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
  readonly listings: { readonly pageSize: number };
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
  readonly footer: ReadonlyArray<{
    readonly href: string;
    readonly type: string;
    readonly labels: Readonly<Record<string, string>>;
  }>;
}

test("pins production origin, Korean defaults, manual language selection, and fallback order", () => {
  const site = readYaml<SiteConfiguration>("config/site.yaml");
  assert.equal(site.schemaVersion, 7);
  assert.deepEqual(site.production, {
    origin: "https://blog.cloverhearts.com",
    basePath: "",
  });
  assert.equal(site.languages.default, "ko");
  assert.equal(site.languages.source, "ko");
  assert.deepEqual(site.languages.primaryExperience, ["ko", "en"]);
  assert.equal(site.languages.browserSelection, "manual-only");
  assert.deepEqual(site.languages.postNavigationFallback, ["en", "ko"]);
  assert.equal(site.listings.pageSize, 10);
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
    ["/posts/", "/work/", "/daily/", "/explore/", "/search/"],
  );
  assert.deepEqual(
    navigation.footer.map(({ href }) => href),
    [],
  );
  for (const item of [...navigation.primary, ...navigation.footer]) {
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

test("ships named component CSS with resilient Pretendard fallbacks", () => {
  const css = read("apps/blog-web/src/styles/blog.css");
  assert.match(css, /pretendardvariable-dynamic-subset\.css/u);
  assert.match(css, /font-family: "Pretendard Variable", Pretendard/u);
  assert.match(css, /--primary: #12b76a/u);
  assert.match(css, /--text: #17211c/u);
  assert.match(css, /--reading-width: 40rem/u);
  assert.match(css, /--motion-fast: \.18s[^}]*--motion-ease: cubic-bezier\(\.2, \.8, \.2, 1\)/u);
  assert.match(css, /\.skip-link\) a \{[^}]*transition: color var\(--motion-fast\) var\(--motion-ease\)[^}]*text-underline-offset var\(--motion-fast\) var\(--motion-ease\)/u);
  assert.match(css, /a:active[^}]*opacity: \.68[^}]*text-underline-offset: \.12em/u);
  assert.match(css, /\.site-control--button, \.site-control--summary[^}]*transform var\(--motion-fast\) var\(--motion-ease\)/u);
  assert.match(css, /:is\(\.site-control--button:not\(:disabled\):active, \.site-control--summary:active\)[^}]*opacity: \.82[^}]*translateY\(\.0625rem\) scale\(\.985\)/u);
  assert.match(css, /@media \(hover: hover\)[\s\S]*:is\(\.site-control--button:not\(:disabled\):hover, \.site-control--summary:hover\)[^}]*translateY\(-\.0625rem\)/u);
  assert.match(css, /\.site-header__inner[^}]*align-items: center[^}]*box-sizing: border-box/u);
  assert.match(css, /\.site-brand[^}]*display: inline-flex[^}]*align-items: center[^}]*min-height: 2\.75rem[^}]*line-height: 1\.25/u);
  assert.match(css, /\.language-navigation[^}]*display: flex[^}]*align-items: center[^}]*min-height: 2\.75rem/u);
  assert.match(css, /@media \(max-width: 64rem\)[\s\S]*\.site-header__inner[^}]*grid-template-columns: auto 1fr[^}]*grid-template-rows: 4rem auto[^}]*row-gap: 0/u);
  assert.match(css, /\.home-hero h1[^}]*font-weight: 620/u);
  assert.match(css, /\.home-hero__copy[^}]*width: 48%/u);
  assert.match(css, /\.home-hero__image[^}]*width: 100%[^}]*height: 100%[^}]*object-fit: cover/u);
  assert.match(css, /\.page--home main[^}]*padding-block: 0 clamp\(2\.5rem, 5vw, 4rem\)/u);
  assert.match(css, /\.home-hero \{[^}]*box-sizing: border-box[^}]*min-height: 25rem/u);
  assert.match(css, /\.page--home \.site-footer[^}]*margin-block-start: clamp\(2\.5rem, 6vw, 4rem\)/u);
  assert.match(css, /\.site-footer > div[^}]*box-sizing: border-box/u);
  assert.match(css, /\.author-intro > a[^}]*margin-inline-end: 1rem/u);
  assert.match(css, /\.post-header h1[^}]*width: 100%[^}]*max-width: none[^}]*margin: \.875rem auto 1\.375rem[^}]*padding-block: \.125rem[^}]*font-size: clamp\(2\.125rem, 3\.8vw, 3rem\)[^}]*font-weight: 600/u);
  assert.match(css, /\.post-header > p[^}]*font-size: 1rem[^}]*line-height: 1\.7/u);
  assert.match(css, /\.post-header__description[^}]*width: 100%[^}]*max-width: var\(--reading-width\)[^}]*margin-block: 0 1\.25rem/u);
  assert.match(css, /@media \(max-width: 38\.75rem\)[\s\S]*\.post-header h1[^}]*font-size: 1\.875rem/u);
  assert.match(css, /\.post-header \.post-kicker a[^}]*text-decoration: none/u);
  assert.match(css, /\.post-header \.post-meta[^}]*font-size: \.75rem[^}]*font-weight: 500/u);
  assert.match(css, /\.post-header \.post-meta[^}]*flex-wrap: nowrap[^}]*width: 100%[^}]*max-width: var\(--reading-width\)[^}]*white-space: nowrap/u);
  assert.match(css, /\.primary-navigation a, \.language-navigation a[^}]*position: relative[^}]*display: inline-flex[^}]*align-items: center[^}]*box-sizing: border-box[^}]*min-height: 2\.75rem[^}]*padding-block: \.35rem \.2rem[^}]*line-height: 1\.25/u);
  assert.match(css, /\.primary-navigation a\[aria-current="page"\]::after[^}]*position: absolute[^}]*inset-inline: 0[^}]*inset-block-end: \.5rem[^}]*height: 1px[^}]*background: var\(--primary-dark\)/u);
  assert.match(css, /@media \(max-width: 64rem\)[\s\S]*\.primary-navigation a[^}]*min-height: 3rem[^}]*padding-block: \.7rem \.2rem/u);
  assert.doesNotMatch(css, /\.primary-navigation a\[aria-current="page"\][^}]*padding-block/u);
  assert.match(css, /\.post-filters > div[^}]*align-items: baseline/u);
  assert.match(css, /\.post-filters strong[^}]*line-height: 1\.5/u);
  assert.match(css, /\.post-filters a[^}]*line-height: 1\.5[^}]*opacity: \.5/u);
  assert.match(css, /\.post-filters a:hover, \.post-filters a:focus-visible[^}]*opacity: 1/u);
  assert.match(css, /\.post-filters a:active[^}]*opacity: \.68/u);
  assert.match(css, /\.pagination \{[^}]*display: flex[^}]*flex-wrap: wrap[^}]*align-items: center[^}]*justify-content: center/u);
  assert.match(css, /\.pagination > p, \.pagination > span[^}]*display: flex[^}]*gap: \.5rem[^}]*margin: 0/u);
  assert.match(css, /\.explore-intro[^}]*padding-block-end: clamp\(2\.5rem, 5vw, 3\.5rem\)[^}]*border-block-end: 1px solid var\(--border-strong\)/u);
  assert.match(css, /\.explore-collection-list[^}]*grid-template-columns: repeat\(2, minmax\(0, 1fr\)\)/u);
  assert.match(css, /\.explore-collection-card a[^}]*background: var\(--surface\)[^}]*border-block-start: 3px solid var\(--primary\)/u);
  assert.match(css, /\.explore-grid[^}]*grid-template-columns: repeat\(2, minmax\(0, 1fr\)\)/u);
  assert.match(css, /\.explore-taxonomy-list a[^}]*justify-content: space-between[^}]*color: var\(--text\)/u);
  assert.match(css, /\.post-tags li[^}]*padding: 0[^}]*background: var\(--surface\)[^}]*border: 1px solid var\(--border\)[^}]*font: 600 \.75rem\/1\.4 var\(--font-mono\)/u);
  assert.match(css, /\.post-tags a[^}]*display: block[^}]*padding: \.25rem \.625rem/u);
  assert.match(css, /\.featured-post[^}]*grid-template-columns: repeat\(2, minmax\(0, 1fr\)\)/u);
  assert.match(css, /\.featured-post__image,\s*\.featured-post__placeholder[^}]*opacity: \.85[^}]*transition: opacity \.24s ease/u);
  assert.match(css, /\.featured-post__copy[^}]*opacity: \.5[^}]*transition: opacity \.24s ease/u);
  assert.match(css, /\.featured-post-link:hover \.featured-post__image,[^}]*\.featured-post-link:focus-visible \.featured-post__copy[^}]*opacity: 1/u);
  assert.match(css, /\.section-heading \{[^}]*margin-block-end: 1rem[^}]*border-block-end: 1px solid var\(--text\)/u);
  assert.match(css, /\.post-list > li[^}]*padding-block: 1rem/u);
  assert.match(css, /\.section-heading \+ \.post-list > li:first-child[^}]*border-block-start: 0/u);
  assert.match(css, /\.post-card[^}]*grid-template-columns: 2\.75rem minmax\(0, 1fr\) 35%[^}]*min-height: 15rem/u);
  assert.match(css, /\.post-card__index,\s*\.post-card__copy[^}]*opacity: \.5[^}]*transition: opacity \.24s ease/u);
  assert.match(css, /\.post-card__thumbnail[^}]*position: absolute[^}]*width: 35%[^}]*height: 100%[^}]*object-fit: cover[^}]*opacity: \.85[^}]*transition: opacity \.24s ease/u);
  assert.match(css, /\.post-card-link:hover \.post-card__thumbnail,[^}]*\.post-card-link:focus-visible \.post-card__thumbnail[^}]*opacity: 1/u);
  assert.match(css, /\.post-card-link:hover \.post-card__index,[^}]*\.post-card-link:focus-visible \.post-card__copy[^}]*opacity: 1/u);
  assert.match(css, /\.post-card h2 \+ p, \.post-card h3 \+ p[^}]*line-height: 1\.6/u);
  assert.match(css, /\.post-card__copy > \.post-meta[^}]*margin-block-start: \.75rem/u);
  assert.doesNotMatch(css, /transform:\s*scale\(1\.05\)/u);
  assert.match(css, /\.hero-actions a[^}]*min-height: 0[^}]*padding: 0 0 \.125rem/u);
  assert.match(css, /\.home-section[^}]*margin-block-start: clamp\(3\.5rem, 6vw, 5rem\)/u);
  assert.doesNotMatch(css, /\.home-featured, \.home-recent, \.home-work[^}]*border-block-start/u);
  assert.doesNotMatch(css, /\.home-featured, \.home-recent, \.home-work[^}]*padding-block-start/u);
  assert.doesNotMatch(css, /\.home-recent \.post-card,/u);
  assert.match(css, /\.post-layout[^}]*grid-template-columns: 8\.25rem minmax\(0, var\(--reading-width\)\) 8\.25rem/u);
  assert.match(css, /\.post-after[^}]*grid-column: 2[^}]*grid-row: 2/u);
  assert.match(css, /\.post-header[^}]*margin-block-end: 3rem/u);
  assert.match(css, /\.related-posts[^}]*margin-block-start: 4\.5rem/u);
  assert.match(css, /\.post-original-reference[^}]*margin-block-start: 4rem[^}]*padding-block: 1rem/u);
  assert.match(css, /\.article-body[^}]*font-size: 1\.125rem[^}]*line-height: 1\.82[^}]*letter-spacing: -\.006em/u);
  assert.match(css, /\.article-body h2[^}]*margin-block: 3\.75em 1em[^}]*font-size: 1\.875rem[^}]*font-weight: 600[^}]*line-height: 1\.38/u);
  assert.match(css, /\.article-body h3[^}]*font-size: 1\.4375rem[^}]*font-weight: 600[^}]*line-height: 1\.4/u);
  assert.match(css, /\.article-body p, \.article-body ul, \.article-body ol, \.article-body blockquote[^}]*margin-block: 0 1\.55em/u);
  assert.match(css, /@media \(max-width: 38\.75rem\)[\s\S]*\.article-body[^}]*font-size: 1\.0625rem[^}]*line-height: 1\.78/u);
  assert.match(css, /\.article-body img\[role="button"\][^}]*cursor: zoom-in/u);
  assert.match(css, /\.image-viewer[^}]*width: min\(90rem, calc\(100% - 2rem\)\)[^}]*height: min\(56rem, calc\(100dvh - 2rem\)\)/u);
  assert.match(css, /\.image-viewer[^}]*background: transparent[^}]*border: 0[^}]*box-shadow: none/u);
  assert.match(css, /\.image-viewer::backdrop[^}]*background: rgb\(255 255 255 \/ 30%\)[^}]*backdrop-filter: blur\(\.5rem\)/u);
  assert.match(css, /\.image-viewer__close[^}]*position: absolute[^}]*inset-inline-end: 1rem/u);
  assert.match(css, /\.image-viewer__figure[^}]*display: flex[^}]*flex-direction: column[^}]*justify-content: center/u);
  assert.match(css, /\.image-viewer__figure figcaption[^}]*margin-block-start: \.75rem[^}]*padding: 1rem[^}]*background: rgb\(255 255 255 \/ 50%\)/u);
  const imageViewer = read("apps/blog-web/src/post/image-viewer.js");
  assert.match(imageViewer, /querySelectorAll\("\[data-article-body\] img"\)/u);
  assert.match(imageViewer, /!image\.closest\("a"\)/u);
  assert.match(imageViewer, /image\.setAttribute\("role", "button"\)/u);
  assert.match(imageViewer, /event\.key !== "Enter" && event\.key !== " "/u);
  assert.match(imageViewer, /dialog\.showModal\(\)/u);
  assert.match(imageViewer, /activeTrigger\?\.focus\(\)/u);
  assert.match(css, /\.post-navigation small[^}]*\.post-navigation span[^}]*display: block/u);
  assert.match(css, /\.post-navigation__link[^}]*opacity: \.5[^}]*transition: opacity \.24s ease/u);
  assert.match(css, /\.post-navigation__link:hover, \.post-navigation__link:focus-visible[^}]*opacity: 1/u);
  assert.match(css, /\.post-navigation small[^}]*margin-block-end: \.5rem[^}]*font-size: \.6875rem/u);
  assert.match(css, /\.post-navigation span[^}]*font-size: \.9375rem[^}]*line-height: 1\.55/u);
  assert.match(css, /\.post-navigation__link--next[^}]*grid-column: 2/u);
  assert.match(css, /\.search-dialog[^}]*width: min\(48rem, calc\(100% - 2rem\)\)[^}]*max-height: min\(44rem, calc\(100dvh - 2rem\)\)/u);
  assert.match(css, /\.search-dialog__field[^}]*grid-template-columns: auto minmax\(0, 1fr\) auto[^}]*border: 1px solid var\(--primary\)/u);
  assert.match(css, /\.search-result[^}]*grid-template-columns: 2\.75rem minmax\(0, 1fr\) auto/u);
  assert.match(css, /\.search-result__icon[^}]*display: grid[^}]*place-items: center[^}]*color: var\(--primary-dark\)/u);
  assert.match(css, /\.search-result__icon svg[^}]*width: 1\.375rem[^}]*fill: none[^}]*stroke: currentColor[^}]*stroke-width: 1\.5/u);
  assert.match(css, /@media \(max-width: 38\.75rem\)/u);
  assert.match(css, /@media \(max-width: 38\.75rem\)[\s\S]*\.home-hero__visual \{[^}]*position: relative[^}]*width: 100%[^}]*aspect-ratio: 16 \/ 9[^}]*margin-block-start: 2rem/u);
  for (const selector of [
    "body > header",
    "body > main",
    "article",
    "nav ul",
  ] as const) {
    assert.ok(css.includes(selector), `Missing semantic selector: ${selector}`);
  }
  assert.match(css, /:focus-visible/u);
  assert.doesNotMatch(css, /\[data-(?!depth)/u);
  assert.match(css, /\.home-hero/u);
  assert.match(css, /\.post-layout/u);
  assert.match(css, /prefers-color-scheme: dark/u);
  assert.match(css, /prefers-reduced-motion: reduce/u);
  assert.match(css, /@media print/u);
  assert.doesNotMatch(css, /https?:\/\//u);

  const socialCards = read("apps/blog-web/src/lib/social-cards.ts");
  assert.match(socialCards, /fill="#ffffff"/u);
  assert.match(socialCards, /fill="#12b76a"/u);
  assert.match(socialCards, /fill="#17211c"/u);
  assert.match(socialCards, /font-weight="600"/u);
  assert.doesNotMatch(socialCards, /fill="#111111"/u);

  const shell = read("apps/blog-web/src/layouts/BlogShell.astro");
  assert.match(shell, /import "\.\.\/styles\/blog\.css"/u);
  for (const landmark of ["<header", "<nav", "<main", "<footer"] as const) {
    assert.ok(shell.includes(landmark), `Missing shell landmark: ${landmark}`);
  }
  assert.match(shell, /data-skip-link/u);
  assert.match(shell, /class=/u);
});

