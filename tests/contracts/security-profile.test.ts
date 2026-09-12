import assert from "node:assert/strict";
import { cpSync, mkdirSync, mkdtempSync, readFileSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { test } from "vitest";
import { parse, stringify } from "yaml";
import { buildWeb } from "../../apps/blog-web/src/build.ts";
import { renderDocument } from "../../apps/blog-web/src/lib/render-document.ts";
import { compileContent } from "../../packages/content-compiler/src/compile.ts";
import { buildManagedPages, renderManagedMarkdown, validateManagedStylesheet } from "../../packages/managed-page-compiler/src/index.ts";
import { loadProjectConfig } from "../../packages/project-config/src/index.ts";
import { buildSearch } from "../../packages/search-indexer/src/index.ts";
import { buildDiscovery } from "../../packages/site-discovery/src/build.ts";
import { assembleRelease, verifyPages } from "../../packages/release-assembler/src/index.ts";

const repositoryRoot = resolve(import.meta.dirname, "../..");
function workspace(basePath = "") {
  const root = mkdtempSync(resolve(tmpdir(), "blog-profile-"));
  for (const name of ["config", "managed-pages"]) cpSync(resolve(repositoryRoot, name), resolve(root, name), { recursive: true });
  // Publication and rich Markdown fixtures must not depend on the owner's bio.
  for (const id of ["profile", "profile-en", "profile-ja"]) {
    const pagePath = resolve(root, `managed-pages/${id}/page.yaml`);
    const page = parse(readFileSync(pagePath, "utf8"));
    page.status = "draft";
    writeFileSync(pagePath, stringify(page));
    writeFileSync(resolve(root, `managed-pages/${id}/content.md`), "Applied AI Engineer\n\n## Review fixture\n\n1. A static review step.\n");
  }
  for (const name of ["CONTENT_RULES.md", "I18N.md", "DESIGN.md"]) cpSync(resolve(repositoryRoot, name), resolve(root, name));
  for (const name of ["docs/ko", "assets/content"]) mkdirSync(resolve(root, name), { recursive: true });
  symlinkSync(resolve(repositoryRoot, "node_modules"), resolve(root, "node_modules"));
  const config = loadProjectConfig({ repositoryRoot: root, env: { SITE_ORIGIN: "https://blog.cloverhearts.com", SITE_BASE_PATH: basePath } });
  return { root, config };
}

test("escapes script-ending metadata in blog and managed JSON-LD without losing data", async () => {
  const payload = '</script><script>alert("test")</script><!-- & 日本語';
  const blog = renderDocument({ language: "ko", title: payload, description: payload, siteName: "Blog", canonicalUrl: "https://blog.cloverhearts.com/", robots: "noindex,follow", homeHref: "/", profileHref: "/profile/", authorName: "Author", searchIndex: "/search/", basePath: "", primaryNavigation: [], languageNavigation: [], head: "", body: "", footer: "", pageKind: "home", jsonLd: [JSON.stringify({ name: payload })] });
  const { root, config } = workspace();
  const path = resolve(root, "managed-pages/profile/page.yaml");
  const source = parse(readFileSync(path, "utf8"));
  source.title = payload;
  source.description = payload;
  writeFileSync(path, stringify(source));
  await buildManagedPages({ config, mode: "preview" });
  const managed = readFileSync(resolve(root, ".artifacts/managed/preview/pages/profile/index.html"), "utf8");
  for (const html of [blog, managed]) {
    assert.doesNotMatch(html, /<script>alert/u);
    const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gu)];
    assert.equal(blocks.length, 1);
    assert.equal(JSON.parse(blocks[0]![1]!).name, payload);
    assert.doesNotMatch(blocks[0]![1]!, /</u);
  }
});

test("renders safe managed Markdown and rejects stylesheet network and markup escapes", () => {
  const markdown = '## Title\n\n**Clear** [local](/work/) [external](https://github.com/cloverhearts)\n\n- Item\n\n<script>alert(1)</script>\n\n[unsafe](javascript:alert)\n\n![remote](https://invalid.test/pixel.png)';
  const html = renderManagedMarkdown(markdown, "/blog");
  assert.match(html, /<h2>Title<\/h2>/u);
  assert.match(html, /<strong>Clear<\/strong>/u);
  assert.match(html, /<ul>/u);
  assert.match(html, /href="\/blog\/work\/"/u);
  assert.match(html, /href="https:\/\/github.com\/cloverhearts"/u);
  assert.doesNotMatch(html, /<script|javascript:|<img|pixel\.png/u);
  assert.equal(renderManagedMarkdown(markdown, "/blog"), html);
  validateManagedStylesheet("body { color: #17211c; } @media print { main { width: 100%; } }");
  for (const css of ['@import "https://bad.test/x.css";', 'a { background: url(https://bad.test/x); }', 'a { background: image-set("https://bad.test/x" 1x); }', '</style><script>x</script>', '@im/**/port "x";', 'a { background: u\\72l(x); }']) {
    assert.throws(() => validateManagedStylesheet(css));
  }
});

