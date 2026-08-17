# Blog Modification History

This file records non-routine changes to the blog project. Entries are ordered
newest first and use the `Asia/Seoul` timezone. Routine post authoring is omitted
unless it changes shared content behavior, routes, schemas, or project rules.

## 2026-08-17T14:18:01+09:00 — Ten-item pagination and secondary Archive navigation

- Change type: Configuration, presentation, UX/design/publishing contracts,
  tests, and implementation-status update.
- Reason: Apply the approved targets that reduce collection pages to 10
  logical post groups and move Archive out of the persistent primary header.
- Scope: `config/site.yaml` page size; `config/navigation.yaml` primary/footer
  membership; footer renderer and 404 recovery links; `UX_FLOW.md`,
  `DESIGN.md`, `PUBLISHING.md`, `CONTENT_RULES.md` examples; pagination and
  navigation contract tests; policy coverage.
- Result: Home and Posts/category/tag/Archive collections use the shared
  `listings.pageSize` of 10. Page 1 stays at the collection root; later pages
  remain `/page/<n>/`. Primary navigation is Posts, Categories, Tags, Search.
  Archive remains at `/archive/`, `/en/archive/`, and `/ja/archive/` and is
  linked once from the footer plus search/404 recovery. RSS, sitemap, post
  routes, and related-post limits are unchanged.
- Validation: `npm run typecheck` passed. Vitest passed 79 of 79 cases across
  18 files, including `defines primary exploration as localized static links`,
  `moves Archive to the footer while keeping localized archive routes`,
  `paginates home and collections by ten logical post groups`, the 21-group
  `10 / 10 / 1` Posts/Archive/category/tag boundary, `/page/1/` exclusion,
  self-canonical and previous/next links, Korean/English/Japanese Archive
  footer placement, English/Japanese fallback counting, `/blog` base-path
  footer links, and `validates every governed policy source and named test
case`. Playwright rendered-browser visual checks were not run.
- Compatibility / follow-up: Archive routes were moved in navigation, not
  deleted. Temporary preview groups will paginate to two pages per complete
  locale collection. No Git commit or push was performed in this change.

## 2026-08-17T13:53:28+09:00 — Ten-item pagination target specification

- Change type: Pagination target, developer handoff, implementation-status
  update, compatibility plan, and regression-test plan.
- Reason: A 20-item collection page is denser than desired for routine
  browsing. The approved target reduces each page to 10 logical post groups so
  lists are easier to scan while retaining the existing static pagination
  model.
- Scope: `IMPLEMENTATION_SPEC.md` and `IMPLEMENTATION_STATUS.md`. The target
  covers home recent posts and Posts, category, tag, and Archive collections in
  Korean, English, and Japanese; translation fallback and group counting; page
  roots and numbered routes; canonical and previous/next links; deterministic
  ordering; base-path portability; configuration ownership; fixtures, tests,
  policy traceability, and implementation reporting.
- Result: The approved shared `listings.pageSize` target is now 10 instead of 20. Page 1 remains the collection root and later pages remain under
  `/page/<n>/`; translation variants count as one logical group. With the
  current 20 temporary logical groups, complete Posts and Archive collections
  will form two 10-entry pages per locale after implementation. The target does
  not change post URLs, result totals, ordering rules, search, RSS, sitemap,
  related-post eligibility, or archive route ownership.
- Validation: Inspected the current `config/site.yaml` value, project-config
  schema, renderer consumers, `PUBLISHING.md` pagination ownership,
  `UX_FLOW.md` route/interaction rules, existing contract-test coverage, and
  `tests/policy-coverage.json` mappings before editing. Documentation
  whitespace, target/status consistency, referenced-file existence, and
  heading/timestamp order checks were run after editing. No runtime
  configuration, governed publishing/UX source, renderer, fixture, policy
  hash, or executable test was changed, so current output still uses 20.
- Compatibility / follow-up: The implementing AI must change
  `config/site.yaml`, authoritative publishing/UX documents, deterministic
  21-group boundary fixtures, collection and route assertions, and affected
  policy hashes together; then run the full relevant tests and preview build.
  This is a target-specification change only and is not complete after a local
  template slice. No Git commit, push, deployment, or post-content change was
  performed.

## 2026-08-17T13:25:35+09:00 — Archive removed from approved primary-navigation target

- Change type: Information-architecture target, navigation handoff,
  implementation-status update, and compatibility plan.
- Reason: Posts and Archive currently appear as similarly prominent menu
  choices even though Archive is a chronological retrieval index rather than a
  second general post feed. Reduce persistent header duplication while keeping
  chronological browsing available.
- Scope: `IMPLEMENTATION_SPEC.md` and `IMPLEMENTATION_STATUS.md`. The target
  defines the exact primary-header order, localized secondary footer placement,
  unchanged Korean/English/Japanese archive routes, search and 404 recovery
  links, no-JavaScript behavior, responsive/accessibility expectations,
  configuration migration, contract/browser tests, policy traceability, and
  implementation reporting.
- Result: The approved primary navigation becomes Posts, Categories, Tags, and
  Search. Archive/보관함/アーカイブ remains a complete static chronological
  index at `/archive/`, `/en/archive/`, and `/ja/archive/`, but moves to one
  localized secondary footer link. Search no-JavaScript and 404 recovery may
  retain contextual Archive links. The handoff explicitly forbids treating
  mobile-menu hiding as removal, deleting or redirecting archive routes, or
  changing their SEO/discovery behavior. It requires the implementing AI to
  update `config/navigation.yaml`, `UX_FLOW.md`, `DESIGN.md`, renderer output,
  the existing primary-exploration test, localized/base-path route assertions,
  policy hashes, status, and history together.
- Validation: Read `UX_FLOW.md` completely and inspected the current
  `config/navigation.yaml`, header rendering input, archive route emitters,
  localized archive messages, search no-JavaScript fallback, policy-coverage
  mapping, and `defines primary exploration as localized static links` test.
  Documentation whitespace, heading order, referenced-file existence, and
  target/status consistency checks were run after editing. No navigation
  configuration, renderer, route, governed UX/design source, policy hash, or
  executable test was changed, so current runtime behavior remains unchanged.
- Compatibility / follow-up: The implementing AI must move, not duplicate, the
  Archive item from primary navigation to the footer; preserve all archive
  routes and discovery; and prove the header/footer behavior in English,
  Korean, Japanese, root, and non-empty base-path output. This is a
  target-specification change only and remains incomplete until code,
  configuration, authoritative UX/design documents, tests, and policy coverage
  land together. No Git commit, push, deployment, or archive-content change was
  performed.

## 2026-08-17T12:10:00+09:00 — Localized description summaries and list thumbnails

- Change type: Content contract, artifact validation, presentation, tests, and
  status update.
- Reason: Implement the approved description-summary and automatic thumbnail
  targets so collection links show the authored localized description and a
  16:9 thumbnail without changing Open Graph or representative-image approval.
- Scope: Frontmatter and Zod validation; compatibility excerpt derivation;
  optional thumbnail asset records; list/home/related rendering; RSS and
  metadata consumers; `CONTENT_RULES.md`, `I18N.md`, `PUBLISHING.md`, `SEO.md`,
  `DESIGN.md`, `QUALITY_GATES.md`, implementation status/spec; policy coverage.
