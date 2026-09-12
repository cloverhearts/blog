import assert from "node:assert/strict";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "vitest";
import { parse } from "yaml";

import { buildWeb } from "../../apps/blog-web/src/build.ts";
import { compileContent } from "../../packages/content-compiler/src/compile.ts";
import { ConfigurationError, loadProjectConfig } from "../../packages/project-config/src/index.ts";
import { buildManagedPages } from "../../packages/managed-page-compiler/src/index.ts";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

test("rejects unsafe or placeholder owner contact destinations", () => {
  const root = copyConfigWorkspace();
  const site = parse(readFileSync(resolve(root, "config/site.yaml"), "utf8")) as {
    identity: { owner: { contacts: Array<Record<string, unknown>> } };
  } & Record<string, unknown>;
  const first = site.identity.owner.contacts[0];
  if (!first) throw new Error("expected a contact");
  first.href = "https://user:secret@github.com/example";
  writeFileSync(resolve(root, "config/site.yaml"), yamlFrom(site));
  assert.throws(
    () => loadProjectConfig({ repositoryRoot: root, env: { SITE_ORIGIN: "https://blog.cloverhearts.com" } }),
    ConfigurationError,
  );
});

test("rejects include and exclude of the same translation key", () => {
  const root = copyConfigWorkspace();
  const curated = parse(readFileSync(resolve(root, "config/curated-collections.yaml"), "utf8")) as {
    collections: { work: { selector: { includeTranslationKeys: string[]; excludeTranslationKeys: string[] } } };
  };
  curated.collections.work.selector.includeTranslationKeys = ["same-key"];
  curated.collections.work.selector.excludeTranslationKeys = ["same-key"];
  writeFileSync(resolve(root, "config/curated-collections.yaml"), yamlFrom(curated));
  assert.throws(
    () => loadProjectConfig({ repositoryRoot: root, env: { SITE_ORIGIN: "https://blog.cloverhearts.com" } }),
    ConfigurationError,
  );
});

