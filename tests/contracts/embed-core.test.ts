import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "vitest";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
  assertSafeEmbedHtml,
  executeEmbedDirective,
  loadEmbedRegistry,
} from "../../packages/embed-core/src/index.ts";
import { compileMarkdown } from "../../packages/content-compiler/src/markdown.ts";
import { loadProjectConfig } from "../../packages/project-config/src/index.ts";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

test("documents the installed YouTube directive contract", () => {
  const contentRules = readFileSync(resolve(repositoryRoot, "CONTENT_RULES.md"), "utf8");
  assert.match(contentRules, /::youtube\{id="VIDEO_ID" title="C\+\+ 프로그래밍 강의"\}/u);
  assert.match(contentRules, /11-character video ID/u);
  assert.match(contentRules, /youtube-nocookie\.com/u);
});

test("refuses remote, duplicate, and unregistered embed plugins", async () => {
  const config = loadProjectConfig({ repositoryRoot });
  assert.equal(config.embeds.plugins.length, 1);
  const registry = await loadEmbedRegistry(config.embeds, repositoryRoot);
  await assert.rejects(() =>
    executeEmbedDirective(
      registry,
      {
        name: "youtube",
        attributes: { id: "abc", title: "Example" },
        sourcePath: "docs/ko/example.md",
        sourceLine: 1,
      },
      {
        buildMode: "preview",
        language: "ko",
        timezone: "Asia/Seoul",
        configuration: {},
      },
    ),
  );
});

test("renders a privacy-enhanced YouTube iframe with a static fallback", async () => {
  const config = loadProjectConfig({ repositoryRoot });
  const registry = await loadEmbedRegistry(config.embeds, repositoryRoot);
  const executed = await executeEmbedDirective(
    registry,
    {
      name: "youtube",
      attributes: { id: "2GNIgiza-m0", title: "YouTube test video" },
      sourcePath: "docs/ko/example.md",
      sourceLine: 4,
    },
    {
      buildMode: "preview",
      language: "ko",
      timezone: "Asia/Seoul",
      configuration: {},
    },
  );
  assert.equal(executed.normalized.canonicalUrl, "https://www.youtube.com/watch?v=2GNIgiza-m0");
  assert.equal(executed.rendered.privacyMode, "external-request");
  assert.match(executed.rendered.staticHtml, /https:\/\/www\.youtube-nocookie\.com\/embed\/2GNIgiza-m0/u);
  assert.match(executed.rendered.staticHtml, /loading="lazy"/u);
  assert.match(executed.rendered.staticHtml, /referrerpolicy="strict-origin-when-cross-origin"/u);
  assert.doesNotMatch(executed.rendered.staticHtml, /\?si=|youtube\.com\/embed/u);

  const compiled = await compileMarkdown({
    body: '::youtube{id="2GNIgiza-m0" title="YouTube test video"}',
    description: "Embed fixture",
    sourcePath: "docs/ko/example.md",
    postId: "ko:example",
    language: "ko",
    assetsRoot: resolve(repositoryRoot, "assets/content"),
    config,
    registry,
    assetCache: new Map(),
    buildMode: "preview",
  });
  assert.match(compiled.bodyHtml, /<iframe[^>]+youtube-nocookie\.com\/embed\/2GNIgiza-m0/u);
  assert.match(compiled.bodyHtml, /<noscript><p><a href="https:\/\/www\.youtube\.com\/watch\?v=2GNIgiza-m0">YouTube test video<\/a><\/p><\/noscript>/u);
  assert.doesNotMatch(compiled.bodyHtml, /<\/iframe><p><a href="https:\/\/www\.youtube\.com/u);
  assert.equal(compiled.embeds.length, 1);
});

test("rejects malformed YouTube directives and unsafe iframe capabilities", async () => {
  const config = loadProjectConfig({ repositoryRoot });
  const registry = await loadEmbedRegistry(config.embeds, repositoryRoot);
  const context = {
    buildMode: "preview" as const,
    language: "ko",
    timezone: "Asia/Seoul",
    configuration: {},
  };
  await assert.rejects(() =>
    executeEmbedDirective(
      registry,
      {
        name: "youtube",
        attributes: { id: "short", title: "Invalid" },
        sourcePath: "fixture.md",
        sourceLine: 1,
      },
      context,
    ),
  );
  await assert.rejects(() =>
    executeEmbedDirective(
      registry,
      {
        name: "youtube",
        attributes: { id: "2GNIgiza-m0", title: "Video", autoplay: "1" },
        sourcePath: "fixture.md",
        sourceLine: 1,
      },
      context,
    ),
  );
  assert.throws(() =>
    assertSafeEmbedHtml(
      '<iframe src="https://www.youtube-nocookie.com/embed/2GNIgiza-m0" title="Video" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" sandbox="allow-scripts" allow="camera" allowfullscreen></iframe>',
      "unsafe-test",
      ["autoplay"],
    ),
  );
});

test("executes a synthetic test-only embed plugin", async () => {
  const config = loadProjectConfig({ repositoryRoot });
  const registry = await loadEmbedRegistry(
    {
      ...config.embeds,
      plugins: [
        {
          id: "test-embed",
          package: "./tests/fixtures/plugins/test-embed/index.ts",
          enabled: true,
        },
      ],
    },
    repositoryRoot,
  );
  const result = await executeEmbedDirective(
    registry,
    {
      name: "test-embed",
      attributes: { id: "demo", title: "Demo embed" },
      sourcePath: "fixture.md",
      sourceLine: 3,
    },
    {
      buildMode: "preview",
      language: "en",
      timezone: "Asia/Seoul",
      configuration: {},
    },
  );
  assert.equal(result.pluginId, "test-embed");
  assert.match(result.rendered.staticHtml, /Demo embed/u);
  assert.equal(result.rendered.privacyMode, "local-only");
});