- Result: `description` is trimmed and capped at 150 Unicode characters and is
  the only collection/RSS/metadata summary. Compatibility `excerpt` skips
  leading non-prose blocks and falls back to `description`. Optional
  `thumbnail.src`/`alt` overrides list images; otherwise the representative
  16:9 derivative is used. Thumbnails do not mutate Open Graph or
  `BlogPosting.image`. Temporary posts needed no description-length migration.
- Validation: Strict TypeScript checking passed. Vitest contract tests passed
  77 of 77 cases across 17 files, including 150/151-character bounds,
  whitespace, invalid descriptions/thumbnails, leading-image excerpt fallback,
  localized collection/RSS/metadata output, explicit versus generated-card
  thumbnail sources, and Open Graph isolation. Playwright rendered-browser
  layout and assistive-technology checks were not run.
- Compatibility / follow-up: Content schema remains version 7; `excerpt` is
  retained only for compatibility. Removing it requires a later schema
  migration. No Git commit or push was performed in this change.

## 2026-08-17T11:21:13+09:00 — Automatic post-thumbnail target specification

- Change type: Approved frontmatter/image target, authoring-agent permission,
  presentation handoff, implementation-status update, and test plan.
- Reason: Allow an explicit thumbnail value in post attributes while ensuring
  every link/list summary receives a useful thumbnail even when the owner does
  not choose one individually. The owner granted standing permission for the
  authoring agent to select or generate a thumbnail by default, without
  conflating that permission with the existing owner-controlled Open Graph,
  cover, and social-image contract.
- Scope: `IMPLEMENTATION_SPEC.md` and `IMPLEMENTATION_STATUS.md`. The target
  covers an optional localized `thumbnail` object, managed-asset validation,
  explicit-owner precedence, agent selection/generation, representative-image
  fallback, canonical asset storage, translation sharing/localization,
  responsive 16:9 derivatives, collection and cross-language fallback
  rendering, accessibility, no-JavaScript behavior, crop safety, performance,
  SEO isolation, tests, policy updates, and implementation reporting.
- Result: The approved target accepts `thumbnail.src` and localized
  `thumbnail.alt` as an explicit list-presentation override. If absent, the
  authoring agent may select a suitable owned post asset or create and store a
  relevant thumbnail without another per-post confirmation. If a distinct
  source is unnecessary, the web build derives the thumbnail from the resolved
  social image, cover, or deterministic generated card, using its existing
  16:9 representative derivative. AI generation occurs only during authoring;
  production remains local and deterministic. A thumbnail never changes
  `representativeImage`, Open Graph, `BlogPosting.image`, cover, social image,
  or body media without a separate explicit decision. The sixty temporary
  groups can use their localized generated-card fallback and therefore need no
  immediate duplicate frontmatter migration.
- Validation: Read the complete root `DESIGN.md` and reviewed the existing
  frontmatter, content artifact, asset compiler, representative-image selector,
  Sharp derivative pipeline, collection renderer, SEO contract, and prior
  summary-target handoff. Confirmed that no current `thumbnail` source or
  artifact field exists and that the existing pipeline already produces a 16:9
  representative derivative suitable as the default source. Documentation
  whitespace, heading order, reference existence, and status/spec consistency
  checks were run after editing. No executable schema, renderer, asset source,
  governed content-policy document, policy hash, or test was changed, so the
  target remains explicitly unimplemented.
- Compatibility / follow-up: The implementing AI must deliver the optional
  field, resolved artifact, fallback precedence, responsive output, collection
  UI, documentation, positive/negative/boundary/deterministic/regression tests,
  rendered-browser checks, policy coverage, and history as one cohesive task.
  It must preserve current representative-image approval semantics, must not
  download unapproved third-party media, and must not perform AI generation in
  production or CI. No Git commit, push, deployment, image generation, or post
  migration was performed.

## 2026-08-17T11:17:29+09:00 — Localized description-summary implementation specification

- Change type: Approved implementation specification, developer handoff,
  implementation-status correction, and known-gap documentation.
- Reason: Make each post variant's existing `description` the single localized
  summary shown with post links and metadata, cap it at 150 characters, avoid a
  duplicate `summary` authoring field, and provide a complete instruction set
  for a separate implementation AI without falsely describing unimplemented
  behavior as current production behavior.
- Scope: `IMPLEMENTATION_SPEC.md` and `IMPLEMENTATION_STATUS.md`. The approved
  target covers English, Korean, and Japanese post authoring; frontmatter and
  artifact validation; home/post/category/tag/archive/pagination collections;
  related and cross-language fallback links; RSS, SEO, Open Graph, structured
  data, Pagefind query snippets, compatibility excerpts, migration, tests,
  policy traceability, and rendered-output checks. The status inventory also
  now records the twenty temporary three-language draft groups instead of the
  obsolete empty-content baseline.
- Result: The target keeps `description` as the only author-controlled summary.
  Every created, translated, or materially regenerated language variant must
  receive its own faithful description of at most 150 Unicode characters after
  trimming. Deterministic link/list/RSS/metadata surfaces will use that value;
  Pagefind retains query-dependent excerpts. The existing derived `excerpt`
  becomes collection-ineligible and, while retained for schema-version-7
  compatibility, must skip non-prose leading blocks and fall back to
  `description`. The handoff explicitly requires the implementing AI to update
  code, runtime schemas, `CONTENT_RULES.md`, `I18N.md`, `PUBLISHING.md`,
  `SEO.md`, policy hashes, tests, status, and history together. It includes
  positive, 150/151-character boundary, whitespace, leading-image regression,
  multilingual fallback, RSS/metadata, and Pagefind-separation acceptance
  cases. Existing inspection showed the sixty temporary descriptions already
  fit the new limit, with a maximum of 139 Unicode characters.
- Validation: Read `CONTENT_RULES.md`, `I18N.md`, `TESTING.md`,
  `PUBLISHING.md`, `SEO.md`, `IMPLEMENTATION_SPEC.md`, and
  `IMPLEMENTATION_STATUS.md` completely before editing. Reviewed current
  frontmatter, artifact, compiler, renderer, and search usages of
  `description` and `excerpt`, and measured all sixty preview artifact
  descriptions. Documentation whitespace, heading placement, and internal
  consistency checks were run after the edit. No implementation, runtime
  schema, governed content-policy source, policy hash, or executable test was
  changed, so no build or automated behavior is reported as newly passing.
- Compatibility / follow-up: This is deliberately a target-specification and
  handoff change rather than a partial runtime change. Current executable
  behavior and the governed contracts remain unchanged until the next AI
  implements the entire completion list. That task must not refresh a policy
  hash without reviewing and extending its mapped cases, must choose an
  explicit compatibility plan before removing `excerpt`, and must retain the
  existing descriptions' supported meaning during any migration. No Git
  commit, push, deployment, or post-body modification was performed.

## 2026-08-17T10:20:00+09:00 — Language-isolated static search

