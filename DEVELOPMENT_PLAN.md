# Blog Development Plan

This plan turns the architecture into implementation phases. GitHub Pages with
a custom GitHub Actions workflow is the production target. Node.js 24.19.0 LTS,
npm 11.17.0 workspaces, Astro static output, Zod 4, the unified Markdown stack,
Pagefind extended, Sharp, Vitest, Playwright, and axe-core are accepted in ADR
0004.

## Resolved decisions

- Production host: GitHub Pages.
- Publishing source: a custom GitHub Actions workflow, never branch-based `/docs` publishing.
- Deployment unit: the verified root-level `dist/` directory only.
- Domain model: `https://blog.cloverhearts.com`, configured as a GitHub Pages
  custom subdomain through a Route 53 `CNAME`, with an empty production base
  path.
- Portability model: every public URL also validates against a repository base path such as `/blog`.
- Runtime model: no server dependency; primary post content is present in static HTML.
- Design authoring: root `DESIGN.md` for the normal blog and page-local `DESIGN.md` for managed pages, compatible with the Open Design package convention.
- Discovery ownership: a post-build `packages/site-discovery/` lane owns
  sitemap, AI-aware robots, `llms.txt`, and one post-only RSS feed per language
  after managed routes are known.
- Analytics: optional blog-only GA4 using `GA4_MEASUREMENT_ID`; blank disables
  it, basic consent mode prevents pre-consent requests, and managed pages are
  excluded by default.
- Localization: Korean is the unprefixed default/fallback and authoring source,
  English is at `/en/`, Japanese is at `/ja/`, and every blog route is a
  complete static HTML document.
- Comments: excluded from the initial release. No comment provider, public
  write API, account flow, moderation queue, comment database, or
  comment-specific browser code is planned in the current phases.
- Test traceability: every behavioral or machine-enforceable policy change adds
  or updates tests in the same task; high-impact policies are hash- and
  case-mapped through `tests/policy-coverage.json`.
- Language selection: requested routes remain stable regardless of browser or
  stored language; readers change language only through published static links.
- Post-link fallback: collection and related links prefer the active language,
  then English, then Korean, and omit groups with no eligible target.
- Post-language context: artifacts always provide current/original language and
  published validated alternates. A bottom-of-post UX may optionally link the
  original; it never exposes review state or redirects the current route.
- Initial visual system: semantic classless CSS, system colors, automatic
  light/dark behavior, Pretendard Variable for Korean/English, resilient
  fallbacks, and `UX_FLOW.md` as the interaction contract. Branded styling is
  intentionally deferred.
- UX review priority: Korean and English first; Japanese remains a complete
  supported locale with required structural/accessibility verification.
- Capacity: the failure budgets in `config/performance-budgets.yaml`, including
  a 512 MiB release, 8-minute deployment, 10,000 routes, and per-route/media/
  font thresholds.

## Decision gates

The implementation stack, local plugin workspace convention, production
origin, classless UX baseline, primary review languages, font, and concrete
performance/capacity budgets are resolved. Search still must pass the English,
Korean, Japanese, mixed-script, and `C++` acceptance fixtures before Phase 4
exits. A later branded design remains optional and cannot delay semantic UX.

## Phase 1 — executable contracts and shared configuration

- Convert the provisional interfaces in `packages/contracts/` into Zod 4 runtime schemas.
- Infer all public TypeScript types from those schemas.
- Implement `packages/project-config/` for `config/*.yaml` validation and normalized route registration.
- Validate supported/source/default languages, locale prefixes, localized
  navigation/taxonomy completeness, pagination segment, manual-only language
  selection, and active-language/English/Korean post-link fallback.
- Validate the project-wide document/direct-managed-page security maximum in `config/security.yaml`.
- Validate `config/analytics.yaml` and resolve the optional public
  `GA4_MEASUREMENT_ID`; reject malformed non-blank values and expose a disabled
  result for blank values.
- Validate `config/ai-crawlers.yaml`, reject duplicate or malformed User-Agent
  rules, and expose deterministic inputs for `robots.txt` and `llms.txt`.
- Validate `config/content-provenance.yaml` and reject non-English, non-owner,
  non-original-work, non-human-primary, or broader-than-proofreading claims.
