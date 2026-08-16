import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "vitest";
import { parse } from "yaml";

import {
  GITHUB_PAGES_PRO_LIMITS,
  type PerformanceBudgets,
  validatePerformanceBudgets,
} from "../../packages/project-config/src/performance-budgets.ts";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

function read(path: string): string {
  return readFileSync(resolve(repositoryRoot, path), "utf8");
}

function readYaml<T>(path: string): T {
  return parse(read(path)) as T;
}

interface SiteConfiguration {
  readonly schemaVersion: number;
  readonly production: { readonly origin: string; readonly basePath: string };
  readonly languages: {
    readonly default: string;
    readonly source: string;
    readonly primaryExperience: readonly string[];
    readonly browserSelection: string;
    readonly postNavigationFallback: readonly string[];
    readonly supported: ReadonlyArray<{
      readonly id: string;
      readonly routePrefix: string;
    }>;
  };
}

interface BudgetConfiguration {
  readonly basis: {
    readonly hosting: string;
    readonly accountPlan: string;
    readonly officialLimits: typeof GITHUB_PAGES_PRO_LIMITS;
  };
  readonly budgets: PerformanceBudgets;
}

interface NavigationConfiguration {
  readonly primary: ReadonlyArray<{
    readonly href: string;
    readonly type: string;
    readonly labels: Readonly<Record<string, string>>;
  }>;
}

test("pins production origin, Korean defaults, manual language selection, and fallback order", () => {
  const site = readYaml<SiteConfiguration>("config/site.yaml");
  assert.equal(site.schemaVersion, 6);
  assert.deepEqual(site.production, {
    origin: "https://blog.cloverhearts.com",
    basePath: "",
  });
  assert.equal(site.languages.default, "ko");
  assert.equal(site.languages.source, "ko");
  assert.deepEqual(site.languages.primaryExperience, ["ko", "en"]);
  assert.equal(site.languages.browserSelection, "manual-only");
  assert.deepEqual(site.languages.postNavigationFallback, ["en", "ko"]);
});

test("keeps Japanese supported outside the primary design review pair", () => {
  const site = readYaml<SiteConfiguration>("config/site.yaml");
  assert.deepEqual(
    site.languages.supported.map(({ id }) => id),
    ["ko", "en", "ja"],
  );
  assert.equal(site.languages.primaryExperience.includes("ja"), false);
});

test("uses unprefixed Korean and explicit English and Japanese route trees", () => {
  const site = readYaml<SiteConfiguration>("config/site.yaml");
  assert.deepEqual(
    site.languages.supported.map(({ id, routePrefix }) => ({ id, routePrefix })),
    [
      { id: "ko", routePrefix: "" },
      { id: "en", routePrefix: "/en" },
      { id: "ja", routePrefix: "/ja" },
    ],
  );
  assert.equal(
    readYaml<{ readonly language: string }>("templates/managed-page/page.yaml")
      .language,
    "ko",
  );
});

test("defines primary exploration as localized static links", () => {
  const navigation = readYaml<NavigationConfiguration>("config/navigation.yaml");
  assert.deepEqual(
    navigation.primary.map(({ href }) => href),
    ["/posts/", "/categories/", "/tags/", "/archive/", "/search/"],
  );
  for (const item of navigation.primary) {
    assert.equal(item.type, "internal");
    assert.deepEqual(Object.keys(item.labels), ["en", "ko", "ja"]);
    assert.equal(Object.values(item.labels).every(Boolean), true);
  }
});

test("defines conservative GitHub Pages Pro budgets", () => {
  const configuration = readYaml<BudgetConfiguration>(
    "config/performance-budgets.yaml",
  );
  assert.equal(configuration.basis.hosting, "github-pages");
  assert.equal(configuration.basis.accountPlan, "github-pro");
  assert.deepEqual(
    configuration.basis.officialLimits,
    GITHUB_PAGES_PRO_LIMITS,
  );
  const budgets = validatePerformanceBudgets(configuration.budgets);
  assert.equal(budgets.publishedSiteMiB, 512);
  assert.equal(budgets.deploymentMinutes, 8);
  assert.equal(budgets.monthlyBandwidthWarningGiB, 75);
  assert.equal(budgets.monthlyActionsMinutesWarning, 2400);
  assert.equal(budgets.actionsArtifactStorageMiB, 512);
});

