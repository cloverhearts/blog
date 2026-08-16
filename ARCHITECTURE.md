# Blog Architecture and Isolation Boundaries

## Status

This document defines the target repository boundaries for the approved
Node.js 24 LTS, npm workspace, Astro static, and Zod 4 implementation. GitHub
Pages with a custom GitHub Actions workflow is the selected production hosting
target. Dependency upgrades or future replacements must preserve these rules
and the hosting contract in `GITHUB_PAGES.md`.

Items marked as planned describe required implementation work. They are not yet a claim that the build is executable.

## Goals

- Blog design can change without editing post or managed-page source.
- Post content can change without editing blog components, layouts, or styles.
- A managed page can change without importing or rebuilding against blog presentation code.
- Published output is static, readable without client-side JavaScript where required, and reproducible from source.
- Cross-boundary communication uses runtime-validated, versioned, framework-neutral artifacts.
- Preview data and production data are structurally separated so drafts cannot leak into a release.
- English, Korean, and Japanese are built as complete static route sets; locale
  selection never turns content rendering into a browser-only responsibility.

## Initial-release exclusions

Public comments are intentionally outside the initial release boundary. No
comment provider, anonymous-submission endpoint, account system, moderation
queue, comment database, or comment-specific client script belongs to the
current blog, content, managed-page, discovery, or release lanes.

This exclusion keeps the production system fully static and avoids introducing
a writable runtime solely for comments. A later comment feature requires an
explicit architecture decision covering provider isolation, privacy, abuse and
spam controls, moderation ownership, data retention and deletion, accessibility,
no-JavaScript behavior, operating cost, and failure isolation. The future
decision must not make post content or navigation depend on comment availability.

Isolation means source ownership and dependency isolation. A final release may still rerender post HTML after a design or content change so that the deployed site stays internally consistent. That rerender must not require source edits on the other side of the boundary.

## Dependency direction

```text
config/ ───────────────► packages/project-config/
packages/contracts/ ───► every artifact producer and consumer
plugins/embeds/* ──────► packages/embed-core/ ◄── config/embeds.yaml

docs/ + assets/content/
        │
        ▼
packages/content-compiler/ ───────────────► .artifacts/content/<mode>/
                                                    │
                                                    ▼
DESIGN.md + apps/blog-web/ ───────────────► apps/blog-web/
                                                    │
                                                    ▼
                                           .artifacts/web/<mode>/
                                                    │
                                                    ▼
packages/search-indexer/ ─────────────────► .artifacts/search/<mode>/

managed-pages/*/page.yaml + managed-pages/*/DESIGN.md + page source
        │
        ▼
packages/managed-page-compiler/ ──────────► .artifacts/managed/<mode>/

.artifacts/content/<mode>/ + .artifacts/web/<mode>/
        + .artifacts/managed/<mode>/
        │
        ▼
packages/site-discovery/ ─────────────────► .artifacts/discovery/<mode>/

web + search + managed + discovery production artifacts
        │
        ▼
packages/release-assembler/ ──────────────► dist/
```

Dependencies only flow downward in this diagram. Source directories never import generated output, compilers never import consumer presentation code, and the release assembler accepts production-mode artifacts only.

## Repository layout