- Change type: Search implementation, presentation, tests, and status update.
- Reason: The search indexer existed, but the public search pages had no
  labeled query field, result list, or Pagefind client, so readers could not
  search.
- Scope: Localized search form and no-JavaScript fallback; progressive
  Pagefind client that loads only the active-language index; post HTML
  pagefind body/weight/ignore markers; indexer exclusion of chrome and
  boilerplate; preview eligibility for draft posts; preview server copies
  search files; contract tests.
- Result: `/search/`, `/en/search/`, and `/ja/search/` expose a labeled
  search form, live result count, keyboard-reachable links, and taxonomy
  fallbacks without JavaScript. Queries stay in the browser and do not go to
  a server or analytics. Production still omits drafts; preview may index
  preview-visible posts.
- Validation: Strict TypeScript checking passed. Vitest contract tests passed
  70 of 70 cases across 16 files, including empty-query behavior,
  language-isolated index paths, C++ published fixtures, production draft
  exclusion, search-page HTML contracts, and the empty-site Pages assembly.
  Playwright rendered-browser search interaction was not run.
- Compatibility / follow-up: `CONTENT_RULES.md` now records that production
  indexes omit drafts while preview may index preview-visible posts. First
  published posts will populate production indexes. Field ranking against a
  larger corpus remains a follow-up check.

## 2026-08-17T03:53:41+09:00 — Temporary post image and excerpt-output audit

- Change type: Content-output audit, known-issue documentation, and validation
  record.
- Reason: Reinspect the twenty temporary multilingual post groups after adding
  remote placeholder images, because successful schema, build, and test results
  did not by themselves prove that derived list summaries remained readable.
- Scope: All sixty draft sources across `docs/ko/`, `docs/en/`, and `docs/ja/`;
  the twenty shared `placehold.org` body-image URLs and localized alternative
  text; preview content artifacts; all sixty localized preview post routes; and
  the derived excerpts displayed by preview home, category, and archive lists.
  The supplied source directory was also searched case-insensitively for
  YouTube URLs, `youtu.be` URLs, YouTube directives, and raw iframe markup.
- Result: Every post variant contains one matching temporary body image, every
  shared image URL occurs in the corresponding Korean, English, and Japanese
  variants, and all sixty preview post pages emit an `<img>` element with
  localized non-empty alternative text. No YouTube URL or embed syntax exists
  in the twenty supplied source files, so no YouTube link was invented or
  added. The audit found one output defect not covered by the passing automated
  suite: because the image is the first Markdown block, `excerptFrom()` in
  `packages/content-compiler/src/markdown.ts` selects the image-only block and
  removes Markdown punctuation without removing its alternative text or URL.
  Consequently all sixty artifact excerpts, and the confirmed preview home,
  category, and archive list summaries that consume them, contain malformed
  text such as `!AI 재귀 오염 개념을 표현한 임시
이미지https://placehold.org/...` instead of the first prose paragraph. The
  post bodies and images themselves render successfully. This entry records the
  defect only; no post position, compiler behavior, schema, or test was changed
  as part of the audit.
- Validation: `npm run validate:config` passed. The preview content build wrote
  60 post artifacts, and the preview web build wrote 151 files including 60
  localized post pages with the expected remote image markup. Vitest passed all
  70 contract tests across 16 files, strict TypeScript checking passed, and the
  Git whitespace check passed. Manual artifact inspection confirmed malformed
  image-derived excerpts in 60 of 60 post artifacts and matching malformed list
  summaries in generated HTML. Source counts confirmed 20 Korean source
  variants, 40 English/Japanese `ai-draft` variants, 60 `draft: true` variants,
  and 60 image-bearing Markdown files. A representative placeholder request
  returned HTTP 200 with `image/png`. Rendered-browser/Playwright visual QA,
  deployed-site validation, and exhaustive live availability checks for all
  twenty external image URLs were not run.
- Compatibility / follow-up: The narrow content-only correction is to move each
  body image after the first prose paragraph in all three language variants so
  the current excerpt derivation selects readable text. A shared behavioral fix
  would instead make the content compiler skip image-only blocks when deriving
  excerpts; that option requires positive, negative, boundary, and regression
  coverage, a review of `CONTENT_RULES.md` and policy traceability, and a new
  history entry before completion. Until one option is explicitly implemented
  and the preview lists are rechecked, the malformed excerpts remain a known
  development-preview issue. All affected variants remain drafts. No Git
  commit, push, deployment, or source correction was performed.

## 2026-08-17T02:46:27+09:00 — English and Japanese preview-post translations

- Change type: Multilingual preview content and prior-entry correction.
- Reason: Correct the incomplete interpretation recorded in the
  `2026-08-17T02:32:56+09:00` entry. Partial publication permits a reviewed
  source to publish without every sibling, but the repository authoring
  workflow still requires new Korean source work to receive English and
  Japanese draft variants.
- Scope: Faithful English and Japanese translations for all twenty Korean test
  posts, preserving shared translation-group identity, categories, filenames,
  slugs, tags, timestamps, generated-card mode, headings, tables, lists, and
  source links.
- Result: `docs/en/` and `docs/ja/` each contain twenty sibling posts matching
  the twenty files under `docs/ko/`. Every new translation uses
  `translationStatus: ai-draft` and `draft: true`; Korean files remain source
  drafts. Preview compilation now produces sixty post artifacts and the web
  preview renders sixty post routes plus fifteen localized category pages.
- Validation: `validate:config` passed. The preview content build wrote 60
  artifacts and the preview web build wrote 151 files. All 65 Vitest contract
  tests across 15 files passed, strict TypeScript checking passed, locale path
  sets matched 20/20/20, English sources contained no Hangul body text, all 60
  sources passed heading/fence/local-path/placeholder checks, and the Git
  whitespace check passed.
- Compatibility / follow-up: The translations require owner review before
  either language can change to `translationStatus: reviewed` or enter a
  production build. No schema, taxonomy behavior, content rule, redirect, or
  test contract changed. Git commit, push, deployment, and visual browser QA
  were not performed.

## 2026-08-17T02:32:56+09:00 — Temporary categorized preview posts

- Change type: Preview content and taxonomy configuration.
- Reason: Populate the developing blog with twenty temporary, anonymized
  Markdown posts so post, category, tag, table, list, and link layouts can be
  tested before the fixtures are deleted.
- Scope: Twenty Korean draft posts under `docs/ko/`; five localized category
  IDs including `research-lab` with the Korean label `연구소`; eighteen
  localized tag IDs; deterministic generated-card selection for preview
  rendering.
- Result: The preview content compiler accepts all twenty posts and the web
  preview emits twenty post routes plus category pages for `research-lab`,
  `developer-life`, `life-notes`, `family-life`, and `everyday-lab`. The posts
  remain `draft: true` because they are substantially AI-edited development
  fixtures and must not enter production under the repository's
  proofreading-only original-work declaration. No English or Japanese sibling
  had been synthesized at this point; the later
  `2026-08-17T02:46:27+09:00` entry records the required correction.