test("rejects budgets that consume a Pages service ceiling", () => {
  const { budgets } = readYaml<BudgetConfiguration>(
    "config/performance-budgets.yaml",
  );
  assert.throws(() =>
    validatePerformanceBudgets({ ...budgets, publishedSiteMiB: 1025 }),
  );
  assert.throws(() =>
    validatePerformanceBudgets({ ...budgets, deploymentMinutes: 10 }),
  );
  assert.throws(() =>
    validatePerformanceBudgets({ ...budgets, monthlyBandwidthWarningGiB: 100 }),
  );
  assert.throws(() =>
    validatePerformanceBudgets({ ...budgets, monthlyActionsMinutesWarning: 3000 }),
  );
  assert.throws(() =>
    validatePerformanceBudgets({ ...budgets, actionsArtifactStorageMiB: 1025 }),
  );
});

test("ships semantic classless CSS with resilient Pretendard fallbacks", () => {
  const css = read("apps/blog-web/src/styles/classless.css");
  assert.match(css, /pretendardvariable-dynamic-subset\.css/u);
  assert.match(css, /font-family: "Pretendard Variable", Pretendard/u);
  for (const selector of [
    "body > header",
    "body > main",
    "article",
    "nav ul",
  ] as const) {
    assert.ok(css.includes(selector), `Missing semantic selector: ${selector}`);
  }
  assert.match(css, /:focus-visible/u);
  assert.match(css, /@media print/u);
  assert.doesNotMatch(css, /https?:\/\//u);

  const shell = read("apps/blog-web/src/layouts/BlogShell.astro");
  assert.match(shell, /import "\.\.\/styles\/classless\.css"/u);
  for (const landmark of ["<header>", "<nav", "<main", "<footer>"] as const) {
    assert.ok(shell.includes(landmark), `Missing shell landmark: ${landmark}`);
  }
  assert.match(shell, /data-skip-link/u);
  assert.doesNotMatch(shell, /class=/u);
});

test("keeps the Pretendard dynamic subset within the font budget", () => {
  const { budgets } = readYaml<BudgetConfiguration>(
    "config/performance-budgets.yaml",
  );
  const directory = resolve(
    repositoryRoot,
    "node_modules/pretendard/dist/web/variable/woff2-dynamic-subset",
  );
  const fontBytes = readdirSync(directory).reduce(
    (total, filename) => total + statSync(resolve(directory, filename)).size,
    0,
  );
  assert.ok(fontBytes > 0);
  assert.ok(fontBytes <= budgets.fonts.publishedAssetsMiB * 1024 * 1024);
});

test("keeps authoring asset limits aligned with release budgets", () => {
  const { budgets } = readYaml<BudgetConfiguration>(
    "config/performance-budgets.yaml",
  );
  const rules = read("CONTENT_RULES.md");
  assert.match(rules, new RegExp(`${budgets.images.sourceFileMiB} MiB`, "u"));
  assert.match(rules, new RegExp(`${budgets.images.sourceMegapixels} megapixels`, "u"));
  assert.match(rules, new RegExp(`${budgets.images.renderedFileKiB} KiB`, "u"));
  assert.match(rules, new RegExp(`${budgets.largestPublishedFileMiB} MiB`, "u"));
  assert.match(rules, new RegExp(`${budgets.fonts.publishedAssetsMiB} MiB`, "u"));
});

test("keeps agent and runbook baseline instructions aligned", () => {
  assert.match(read("AGENTS.md"), /`UX_FLOW\.md` is authoritative/u);
  assert.match(read("AGENTS.md"), /`config\/performance-budgets\.yaml` owns/u);
  assert.match(read("DEVELOPMENT.md"), /https:\/\/blog\.cloverhearts\.com/u);
  assert.match(read("QUALITY_GATES.md"), /512 MiB release\/repository/u);
  assert.match(read("QUALITY_GATES.md"), /2,400 monthly Actions minutes/u);
});

test("defines a static recovery path for every primary UX flow", () => {
  const flow = read("UX_FLOW.md");
  for (const required of [
    "Persistent page frame",
    "Discovery flow",
    "Reading flow",
    "Search flow",
    "Managed-page flow",
    "Error and recovery flow",
    "Enhancement boundary",
  ] as const) {
    assert.ok(flow.includes(required), `Missing UX flow: ${required}`);
  }
  assert.match(flow, /Without JavaScript/u);
  assert.match(flow, /normal links in initial HTML/u);
});