```text
apps/
└── blog-web/                    # Blog layout, routes, components, styles

config/
├── site.yaml                    # Origin key, locale, timezone, global policies
├── performance-budgets.yaml     # Pages capacity and route/media/font budgets
├── routes.yaml                  # Prefixes, system routes, reserved namespaces
├── taxonomy.yaml                # Category/tag labels and aliases
├── navigation.yaml              # Intentional blog and managed-page links
├── redirects.yaml               # Explicit route compatibility rules
├── security.yaml                # Static-document and direct page max policy
├── embeds.yaml                  # Explicit local plugin registry and safety policy
├── ai-crawlers.yaml             # AI crawler access and llms.txt policy
├── content-provenance.yaml      # Shared post authorship/AI-use declaration
└── analytics.yaml               # Optional GA4 activation, consent, and collection policy

DESIGN.md                        # Open Design contract for normal blog only
UX_FLOW.md                       # Semantic navigation and interaction contract
I18N.md                          # Language, translation, and locale-route contract

packages/
├── contracts/                   # Runtime artifact schemas and inferred TS types
├── project-config/              # Runtime-validated config and route registry
├── embed-core/                  # Provider-neutral build-time embed extension point
├── content-compiler/            # Posts and post assets -> content artifact
├── managed-page-compiler/       # Managed page packages -> standalone output
├── search-indexer/              # Final blog HTML -> static search artifact
├── site-discovery/              # Final routes -> sitemap, robots, and RSS
└── release-assembler/           # Compatibility checks and final static merge

docs/{en,ko,ja}/                 # Locale-grouped post Markdown only
assets/content/                  # Post-owned source assets only
managed-pages/                   # Self-contained managed-page packages
templates/managed-page/          # Non-published page package starter
design/open-design/              # Unreviewed normal-blog Open Design exports
plugins/embeds/                  # Reviewed provider adapters; empty until installed
tests/
├── fixtures/                    # Valid, invalid, malicious, and edge-case sources
├── contracts/                   # Producer/consumer and policy conformance tests
└── policy-coverage.json         # High-impact policy-to-test traceability
.artifacts/                      # Ignored intermediate build output
dist/                            # Ignored final static release
```

## GitHub Pages deployment boundary

GitHub Pages is downstream of release assembly rather than a dependency of any
source or compiler package:

```text
production artifacts -> release assembler -> dist/ -> Pages verifier -> GitHub Actions -> GitHub Pages
```

- Only the final `dist/` directory is uploaded.
- `docs/` is never a Pages publishing source; it contains source Markdown.
- GitHub-specific Actions and permissions live only in `.github/workflows/`.
- Origin and base path are validated deployment inputs. Artifact contracts keep
  logical root-relative routes and never contain a GitHub repository name.
- The final site is valid both at a custom-domain root and at a repository base
  path, although production deploys use the custom-domain root.
- The release verifier owns host-compatibility inspection but does not repair or
  rewrite producer output.
- Custom-domain and Route 53 configuration remain external deployment state;
  they are not content metadata.

See `GITHUB_PAGES.md` for the complete output, workflow, DNS, redirect, security,
size, and rollback contract.

## Shared configuration and route registry

`config/` is the only source of truth for settings used across more than one build lane. `packages/project-config/` will validate these files at runtime and expose immutable, framework-neutral values.

Shared configuration owns:

- the public site identity, deployment-origin and base-path environment variable
  names, supported/source/default languages, locale prefixes, preference key,
  and timezone;
- post, category, tag, archive, search, feed, sitemap, managed-page, asset
  prefixes, and the stable pagination segment;
- reserved routes and path namespaces;
- the default managed-page return route;
- taxonomy display labels and aliases;
- intentional blog navigation links, including explicitly surfaced managed pages;
- explicit redirects and canonical-route compatibility;
- the maximum static-document and direct managed-page external-origin policy;
- the explicit local embed-plugin registry and global embed security policy.
- AI search, user-directed, training, and mixed-purpose crawler access plus the
  generated agent-guide inclusion policy;
- the owner-declared original-work authorship and limited AI-assistance policy
  copied into every post artifact;
- the optional public GA4 environment key, blog-only scope, consent mode, and
  data-minimization policy.

It does not own blog colors, layout, typography, components, or managed-page design. Those belong to the root blog `DESIGN.md` and page-local `DESIGN.md` files respectively.

Analytics configuration is resolved at build time. A missing or blank
`GA4_MEASUREMENT_ID` produces a disabled configuration and the blog renderer
must emit no Google loader or analytics origins. A configured ID is public and
must match the `G-...` GA4 Measurement ID format; it is never treated as a
secret. Invalid non-blank values fail configuration validation.

Every route-producing lane emits route claims using the shared contract. The route registry validates normalized paths before expensive rendering where possible, and the release assembler repeats the collision check against emitted files. No producer silently renames a conflicting route.

YAML values unrelated to the resolved GitHub Pages hosting contract remain
reviewable project configuration. Astro integration must preserve the
origin/base-path input model and trailing-slash route policy in
`GITHUB_PAGES.md`.

The public URL resolver combines the validated origin, validated base path, and
logical route. Producers must not concatenate those values independently.

## Embed core and provider plugin boundary

