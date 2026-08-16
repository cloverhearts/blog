import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "vitest";

import { buildWeb } from "../../apps/blog-web/src/build.ts";
import { compileContent } from "../../packages/content-compiler/src/compile.ts";
import { buildManagedPages } from "../../packages/managed-page-compiler/src/index.ts";
import { loadProjectConfig } from "../../packages/project-config/src/index.ts";
import { assembleRelease, verifyPages } from "../../packages/release-assembler/src/index.ts";
import { buildSearch } from "../../packages/search-indexer/src/index.ts";
import { buildDiscovery } from "../../packages/site-discovery/src/build.ts";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

test("builds an empty production site with required Pages files", async () => {
  const config = loadProjectConfig({
    repositoryRoot,
    env: {
      SITE_ORIGIN: "https://blog.cloverhearts.com",
      SITE_BASE_PATH: "",
    },
    requireDeploymentInputs: true,
  });
  await compileContent({ config, mode: "production" });
  await buildWeb({ config, mode: "production" });
  await buildSearch({ config, mode: "production" });
  await buildManagedPages({ config, mode: "production" });
  buildDiscovery({ config });
  assembleRelease({ config });
  verifyPages(config);

  const index = readFileSync(resolve(repositoryRoot, "dist/index.html"), "utf8");
  assert.match(index, /<html lang="ko">/u);
  assert.match(index, /CloverHearts Blog/u);
  assert.equal(existsSync(resolve(repositoryRoot, "dist/404.html")), true);
  assert.equal(existsSync(resolve(repositoryRoot, "dist/en/index.html")), true);
  assert.equal(existsSync(resolve(repositoryRoot, "dist/ja/index.html")), true);
  assert.equal(existsSync(resolve(repositoryRoot, "dist/robots.txt")), true);
  assert.equal(existsSync(resolve(repositoryRoot, "dist/llms.txt")), true);
  assert.equal(existsSync(resolve(repositoryRoot, "dist/sitemap.xml")), true);
  assert.equal(existsSync(resolve(repositoryRoot, "dist/rss.xml")), true);
  assert.doesNotMatch(index, /<script src="https:\/\/www\.googletagmanager\.com/u);
});
