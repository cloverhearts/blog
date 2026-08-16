# Blog Modification History

This file records non-routine changes to the blog project. Entries are ordered
newest first and use the `Asia/Seoul` timezone. Routine post authoring is omitted
unless it changes shared content behavior, routes, schemas, or project rules.

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