External content is extended at build time through `packages/embed-core/`; it is not implemented as arbitrary Markdown HTML or as a runtime plugin marketplace.

Dependency rules:

- `packages/content-compiler/` and the controlled managed-page Markdown adapter depend on `packages/embed-core/`, never on individual providers.
- A provider under `plugins/embeds/<plugin-id>/` depends only on the embed-core API and approved utility packages.
- `packages/embed-core/` loads only local workspace plugins explicitly listed in `config/embeds.yaml`; it does not scan directories or download code.
- The blog application and managed-page compiler consume sanitized embed HTML and framework-neutral embed artifact records. They do not import provider packages.
- The release assembler validates declared external origins and browser permissions but does not execute or rerender plugins.

Embed-core responsibilities:

- dispatch a named Markdown directive to exactly one enabled provider plugin;
- invoke runtime validation for provider-owned directive attributes;
- require an accessible title, canonical external URL, searchable fallback text, and static/no-JavaScript fallback;
- require a privacy mode declaring whether rendering makes an external request or requires prior consent;
- sanitize returned markup even though plugins are reviewed local code;
- aggregate allowlisted CSP origins and iframe permissions;
- collect optional progressive-enhancement modules as immutable artifact files;
- record plugin ID, version, configuration hash, and output hash in content artifacts.

Provider plugin responsibilities:

- normalize only its own provider identifiers and URLs;
- generate provider-specific semantic markup and a durable normal-link fallback;
- declare every external frame, script, connection, and image origin it needs;
- declare whether it is local-only, immediately makes an external request, or must wait for consent;
- keep browser-side behavior optional to understanding the surrounding post;
- avoid secrets and undeclared network access.

Unknown, disabled, duplicated, or policy-violating directives are content build errors. Network access during builds is denied by default. If a future plugin genuinely requires it, the request must be explicitly enabled, cached or frozen for reproducibility, and included in provenance.

No provider plugin is implemented by this scaffold. Adding Google Maps, Naver Maps, or another provider later must not require changes to embed-core, the content compiler, or blog presentation code; it should require only a provider package, registry/configuration entry, content-rule syntax, and fixtures.

## Boundary ownership

### Post sources

Owned paths:

- `docs/`
- `assets/content/`
- post-related sections of `CONTENT_RULES.md`

Post sources contain facts, metadata, semantic Markdown, and logical media references. They must not contain framework components, imports from `apps/blog-web/`, blog CSS class contracts, generated URLs, or generated asset hashes.

### Content compiler

Owned path: `packages/content-compiler/`

Responsibilities:

- parse and runtime-validate post Markdown;
- validate complete en/ko/ja translation groups and emit locale-qualified IDs
  plus alternate-route records used with `originalLanguage` as the required
  input for optional post-language context;
- validate per-variant translation review status and reject unreviewed AI
  translations from production artifacts;
- resolve logical `asset:` references;
- delegate registered external-content directives to `packages/embed-core/`;
- sanitize and convert Markdown into semantic, unstyled HTML fragments;
- generate language-scoped summaries, categories, tags, recommendations,
  deterministic heading anchors/TOC records, and shared asset records;
- emit search eligibility and descriptive metadata, but not the final search index;
- attach the project-config-validated authorship declaration to every post
  variant as original-work metadata without modifying source Markdown;
- emit only artifacts accepted by runtime schemas from `packages/contracts/`;
- write intermediate output only to `.artifacts/content/<mode>/`.

The compiler assigns heading IDs and emits TOC metadata from the same parsed
heading nodes. It rejects invalid hierarchy, explicit-ID collisions, and broken
same-document fragment links. It must not import individual provider plugins,
blog layouts, components, CSS, framework routing, search-engine internals, or
managed-page code.

### Blog web application

Owned path: `apps/blog-web/`

Responsibilities:

- complete English, Korean, and Japanese blog home, navigation, post
  presentation, category, tag, archive, search, and system pages;
- the complete blog design system, layout, typography, and responsive behavior;
- rendering content artifacts into final static blog HTML;
- rendering accessible table-of-contents navigation from validated heading
  records without reparsing Markdown or inventing IDs;
