import assert from "node:assert/strict";
import { cpSync, mkdirSync, mkdtempSync, readFileSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "vitest";
import sharp from "sharp";

import { buildWeb } from "../../apps/blog-web/src/build.ts";
import { createPostOpenGraphTags } from "../../apps/blog-web/src/seo/open-graph.ts";
import {
  excerptFrom,
  normalizePostDescription,
  parsePostFrontmatter,
  unicodeLength,
} from "../../packages/content-compiler/src/index.ts";
import { compileContent } from "../../packages/content-compiler/src/compile.ts";
import { loadProjectConfig } from "../../packages/project-config/src/index.ts";
import { buildDiscovery } from "../../packages/site-discovery/src/build.ts";
import { buildManagedPages } from "../../packages/managed-page-compiler/src/index.ts";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

const validFrontmatter = {
  title: "About C++ programming",
  description: "Basic principles for designing a good C++ program.",
  translationKey: "cpp-programming",
  originalLanguage: "ko",
  translationStatus: "reviewed",
  slug: "cpp-programming",
  tags: ["cpp", "programming", "methodology"],
  createdAt: "2026-09-13T13:00:00+09:00",
  representativeImage: "generated-card",
  draft: false,
} as const;

test("accepts a localized description of exactly 150 Unicode characters", () => {
  const description = "あ".repeat(150);
  const parsed = parsePostFrontmatter({ ...validFrontmatter, description }, "fixture.md");
  assert.equal(unicodeLength(parsed.description), 150);
});

test("rejects a description of 151 Unicode characters", () => {
  assert.throws(() =>
    parsePostFrontmatter({ ...validFrontmatter, description: "あ".repeat(151) }, "fixture.md"),
  );
});

test("trims surrounding whitespace before measuring a description", () => {
  const parsed = parsePostFrontmatter(
    { ...validFrontmatter, description: "  A short localized summary.  " },
    "fixture.md",
  );
  assert.equal(parsed.description, "A short localized summary.");
});

test("rejects empty, Markdown, URL, placeholder, and title-copy descriptions", () => {
  assert.throws(() => normalizePostDescription("   ", "Title", "x.md"));
  assert.throws(() => normalizePostDescription("See https://example.com for more.", "Title", "x.md"));
  assert.throws(() => normalizePostDescription("Use [this](https://example.com).", "Title", "x.md"));
  assert.throws(() => normalizePostDescription("TODO write this later", "Title", "x.md"));
  assert.throws(() => normalizePostDescription("Title", "Title", "x.md"));
});

test("compatibility excerpt skips a leading image and falls back to description", () => {
  const description = "Readable localized summary of the post.";
  assert.equal(
    excerptFrom("![memory](asset:/programming/cpp-programming/memory-layout.png)\n\n## Heading only", description),
    description,
  );
  assert.equal(
    excerptFrom("![memory](asset:/x.png)\n\nThe first prose paragraph remains.", description),
    "The first prose paragraph remains.",
  );
});

test("rejects missing alt, remote, and non-raster thumbnail sources", () => {
  assert.throws(() =>
    parsePostFrontmatter(
      {
        ...validFrontmatter,
        thumbnail: { src: "asset:/programming/cpp-programming/thumb.png", alt: "" },
      },
      "fixture.md",
    ),
  );
  assert.throws(() =>
    parsePostFrontmatter(
      {
        ...validFrontmatter,
        thumbnail: { src: "https://example.com/thumb.png", alt: "Remote" },
      },
      "fixture.md",
    ),
  );
  assert.throws(() =>
    parsePostFrontmatter(
      {
        ...validFrontmatter,
        thumbnail: { src: "asset:/programming/cpp-programming/thumb.svg", alt: "Vector" },
      },
      "fixture.md",
    ),
  );
});

test("collections, RSS, and metadata use description while thumbnails stay off Open Graph", async () => {
  const root = await createSummaryWorkspace();
  const config = loadProjectConfig({
    repositoryRoot: root,
    env: { SITE_ORIGIN: "https://blog.cloverhearts.com" },
  });
  const compiled = await compileContent({ config, mode: "production" });
  const korean = compiled.posts.find((post) => post.language === "ko");
  const english = compiled.posts.find((post) => post.language === "en");
  assert.ok(korean);
  assert.ok(english);
  assert.equal(korean.description, "한국어로 된 독립 요약입니다.");
  assert.equal(english.description, "An independent English summary.");
  assert.equal(korean.excerpt, "Prose after the image.");
  assert.ok(korean.thumbnail);

  await buildWeb({ config, mode: "production" });
  await buildManagedPages({ config, mode: "production" });
  buildDiscovery({ config });

  const home = readFileSync(resolve(root, ".artifacts/web/production/site/index.html"), "utf8");
  assert.match(home, /한국어로 된 독립 요약입니다\./u);
  assert.doesNotMatch(home, /memory-layout/u);
  assert.match(home, /data-post-list/u);
  assert.match(home, /data-post-thumbnail="thumbnail"/u);
  assert.match(home, /width="640" height="360"/u);
  assert.match(home, /alt=""/u);
  assert.match(home, /loading="eager"/u);

  const englishHome = readFileSync(resolve(root, ".artifacts/web/production/site/en/index.html"), "utf8");
  assert.match(englishHome, /An independent English summary\./u);
  assert.match(englishHome, /data-post-thumbnail="representative"/u);

  const rss = readFileSync(resolve(root, ".artifacts/discovery/production/site/rss.xml"), "utf8");
  assert.match(rss, /<description>한국어로 된 독립 요약입니다\.<\/description>/u);

  const postHtml = readFileSync(
    resolve(root, ".artifacts/web/production/site/posts/cpp-programming/index.html"),
    "utf8",
  );
  assert.match(postHtml, /property="og:description" content="한국어로 된 독립 요약입니다\."/u);
  assert.match(postHtml, /property="og:image" content="https:\/\/blog\.cloverhearts\.com\/_assets\/social\//u);
  assert.doesNotMatch(postHtml, /property="og:image" content="[^"]*_assets\/thumbnails\//u);
  const postingJson = postHtml
    .split("application/ld+json")
    .find((chunk) => chunk.includes("BlogPosting"));
  assert.ok(postingJson);
  assert.doesNotMatch(postingJson, /thumbnails/u);

  const tags = createPostOpenGraphTags({
    title: korean.title,
    description: korean.description,
    canonicalUrl: "https://blog.cloverhearts.com/posts/cpp-programming/",
    siteName: "CloverHearts Blog",
    locale: "ko_KR",
    alternateLocales: ["en_US"],
    publishedTime: korean.createdAt,
    section: "프로그래밍",
    tags: [...korean.tags],
    image: {
      url: "https://blog.cloverhearts.com/_assets/social/ko-cpp-programming-og.png",
      mediaType: "image/png",
      width: 1200,
      height: 630,
      alt: korean.title,
    },
  });
  assert.equal(tags.some((tag) => tag.property === "og:description" && tag.content === korean.description), true);
});

async function createSummaryWorkspace(): Promise<string> {
  const root = mkdtempSync(resolve(tmpdir(), "blog-summary-"));
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
  writeFileSync(resolve(root, "CONTENT_RULES.md"), readFileSync(resolve(repositoryRoot, "CONTENT_RULES.md")));
  writeFileSync(resolve(root, "I18N.md"), readFileSync(resolve(repositoryRoot, "I18N.md")));
  writeFileSync(resolve(root, "DESIGN.md"), readFileSync(resolve(repositoryRoot, "DESIGN.md")));
  symlinkSync(resolve(repositoryRoot, "node_modules"), resolve(root, "node_modules"));
  const png = await sharp({
    create: { width: 64, height: 64, channels: 3, background: "#336699" },
  })
    .png()
    .toBuffer();
  writeFileSync(resolve(root, "assets/content/programming/cpp-programming/memory-layout.png"), png);
  writeFileSync(resolve(root, "assets/content/programming/cpp-programming/thumbnail.png"), png);
  writeVariant(root, "ko", "source", "C++ 프로그래밍에 대해서", "한국어로 된 독립 요약입니다.", true);
  writeVariant(root, "en", "reviewed", "About C++ programming", "An independent English summary.", false);
  writeVariant(root, "ja", "reviewed", "C++プログラミングについて", "独立した日本語の要約です。", false);
  return root;
}

function writeVariant(
  root: string,
  language: "en" | "ko" | "ja",
  status: "source" | "reviewed",
  title: string,
  description: string,
  withThumbnail: boolean,
): void {
  const thumbnail = withThumbnail
    ? `thumbnail:
  src: "asset:/programming/cpp-programming/thumbnail.png"
  alt: "메모리 구조를 검토하는 C++ 개발 환경"
`
    : "";
  writeFileSync(
    resolve(root, `docs/${language}/programming/2026-09-13-cpp-programming.md`),
    `---
title: "${title}"
description: "${description}"
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
draft: false
${thumbnail}---

![memory](asset:/programming/cpp-programming/memory-layout.png)

## C++ heading

Prose after the image.
`,
  );
}
