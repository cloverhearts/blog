import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "vitest";

import { buildWeb } from "../../apps/blog-web/src/build.ts";
import { renderDocument } from "../../apps/blog-web/src/lib/render-document.ts";
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
  await buildManagedPages({ config, mode: "production" });
  await buildWeb({ config, mode: "production" });
  await buildSearch({ config, mode: "production" });
  buildDiscovery({ config });
  assembleRelease({ config });
  verifyPages(config);

  const index = readFileSync(resolve(repositoryRoot, "dist/index.html"), "utf8");
  assert.match(index, /<html lang="ko">/u);
  assert.match(index, /CloverHearts Labs/u);
  assert.equal(existsSync(resolve(repositoryRoot, "dist/404.html")), true);
  assert.equal(existsSync(resolve(repositoryRoot, "dist/en/index.html")), true);
  assert.equal(existsSync(resolve(repositoryRoot, "dist/ja/index.html")), true);
  assert.equal(existsSync(resolve(repositoryRoot, "dist/robots.txt")), true);
  assert.equal(existsSync(resolve(repositoryRoot, "dist/llms.txt")), true);
  assert.equal(existsSync(resolve(repositoryRoot, "dist/sitemap.xml")), true);
  assert.equal(existsSync(resolve(repositoryRoot, "dist/rss.xml")), true);
  assert.doesNotMatch(index, /<script src="https:\/\/www\.googletagmanager\.com/u);

  const searchPage = readFileSync(resolve(repositoryRoot, "dist/search/index.html"), "utf8");
  assert.match(searchPage, /<form role="search"/u);
  assert.match(searchPage, /<noscript>/u);
  assert.match(searchPage, /\/_assets\/app\/search.js/u);
  assert.equal(existsSync(resolve(repositoryRoot, "dist/_assets/app/search.js")), true);
  assert.equal(existsSync(resolve(repositoryRoot, "dist/_assets/app/image-viewer.js")), true);
  assert.equal(existsSync(resolve(repositoryRoot, "dist/_assets/search/ko")), true);
  assert.equal(existsSync(resolve(repositoryRoot, "dist/_assets/search/en")), true);
  assert.equal(existsSync(resolve(repositoryRoot, "dist/_assets/search/ja")), true);
});

test("adds the localized image viewer only to post documents", () => {
  const base = {
    language: "ko" as const,
    title: "테스트",
    description: "테스트 설명",
    siteName: "CloverHearts Labs",
    canonicalUrl: "https://blog.cloverhearts.com/posts/test/",
    robots: "index,follow",
    homeHref: "/",
    profileHref: "/profile/",
    authorName: "CloverHearts",
    searchIndex: "/_assets/search/ko/",
    basePath: "",
    primaryNavigation: [],
    languageNavigation: [],
    head: "",
    body: '<article><div data-article-body><img src="/example.png" alt="예제"></div></article>',
    footer: "",
  };
  const post = renderDocument({ ...base, pageKind: "post" });
  const collection = renderDocument({ ...base, pageKind: "collection" });

  assert.match(post, /<dialog class="image-viewer"[^>]*data-image-viewer/u);
  assert.match(post, /aria-label="이미지 확대 보기"/u);
  assert.match(post, /<script type="module" src="\/_assets\/app\/image-viewer.js">/u);
  assert.doesNotMatch(collection, /data-image-viewer/u);
  assert.doesNotMatch(collection, /image-viewer.js/u);
});