- Validation: `validate:config` passed. The preview content build wrote 20
  artifacts, and the preview web build wrote 111 files including 20 post pages
  and 5 Korean category pages. All 65 Vitest contract tests across 15 files
  passed, strict TypeScript checking passed, the 20 post sources passed manual
  frontmatter/heading/fence/local-path/placeholder checks, and the Git
  whitespace check passed.
- Compatibility / follow-up: This adds only values allowed by the existing
  taxonomy schema and uses existing post syntax, so no new unit-test case or
  `CONTENT_RULES.md` change is required. Delete these temporary post groups and
  remove taxonomy values that are no longer used after layout testing. Git
  commit, push, deployment, translated-variant review, and visual browser QA
  were not performed.

## 2026-08-17T01:05:00+09:00 — Executable static-blog pipeline

- Change type: Architecture implementation, runtime contracts, build commands,
  tests, CI, and implementation-status update.
- Reason: Replace the specification-led scaffold with the documented Phase 1–8
  command surface so an empty production site can be validated and assembled.
- Scope: Zod artifact schemas; shared configuration loader; embed-core
  registry; content compiler; static blog renderer; Pagefind indexer;
  managed-page compiler; discovery builder; release assembler; root scripts;
  quality and Pages workflows; contract fixtures and tests; status and runbook
  wording.
- Result: `validate:config`, `validate:embeds`, `build:*`, `build`,
  `verify:pages`, and `dev` are executable. An empty production site emits
  localized home/list/search/404 routes, robots, llms.txt, sitemap, RSS, and
  `dist/index.html` plus `dist/404.html`. Preview and production artifacts stay
  separated. No production post, managed page, or real provider plugin was
  added.
- Validation: Strict TypeScript checking passed. Vitest contract tests passed
  65 of 65 cases across 15 files, including configuration load/rejection,
  synthetic embed execution, C++ translation-group compilation, production
  rejection of a draft original, omission of an unpublished English sibling,
  and empty-site Pages assembly. `validate:config` and `validate:embeds` were
  run after the suite. Playwright rendered-browser checks and live GitHub
  Pages/custom-domain verification were not run.
- Compatibility / follow-up: First reviewed posts, real embed providers, and
  custom-domain/Search Console operations remain follow-up. Generated
  `.artifacts/` and `dist/` stay uncommitted. `CONTENT_RULES.md` now documents
  the local embed registry entry shape; existing empty `config/embeds.yaml`
  remains valid.

## Entry format

```text
## <ISO 8601 timestamp> — <short title>

- Change type: <design, page, architecture, configuration, guide, build, etc.>
- Reason: <why the change was needed>
- Scope: <affected surfaces>
- Result: <observable outcome>
- Validation: <checks actually run, or explicitly not run>
- Compatibility / follow-up: <migration, known limits, or none>
```

## 2026-08-17T00:19:26+09:00 — Implementation-status audit and AI developer handoff

- Change type: Project description, implementation-status audit, specification
  clarification, package guides, agent workflow, and policy traceability.
- Reason: Preserve the existing scaffold while preventing the next development
  AI from mistaking package names, dependencies, provisional interfaces, or
  isolated helpers for a complete static-blog pipeline.
- Scope: English-first/Korean-companion project overview; actual versus target
  capability matrix; lane inputs and required outputs; implementation order and
  definition of done; content/web/search/managed/discovery/release package
  status; multilingual phase criteria; implementation/runbook/agent guidance;
  governed policy hashes.
- Result: `README.md` now identifies the repository as a specification-led,
  non-buildable scaffold and points to `IMPLEMENTATION_STATUS.md` as the exact
  developer handoff. The new status document records each lane as implemented,
  partial, scaffold-only, or specified-only, names the only commands that
  currently exist, and separates the approved target from verified capability.
  Related guides now use future-tense requirements where production pipelines
  do not exist. Existing executable source and tests were not changed.
- Validation: Strict TypeScript checking passed. All 52 Vitest contract tests
  across 9 files passed, and the dedicated policy-governance test passed 1 of 1
  case. Parsed 13 YAML and 13 JSON files, checked 46 Markdown files for local
  links and balanced fences, and passed the Git whitespace check.
- Compatibility / follow-up: This is a documentation-only clarification under
  the test-policy exemption; no runtime behavior, schema, route, artifact, or
  content source changed, so no new executable test case was required. The
  complete content, Astro, search, managed-page, discovery, release, and Pages
  deployment pipelines remain implementation work. Validation used the
  available local Node.js 25.2.1/npm 11.18.0; committed production pins remain
  Node.js 24.19.0/npm 11.17.0.

## 2026-08-17T00:07:35+09:00 — Multilingual publication and deterministic post-link fallback

- Change type: Localization/discovery policy, publication contract,
  configuration, provisional implementation, UX/SEO/architecture guides, ADR,
  tests, and policy traceability.
- Reason: Treat Korean, English, and Japanese variants as independently
  discoverable static publications instead of browser-language conveniences,
  preserve every intentionally requested URL, and provide deterministic post
  navigation when the active-language translation is unavailable.
- Scope: Manual-only language switching; partial translation publication;
  active-language, English, then Korean collection/related-link fallback;
  fallback-language labeling; source-before-translation and owner-review
  validation; localized UI copy; content, publishing, SEO, UX, design,
  architecture, development, deployment, agent, README, and compiler guides;
  ADR 0008; policy coverage; localization and site-baseline tests.
- Result: Removed the browser/stored-language navigation bootstrap and optional
  browser-preferred post context. Direct URLs now remain stable and language
  changes use published normal links only. The authored original may publish
  independently; each reviewed translation may follow without requiring all
  three languages at once. Post-group navigation resolves one target in active
  language, English, then Korean order, omits groups with no eligible target,
  and requires cross-language labels. `config/site.yaml` advances to schema
  version 6; the variable-length alternate artifact keeps content schema
  version 7. ADR 0008 supersedes ADR 0007's browser-selection and complete-group
  publication clauses while retaining Korean-default routes.
- Validation: All 52 Vitest contract tests across 9 files passed with zero
  failures, including active-language/English/Korean fallback, missing-target
  omission, independent reviewed-translation publication, original-first and
  owner-review rejection, manual selection configuration, route prefixes,
  original linking, and localized message parity. The dedicated policy test
  passed 1 of 1 case, strict TypeScript checking passed, 13 YAML and 13 JSON
  files parsed, 45 Markdown files passed local-link and balanced-fence checks,
  and the Git whitespace check passed.
- Compatibility / follow-up: No published post routes exist, so no redirect is
  required. Full compiler/list renderer, reciprocal partial-group `hreflang`,
  fallback-summary markup, Pagefind/RSS integration, Astro output, and deployed
  Pages checks remain implementation work. Validation ran with the available
  local Node.js 25.2.1/npm 11.18.0; the committed production pins remain Node.js
  24.19.0/npm 11.17.0 and CI must run the pinned versions.

## 2026-08-16T23:13:00+09:00 — Korean-default routing and Vitest handoff

- Change type: Localization decision, route policy, optional post UX metadata,
  test-runner migration, architecture/SEO/deployment guides, ADR, tests, and
  handoff documentation.