- Convert `packages/embed-core/` into a runtime-validated build-time plugin API and explicit registry loader.
- Validate `config/embeds.yaml` without loading provider code during configuration checks.
- Generate optional JSON Schema files for editors and non-TypeScript agents.
- Add valid and invalid contract/config fixtures, including a synthetic test-only embed plugin.
- Keep all focused unit and cross-boundary contract suites on Vitest; do not
  introduce or retain a second `node:test` runner.
- Keep `test:policy` included in `test:contracts` and the quality workflow as
  runtime schemas and packages replace the provisional source.

Exit criteria:

- malformed configuration and artifacts fail with field-level errors;
- every producer and consumer uses the same runtime schema package;
- duplicate, reserved, and redirect-conflicting routes fail before rendering;
- remote, unregistered, duplicate, and policy-violating embed plugins cannot load.

## Phase 2 — deterministic content compiler

- Parse and validate canonical Markdown/frontmatter from `docs/`.
- Validate complete and partial en/ko/ja translation groups, invariant metadata, and
  locale-qualified identity before production output.
- Require one consistent `originalLanguage`, verify that its variant exists,
  and expose original-language plus all published alternate-route metadata to
  downstream renderers for explicit language switching and optional
  original-language context UX.
- Validate `translationStatus`: the original is `source`, unreviewed AI
  translations are `ai-draft`, and production accepts only owner-approved
  `reviewed` translated variants.
- Resolve optional paired cover/social-image asset records with localized alt
  text for downstream Open Graph rendering.
- Require the owner-approved `representativeImage` mode and reject missing
  source assets for the selected mode.
- Resolve and verify `asset:` references from `assets/content/`.
- Sanitize Markdown and approved media directives into semantic HTML fragments.
- Route external-content directives through embed-core without importing provider packages from the compiler.
- Record plugin versions, policy hashes, security requirements, fallback text, and optional progressive-enhancement assets.
- Generate taxonomy, related-post, excerpt, reading-time, asset, and search-eligibility metadata.
- Attach the validated shared authorship disclosure to every post variant as
  derived artifact metadata; never inject it into Markdown-derived body HTML.
- Derive deterministic heading IDs and ordered parent-aware TOC records from a
  single Markdown heading traversal; apply the same IDs to semantic body HTML.
- Emit distinct preview and production artifacts with provenance hashes.

Exit criteria:

- identical inputs generate byte-identical integrity-bearing artifacts;
- production artifacts cannot contain draft records;
- malicious markup and missing/out-of-bound assets fail validation;
- unknown directives, missing fallbacks, unsafe plugin HTML, and undeclared origins fail validation;
- representative English, Korean, Japanese, and C++ fixtures pass;
- a missing or unpublished authored original, invalid review state, or
  structurally divergent shared group metadata fails production validation;
  an absent or draft translation sibling remains valid and is omitted from
  production alternates.
- generated/explicit anchor, duplicate, hierarchy, broken-fragment, and
  TOC/body-parity fixtures pass deterministically.

## Phase 3 — static blog renderer

- Initialize Astro static output inside `apps/blog-web/` only.
- Import the approved classless stylesheet once in the shared document shell;
  do not add a component utility framework or external font request.
- Implement the semantic page frame and route flows from `UX_FLOW.md` before
  decorative refinement.
- Render complete English, Korean, and Japanese system, collection, search, and
  error routes, plus every independently published post variant. Do not invent
  a missing post translation.
- Render first and later global/category/tag/archive list pages at stable
  `/page/<n>/` routes with normal sequential links and self canonicals.
- Resolve artifact-relative assets to configured public routes.
- Render provider-neutral embed containers, approved privacy/consent states, and optional progressive-enhancement loading from artifact records.
- Wire the blog-owned GA4 adapter and accessible consent controls. Emit no
  loader or analytics origins when the Measurement ID is absent, make no Google
  request before consent, and keep advertising signals and personalization off.
- Ensure primary post content and navigation links exist in initial HTML.
- Emit real published language-switcher links, localized framework copy, self
  canonicals, and reciprocal `hreflang` alternates without browser-language
  navigation.
- Resolve collection and related-post links to the active-language variant,
  then English, then Korean; omit unmatched groups and label every
  cross-language fallback.
- Provide a presentation-neutral post-language context resolver. An optional
  post-body treatment may identify/link the original, but route visits remain
  stable and no review-state banner is exposed.