- crawlable self-canonical pagination with stable sequential links;
- blog-specific SEO presentation and shared browser enhancements;
- home-page `WebSite`, conditional public-author `ProfilePage`/`Person`,
  content-appropriate page structured data, and stable favicon presentation;
- per-post Open Graph records plus `1:1`, `4:3`, and `16:9` Article image
  derivatives from the owner-approved representative source, with local
  deterministic social-card generation only when that mode was selected;
- metadata-only post authorship disclosure in the static `<head>`, emitted from
  the validated artifact and excluded from visible body/search text and
  Schema.org rich-result claims;
- real-link language switching and one loop-free browser-preference navigation
  from an unprefixed Korean route to an existing static alternate, with Korean
  remaining the no-JavaScript fallback;
- presentation-neutral post-language context derived from current language,
  original language, and validated alternates; any post-body treatment is
  optional, exposes no review state, and never redirects an explicit route;
- optional consent-gated aggregate analytics through the reviewed blog-owned
  GA4 adapter;
- emitting a web manifest and route claims for the generated HTML.

It may import inferred types and validators from `packages/contracts/`, read validated `.artifacts/content/<mode>/`, and consume validated shared configuration. It must not traverse `docs/`, parse Markdown, resolve source asset paths, or import managed-page source.

The analytics adapter is not an embed plugin and is not part of content
compilation. It receives only the validated public Measurement ID. In basic
consent mode it must not request `gtag.js` until the reader grants analytics
consent. It strips URL queries and fragments from page-view locations, disables
Google Signals and advertising personalization, and must not receive raw search
terms, user IDs, email addresses, post text, or code. Analytics failure or
blocking may never delay or alter static content, navigation, search,
recommendations, SEO, or release assembly. Managed pages do not import the blog
adapter and remain untracked by default.

### Search indexer

Owned path: `packages/search-indexer/`

Responsibilities:

- consume the already-rendered `.artifacts/web/<mode>/` HTML;
- use content artifact metadata to include only eligible blog documents;
- create a browser-readable static index without a server dependency;
- create and isolate one deterministic index per supported language;
- exclude managed pages by default;
- emit `.artifacts/search/<mode>/` and its own manifest/provenance.

Indexing final HTML ensures search text matches what readers receive. The search indexer does not parse Markdown, render pages, infer post taxonomy, or modify web output.

### Site discovery builder

Owned path: `packages/site-discovery/`

Responsibilities:

- consume validated content, web, and managed-page manifests only after their
  final canonical routes are known;
- generate the root `sitemap.xml`, AI-aware `robots.txt`, proposal-based
  `llms.txt`, and post-only English, Korean, and Japanese RSS feeds;
- validate `config/ai-crawlers.yaml`, keep search, user-directed,
  model-development, and public-dataset agents discoverable, and make any
  combined-purpose trade-offs explicit;
- include only canonical published routes and managed pages whose explicit
  `robots` and `sitemap` policies allow discovery;
- derive sitemap `lastmod` only from authored publication/modification values
  and keep resources needed to understand indexable pages crawlable;
- exclude drafts, previews, redirects, search results, assets, aliases, and
  `noindex` pages;
- resolve absolute URLs through the shared origin/base-path resolver;
- emit `.artifacts/discovery/<mode>/` tied to the exact hashes of every input.

It does not parse Markdown, render or restyle pages, infer a managed page's
publication policy, add managed pages to RSS, or modify upstream artifacts.

### Managed pages

Owned path: `managed-pages/`

Each child is an independent package with `page.yaml`, `DESIGN.md`, an appropriate entry source, and local assets. A managed page must not import blog layouts, the root blog `DESIGN.md`, or global blog styles. The managed-page compiler supplies only the invariant return control and document safety/accessibility shell defined in `CONTENT_RULES.md`.

### Managed-page compiler

Owned path: `packages/managed-page-compiler/`

Responsibilities:

- runtime-validate `page.yaml`, the required Open Design-compatible `DESIGN.md`, the declared page entrypoint, security declarations, and local assets;
- route any enabled provider directive in a managed Markdown entry through `packages/embed-core/`;
- build a complete standalone static document or application bundle;
- inject the return control without depending on the blog UI;
- enforce route, no-script, print, accessibility, metadata, content-appropriate
  structured data, and asset rules;