- Reason: Make Korean the blog's unprefixed default, publish English and
  Japanese under explicit language paths, preserve intentionally requested
  language routes, provide metadata for an optional browser-language post
  affordance, and remove ambiguity about the approved test runner.
- Scope: `config/site.yaml` and logical route guidance; project/browser language
  resolvers; post original/preferred-language context; Korean, English, and
  Japanese UI messages; content, I18N, UX, design, SEO, AI discovery, GitHub
  Pages, architecture, development, testing, agent, README, managed-page
  template, and quality contracts; ADR 0007; policy traceability; all executable
  contract tests and root test scripts.
- Result: Korean now owns `/` and every unprefixed blog route, English owns
  `/en/`, and Japanese retains `/ja/`. Unsupported/no-JavaScript fallback is
  Korean. Automatic browser selection can navigate once only from an
  unprefixed Korean route; explicit language routes remain stable. Existing
  `originalLanguage` and validated alternate data now produce an optional
  `PostLanguageContext` with an original route and available browser-preferred
  sibling, without exposing review state or requiring visible post chrome. The
  content artifact remains schema version 7. All unit/contract and policy tests
  now run exclusively with Vitest; the Open Design workflow and approved
  classless baseline remain otherwise unchanged.
- Validation: Vitest `4.1.10` passed all 55 tests across 9 files with zero
  failures, including Korean fallback/prefix routing, explicit-route stability,
  missing-alternate behavior, optional post-language context, locale message
  parity, the managed-page template default, and Vitest script enforcement. The
  dedicated policy-governance run passed 1 of 1 case. Strict TypeScript checking
  passed. Parsed 12 YAML and 13 JSON files, checked links and balanced fences
  across 44 Markdown files, and passed the Git whitespace check.
- Compatibility / follow-up: ADR 0007 supersedes ADR 0005 and the locale-default
  clause of ADR 0006. No published post routes exist, so no redirect migration
  is required; any externally published route from the former planned model
  would need an explicit compatibility entry. Full Astro route generation,
  rendered optional language-context UX, release assembly, and deployed Pages
  checks remain later implementation work and were not reported as passed.

## 2026-08-16T22:34:08+09:00 — Production domain and classless UX baseline

- Change type: Architecture decision, production configuration, UX, design,
  font dependency, navigation, capacity policy, provisional implementation,
  tests, and guides.
- Reason: Resolve the remaining launch-critical origin, initial presentation,
  primary UX review languages, and GitHub Pages/GitHub Pro performance and
  capacity decisions without delaying semantic user-flow implementation for a
  branded visual system.
- Scope: `blog.cloverhearts.com` production origin, Route 53/Pages subdomain
  contract, Korean/English UX priority with retained Japanese support,
  `UX_FLOW.md`, root classless design contract, semantic Astro shell, classless
  CSS, Pretendard package/provenance, localized primary navigation and skip
  label, performance-budget configuration/validator, author asset limits,
  implementation/development/deployment/SEO/agent guides, ADR 0006, policy
  traceability, and contract tests.
- Result: Fixed the canonical production origin at
  `https://blog.cloverhearts.com` with an empty base path and documented a Route
  53 `blog` CNAME to `cloverhearts.github.io` after Pages registration. Added a
  no-component-class semantic shell and CSS baseline using system colors,
  fluid reading widths, visible focus, print behavior, and locally bundled
  Pretendard Variable `1.3.9` dynamic subsets. Defined static home/discovery/
  reading/search/recovery/managed-page flows and real Posts, Categories, Tags,
  Archive, and Search links. Added conservative Pages/Pro failure budgets,
  including a 512 MiB release, 8-minute deployment, 10,000 routes, 1 MiB normal
  initial transfer, image/font limits, 75 GiB bandwidth warning, 2,400 Actions
  minutes warning, and 512 MiB Actions artifact storage.
- Validation: With Node.js `24.19.0` and npm `11.17.0`, strict TypeScript
  checking and all 52 contract/policy tests passed with zero failures, skips, or
  cancellations, including 11 new stack/site-baseline cases. The Astro compiler
  accepted `BlogShell.astro`; the installed Pretendard dynamic WOFF2 subset fit
  the 4 MiB font budget. npm installed/audited 321 packages with zero reported
  vulnerabilities and reported no unreviewed install scripts; the optional-free
  dependency tree was valid. Parsed eleven project YAML files plus the Actions
  workflow and four JSON files, checked all 43 Markdown files for balanced
  fences and local links, and passed the Git whitespace check. Reviewed current
  official GitHub Pages limits, GitHub Pro Actions allowances, custom-subdomain
  guidance, and Pretendard license/distribution guidance.
- Compatibility / follow-up: `config/site.yaml` advances from schema version 4
  to 5; the future runtime Zod schema must accept `production` and
  `primaryExperience`. Japanese content/routes remain required and no post
  frontmatter or content-artifact schema changes. GitHub Pages settings, Route
  53 DNS, certificate activation, complete Astro routes, full build, budget
  measurement, and deployed-environment checks were not performed and remain
  later implementation/operations work.

## 2026-08-16T21:49:38+09:00 — Approved npm implementation baseline

- Change type: Architecture, runtime, package management, localization,
  implementation specification, CI, tests, configuration, and guides.
- Reason: Finalize the previously deferred technology choices for the next
  implementation agent, standardize on the latest Node.js 24 LTS release and
  npm instead of pnpm, and reduce translated-post chrome to an original-work
  reference below the article.
- Scope: Root npm workspace and lockfile, Node/npm version pins, install-script
  approvals, strict TypeScript configuration, package dependency manifests,
  GitHub quality workflow, implementation handoff, two accepted ADRs, browser
  language selection, translated-post footer rendering, shared language
  messages/configuration, architecture/development/design/SEO/publishing/
  deployment/content guides, policy traceability, and contract tests.
- Result: Pinned Node.js `24.19.0` with its bundled npm `11.17.0`, added the
  approved Astro/Zod/unified/Pagefind/Sharp/Vitest/Playwright/axe-core stack as
  npm workspaces with one lockfile, and added an npm-based quality workflow.
  An unprefixed English static route can now navigate once to an existing
  browser-preferred Korean or Japanese static alternate; prefixed routes and
  explicit choices remain stable. Translated posts expose only the original
  language and original-post link in a semantic footer after the article body,
  while source-language posts add no such footer.
- Validation: Installed the locked dependency tree with `npm ci`; npm reported
  no unreviewed install scripts after the pinned `esbuild` approval and explicit
  `fsevents` denial. Using Node.js `24.19.0` and npm `11.17.0`, TypeScript strict
  checking passed and all 41 contract/policy tests passed with zero failures,
  skips, or cancellations. `npm audit --omit=dev` reported zero vulnerabilities,
  and `npm ls --all --omit=optional` found a valid dependency tree. Parsed ten
  shared YAML configurations plus the GitHub quality workflow and four JSON
  files; checked all 41 Markdown files for balanced fences and local links; and
  passed the Git whitespace check.
- Compatibility / follow-up: Content artifact schema version 7 is unchanged and
  there are no existing post sources to migrate. The executable Astro routes,
  runtime Zod schemas, full compilers, Pagefind integration, release assembly,
  and Pages deployment workflow remain implementation work, so no full site
  build or deployed-environment check was claimed. The committed quality
  workflow will run on GitHub after push; deployment remains deferred until a
  valid `dist/` pipeline exists.