test("keeps profile drafts private while rendering static localized review pages deterministically", async () => {
  const { root, config } = workspace("/blog");
  const first = await buildManagedPages({ config, mode: "preview" });
  assert.equal(first.pages.length, 3);
  for (const page of first.pages) {
    const html = readFileSync(resolve(root, ".artifacts/managed/preview", page.entryArtifactPath), "utf8");
    assert.match(html, /Applied AI Engineer/u);
    assert.match(html, /<meta name="robots" content="noindex,follow">/u);
    assert.match(html, /data-managed-page-style/u);
    assert.match(html, /data-managed-page-return href="\/blog\//u);
    assert.match(html, /<h2>/u);
    assert.match(html, /<ol>/u);
    assert.doesNotMatch(html, /blog\.css|data-site-header|data-search-dialog|googletagmanager|href="\/work\/"/u);
  }
  const second = await buildManagedPages({ config, mode: "preview" });
  assert.deepEqual(first, second);
  const cssPath = resolve(root, "managed-pages/profile/profile.css");
  writeFileSync(cssPath, `${readFileSync(cssPath, "utf8")}\nmain { max-width: 60rem; }`);
  const third = await buildManagedPages({ config, mode: "preview" });
  assert.notEqual(first.provenance.inputHash, third.provenance.inputHash);
  const published = await buildManagedPages({ config, mode: "production" });
  assert.equal(published.pages.length, 0);
});

test("hides unavailable profile links and uses one honest empty home state at both deployment bases", async () => {
  for (const base of ["", "/blog"]) {
    const { root, config } = workspace(base);
    await compileContent({ config, mode: "production" });
    await buildManagedPages({ config, mode: "production" });
    const first = await buildWeb({ config, mode: "production" });
    const homePath = resolve(root, ".artifacts/web/production/site/index.html");
    for (const prefix of ["", "en/", "ja/"]) {
      const html = readFileSync(resolve(root, `.artifacts/web/production/site/${prefix}index.html`), "utf8");
      assert.match(html, /home-hero--text-only/u);
      assert.doesNotMatch(html, /class="home-hero__title-link"/u, "No invented destination in an empty home");
      assert.equal([...html.matchAll(/data-empty-state/gu)].length, 1);
      assert.doesNotMatch(html, /data-home-featured|data-home-work|rel="author"/u);
    }
    const pagePath = resolve(root, "managed-pages/profile/page.yaml");
    const source = parse(readFileSync(pagePath, "utf8"));
    source.status = "published";
    writeFileSync(pagePath, stringify(source));
    await buildManagedPages({ config, mode: "production" });
    const second = await buildWeb({ config, mode: "production" });
    assert.notEqual(first.provenance.inputHash, second.provenance.inputHash);
    assert.ok(readFileSync(homePath, "utf8").includes(`href="${base}/profile/" rel="author"`));
    const profile = readFileSync(resolve(root, ".artifacts/managed/production/pages/profile/index.html"), "utf8");
    assert.doesNotMatch(profile, /hreflang="en"|hreflang="ja"/u);
    await compileContent({ config, mode: "preview" });
    await buildManagedPages({ config, mode: "preview" });
    await buildWeb({ config, mode: "preview" });
    const english = readFileSync(resolve(root, ".artifacts/web/preview/site/en/index.html"), "utf8");
    assert.ok(english.includes(`href="${base}/en/profile/" rel="author"`));
  }
});

test("publishes empty noindex profiles without sample discovery at root and subpath", async () => {
  for (const base of ["", "/blog"]) {
    const { root, config } = workspace(base);
    for (const id of ["profile", "profile-en", "profile-ja"]) {
      const path = resolve(root, `managed-pages/${id}/page.yaml`);
      const source = parse(readFileSync(path, "utf8"));
      source.status = "published";
      writeFileSync(path, stringify(source));
      writeFileSync(resolve(root, `managed-pages/${id}/content.md`), "");
    }
    const content = await compileContent({ config, mode: "production" });
    assert.equal(content.manifest.posts.length, 0);
    const managed = await buildManagedPages({ config, mode: "production" });
    assert.equal(managed.pages.length, 3);
    assert.deepEqual(await buildManagedPages({ config, mode: "production" }), managed);
    await buildWeb({ config, mode: "production" });
    await buildSearch({ config, mode: "production" });
    buildDiscovery({ config });
    assembleRelease({ config });
    verifyPages(config);
    const read = (path: string) => readFileSync(resolve(root, "dist", path), "utf8");
    for (const prefix of ["", "en/", "ja/"]) {
      const profile = read(`${prefix}profile/index.html`);
      assert.match(profile, /<article>\s*<\/article>/u);
      assert.match(profile, /<h1>CloverHearts<\/h1>/u);
      assert.match(profile, /name="robots" content="noindex,follow"/u);
      assert.ok(profile.includes(`data-managed-page-return href="${base}/${prefix}"`));
      assert.doesNotMatch(profile, /data-site-header|data-root-language-selection|data-pagefind-body/u);
      assert.ok(read(`${prefix}index.html`).includes(`href="${base}/${prefix}profile/" rel="author"`));
      for (const route of ["index.html", "explore/index.html", "work/index.html", "daily/index.html", "categories/index.html", "tags/index.html"]) {
        assert.doesNotMatch(read(`${prefix}${route}`), /class="post-card-link"|href="[^"]*\/(?:categories|tags)\/[^"/]+\//u);
      }
      assert.doesNotMatch(read(`${prefix}rss.xml`), /<item>|\/profile\//u);
    }
    assert.doesNotMatch(read("sitemap.xml"), /\/profile\/|\/posts\/[^<]+\/|\/categories\/[^<]+\//u);
    for (const language of ["ko", "en", "ja"]) {
      assert.ok(managed.pages.some((page) => page.language === language));
    }
    const preview = await compileContent({ config, mode: "preview" });
    assert.equal(preview.manifest.posts.length, 0);
    assert.equal((await buildManagedPages({ config, mode: "preview" })).pages.length, 3);
  }
});

test("rejects managed entry and stylesheet paths escaping through traversal or symlinks", async () => {
  for (const kind of ["path", "stylesheet"] as const) {
    const { root, config } = workspace();
    const path = resolve(root, "managed-pages/profile/page.yaml");
    const source = parse(readFileSync(path, "utf8"));
    source.entry[kind] = "../../DESIGN.md";
    writeFileSync(path, stringify(source));
    await assert.rejects(buildManagedPages({ config, mode: "preview" }), /escapes/u);
    symlinkSync(resolve(root, "DESIGN.md"), resolve(root, "managed-pages/profile/outside"));
    source.entry[kind] = "outside";
    writeFileSync(path, stringify(source));
    await assert.rejects(buildManagedPages({ config, mode: "preview" }), /symlink escapes/u);
  }
});

test("keeps normal blog text opaque and text tokens above AA contrast on light and dark surfaces", () => {
  const css = readFileSync(resolve(repositoryRoot, "apps/blog-web/src/styles/blog.css"), "utf8");
  const luminance = (hex: string) => {
    const rgb = hex.match(/\w\w/gu)!.map((x) => parseInt(x, 16) / 255).map((v) => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4);
    return rgb[0]! * .2126 + rgb[1]! * .7152 + rgb[2]! * .0722;
  };
  const roots = [...css.matchAll(/:root\s*\{([^}]+)\}/gu)].filter(([, block]) => block!.includes("--primary-dark"));
  assert.equal(roots.length, 2, "Check both normal light and dark palettes; print uses its own monochrome palette");
  for (const [, block] of roots) {
    const tokens = Object.fromEntries([...block!.matchAll(/--([a-z-]+):\s*#([a-f0-9]{6})/gu)].map(([, name, value]) => [name, value!]));
    for (const text of ["text", "muted", "tertiary", "primary-dark"]) {
      for (const background of ["bg", "surface", "primary-surface"]) {
        const a = luminance(tokens[text]!); const b = luminance(tokens[background]!);
        assert.ok((Math.max(a, b) + .05) / (Math.min(a, b) + .05) >= 4.5, `${text} on ${background}`);
      }
    }
  }
  assert.doesNotMatch(css, /(?:post-card__copy|featured-post__copy|post-navigation__link|post-filters a)[^{}]*\{[^}]*opacity:\s*\.(?:5|68)/u);
  assert.match(css, /home-hero--text-only[^}]*min-height: auto/u);
});
