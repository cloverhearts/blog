import assert from "node:assert/strict";
import { gunzipSync } from "node:zlib";
import { cpSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "vitest";
import sharp from "sharp";

import { buildWeb } from "../../apps/blog-web/src/build.ts";
import { searchIcon } from "../../apps/blog-web/src/lib/search-icon.ts";
import {
  bindDialogBackdrop,
  formatResultCount,
  normalizeQuery,
  publicResultUrl,
  renderSearchResultItems,
  searchIndexBasePath,
  shouldRunSearch,
} from "../../apps/blog-web/src/search/client.js";
import { compileContent } from "../../packages/content-compiler/src/compile.ts";
import { loadProjectConfig } from "../../packages/project-config/src/index.ts";
import { buildSearch } from "../../packages/search-indexer/src/index.ts";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

test("dismisses search only for completed backdrop gestures", () => {
  class DialogStub extends EventTarget {
    closed = 0;
    getBoundingClientRect() { return { left: 100, top: 100, right: 500, bottom: 400 }; }
    close() { this.closed += 1; this.dispatchEvent(new Event("close")); }
  }
  const dialog = new DialogStub();
  bindDialogBackdrop(dialog as unknown as HTMLDialogElement);
  const send = (type: string, x: number, y: number, target: EventTarget = dialog, button = 0) => {
    const event = Object.assign(new Event(type), { clientX: x, clientY: y, button });
    Object.defineProperty(event, "target", { value: target });
    dialog.dispatchEvent(event);
  };
  send("pointerdown", 50, 200);
  send("click", 50, 200);
  assert.equal(dialog.closed, 1);
  for (const [x, y] of [[100, 100], [500, 400], [300, 250]]) {
    send("pointerdown", x!, y!);
    send("click", x!, y!);
  }
  send("pointerdown", 250, 200, new EventTarget());
  send("click", 50, 200); // Selection dragged out of the dialog.
  send("pointerdown", 50, 200);
  send("click", 250, 200); // Pointer moves into the dialog.
  send("click", 50, 200); // No matching pointerdown.
  send("pointerdown", 50, 200, dialog, 2);
  send("click", 50, 200, dialog, 2);
  send("pointerdown", 50, 200);
  dialog.dispatchEvent(new Event("pointercancel"));
  send("click", 50, 200);
  assert.equal(dialog.closed, 1);
  for (const [x, y] of [[501, 200], [300, 99], [300, 401]]) {
    send("pointerdown", x!, y!);
    send("click", x!, y!);
  }
  assert.equal(dialog.closed, 4);
});

test("keeps search close feedback flat with visible keyboard focus", () => {
  const css = readFileSync(resolve(repositoryRoot, "apps/blog-web/src/styles/blog.css"), "utf8");
  const interaction = css.match(/\.search-dialog \.search-dialog__header \.search-dialog__close:is\(:hover, :focus-visible, :active\)\s*\{([^}]+)\}/u)?.[1];
  assert.ok(interaction);
  assert.match(interaction, /box-shadow: none;/u);
  assert.match(interaction, /transform: none;/u);
  assert.match(interaction, /font-weight: 750;/u);
  assert.match(interaction, /color: var\(--primary-dark\);/u);
  assert.doesNotMatch(interaction, /outline: (?:0|none)/u);
  assert.match(css, /:focus-visible \{ outline: \.2rem solid var\(--primary\)/u);
  assert.doesNotMatch(css, /\.search-dialog__icon::after/u);
});

test("embeds the licensed Lucide search SVG without a runtime icon dependency", () => {
  assert.match(searchIcon, /ISC License[\s\S]*Copyright \(c\) 2026 Lucide/u);
  assert.match(searchIcon, /The MIT License \(MIT\)[\s\S]*Copyright \(c\) 2013-present Cole Bemis/u);
  assert.match(searchIcon, /<svg class="search-dialog__icon" aria-hidden="true" focusable="false"/u);
  assert.match(searchIcon, /viewBox="0 0 24 24"/u);
  assert.match(searchIcon, /stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/u);
  assert.match(searchIcon, /<path d="m21 21-4\.34-4\.34"\/><circle cx="11" cy="11" r="8"\/>/u);
  assert.doesNotMatch(searchIcon, /<script|<use|\shref=|\ssrc=|\son[a-z]+=/u);
});

test("does not search until the reader enters a query", () => {
  assert.equal(shouldRunSearch(""), false);
  assert.equal(shouldRunSearch("   "), false);
  assert.equal(shouldRunSearch("C++"), true);
  assert.equal(normalizeQuery("  C++  "), "C++");
});

test("resolves only the active-language Pagefind index", () => {
  assert.equal(searchIndexBasePath("", "ko"), "/_assets/search/ko/");
  assert.equal(searchIndexBasePath("/blog", "en"), "/blog/_assets/search/en/");
  assert.equal(searchIndexBasePath("/blog", "ja"), "/blog/_assets/search/ja/");
});

test("renders keyboard-reachable local result links without a server request", () => {
  assert.equal(publicResultUrl("", "/posts/cpp-programming/"), "/posts/cpp-programming/");
  assert.equal(publicResultUrl("/blog", "/en/posts/cpp-programming/"), "/blog/en/posts/cpp-programming/");
  assert.equal(
    formatResultCount("{n} results", 2),
    "2 results",
  );
  const html = renderSearchResultItems(
    [{ url: "/posts/cpp-programming/", meta: { title: "C++" }, excerpt: "memory" }],
    "",
  );
  assert.match(html, /<a class="search-result" href="\/posts\/cpp-programming\/">[\s\S]*<strong>C\+\+<\/strong>[\s\S]*class="search-result__arrow"/u);
  assert.match(html, /class="search-result__icon" aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false">[\s\S]*<\/svg><\/span>/u);
  assert.doesNotMatch(html, /<use\b|https?:\/\//u);
  assert.doesNotMatch(html, /gtag|search_term|googletagmanager/u);
});

test("indexes published language-isolated HTML and keeps C++ tokens searchable", async () => {
  const root = await createPublishedSearchWorkspace();
  const config = loadProjectConfig({
    repositoryRoot: root,
    env: { SITE_ORIGIN: "https://blog.cloverhearts.com" },
  });
  const content = await compileContent({ config, mode: "production" });
  assert.deepEqual(
    content.manifest.searchDocuments.map((document) => document.language).sort(),
    ["en", "ja", "ko"],
  );
  assert.ok(content.manifest.searchDocuments.every((document) => document.eligible));
  await buildWeb({ config, mode: "production" });
  const search = await buildSearch({ config, mode: "production" });
  assert.deepEqual(search.indexedPostIdsByLanguage.ko, ["ko:cpp-programming"]);
  assert.deepEqual(search.indexedPostIdsByLanguage.en, ["en:cpp-programming"]);
  assert.deepEqual(search.indexedPostIdsByLanguage.ja, ["ja:cpp-programming"]);

  const koreanPost = readFileSync(
    resolve(root, ".artifacts/web/production/site/posts/cpp-programming/index.html"),
    "utf8",
  );
  const searchPage = readFileSync(
    resolve(root, ".artifacts/web/production/site/search/index.html"),
    "utf8",
  );
  assert.match(searchPage, /<form role="search"/u);
  assert.match(searchPage, /<label for="site-search-query">/u);
  assert.match(searchPage, /<input class="site-control site-control--field site-search__input" id="site-search-query" name="q" type="search"/u);
  assert.match(searchPage, /data-search-results/u);
  assert.match(searchPage, /data-search-empty/u);
  assert.match(searchPage, /<noscript>/u);
  assert.match(searchPage, /\/categories\//u);
  assert.match(searchPage, /content="noindex,follow"/u);
  assert.match(searchPage, /data-search-index="\/_assets\/search\/ko\/"/u);
  assert.match(searchPage, /class="search-dialog__header"/u);
  assert.match(searchPage, /class="search-dialog__field"/u);
  assert.ok(searchPage.includes(searchIcon), "Keep icon geometry and both license notices in the emitted document");
  assert.match(searchPage, /placeholder="검색어를 입력하세요"/u);
  assert.match(searchPage, /data-search-hint/u);
  assert.match(searchPage, /aria-labelledby="search-dialog-title"/u);
  assert.match(searchPage, /<script type="module" src="\/_assets\/app\/search.js">/u);
  assert.match(searchPage, /class="site-search"/u);
  assert.doesNotMatch(searchPage, /<style(?:\s|>)|\sstyle=/u);
  const englishSearch = readFileSync(
    resolve(root, ".artifacts/web/production/site/en/search/index.html"),
    "utf8",
  );
  assert.match(englishSearch, /data-search-index="\/_assets\/search\/en\/"/u);

  assert.match(koreanPost, /data-pagefind-body/u);
  assert.match(koreanPost, /data-pagefind-weight="10"/u);
  assert.match(koreanPost, /data-pagefind-filter="tag"/u);
  assert.match(koreanPost, /data-post-toc data-pagefind-ignore/u);
  assert.match(koreanPost, /C\+\+/u);

  const koreanIndex = readIndexText(resolve(root, ".artifacts/search/production/index/ko"));
  const englishIndex = readIndexText(resolve(root, ".artifacts/search/production/index/en"));
  assert.match(koreanIndex, /\/posts\/cpp-programming\//u);
  assert.doesNotMatch(koreanIndex, /\/en\/posts\/cpp-programming\//u);
  assert.match(englishIndex, /\/en\/posts\/cpp-programming\//u);
  assert.doesNotMatch(englishIndex, /"\/posts\/cpp-programming\/"/u);
});

test("production search eligibility excludes drafts", async () => {
  const root = await createPublishedSearchWorkspace({ draftEnglish: true });
  const config = loadProjectConfig({
    repositoryRoot: root,
    env: { SITE_ORIGIN: "https://blog.cloverhearts.com" },
  });
  const production = await compileContent({ config, mode: "production" });
  assert.deepEqual(
    production.manifest.searchDocuments.map((document) => document.language).sort(),
    ["ja", "ko"],
  );
  const preview = await compileContent({ config, mode: "preview" });
  assert.equal(
    preview.manifest.searchDocuments.some(
      (document) => document.language === "en" && document.eligible,
    ),
    true,
  );
});

async function createPublishedSearchWorkspace(options?: {
  readonly draftEnglish?: boolean;
}): Promise<string> {
  const root = mkdtempSync(resolve(tmpdir(), "blog-search-"));
  for (const directory of [
    "docs/ko/programming",
    "docs/en/programming",
    "docs/ja/programming",
    "assets/content/programming/cpp-programming",
  ]) {
    mkdirSync(resolve(root, directory), { recursive: true });
  }
  cpSync(resolve(repositoryRoot, "config"), resolve(root, "config"), { recursive: true });
  writeFileSync(
    resolve(root, "config/taxonomy.yaml"),
    `schemaVersion: 2
categories:
  programming:
    labels:
      en: "Programming"
      ko: "프로그래밍"
      ja: "プログラミング"
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
  writeFileSync(
    resolve(root, "assets/content/programming/cpp-programming/memory-layout.png"),
    await sharp({ create: { width: 64, height: 64, channels: 3, background: "#224466" } })
      .png()
      .toBuffer(),
  );
  writeSearchPost(root, "ko", "source", false, "C++ 프로그래밍에 대해서");
  writeSearchPost(root, "en", "reviewed", options?.draftEnglish === true, "About C++ programming");
  writeSearchPost(root, "ja", "reviewed", false, "C++プログラミングについて");
  return root;
}

function writeSearchPost(
  root: string,
  language: "en" | "ko" | "ja",
  status: "source" | "reviewed",
  draft: boolean,
  title: string,
): void {
  writeFileSync(
    resolve(root, `docs/${language}/programming/2026-09-13-cpp-programming.md`),
    `---
title: "${title}"
description: "C++ identifiers, headings, and tags remain searchable."
translationKey: "cpp-programming"
originalLanguage: "ko"
translationStatus: "${status}"
slug: "cpp-programming"
tags:
  - "cpp"
  - "programming"
  - "methodology"
createdAt: "2026-09-13T13:00:00+09:00"
representativeImage: "generated-card"
draft: ${draft}
---

## C++ heading

Search should find C++ and \`vector<int>\`.
`,
  );
}

function readIndexText(directory: string): string {
  const chunks: string[] = [];
  const walk = (current: string): void => {
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const path = resolve(current, entry.name);
      if (entry.isDirectory()) {
        walk(path);
        continue;
      }
      const bytes = readFileSync(path);
      const decoded =
        bytes[0] === 0x1f && bytes[1] === 0x8b
          ? gunzipSync(bytes).toString("utf8")
          : bytes.toString("latin1");
      chunks.push(decoded);
    }
  };
  walk(directory);
  return chunks.join("\n");
}