## 2026-08-16T17:17:34+09:00 — Mandatory change-to-test traceability

- Change type: Test governance, agent policy, quality gate, development
  workflow, architecture, provisional automation, README, and guides.
- Reason: Require every future behavioral or machine-enforceable policy change
  to add or update its test cases in the same task, including the AI crawler,
  AI data-use, and post-authorship policies already introduced.
- Scope: Root testing policy, agent completion rules, command contract, quality
  gates, development plan, contract-test documentation, high-impact policy
  coverage manifest, source-hash/case-name governance test, and public README.
- Result: Added `TESTING.md` as the authoritative change-to-test contract.
  Behavioral/config/schema/security/SEO/AI/content/deployment changes now
  require applicable positive, negative, boundary, deterministic, and
  regression cases. Added `tests/policy-coverage.json`, mapping test governance,
  open AI discovery/data use, and metadata-only human authorship policies to
  reviewed source hashes and exact executable case names. Added a governance
  test that rejects stale hashes, missing/escaping paths, duplicate policy
  ownership, empty mappings, and nonexistent named tests. Non-semantic prose
  edits and routine posts have narrowly documented validation-based exemptions;
  new shared behavior or syntax does not.
- Validation: Passed the new policy-governance test directly, then passed all 35
  executable TypeScript tests. Parsed the policy coverage JSON and all ten YAML
  configuration files, checked 38 Markdown files for balanced fences and local
  links, and passed the Git whitespace check. The future root `test:policy`
  package script and CI integration were not run because the package manager,
  root scripts, and workflow remain deferred.
- Compatibility / follow-up: No content/frontmatter or artifact schema changed,
  so `CONTENT_RULES.md` remains accurate and generated artifacts need no
  migration. When a governed source changes, its mapped cases must be reviewed
  and its SHA-256 refreshed in the same task. New high-impact policies must be
  added to the coverage manifest when introduced; updating a hash alone is not
  adequate test review.

## 2026-08-16T16:49:51+09:00 — Metadata-only human authorship disclosure

- Change type: Content provenance, metadata, artifact schema, SEO safety,
  localization, agent rules, provisional implementation, tests, and guides.
- Reason: Add an English machine-readable declaration to every post stating
  that its original work is reliable and human-authored and that AI assistance
  on that original was limited to proofreading, without displaying the text in
  the reader-facing post.
- Scope: Shared content-provenance configuration, content artifact contract,
  project-config validation, static-head metadata rendering, multilingual
  provenance semantics, AI discovery guidance, SEO/search exclusions, content
  authoring rules, quality gates, README, and contract tests.
- Result: Added a required, build-derived `authorshipDisclosure` record to every
  post artifact and advanced the content schema to version 7. The renderer emits
  the exact English statement plus owner/original-work/human/proofreading values
  as escaped custom `<meta>` records. It emits no CSS-hidden body text and no
  JSON-LD/Schema.org trust claim. The declaration applies to the original work,
  so AI-assisted translation and owner review remain independently represented
  by `originalLanguage` and `translationStatus`. Authoring agents must keep
  substantially AI-drafted source material as draft rather than publishing it
  under the proofreading-only owner declaration.
- Validation: Passed all 34 executable TypeScript tests, including four new
  authorship-disclosure tests for exact semantics, metadata-only output,
  escaping, and misleading-scope rejection. Parsed and verified all ten shared
  YAML files, checked 37 Markdown files for balanced fences and local links,
  and passed the Git whitespace check. Reviewed current Google Search guidance
  on hidden-text abuse, structured-data visibility, and AI-creation context. A
  full site build was not run because the executable content/web pipeline and
  framework remain deferred.
- Compatibility / follow-up: Content artifacts advance from version 6 to 7 and
  earlier intermediates must be rebuilt. No frontmatter migration is required
  because the field is derived from `config/content-provenance.yaml`; there are
  no existing post source files to rewrite. The selected runtime schema and
  renderer must wire the provided validation and head-metadata functions. A
  substantially AI-authored future post requires an explicit provenance policy
  extension instead of reusing this declaration.

## 2026-08-16T16:32:52+09:00 — Open AI data-use policy

- Change type: AI discovery policy, configuration, guide, provisional
  implementation, and tests.
- Reason: Make public, indexable blog content intentionally friendly to AI
  search, answer generation, user-directed retrieval, public datasets, and
  model development rather than limiting training-oriented crawlers.
- Scope: AI crawler registry and schema, `llms.txt` machine-use declaration,
  discovery renderer types, Common Crawl support, SEO/architecture/build/quality
  guides, bilingual README, and contract tests.
- Result: Changed `GPTBot` and `ClaudeBot` from disallowed to allowed, retained
  open `Google-Extended`, and explicitly added Common Crawl's `CCBot`. Added a
  structured `dataUse` declaration allowing search/answering, user-directed
  retrieval, model development, and public dataset inclusion while requesting
  canonical attribution. Generated `llms.txt` now emits the same machine-use
  posture in a dedicated section. Crawler access remains separate from any
  copyright or license grant.
- Validation: Verified current `CCBot` identity and behavior against Common
  Crawl's official crawler documentation. Passed all 30 executable TypeScript
  tests, including open search/training/dataset/wildcard rules and generated
  `llms.txt` machine-use statements. Parsed all nine shared YAML files, checked
  37 Markdown files for balanced fences and local links, and passed the Git
  whitespace check. A full site build was not run because the executable
  discovery/release pipeline remains deferred.
- Compatibility / follow-up: `config/ai-crawlers.yaml` advances from schema
  version 1 to 2. Discovery artifact version 3 remains compatible because its
  crawler-policy hash already captures policy changes and its generated-file
  contract is unchanged. No post or managed-page authoring field changed, so
  `CONTENT_RULES.md` remains accurate. A separate content-license decision is
  still required if the owner wants to grant reuse rights beyond crawler and
  machine-use intent.

## 2026-08-16T16:28:24+09:00 — AI crawler policy and llms.txt discovery guide

- Change type: AI discovery, SEO, configuration, architecture, build contract,
  provisional implementation, tests, and guides.
- Reason: Keep the public blog discoverable to AI search and user-directed
  agents while separating provider-specific search, training, and mixed-use
  crawler policy and giving agents a concise canonical usage guide.
- Scope: AI crawler registry, route reservations, site-discovery and release
  artifacts, `robots.txt` generation, root `llms.txt` generation, GitHub Pages
  verification, artifact schema compatibility, project/agent documentation,
  and contract tests.
- Result: Added `config/ai-crawlers.yaml` as the single policy source. AI search
  and user-directed agents plus the open wildcard remain allowed; OpenAI and
  Anthropic training-only tokens default to disallowed, while
  `Google-Extended` is explicitly allowed because it currently combines Gemini
  grounding and model-improvement use. Added deterministic TypeScript renderers
  for policy-driven `robots.txt` and proposal-based `llms.txt`, with HTTPS,
  duplicate-token, newline-injection, and structural validation. The concise
  guide uses canonical language/discovery/intentional links rather than raw
  Markdown or a duplicate all-post index. Added the human policy and static-host
  enforcement boundary in `AI_DISCOVERY.md`.