- emit route claims and write only to `.artifacts/managed/<mode>/`.

It must not import `apps/blog-web/`, post content, post taxonomies, blog CSS, or an individual provider plugin.

Managed-page build adapters are internal, versioned compiler capabilities rather
than page-provided lifecycle scripts. The initial adapter set is:

- semantic Markdown document;
- semantic Markdown presentation;
- repository-bundled TypeScript application.

A page selects an adapter through the validated `entry.format`/`kind`
combination. Page packages do not run their own install hooks, declare a second
package manager, or execute arbitrary build commands. Adding an adapter is a
compiler and content-contract change with fixtures and security review.

### Release assembler

Owned path: `packages/release-assembler/`

Responsibilities:

- accept production-mode web, search, managed-page, and discovery artifacts only;
- validate every input manifest at runtime and reject unsupported or mixed schemas;
- reject stale inputs whose provenance hashes do not agree on configuration and content rules;
- reject route and emitted-file collisions;
- copy immutable outputs into `dist/`;
- verify required root files and internal references;
- verify GitHub Pages constraints through a read-only `verify:pages` step;
- produce a release manifest and a separate diagnostic build report.

It does not parse Markdown, render layouts, alter managed-page designs, derive content metadata, or repair invalid producer output.

## Executable artifact contracts

`packages/contracts/` uses Zod 4 runtime schemas as its implementation source
of truth. TypeScript types must be inferred from those schemas rather than
maintained independently, and JSON Schema is generated from the same source.

Contract rules:

- Producers validate data immediately before writing it.
- Consumers validate data immediately after reading it; TypeScript compilation alone is insufficient.
- Artifacts are JSON-serializable and contain no framework objects or executable functions.
- Dates are ISO 8601 strings. Routes are normalized root-relative paths.
- Semantic post HTML contains no blog presentation classes or inline executable code.
- Artifact schema versions are explicit and consumers reject unsupported major versions.
- JSON Schema may be generated from the runtime schemas for editor and non-TypeScript tooling support.
- A breaking change updates producers, consumers, fixtures, migration notes, `CONTENT_RULES.md`, and this document together.

The current TypeScript interfaces are a provisional contract sketch until the
Phase 1 Zod runtime schemas are implemented. They must not be treated as runtime
validation.

## Deterministic artifacts and provenance

Every artifact manifest carries provenance sufficient to detect stale or mixed inputs:

- `producer` and `producerVersion`;
- `schemaVersion`;
- `buildMode` (`preview` or `production`);
- `inputHash`;
- `configHash`;
- `contentRulesHash`;
- `localizationRulesHash`.

Content manifests that contain embeds also record every contributing plugin ID/version and the embed-registry policy hash. Plugin source, configuration, frozen external responses, and emitted enhancement assets participate in `inputHash`.

The web artifact `inputHash` includes the root `DESIGN.md`, reviewed blog assets,
and implementation source. Each managed-page `sourceHash` includes its
`page.yaml`, local `DESIGN.md`, declared entry graph, security declarations, and
page-owned assets. A design change therefore invalidates only its owning build
lane and downstream artifacts.

Content-addressed assets use stable artifact-relative paths and asset IDs. Contracts do not store deployment-specific public URLs or producer filesystem output directories. The web renderer resolves a public URL from shared route configuration; the release assembler maps artifact-relative paths into `dist/`.

Wall-clock timestamps such as `generatedAt` are excluded from reproducible content manifests. If a human-readable build time is needed, it belongs in a diagnostic report that is excluded from integrity hashes, or it is derived from an explicit `SOURCE_DATE_EPOCH` value.

The release assembler rejects inputs when build modes, schema versions,
configuration hashes, content-rule hashes, or localization-rule hashes are
incompatible.

## Preview and production separation

Preview and production outputs use different directories and different manifest types:

```text
.artifacts/<lane>/preview/
.artifacts/<lane>/production/
```

- Source records may have `draft` or `published` status.
- Preview manifests may contain both statuses and must be served only by preview tooling.
- Production post and managed-page manifest types cannot represent a draft entry.
- Production compilers omit drafts before rendering and validate that no draft-only route or asset remains.
- `build:release` consumes only `.artifacts/*/production/` and fails if a preview artifact is supplied.