- Generate a complete localized `article` Open Graph set for every post from
  the owner-approved representative-image mode. Render a deterministic local
  `1200 × 630` post card only when that mode was selected, then emit
  high-resolution `1:1`, `4:3`, and `16:9` Article derivatives from the same
  approved source before writing HTML.
- Emit responsive body images with intrinsic dimensions, `srcset`/`sizes`, an
  eager primary image, and native lazy loading only below the fold.
- Emit a stable favicon and home-page `WebSite` structured data. When a public
  profile route is explicitly configured, connect its `ProfilePage`/`Person`
  identity to `BlogPosting.author`; otherwise do not invent an author URL.
- Emit the post authorship statement only through escaped custom `<meta>` data
  in the static head, excluding it from body markup, JSON-LD, feeds, and search.
- Render an accessible static TOC from heading artifacts, with native fragment
  navigation and no Markdown reparsing; section highlighting is enhancement
  only.
- Emit a validated web manifest, route claims, and provenance.

Exit criteria:

- posts remain readable with JavaScript disabled;
- blog source never reads `docs/` or source assets directly;
- blog source does not import provider packages and embed fallback links remain usable without JavaScript;
- SEO metadata and canonical links are derived from validated production data.
- every representative post has an absolute self `og:url`, post-specific
  resolvable `og:image`, localized locale/alternate metadata, and valid
  article dates/category/tags in initial HTML;
- every TOC link resolves to exactly one heading in the initial HTML with
  JavaScript disabled.
- analytics-disabled and consent-denied builds retain identical content and
  navigation behavior; analytics events omit raw searches, identifiers, URL
  queries, and fragments.
- JavaScript-disabled visits retain the requested complete static document;
  browser language never changes the route or article content.

## Phase 4 — final-HTML search pipeline

- Validate Pagefind extended with English, Korean, and Japanese fixtures.
- Index rendered blog HTML, using content metadata as the eligibility whitelist.
- Emit one language-isolated index as a separate search artifact tied to the
  exact web artifact hash.
- Provide a progressively enhanced search page with a useful no-JavaScript explanation.

Exit criteria:

- eligible post text is searchable without a server;
- managed pages and drafts are excluded by default;
- a stale search index cannot be combined with newer web output.
- an active language search never leaks sibling translations from another index.

## Phase 5 — managed-page compiler

- Validate `page.yaml`, page-local `DESIGN.md`, declared entry sources, security declarations, and page-local assets.
- Implement independent document, presentation, and application build adapters.
- Enforce entry-format/kind compatibility and reject escaping or ambiguous entry paths.
- Intersect page-requested external origins and iframe permissions with `config/security.yaml`.
- Route managed Markdown provider directives through embed-core without direct provider imports.
- Inject the accessible floating return link without blog UI dependencies.
- Implement static/no-script and print behavior required by each page kind.
- Map each indexable managed-page kind to visible-content-appropriate structured
  data and omit unsupported markup. A configured public profile emits the
  `ProfilePage`/`Person` identity referenced by blog posts.
- Emit separate preview and production artifacts with route claims and provenance.
- Group only explicitly authored managed-page variants sharing
  `translationKey`; never synthesize or auto-translate a page or its local
  `DESIGN.md`.

Exit criteria:

- all three managed-page fixture kinds build independently;
- missing/mis-cased `DESIGN.md`, invalid entries, undeclared origins, and excess permissions fail with field-level diagnostics;
- draft pages cannot enter the production manifest;
- normal blog chrome and post taxonomy are absent;
- return navigation, print, and no-JavaScript expectations pass.

## Phase 6 — site discovery

- Consume matching production content, web, and managed-page manifests.
- Generate canonical `sitemap.xml`, registry-driven `robots.txt`, concise
  `llms.txt`, and post-only English, Korean, and Japanese RSS feeds.
- Keep AI search, user-directed, training/model-development, and public-dataset
  agents open, and use the sitemap instead of copying every post into
  `llms.txt`.
- Emit sitemap `lastmod` only from authored publication/modification values and
  keep resources required to understand indexed HTML crawlable.
- Include only managed pages explicitly marked `robots: index` and `sitemap: true`.
- Resolve every absolute URL through the shared origin/base-path resolver.
- Emit a discovery manifest tied to the exact hashes of all inputs.

