import assert from "node:assert/strict";
import { test } from "vitest";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { executeEmbedDirective, loadEmbedRegistry } from "../../packages/embed-core/src/index.ts";
import { loadProjectConfig } from "../../packages/project-config/src/index.ts";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

test("refuses remote, duplicate, and unregistered embed plugins", async () => {
  const config = loadProjectConfig({ repositoryRoot });
  assert.equal(config.embeds.plugins.length, 0);
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
