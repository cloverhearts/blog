import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "vitest";

import { DISCOVERY_ARTIFACT_SCHEMA_VERSION } from "../../packages/contracts/src/index.ts";
import { loadProjectConfig } from "../../packages/project-config/src/index.ts";
import { buildDiscovery } from "../../packages/site-discovery/src/build.ts";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

test("uses the AI-guide discovery artifact schema version in generated manifests", () => {
  assert.equal(DISCOVERY_ARTIFACT_SCHEMA_VERSION, 3);
});

test("rejects mixed or stale discovery inputs", () => {
  const root = mkdtempSync(resolve(tmpdir(), "blog-discovery-"));
  const config = loadProjectConfig({
    repositoryRoot,
    env: { SITE_ORIGIN: "https://blog.cloverhearts.com" },
  });
  mkdirSync(resolve(root, "content"), { recursive: true });
  writeFileSync(resolve(root, "content/manifest.json"), "{\"provenance\":{\"buildMode\":\"preview\"}}");
  assert.throws(() =>
    buildDiscovery({
      config,
      contentDirectory: resolve(root, "content"),
      webDirectory: resolve(root, "web"),
      managedDirectory: resolve(root, "managed"),
      outputDirectory: resolve(root, "discovery"),
    }),
  );
});