Exit criteria:

- drafts, previews, redirects, aliases, assets, search results, and `noindex` pages are absent from the sitemap;
- managed pages are absent from RSS regardless of sitemap policy;
- stale or mixed discovery inputs fail validation;
- custom-domain and `/blog` builds emit correct absolute discovery URLs.
- published localized HTML alternates are reciprocal, `x-default` resolves to
  Korean or the documented available fallback, and every eligible localized
  route/feed is present exactly once.
- `robots.txt` matches the validated registry and `llms.txt` contains only
  canonical, public, HTTPS links with no drafts, source paths, or timestamps.

## Phase 7 — release assembly and conformance

- Validate production web, search, managed, and discovery manifests at ingestion.
- Reject wrong-mode, stale, mixed-schema, route-colliding, asset-colliding, or embed-policy-violating inputs.
- Assemble immutable files into `dist/` and verify internal references.
- Emit root `index.html` and `404.html`, directory-style route files, discovery files, and content-addressed assets using the layout in `GITHUB_PAGES.md`.
- Implement `verify:pages` for size, file type, route, base-path, source-leak, draft-leak, no-JavaScript, and static-host security checks.
- Produce a deterministic release manifest and a separate human diagnostic report.
- Run boundary, schema, fixture, accessibility, no-JavaScript, and reproducibility checks in CI.
- Reject a release change whose governed policy sources have stale hashes or
  whose mapped test files/case names are missing.
- Enforce launch Core Web Vitals targets or lab proxies: LCP <= 2.5 s,
  INP <= 200 ms, and CLS <= 0.1, alongside the selected byte/image/font budgets.
- Validate `WebSite`, `BlogPosting`, `BreadcrumbList`, conditional
  `ProfilePage`/`Person`, managed-page structured data, favicon, pagination,
  and all representative-image derivatives.
- Verify absent/invalid/configured GA4 IDs, consent grant/revoke behavior,
  single-load initialization, safe page-view URLs, and conditional CSP origins.

Exit criteria:

- only production artifacts can create `dist/`;
- two clean builds from identical inputs match;
- every published route and asset is unique and internally resolvable;
- isolated builds from the same source pass URL validation for both the custom-domain root and `/blog` base path;
- the documented content rules, runtime schemas, examples, and tests agree.

## Phase 8 — GitHub Pages delivery

- Add the custom GitHub Actions workflow only after the root package scripts and lockfile exist.
- Run validation and build for pull requests without deployment permissions.
- Build production output from the default branch and upload exactly `dist/` with the official Pages artifact action.
- Pass `vars.GA4_MEASUREMENT_ID` into the production build; leaving the
  repository/environment variable unset is the supported analytics-off state.
- Deploy through the protected `github-pages` environment with minimum permissions and serialized production deployments.
- Configure and verify the custom domain in repository settings before changing Route 53 records.
- Enable HTTPS enforcement after certificate provisioning.
- Verify a Google Search Console Domain property through Route 53 DNS, submit
  `/sitemap.xml`, and record representative URL Inspection, Rich Results, Page
  Indexing, and Core Web Vitals checks in the launch checklist.
- Document a rollback drill that redeploys a previously verified commit.

Exit criteria:

- source Markdown, intermediate artifacts, previews, drafts, source maps, and caches are absent from the uploaded artifact;
- a deployment exposes `index.html`, `404.html`, posts, taxonomy pages, managed pages, RSS, sitemap, robots, search files, and assets at their claimed URLs;
- direct navigation to representative nested routes works without a client router;
- no-JavaScript checks pass against the deployed HTML;
- the configured custom domain is canonical and the default GitHub Pages URL redirects consistently;
- a previous verified commit can be redeployed without committing generated output.

## Deferred decisions

The following remain intentionally undecided until their decision gate:

- the first real provider plugins, including whether Google Maps or Naver Maps requires build-time network access or progressive client enhancement;
- any future branded palette, identity imagery, or richer component styling
  beyond the approved classless baseline;
- any future comment system; it requires a new privacy, abuse-prevention,
  moderation, retention/deletion, cost, accessibility, and architecture review
  rather than an implementation hidden inside the blog renderer.

No phase may compensate for an undecided tool by introducing a source-level dependency across architecture boundaries.