This structural distinction is the primary draft-safety mechanism; a boolean checked only at template render time is not sufficient.

## Artifact layouts

### Content artifact

```text
.artifacts/content/<mode>/
├── manifest.json
├── posts/<post-id>.json
└── assets/
```

The manifest contains post summaries, category/tag indexes, related-post IDs, search eligibility metadata, asset records, provider-neutral embed/plugin/security records, and route claims. Individual post artifacts contain validated metadata, an ordered heading/anchor record used as the table-of-contents source, and an unstyled semantic HTML fragment whose heading IDs exactly match that record.

Content artifact schema version `7` adds the owner-declared, metadata-only
original-work authorship disclosure. Version `6` added per-variant
`translationStatus` and production rejection of unreviewed AI translations.
Version `5` replaced the unpaired cover asset ID with paired cover/social-image
records. Version `7` retains `originalLanguage` from version `4`, the
language/translation/taxonomy
fields from version `3`, and the heading
`anchor`/`parentId` shape introduced in version `2`. Earlier
intermediate artifacts have no migration path because `.artifacts/` is
rebuildable output; all consumers reject them and rebuild downstream lanes from
the locale-grouped source.

### Web artifact

```text
.artifacts/web/<mode>/
├── manifest.json
└── site/<static blog routes, app assets, and post social cards>
```

The web build treats the content artifact as read-only input and owns all blog presentation in this output.

### Search artifact

```text
.artifacts/search/<mode>/
├── manifest.json
└── index/<static search files>
```

The exact index format remains an implementation choice. It must be deployable as static files and its manifest must declare the web artifact hash it indexed.

### Managed-page artifact

```text
.artifacts/managed/<mode>/
├── manifest.json
└── pages/<managed-page-id>/
```

Each page output is complete and standalone. It does not expect the final release to inject blog CSS or blog markup.

The artifact keeps page output grouped by stable page ID. Its manifest also
contains the public route claim. Release assembly maps the group to the claimed
route; the intermediate `pages/<managed-page-id>/` directory is not a public URL
contract.

### Discovery artifact

```text
.artifacts/discovery/<mode>/
├── manifest.json
└── site/
    ├── robots.txt
    ├── llms.txt
    ├── sitemap.xml
    ├── rss.xml
    ├── en/rss.xml
    └── ja/rss.xml
```

The manifest records the exact content, web, managed-page, and crawler-policy
hashes used to produce the discovery files, plus explicit robots, llms, sitemap,
and feed routes. A stale discovery artifact cannot enter a release.

## Build lanes

The intended commands, once implementations exist, are:

```text
validate:config  config files -> validated shared configuration and route rules
validate:embeds  explicit registry + local plugin packages -> compatibility result
build:content    docs + post assets + config -> .artifacts/content/<mode>
build:web        blog source + content artifact + config -> .artifacts/web/<mode>
build:search     final web HTML + content metadata -> .artifacts/search/<mode>
build:managed    managed page packages + config -> .artifacts/managed/<mode>
build:discovery  content + web + managed manifests -> .artifacts/discovery/<mode>
build:release    production web + search + managed + discovery artifacts -> dist
verify:pages     dist + deployment URL inputs -> GitHub Pages compatibility result
test:contracts   schemas + producers + consumers + fixtures -> compatibility result
build            production lanes in dependency order, then contract/release/Pages checks
```

Local development may watch several lanes together, but each command must keep its declared inputs and outputs.

## Change impact

| Changed source | Required work | Must not require |
| --- | --- | --- |
| `docs/`, `assets/content/` | Content compile, blog render, search index, discovery, release assembly | Editing blog source |
| `DESIGN.md`, `apps/blog-web/` | Blog render, search index, discovery, release assembly | Editing posts or managed pages |
| One `managed-pages/<id>/` package | That managed-page build, discovery, release assembly | Editing or importing blog source |
| `config/` route or URL policy | All affected validation/build lanes | Duplicating constants in each package |
| `config/embeds.yaml` | Embed registry validation, content compile, downstream artifacts | Editing content compiler or blog UI |
| `config/analytics.yaml`, `GA4_MEASUREMENT_ID` | Config validation and blog render | Rebuilding content or changing managed pages |
| One `plugins/embeds/<id>/` package | That plugin's tests, content compile, downstream artifacts | Editing embed-core or blog UI |
| `packages/contracts/` | All affected producers, consumers, fixtures | Silent compatibility assumptions |
| `CONTENT_RULES.md` | Related schemas, validators, examples, provenance | Unsupported documented behavior |
| `I18N.md` | Locale schemas, routes, UI/search/discovery behavior, provenance | Partial or browser-only localization |

