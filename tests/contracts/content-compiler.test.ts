import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { cpSync } from "node:fs";
import { test } from "vitest";
import sharp from "sharp";

import { compileContent } from "../../packages/content-compiler/src/compile.ts";
import { loadProjectConfig } from "../../packages/project-config/src/index.ts";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

test("compiles a Korean/English/Japanese C++ group into deterministic production artifacts", async () => {
  const root = await createContentWorkspace();
  const config = loadProjectConfig({
    repositoryRoot: root,
    env: { SITE_ORIGIN: "https://blog.cloverhearts.com" },
  });
  const first = await compileContent({ config, mode: "production" });
  const second = await compileContent({ config, mode: "production" });
  assert.equal(first.posts.length, 3);
  assert.equal(first.manifest.provenance.inputHash, second.manifest.provenance.inputHash);
  assert.equal(first.manifest.provenance.buildMode, "production");
  assert.ok(first.posts.every((post) => post.status === "published"));
  assert.ok(first.posts.every((post) => post.bodyHtml.includes("id=")));
  assert.ok(first.posts.some((post) => post.bodyHtml.includes("C++")));
});

test("rejects an unpublished authored original before a reviewed translation", async () => {
  const root = await createContentWorkspace({ draftOriginal: true });
  const config = loadProjectConfig({
    repositoryRoot: root,
    env: { SITE_ORIGIN: "https://blog.cloverhearts.com" },
  });
  await assert.rejects(() => compileContent({ config, mode: "production" }));
});

test("omits an unpublished translation sibling from production", async () => {
  const root = await createContentWorkspace({ draftEnglish: true });
  const config = loadProjectConfig({
    repositoryRoot: root,
    env: { SITE_ORIGIN: "https://blog.cloverhearts.com" },
  });
  const result = await compileContent({ config, mode: "production" });
  assert.deepEqual(
    result.posts.map((post) => post.language).sort(),
    ["ja", "ko"],
  );
});

async function createContentWorkspace(options?: {
  readonly draftOriginal?: boolean;
  readonly draftEnglish?: boolean;
}): Promise<string> {
  const root = mkdtempSync(resolve(tmpdir(), "blog-content-"));
  for (const directory of ["config", "docs/ko/programming", "docs/en/programming", "docs/ja/programming", "assets/content/programming/cpp-programming"]) {
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
    labels:
      en: "C++"
      ko: "C++"
      ja: "C++"
  programming:
    labels:
      en: "Programming"
      ko: "프로그래밍"
      ja: "プログラミング"
  methodology:
    labels:
      en: "Methodology"
      ko: "방법론"
      ja: "方法論"
tagAliases: {}
`,
  );
  writeFileSync(resolve(root, "CONTENT_RULES.md"), "content rules");
  writeFileSync(resolve(root, "I18N.md"), "i18n rules");
  const png = await sharp({
    create: { width: 64, height: 64, channels: 3, background: "#336699" },
  })
    .png()
    .toBuffer();
  writeFileSync(resolve(root, "assets/content/programming/cpp-programming/memory-layout.png"), png);
  writePost(root, "ko", {
    status: "source",
    draft: options?.draftOriginal === true,
    title: "C++ 프로그래밍에 대해서",
    description: "좋은 C++ 프로그램을 설계하기 위한 기본 원칙을 설명합니다.",
  });
  writePost(root, "en", {
    status: "reviewed",
    draft: options?.draftEnglish === true,
    title: "About C++ programming",
    description: "Basic principles for designing a good C++ program.",
  });
  writePost(root, "ja", {
    status: "reviewed",
    draft: false,
    title: "C++プログラミングについて",
    description: "良いC++プログラムを設計するための基本原則を説明します。",
  });
  return root;
}

function writePost(
  root: string,
  language: "en" | "ko" | "ja",
  options: {
    readonly status: "source" | "reviewed" | "ai-draft";
    readonly draft: boolean;
    readonly title: string;
    readonly description: string;
  },
): void {
  writeFileSync(
    resolve(root, `docs/${language}/programming/2026-09-13-cpp-programming.md`),
    `---
title: "${options.title}"
description: "${options.description}"
translationKey: "cpp-programming"
originalLanguage: "ko"
translationStatus: "${options.status}"
slug: "cpp-programming"
tags:
  - "cpp"
  - "programming"
  - "methodology"
createdAt: "2026-09-13T13:00:00+09:00"
representativeImage: "generated-card"
draft: ${options.draft}
---

좋은 프로그램은 작은 단위로 검증합니다.

## 어떻게 접근해야 좋은 프로그램인가?

C++ 코드는 의도를 드러내야 합니다.

### 작은 단위로 검증하기

\`\`\`cpp
int main() { return 0; }
\`\`\`

![memory](asset:/programming/cpp-programming/memory-layout.png)
`,
  );
}
