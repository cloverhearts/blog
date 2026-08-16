import assert from "node:assert/strict";
import { test } from "vitest";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { ConfigurationError, loadProjectConfig } from "../../packages/project-config/src/index.ts";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

test("loads every shared configuration file and resolves public URLs", () => {
  const config = loadProjectConfig({
    repositoryRoot,
    env: {
      SITE_ORIGIN: "https://blog.cloverhearts.com",
      SITE_BASE_PATH: "",
    },
  });
  assert.equal(config.site.identity.name, "CloverHearts Blog");
  assert.equal(config.resolved.origin, "https://blog.cloverhearts.com");
  assert.equal(config.resolved.basePath, "");
  assert.equal(config.resolved.ga4.enabled, false);
  assert.equal(
    config.resolvePublicUrl("/posts/example/"),
    "https://blog.cloverhearts.com/posts/example/",
  );
  assert.equal(config.localizeRoute("en", "/posts/example/"), "/en/posts/example/");
  assert.equal(config.authorshipDisclosure.aiAssistance[0], "proofreading");
});

test("rejects a malformed GA4 measurement ID", () => {
  assert.throws(
    () =>
      loadProjectConfig({
        repositoryRoot,
        env: {
          SITE_ORIGIN: "https://blog.cloverhearts.com",
          GA4_MEASUREMENT_ID: "not-a-measurement-id",
        },
      }),
    ConfigurationError,
  );
});

test("accepts a portability base path without changing the production origin", () => {
  const config = loadProjectConfig({
    repositoryRoot,
    env: {
      SITE_ORIGIN: "https://blog.cloverhearts.com",
      SITE_BASE_PATH: "/blog",
    },
    expectedProductionOrigin: true,
  });
  assert.equal(
    config.resolvePublicUrl("/en/posts/example/"),
    "https://blog.cloverhearts.com/blog/en/posts/example/",
  );
});