- Validation: Passed all 30 executable TypeScript tests, including five new AI
  discovery tests. Parsed all nine shared YAML configuration files, checked the
  edited files with the Git whitespace validator, and reviewed the content
  authoring contract for impact. A full site build and deployed URL check were
  not run because the package manager, framework, runtime YAML schema, and
  executable discovery/release pipeline remain deferred.
- Compatibility / follow-up: `config/routes.yaml` advances from schema version
  3 to 4 and discovery artifacts advance from version 2 to 3; earlier
  intermediates must be rebuilt. No post or managed-page authoring field
  changed, so `CONTENT_RULES.md` remains accurate. Phase 1 must connect the YAML
  validator to the provided renderer input, and Phase 6 must supply resolved
  canonical links and write the generated files into the discovery artifact.

## 2026-08-16T14:24:12+09:00 — SEO hardening and owner-approved post imagery

- Change type: SEO, localization, content metadata, image workflow, routing,
  design, build/deployment plan, provisional contracts, tests, and guides.
- Reason: Complete the remaining launch SEO structure and ensure an authoring
  agent cannot silently choose or generate a post representative image while
  converting source material.
- Scope: Canonical pagination, non-redirecting browser-language suggestions,
  translation review status, owner-approved representative-image modes,
  responsive/Article image derivatives, site/author structured data, favicon,
  Core Web Vitals targets, Search Console operations, sitemap/robots rules,
  GitHub Pages output verification, shared route configuration, and agent
  workflows.
- Result: Added required `translationStatus` and `representativeImage` post
  fields, raised the content artifact schema to version 6, and made production
  reject unreviewed AI translations or inconsistent image modes. Post
  conversion now offers supplied asset, cover, deterministic-card, AI-image,
  or later-supply choices; generation requires explicit selection and a
  generated asset requires final owner approval. The renderer follows the
  stored mode without fallback and plans `1200 × 630`, `1:1`, `4:3`, and `16:9`
  derivatives. Browser detection now returns a dismissible alternate-language
  suggestion instead of a redirect. Added self-canonical `/page/<n>/` routing,
  `WebSite`/conditional `Person` guidance, managed-page schema mapping,
  responsive image and favicon rules, numeric Core Web Vitals goals, and Route
  53/Search Console launch checks.
- Validation: Passed all 25 executable TypeScript tests, including the revised
  language suggestion behavior, content schema version, and strict
  representative-image mode selection. Parsed all shared YAML configuration,
  checked balanced fences and local links across 36 Markdown files, and passed
  the Git whitespace check. A full site build, generated image crop inspection,
  Rich Results Test, Search Console verification, and field performance check
  were not run because the framework, executable build pipeline, production
  domain, and deployed pages remain deferred.
- Compatibility / follow-up: `config/routes.yaml` advances from schema version
  2 to 3 and content artifacts advance from version 5 to 6; earlier
  intermediates must be rebuilt. There are no existing post Markdown files to
  migrate. The selected implementation stack must add runtime schemas, image
  transformation/crop review, favicon assets, structured-data emitters,
  pagination output, performance budgets, and the documented deployment-time
  Search Console checks.

## 2026-08-16T13:20:57+09:00 — English-first bilingual README

- Change type: Repository guide, agent instruction, and documentation language
  policy.
- Reason: The public project overview needs English as its default language
  while remaining directly readable to Korean contributors and readers.
- Scope: Root `README.md`, the shared agent instructions, and modification
  history.
- Result: Reorganized the README into English-first sections with an adjacent
  Korean companion translation for every explanatory section. Added a durable
  instruction requiring future README changes to update both languages
  together while treating English as authoritative.
- Validation: Checked all Markdown files for balanced fences and resolvable
  local links, checked modified files for trailing whitespace, and ran the Git
  whitespace check. No executable code or content schema changed, so no build
  or application tests were required.
- Compatibility / follow-up: `CONTENT_RULES.md` remains accurate because post
  and managed-page authoring formats did not change. Future README edits must
  preserve English-first ordering and Korean parity.

## 2026-08-16T13:18:13+09:00 — Public comments deferred from initial release

- Change type: Architecture scope, implementation plan, decision record, and
  guide update.
- Reason: Anonymous or account-backed comments would add a writable runtime,
  moderation, abuse prevention, privacy, retention, and operational complexity
  that is not required for the initial static blog.
- Scope: Initial-release architecture boundary, resolved/deferred development
  decisions, repository overview, and ADR 0003.
- Result: Public comments are explicitly excluded. The current phases add no
  comment provider, write API, account flow, moderation queue, comment database,
  placeholder SDK, metadata contract, or comment-specific client code. Any
  future comment proposal requires a separate architecture and privacy review.
- Validation: Searched project Markdown and configuration for existing comment
  providers and comment-system contracts; found no implementation or provider
  dependency to remove. Checked the edited Markdown links, fences, and Git
  whitespace after the documentation update.
- Compatibility / follow-up: No post or managed-page authoring format changed,
  so `CONTENT_RULES.md` remains accurate and requires no update. Readers cannot
  post comments in the initial release; content, navigation, SEO, search,
  analytics, and managed pages remain independent of comments.

## 2026-08-16T05:07:06+09:00 — Per-post localized Open Graph contract

- Change type: SEO, content metadata, artifact/configuration schema, web
  presentation, design, tests, build/deployment contract, and guide update.
- Reason: Every localized post needs its own static Open Graph metadata and
  representative social preview without inheriting an unrelated global image.
- Scope: Optional post `socialImage`, paired cover/social-image artifacts,
  language-specific Open Graph locales, metadata generation and escaping,
  image-source precedence, deterministic fallback-card design, Pages output,
  authoring agents, quality gates, and implementation plan.
- Result: Each published post must emit a complete `article` Open Graph object
  with localized title/description/locale/category/tags, canonical self URL,
  publication dates, and a post-specific `1200 × 630` image. Image selection is
  explicit social image, then cover, then a locally generated deterministic
  post card. Added a framework-independent ordered metadata generator, safe
  HTML rendering, HTTPS validation, namespace constant, and source-selection
  helper. Production never calls a remote image service or reuses a misleading
  global fallback.
- Validation: Passed all 25 executable TypeScript tests, including core tag
  ordering, locale alternates, article metadata, attribute escaping, invalid
  URL/image rejection, and image-source precedence; parsed all eight YAML files
  and verified `en_US`/`ko_KR`/`ja_JP`; checked links and balanced fences across
  35 Markdown files; and passed the Git whitespace check. The full website and
  pixel-level card renderer were not built because the framework, fonts, final
  Open Design tokens, and executable root build pipeline remain deferred.
- Compatibility / follow-up: Content artifacts advance from schema version 4
  to version 5 and `config/site.yaml` advances from version 2 to version 3;
  earlier intermediates must be rebuilt. There are no existing posts to migrate.
  The selected framework must implement the documented local card renderer,
  place cards under `/_assets/social/`, inject the generated tags into initial
  HTML, and run visual/social-preview validation before launch.

