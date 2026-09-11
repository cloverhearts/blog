import assert from "node:assert/strict";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { beforeAll, test } from "vitest";

import { buildWeb } from "../../apps/blog-web/src/build.ts";
import { compileContent } from "../../packages/content-compiler/src/compile.ts";
import { loadProjectConfig } from "../../packages/project-config/src/index.ts";
import { buildManagedPages } from "../../packages/managed-page-compiler/src/index.ts";
import { buildDiscovery } from "../../packages/site-discovery/src/build.ts";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

let paginationSite: Awaited<ReturnType<typeof buildPaginationSite>>;

beforeAll(async () => {
  paginationSite = await buildPaginationSite();
}, 30_000);

test("omits footer navigation while keeping localized archive routes", async () => {
  const { root } = await paginationSite;
  const home = readSite(root, "index.html");
  assert.match(primaryMenu(home), /\/posts\/[\s\S]*\/work\/[\s\S]*\/daily\/[\s\S]*\/explore\/[\s\S]*\/search\//u);
  assert.doesNotMatch(primaryMenu(home), /\/archive\//u);
  assert.doesNotMatch(footerMarkup(home), /<nav|href="\/(?:profile|archive)\//u);
  assert.doesNotMatch(footerMarkup(home), /data-footer-meta|©/u);

  const englishArchive = readSite(root, "en/archive/index.html");
  assert.doesNotMatch(primaryMenu(englishArchive), /\/archive\//u);
  assert.doesNotMatch(footerMarkup(englishArchive), /<nav|href="\/en\/(?:profile|archive)\//u);
  assert.equal(existsSync(resolve(root, ".artifacts/web/production/site/en/archive/index.html")), true);

  const japaneseArchive = readSite(root, "ja/archive/index.html");
  assert.doesNotMatch(primaryMenu(japaneseArchive), /\/archive\//u);
  assert.doesNotMatch(footerMarkup(japaneseArchive), /<nav|href="\/ja\/(?:profile|archive)\//u);
  assert.equal(existsSync(resolve(root, ".artifacts/web/production/site/ja/archive/index.html")), true);

  const notFound = readSite(root, "404/index.html");
  assert.match(notFound, /href="\/"[^>]*><span>홈<\/span>/u);
  assert.match(notFound, /href="\/posts\/"/u);
  assert.match(notFound, /href="\/categories\/"/u);
  assert.match(notFound, /href="\/tags\/"/u);
  assert.match(notFound, /href="\/archive\/"/u);
  assert.match(notFound, /href="\/search\/"/u);

  const search = readSite(root, "search/index.html");
  assert.match(search, /<noscript>[\s\S]*href="\/archive\/"/u);

  const blogHome = readFileSync(resolve(root, ".artifacts/web/blog/site/index.html"), "utf8");
  assert.doesNotMatch(footerMarkup(blogHome), /<nav|href="\/blog\/(?:profile|archive)\//u);
  assert.match(blogHome, /href="\/blog\/posts\/"/u);
  assert.doesNotMatch(primaryMenu(blogHome), /\/archive\//u);
});

test("renders list and featured posts as one full-card link without inline presentation styles", async () => {
  const { root } = await paginationSite;
  const home = readSite(root, "index.html");
  assert.match(home, /<li><a class="post-card-link" href="\/posts\/[^"]+\/">\s*<article class="post-card" data-post-card>[\s\S]*?<h3>[^<]+<\/h3>[\s\S]*?<p>[^<]+<\/p>[\s\S]*?<img class="post-card__thumbnail"/u);
  const featured = home.match(/<a class="featured-post-link"[^>]*>[\s\S]*?<\/article><\/a>/u)?.[0];
  assert.ok(featured, "Expected one full featured-post link");
  assert.match(featured, /<article class="featured-post" data-featured-post>[\s\S]*?<h3>[^<]+<\/h3>[\s\S]*?<span class="text-link" data-text-link>/u);
  assert.equal((featured.match(/<a\b/gu) ?? []).length, 1);
  assert.doesNotMatch(home, /<style(?:\s|>)|\sstyle=/u);
});

test("paginates home and collections by ten logical post groups", async () => {
  const { root, discovery } = await paginationSite;
  const home = readSite(root, "index.html");
  assert.equal(countListItems(home), 10);

  const postsPage1 = readSite(root, "posts/index.html");
  const postsPage2 = readSite(root, "posts/page/2/index.html");
  const postsPage3 = readSite(root, "posts/page/3/index.html");
  assert.equal(existsSync(resolve(root, ".artifacts/web/production/site/posts/page/1/index.html")), false);
  assert.equal(countListItems(postsPage1), 10);
  assert.equal(countListItems(postsPage2), 10);
  assert.equal(countListItems(postsPage3), 1);
  assert.match(postsPage1, /rel="canonical" href="https:\/\/blog\.cloverhearts\.com\/posts\/"/u);
  assert.match(postsPage2, /rel="canonical" href="https:\/\/blog\.cloverhearts\.com\/posts\/page\/2\/"/u);
  assert.match(postsPage2, /href="\/posts\/"/u);
  assert.match(postsPage2, /href="\/posts\/page\/3\/"/u);
  assert.match(postsPage3, /href="\/posts\/page\/2\/"/u);
  assert.match(postsPage1, /group-01/u);
  assert.match(postsPage1, /<time datetime="2026-09-13T13:00:00\+09:00">2026\. 09\. 13 13:00<\/time>/u);
  assert.doesNotMatch(postsPage1, /group-21/u);
  assert.match(postsPage3, /group-21/u);

  assert.equal(countListItems(readSite(root, "archive/page/3/index.html")), 1);
  assert.equal(countListItems(readSite(root, "categories/programming/page/3/index.html")), 1);
  assert.equal(countListItems(readSite(root, "tags/cpp/page/3/index.html")), 1);
  assert.equal(countListItems(readSite(root, "en/archive/index.html")), 10);
  assert.match(readSite(root, "en/archive/index.html"), /Available in/u);
  assert.equal(countListItems(readSite(root, "ja/archive/index.html")), 10);
  assert.match(readSite(root, "ja/archive/index.html"), /提供言語/u);
  assert.equal(existsSync(resolve(root, ".artifacts/web/production/site/ja/archive/page/3/index.html")), true);

  assert.equal(discovery.includedRoutes.filter((route) => route.includes("/posts/group-")).length, 22);
  const rss = readFileSync(resolve(root, ".artifacts/discovery/production/site/rss.xml"), "utf8");
  assert.equal((rss.match(/<item>/gu) ?? []).length, 21);
});

test("keeps related posts in the active language before configured fallbacks", async () => {
  const { root } = await paginationSite;
  const post = readSite(root, "posts/group-01/index.html");
  const related = post.match(/<aside class="related-posts" data-related-posts[\s\S]*?<\/aside>/u)?.[0] ?? "";
  assert.match(related, /한국어 group-02/u);
  assert.doesNotMatch(related, /English group-21/u);
  assert.doesNotMatch(related, /href="\/en\/posts\//u);
  assert.equal((related.match(/<article class="post-card" data-post-card>/gu) ?? []).length, 4);
  assert.match(
    post,
    /data-post-content[\s\S]*data-post-author[\s\S]*data-post-after[\s\S]*data-post-navigation[\s\S]*data-related-posts/u,
  );
  const navigation = post.match(/<nav class="post-navigation" data-post-navigation[\s\S]*?<\/nav>/u)?.[0] ?? "";
  assert.match(post, /class="post-tags"[\s\S]*href="\/tags\/[^"]+\/"/u);
  assert.match(navigation, /class="post-navigation__link post-navigation__link--previous"/u);
  assert.match(navigation, /<small>이전 글<\/small>\s+<span>/u);
  const middlePost = readSite(root, "posts/group-02/index.html");
  const middleNavigation = middlePost.match(/<nav class="post-navigation" data-post-navigation[\s\S]*?<\/nav>/u)?.[0] ?? "";
  assert.match(middleNavigation, /<small>이전 글<\/small>\s+<span>/u);
  assert.match(middleNavigation, /<small>다음 글<\/small>\s+<span>/u);
  assert.match(middleNavigation, /class="post-navigation__link post-navigation__link--next"/u);
});

async function buildPaginationSite(): Promise<{
  readonly root: string;
  readonly discovery: ReturnType<typeof buildDiscovery>;
}> {
  const root = createPaginationWorkspace();
  const config = loadProjectConfig({
    repositoryRoot: root,
    env: { SITE_ORIGIN: "https://blog.cloverhearts.com" },
  });
  assert.equal(config.site.listings.pageSize, 10);
  const compiled = await compileContent({ config, mode: "production" });
  assert.equal(compiled.posts.length, 22);
  await buildWeb({ config, mode: "production" });
  await buildManagedPages({ config, mode: "production" });
  const discovery = buildDiscovery({ config });
  const blogConfig = loadProjectConfig({
    repositoryRoot: root,
    env: { SITE_ORIGIN: "https://blog.cloverhearts.com", SITE_BASE_PATH: "/blog" },
  });
  await buildWeb({
    config: blogConfig,
    mode: "production",
    outputDirectory: resolve(root, ".artifacts/web/blog"),
  });
  return { root, discovery };
}

function readSite(root: string, relativePath: string): string {
  return readFileSync(resolve(root, ".artifacts/web/production/site", relativePath), "utf8");
}

function countListItems(html: string): number {
  const list = html.match(/<ul class="post-list" data-post-list>([\s\S]*?)<\/ul>/u)?.[1] ?? "";
  return (list.match(/<li>/gu) ?? []).length;
}

function primaryMenu(html: string): string {
  return html.match(/<nav class="primary-navigation" data-primary-navigation aria-label="(?:Menu|메뉴|メニュー)">[\s\S]*?<\/nav>/u)?.[0] ?? "";
}

function footerMarkup(html: string): string {
  return html.match(/<footer class="site-footer" data-site-footer>[\s\S]*?<\/footer>/u)?.[0] ?? "";
}

function createPaginationWorkspace(): string {
  const root = mkdtempSync(resolve(tmpdir(), "blog-pagination-"));
  mkdirSync(resolve(root, "docs/ko/programming"), { recursive: true });
  mkdirSync(resolve(root, "docs/en/programming"), { recursive: true });
  mkdirSync(resolve(root, "assets/content"), { recursive: true });
  cpSync(resolve(repositoryRoot, "config"), resolve(root, "config"), { recursive: true });
  writeFileSync(
    resolve(root, "config/taxonomy.yaml"),
    `schemaVersion: 2
categories:
  programming:
    labels: { en: "Programming", ko: "프로그래밍", ja: "プログラミング" }
tags:
  cpp:
    labels: { en: "C++", ko: "C++", ja: "C++" }
  programming:
    labels: { en: "Programming", ko: "프로그래밍", ja: "プログラミング" }
  methodology:
    labels: { en: "Methodology", ko: "방법론", ja: "方法論" }
tagAliases: {}
`,
  );
  writeFileSync(resolve(root, "config/curated-collections.yaml"), "schemaVersion: 1\ncollections: {}\n");
  writeFileSync(resolve(root, "CONTENT_RULES.md"), readFileSync(resolve(repositoryRoot, "CONTENT_RULES.md")));
  writeFileSync(resolve(root, "I18N.md"), readFileSync(resolve(repositoryRoot, "I18N.md")));
  writeFileSync(resolve(root, "DESIGN.md"), readFileSync(resolve(repositoryRoot, "DESIGN.md")));
  symlinkSync(resolve(repositoryRoot, "node_modules"), resolve(root, "node_modules"));
  for (let index = 1; index <= 21; index += 1) {
    const slug = `group-${String(index).padStart(2, "0")}`;
    writePost(root, "ko", slug, "source", false, `한국어 ${slug}`);
  }
  writePost(root, "en", "group-21", "reviewed", false, "English group-21");
  return root;
}

function writePost(
  root: string,
  language: "en" | "ko",
  slug: string,
  status: "source" | "reviewed",
  draft: boolean,
  title: string,
): void {
  writeFileSync(
    resolve(root, `docs/${language}/programming/2026-09-13-${slug}.md`),
    `---
title: "${title}"
description: "Summary for ${slug}."
translationKey: "${slug}"
originalLanguage: "ko"
translationStatus: "${status}"
slug: "${slug}"
tags:
  - "cpp"
  - "programming"
  - "methodology"
createdAt: "2026-09-13T13:00:00+09:00"
representativeImage: "generated-card"
draft: ${draft}
---

## Heading

Body for ${slug}.
`,
  );
}