test("derives curated membership, work chronology, and configuration-only extra collections", async () => {
  const root = createCuratedWorkspace();
  const config = loadProjectConfig({
    repositoryRoot: root,
    env: { SITE_ORIGIN: "https://blog.cloverhearts.com" },
  });
  assert.equal(config.navigation.primary.map((item) => item.href).join(","), "/posts/,/work/,/daily/,/explore/,/search/");
  const compiled = await compileContent({ config, mode: "production" });
  const work = compiled.manifest.curatedCollections.find((collection) => collection.id === "work");
  const daily = compiled.manifest.curatedCollections.find((collection) => collection.id === "daily");
  const extra = compiled.manifest.curatedCollections.find((collection) => collection.id === "notes");
  assert.ok(work && daily && extra);
  assert.deepEqual(work.items.map((item) => item.translationKey), [
    "led-project",
    "overlap-item",
    "work-five",
    "work-four",
    "work-three",
  ]);
  assert.equal(work.items[0]?.dateSource, "work-evidence");
  assert.equal(work.items[0]?.period?.end, "2026-10");
  assert.deepEqual(daily.items.map((item) => item.translationKey), ["family-day", "overlap-item"]);
  assert.deepEqual(extra.items.map((item) => item.translationKey), ["family-day"]);
  assert.equal(compiled.posts.some((post) => post.translationKey === "excluded-note"), true);
  assert.equal(daily.items.some((item) => item.translationKey === "excluded-note"), false);

  await buildWeb({ config, mode: "production" });
  const workPage = readFileSync(resolve(root, ".artifacts/web/production/site/work/index.html"), "utf8");
  assert.match(workPage, /data-collection-intro/u);
  assert.match(workPage, /data-collection-presentation="work"/u);
  assert.match(workPage, /직접 만들거나 주도한 프로젝트/u);
  assert.match(workPage, /5편/u);
  assert.match(workPage, /led-project/u);
  assert.doesNotMatch(workPage, /family-day/u);
  assert.match(workPage, /작업 기간/u);
  assert.match(workPage, /작업 기간: 2026\. 01–2026\. 10/u);
  assert.match(workPage, /<time datetime="2026-09-13T13:00:00\+09:00">2026\. 09\. 13 13:00<\/time>/u);

  const explore = readFileSync(resolve(root, ".artifacts/web/production/site/explore/index.html"), "utf8");
  assert.match(explore, /\/work\//u);
  assert.match(explore, /\/daily\//u);
  assert.match(explore, /\/notes\//u);
  assert.match(explore, /research-lab|연구소/u);
  assert.match(explore, /class="page-intro explore-intro"/u);
  assert.match(explore, /class="explore-collection-list" data-explore-collections/u);
  assert.match(explore, /class="explore-collection-card"><a[^>]+><small>[^<]+<\/small><strong>[^<]+<\/strong><span>[^<]+<\/span><b aria-hidden="true">→<\/b><\/a>/u);
  assert.match(explore, /class="explore-grid" data-explore-grid/u);
  assert.match(explore, /class="explore-taxonomy-list" data-taxonomy-cloud/u);

  const home = readFileSync(resolve(root, ".artifacts/web/production/site/index.html"), "utf8");
  assert.match(home, /data-author-intro/u);
  assert.doesNotMatch(home, /href="\/profile\/"/u, "Draft profiles must not receive live links");
  assert.match(home, /data-search-trigger/u);
  assert.match(home, /<dialog class="search-dialog" data-search-dialog/u);
  assert.match(home, /전체 보기[\s\S]*주요 작업[\s\S]*일상 기록[\s\S]*둘러보기[\s\S]*검색/u);
  const homeHero = home.match(/<section class="home-hero" data-home-hero>([\s\S]*?)<\/section>/u)?.[1] ?? "";
  assert.match(homeHero, /class="home-hero__visual"[^>]*><img class="home-hero__image"[^>]+alt=""[^>]+data-hero-thumbnail=/u);
  assert.doesNotMatch(homeHero, /context\.collect\(\)|workflow\.execute\(\)/u);
  assert.match(homeHero, /<h1><a class="home-hero__title-link" href="\/posts\/led-project\/" hreflang="ko"/u, "Hero follows its Selected Work image, not an unrelated recent post");
  const homeFeatured = home.match(/<section class="home-section home-featured" data-home-featured>([\s\S]*?)<\/section>/u)?.[1] ?? "";
  assert.match(homeFeatured, /<div class="section-heading" data-section-heading><h2>추천 글<\/h2>/u);
  assert.doesNotMatch(homeFeatured, /data-eyebrow/u);
  const homeWork = home.match(/<section class="home-section home-work" data-home-work>([\s\S]*?)<\/section>/u)?.[1] ?? "";
  assert.equal((homeWork.match(/<article class="post-card" data-post-card>/g) ?? []).length, 5);
  assert.doesNotMatch(homeWork, /data-eyebrow/u);
  assert.equal(
    (homeWork.match(/sizes="\(max-width: 40rem\) 100vw, \(max-width: 80rem\) 35vw, 27rem"/g) ?? []).length,
    5,
  );

  const englishWork = readFileSync(resolve(root, ".artifacts/web/production/site/en/work/index.html"), "utf8");
  assert.match(englishWork, /Selected Work/u);
  assert.match(englishWork, /Available in/u);

  await buildManagedPages({ config, mode: "production" });
  assert.equal(existsSync(resolve(root, ".artifacts/managed/production/pages/profile/index.html")), false);
  await buildManagedPages({ config, mode: "preview" });
  const profile = readFileSync(resolve(root, ".artifacts/managed/preview/pages/profile/index.html"), "utf8");
  assert.match(profile, /ProfilePage/u);
  assert.match(profile, /#person/u);
});

test("keeps permanent curated routes without layout-review sample selectors", () => {
  const config = loadProjectConfig({
    repositoryRoot,
    env: { SITE_ORIGIN: "https://blog.cloverhearts.com" },
  });
  assert.equal(config.routes.paths.explore, "/explore/");
  assert.equal(config.routes.curated.work, "/work/");
  assert.equal(config.routes.curated.daily, "/daily/");
  assert.equal(config.curatedCollections.collections.work?.presentation, "work");
  assert.deepEqual(config.curatedCollections.collections.work?.selector.includeTranslationKeys, []);
  assert.deepEqual(config.curatedCollections.collections.daily?.selector.anyCategories, []);
  assert.deepEqual(config.taxonomy.categories, {});
  assert.deepEqual(Object.keys(config.taxonomy.tags).sort(), ["daily-record", "work-evidence"]);
  assert.equal(config.site.identity.owner.displayName, "CloverHearts");
  assert.equal(config.site.identity.owner.contacts[0]?.kind, "github");
});

function copyConfigWorkspace(): string {
  const root = mkdtempSync(resolve(tmpdir(), "blog-curated-config-"));
  cpSync(resolve(repositoryRoot, "config"), resolve(root, "config"), { recursive: true });
  writeFileSync(resolve(root, "CONTENT_RULES.md"), "content rules");
  writeFileSync(resolve(root, "I18N.md"), "i18n rules");
  return root;
}

function createCuratedWorkspace(): string {
  const root = mkdtempSync(resolve(tmpdir(), "blog-curated-"));
  for (const directory of [
    "docs/ko/research-lab",
    "docs/ko/family-life",
    "docs/en/research-lab",
    "managed-pages/profile",
    "assets/content",
  ]) {
    mkdirSync(resolve(root, directory), { recursive: true });
  }
  cpSync(resolve(repositoryRoot, "config"), resolve(root, "config"), { recursive: true });
  const routes = parse(readFileSync(resolve(root, "config/routes.yaml"), "utf8")) as {
    curated: Record<string, string>;
  };
  // Synthetic taxonomy belongs to this fixture, never to live sample content.
  const taxonomyPath = resolve(root, "config/taxonomy.yaml");
  const taxonomy = parse(readFileSync(taxonomyPath, "utf8"));
  for (const id of ["research-lab", "family-life"]) {
    taxonomy.categories[id] = { labels: { en: id, ko: id, ja: id } };
  }
  for (const id of ["research", "ai", "family"]) {
    taxonomy.tags[id] = { labels: { en: id, ko: id, ja: id } };
  }
  writeFileSync(taxonomyPath, yamlFrom(taxonomy));
  routes.curated.notes = "/notes/";
  writeFileSync(resolve(root, "config/routes.yaml"), yamlFrom(routes));
  const curated = parse(readFileSync(resolve(root, "config/curated-collections.yaml"), "utf8")) as {
    collections: Record<string, unknown> & {
      work: { selector: { includeTranslationKeys: string[] } };
    };
  };
  curated.collections.work.selector.includeTranslationKeys = [
    "led-project",
    "overlap-item",
    "work-three",
    "work-four",
    "work-five",
  ];
  curated.collections.notes = {
    routeKey: "notes",
    labels: { en: "Notes", ko: "노트", ja: "ノート" },
    descriptions: { en: "A notes collection.", ko: "노트 모음입니다.", ja: "ノートの集まりです。" },
    selector: {
      anyTags: ["daily-record"],
      anyCategories: [],
      includeTranslationKeys: [],
      excludeTranslationKeys: ["overlap-item", "excluded-note"],
    },
    order: { primary: "created-at", fallback: "created-at", direction: "descending" },
    presentation: "journal",
    robots: "index",
  };
  writeFileSync(resolve(root, "config/curated-collections.yaml"), yamlFrom(curated));
  writeFileSync(resolve(root, "CONTENT_RULES.md"), readFileSync(resolve(repositoryRoot, "CONTENT_RULES.md")));
  writeFileSync(resolve(root, "I18N.md"), readFileSync(resolve(repositoryRoot, "I18N.md")));
  writeFileSync(resolve(root, "DESIGN.md"), readFileSync(resolve(repositoryRoot, "DESIGN.md")));
  symlinkSync(resolve(repositoryRoot, "node_modules"), resolve(root, "node_modules"));
  writePost(root, "ko", "research-lab", "led-project", "source", "주도한 프로젝트", ["work-evidence", "research"], {
    sortDate: "2026-10-01",
    period: { start: "2026-01", end: "2026-10" },
  });
  writePost(root, "en", "research-lab", "led-project", "reviewed", "A led project", ["work-evidence", "research"], {
    sortDate: "2026-10-01",
    period: { start: "2026-01", end: "2026-10" },
  });
  writePost(root, "ko", "research-lab", "overlap-item", "source", "겹치는 항목", ["work-evidence", "daily-record", "research"]);
  writePost(root, "ko", "research-lab", "work-three", "source", "세 번째 주요 작업", ["research", "ai"]);
  writePost(root, "ko", "research-lab", "work-four", "source", "네 번째 주요 작업", ["research", "ai"]);
  writePost(root, "ko", "research-lab", "work-five", "source", "다섯 번째 주요 작업", ["research", "ai"]);
  writePost(root, "ko", "family-life", "family-day", "source", "가족과 보낸 하루", ["daily-record", "family"]);
  writePost(root, "ko", "family-life", "excluded-note", "source", "제외된 기록", ["daily-record", "family"]);
  const daily = parse(readFileSync(resolve(root, "config/curated-collections.yaml"), "utf8")) as {
    collections: { daily: { selector: { excludeTranslationKeys: string[] } } };
  };
  daily.collections.daily.selector.excludeTranslationKeys = ["excluded-note"];
  writeFileSync(resolve(root, "config/curated-collections.yaml"), yamlFrom(daily));
  cpSync(resolve(repositoryRoot, "managed-pages/profile"), resolve(root, "managed-pages/profile"), { recursive: true });
  const profilePath = resolve(root, "managed-pages/profile/page.yaml");
  const profile = parse(readFileSync(profilePath, "utf8"));
  profile.status = "draft";
  writeFileSync(profilePath, yamlFrom(profile));
  return root;
}

function writePost(
  root: string,
  language: "en" | "ko",
  category: string,
  slug: string,
  status: "source" | "reviewed",
  title: string,
  tags: readonly string[],
  workEvidence?: { readonly sortDate: string; readonly period?: { readonly start: string; readonly end: string } },
): void {
  const evidence = workEvidence
    ? `workEvidence:
  sortDate: "${workEvidence.sortDate}"
${workEvidence.period ? `  period:\n    start: "${workEvidence.period.start}"\n    end: "${workEvidence.period.end}"\n` : ""}`
    : "";
  writeFileSync(
    resolve(root, `docs/${language}/${category}/2026-09-13-${slug}.md`),
    `---
title: "${title}"
description: "Summary for ${slug} used in curated discovery tests."
translationKey: "${slug}"
originalLanguage: "ko"
translationStatus: "${status}"
slug: "${slug}"
tags:
${tags.map((tag) => `  - "${tag}"`).join("\n")}
createdAt: "2026-09-13T13:00:00+09:00"
representativeImage: "generated-card"
draft: false
${evidence}---

## Heading

Body for ${slug}.
`,
  );
}

function yamlFrom(value: unknown): string {
  return `${JSON.stringify(value, null, 2)}\n`;
}