## 2026-08-16T04:58:52+09:00 — Original-language provenance for translated posts

- Change type: Content metadata, artifact schema, localization UI, SEO,
  validation, agent workflow, and guide update.
- Reason: English and Japanese translations need to identify their Korean
  source clearly so readers can distinguish an authored original from a
  translation and consult the original when nuance matters.
- Scope: Post frontmatter, translation-group invariants, content/search
  artifacts, post-header messages and origin resolver, Schema.org relationships,
  Open Design requirements, publishing/quality gates, agent instructions,
  development plan, and contract tests.
- Result: Every post variant now requires the same `originalLanguage` value.
  Renderers can classify original versus translated variants, display localized
  origin metadata, warn translated-page readers that nuance may differ, and
  link to the validated original route. Structured data uses `inLanguage` and
  connects translations with `translationOfWork`; no translator identity is
  inferred. Korean-source authoring sets `originalLanguage: "ko"` on all three
  variants.
- Validation: Passed all 21 executable TypeScript tests, including original
  resolution and missing-original rejection; parsed all eight shared YAML
  files; checked local links and balanced fences across 35 Markdown files; and
  passed the Git whitespace check. A full site build was not run because the
  framework and executable root build pipeline remain deferred.
- Compatibility / follow-up: Content artifacts advance from schema version 3
  to version 4 and earlier intermediate output must be rebuilt. There are no
  existing post files to migrate; any future legacy group must add the field to
  all variants before production. The selected renderer still needs to wire the
  documented initial-HTML disclosure and JSON-LD emission.

## 2026-08-16T04:53:40+09:00 — English-default multilingual publishing contract

- Change type: Architecture, content schema, configuration, localization,
  design, SEO, search, discovery, managed-page metadata, tests, and guides.
- Reason: Korean source posts must be publishable as English and Japanese
  translations, with the whole blog selecting a browser-appropriate language
  while retaining complete static HTML and GitHub Pages compatibility.
- Scope: Locale-grouped `docs/`, shared language/route/taxonomy/navigation
  configuration, artifact contracts and provenance, browser preference and UI
  message scaffolding, normal-blog and managed-page rules, Open Design guidance,
  static search/RSS/404 behavior, deployment layout, quality gates, and agent
  post-conversion instructions.
- Result: English is now the unprefixed default and no-JavaScript fallback;
  Korean uses `/ko/` and Japanese `/ja/`. Published posts require a consistent
  three-file translation group. All normal blog surfaces, search indexes, and
  RSS feeds are language-scoped, with reciprocal SEO alternates and real
  language links. Managed pages remain independent and expose alternates only
  when separately authored packages share an optional `translationKey`.
  Provisional browser-language selection and complete typed UI message maps
  were added without introducing a framework or runtime translation service.
- Validation: Parsed all eight shared YAML files and asserted the configured
  `en`/`ko`/`ja`, English-default, Korean-source invariants; checked local links
  and balanced fences across 35 Markdown files; passed all 19 executable
  TypeScript tests; and passed the Git whitespace check. A full site build was
  not run because the framework, runtime schema implementation, package manager,
  and root build scripts remain deferred decision gates.
- Compatibility / follow-up: There are no existing post Markdown files or
  managed-page packages to migrate. Legacy `docs/<category>/...` posts must move
  under `docs/ko/`, add `translationKey` and stable taxonomy IDs, and gain
  matching `en`/`ja` variants before production. Content artifacts advance to
  schema version 3; web, search, managed-page, discovery, and release artifacts
  advance to version 2, so all earlier intermediate output is rebuild-only.
  The selected framework must wire the provided preference helper and render
  the documented static alternate metadata; no deployment was attempted.

## 2026-08-16T04:38:15+09:00 — History governance and final consistency audit

- Change type: Guide, project governance, validation, and analytics bug fix.
- Reason: Require durable history for every non-routine blog change and perform
  a final review for incorrect or inconsistent project behavior.
- Scope: `AGENTS.md`, `History.md`, root documentation, configuration, Markdown
  links/fences, artifact contracts, heading-anchor logic/tests, and the
  blog-owned GA4 adapter/tests.
- Result: Added the mandatory history workflow and README discovery link. The
  audit found and fixed one functional defect: after analytics consent was
  revoked and granted again, the already-loaded GA4 client did not receive the
  new `granted` consent update. Re-grant now updates GA4 without loading a
  second script. No other blocking contract or documentation inconsistency was
  found.
- Validation: Parsed all nine YAML files; verified local Markdown links and
  balanced fences across 34 Markdown files; scanned required paths, whitespace,
  and common secret/local-path patterns; ran all 11 executable TypeScript
  scaffold tests covering GA4 and heading anchors; and ran the Git whitespace
  check. Full build/deployment was not run because executable root build scripts
  and the deferred implementation stack do not yet exist.
- Compatibility / follow-up: No post or managed-page authoring format changed.
  The untracked root image `guro-vlog-thumbnail-upload-3840x2160.jpg` remains
  untouched because its intended ownership is unknown; classify/copy it through
  the content asset workflow if it is meant for a post. The repository scaffold
  and image are still uncommitted and therefore not yet preserved in Git
  history.

## 2026-08-16T04:34:40+09:00 — Modification-history policy introduced

- Change type: Project governance and guide update.
- Reason: Non-content blog changes need a durable record of their time, intent,
  and outcome across Codex, Claude Code, Gemini CLI, and other agents.
- Scope: Root `History.md`, shared `AGENTS.md`, and repository documentation.
- Result: All design, page, structure, contract, configuration, guide,
  build/deployment, security, analytics, and search changes must now update this
  log in the same task. Routine post authoring is the narrowly defined
  exception.
- Validation: Confirmed the Claude and Gemini adapter files import
  `AGENTS.md`; final repository audit is recorded in the next entry after its
  checks complete.
- Compatibility / follow-up: No post or managed-page source format changed.

## 2026-08-16T04:34:40+09:00 — Existing project foundation recorded as baseline

- Change type: Retrospective baseline recorded at history-introduction time.
- Reason: The history file was introduced after the initial architecture work,
  so the current repository state needs an explicit starting point without
  inventing earlier per-change timestamps.
- Scope: Static blog/content isolation, GitHub Pages release boundary, Open
  Design contracts, managed pages, embed-plugin boundary, asset handling,
  search/taxonomy/recommendation policies, optional consent-gated GA4, and
  Markdown-derived heading anchors/table-of-contents metadata.
- Result: The repository contains planning contracts and framework-neutral
  TypeScript scaffolding for the agreed architecture. Content artifact schema
  version `2` carries deterministic heading anchors and hierarchy metadata.
- Validation: Heading-anchor contract tests passed before this baseline was
  recorded. Full end-to-end build/deployment was not run because the framework,
  package manager, runtime schema library, Markdown stack, and root build
  scripts are still documented decision gates.
- Compatibility / follow-up: Existing Markdown posts require no TOC migration;
  version `1` intermediate content artifacts must be rebuilt. Select the
  deferred implementation stack before claiming an executable site release.