## Contract tests and fixtures

`tests/fixtures/` will contain representative source packages, while `tests/contracts/` will verify every producer/consumer boundary.

`TESTING.md` requires every behavioral or machine-enforceable policy change to
add or update tests in the same task. High-impact policy sources are mapped by
hash to exact test-case names in `tests/policy-coverage.json`; the contract suite
rejects stale hashes, missing sources, missing test files, and missing mapped
cases. This traceability complements rather than replaces behavioral assertions.

Minimum fixtures:

- a valid English/Korean/Japanese translation group with a `C++` tag, code,
  shared image, and synthetic external embed;
- valid and invalid `translationStatus` combinations, including production
  rejection of an `ai-draft` translation;
- Korean, Japanese, Latin, punctuation-only, duplicate, and explicit
  heading-anchor cases,
  including nested TOC parent relationships;
- invalid frontmatter, missing assets, path traversal, raw scripts/iframes, and malicious HTML;
- a synthetic test embed plugin covering valid fallback output without implementing a real provider;
- unknown/disabled directives, duplicate registrations, invalid plugin output, CSP escalation, undeclared network access, and missing fallbacks;
- manual and automatic related-post cases;
- draft and published variants for posts and managed pages;
- document, presentation, and application managed pages with valid and invalid entry, `DESIGN.md`, security, and arbitrary-route cases;
- duplicate routes, reserved routes, redirect conflicts, and asset collisions;
- discovery inclusion/exclusion, stale discovery inputs, and managed-route-to-file mapping;
- no-JavaScript, accessibility, responsive, and print expectations;
- invalid skipped heading levels, duplicate explicit IDs, unresolved fragments,
  and mismatched heading metadata/body HTML;
- golden manifests proving stable hashes and byte-for-byte deterministic output.

Required checks:

- each producer output passes its runtime schema;
- each consumer rejects malformed, stale, unsupported, or wrong-mode artifacts;
- production manifests and release output contain no draft records;
- final HTML contains the primary readable post content without client-side JavaScript;
- final HTML contains semantic TOC links whose fragments resolve to exactly one
  matching post heading without client-side JavaScript;
- the search index covers eligible final blog HTML and excludes managed pages by default;
- repeated builds with identical inputs produce identical integrity-bearing artifacts;
- changing a registered plugin version or policy changes provenance and prevents stale artifact reuse.
- absent, invalid, consent-denied, consent-granted, and consent-revoked GA4
  cases; disabled/denied cases make no Google request and page views omit URL
  queries and fragments.

## Enforcement

When the implementation stack is selected, add automated checks for:

- forbidden cross-boundary imports;
- direct blog reads of `docs/` or `assets/content/`;
- content-compiler imports from `apps/`;
- managed-page imports from `apps/blog-web/`;
- provider-plugin imports from the content compiler, blog application, or managed pages;
- implicit plugin discovery, remote plugin loading, and unregistered directive execution;
- embed fallback, sanitization, CSP-origin, permission, and provenance conformance;
- runtime artifact and shared-config validation;
- GA4 Measurement ID validation, consent gating, event data minimization, and
  conditional CSP-origin emission;
- unsupported schema versions and incompatible provenance;
- preview artifacts or drafts entering production release assembly;
- route and asset collisions both before rendering and during assembly;
- generated files written outside `.artifacts/` and `dist/`;
- differences between documented authoring rules and executable schemas;
- heading-anchor algorithm drift, unresolved fragment links, duplicated IDs,
  and TOC/body parity failures;
- deterministic output and golden-fixture conformance.

An architecture change that relaxes these boundaries requires an explicit decision, an update to this document, and a matching update to `AGENTS.md` and `CONTENT_RULES.md` when authoring or generated content behavior is affected.