test("keeps blog element defaults out of injected browser UI", () => {
  const css = read("apps/blog-web/src/styles/blog.css");
  const unscopedRules = new Set([
    "*, *::before, *::after { box-sizing: border-box; }",
    "article { min-width: 0; }",
    "nav ul { list-style: none; }",
    "a {",
    "a:hover { color: var(--primary); text-decoration-color: currentColor; }",
    "button, input, select, textarea { min-height: 2.75rem; font: inherit; }",
    "button {",
    "p { margin-block: 0 1em; }",
    "img, video, iframe { max-width: 100%; }",
  ]);
  for (const line of css.split("\n")) {
    assert.equal(unscopedRules.has(line), false, `Unscoped element rule: ${line}`);
  }
  assert.match(css, /:where\(\.site-header, #main, \.site-footer, \.search-dialog, \.image-viewer, \.analytics-consent, \.skip-link\)/u);
  assert.doesNotMatch(css, /\.page\s+(?:button|input|a|p|img|iframe)\b/u);
  assert.doesNotMatch(css, /#main[^\n{]*\*/u);
  assert.doesNotMatch(css, /#main[^\n{]*:is\((?:button|input|select|textarea|summary)/u);
  assert.match(css, /\.site-control \{[^}]*min-height: 2\.75rem[^}]*box-sizing: border-box[^}]*font: inherit/u);

  const renderer = read("apps/blog-web/src/lib/render-document.ts");
  const build = read("apps/blog-web/src/build.ts");
  assert.match(renderer, /class="site-control site-control--button search-dialog__close"/u);
  assert.match(renderer, /class="site-control site-control--field search-dialog__input"/u);
  assert.match(renderer, /class="site-control site-control--button image-viewer__close"/u);
  assert.match(build, /class="site-control site-control--summary post-toc__summary"/u);
  assert.match(build, /class="site-control site-control--button site-search__submit"/u);
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
