# Implementation Status and Developer Handoff

## Purpose

This document records what is actually present in the repository and what the
next implementation agent must still build. It complements the target contract
in `IMPLEMENTATION_SPEC.md` and the phase plan in `DEVELOPMENT_PLAN.md`.

Do not infer completion from a package directory, dependency, TypeScript
interface, README, or test name. A lane is complete only when its documented
commands, runtime validation, artifacts, negative cases, and acceptance checks
exist and pass.

Status terms used below:

- **Implemented**: executable behavior exists and has focused tests.
- **Partial**: one or more reusable primitives exist, but the lane cannot yet
  produce its required artifact.
- **Scaffold only**: package/dependencies/contracts exist without the production
  pipeline.
- **Specified only**: behavior is documented but has no implementation.

## Repository baseline

As of 2026-08-17, the documented command surface is executable. An empty
production site (no posts or managed pages yet) builds to `dist/` with Korean,
English, and Japanese system routes, discovery files, and Pages verification.
First reviewed posts, real provider plugins, and live custom-domain operations
remain follow-up work.

| Lane                 | Status      | Present now                                                                                                                                                            | Still required                                                                                                         |
| -------------------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Root tooling         | Implemented | npm workspaces, lockfile, Node/npm pins, TypeScript, Vitest, documented command surface, watch-based preview rebuilds with development-only browser live reload, quality and Pages workflows | Live custom-domain/Search Console operational checks                                                                   |
| Artifact contracts   | Implemented | Zod 4 schemas, inferred types, parse helpers, generated JSON Schema, 150-character descriptions, optional thumbnail records                                            | Schema-8 removal of compatibility `excerpt` remains a later explicit migration                                         |
| Shared configuration | Implemented | Zod-backed loader for every `config/*.yaml` file, URL resolver, route registry, Clarity/provenance/budget validation                                                       | None for the current configuration set                                                                                 |
| Content compiler     | Implemented | Discovery, frontmatter, sanitization, assets, headings/TOC, translation groups, related posts, 150-character descriptions, compatibility excerpts, optional thumbnails | First reviewed production posts                                                                                        |
| Embed core           | Implemented | Runtime schemas, explicit registry, safe iframe validation, deterministic execution, synthetic test plugin, and reviewed local YouTube provider                         | Additional providers only after separate review                                                                        |
| Blog web             | Implemented | Static renderer, localized routes, named-component external CSS, Open Design refined white/green editorial shell, full-link post cards with restrained thumbnail transitions, overlapping workflow hero, numbered ruled lists, 132/704/132 post layout, mobile white hero, TOC, Open Graph, description summaries, 16:9 list thumbnails, dark/print modes, Clarity-off default | Ongoing populated-corpus cross-browser and device visual regression checks                                             |
| Search               | Implemented | Pagefind per-language indexes, labeled search form, no-JS fallback, and language-isolated client enhancement                                                           | Field ranking checks against a larger published corpus                                                                 |
| Managed pages        | Partial | Static sanitized Markdown documents, optional network-free page-local CSS, route-aware profile links, return control, preview/production manifests; three published, empty noindex profile shells | Real profile content and owner review; TypeScript applications and interactive presentations remain fallback-only, not complete adapters |
| Site discovery       | Implemented | Config/artifact ingestion, sitemap, robots, llms.txt, per-language RSS, discovery manifest                                                                             | None until indexable managed pages exist                                                                               |
| Release assembly     | Implemented | Production-only merge, collision checks, `dist/`, `verify:pages`, release manifest and diagnostic report                                                               | Isolated `/blog` portability build in CI after Pages environment exists                                                |
| Content/plugins      | Partial     | Empty authoring workspace after removal of design-review samples; one reviewed local YouTube provider remains available | First reviewed real posts, categories and topical tags |
| Delivery             | Partial     | Quality workflow plus Pages upload/deploy workflow                                                                                                                     | Custom-domain DNS, HTTPS enforcement, Search Console, rollback drill                                                   |

## Commands that exist now

```text
npm ci
npm run typecheck
npm run validate:config
npm run validate:embeds
npm run test:contracts
npm run test:policy
npm run test:i18n
npm run test:seo
npm run test:analytics
npm run test:quality
npm test
npm run build:content
npm run build:web
npm run build:search
npm run build:managed
npm run build:discovery
npm run build:release
npm run verify:pages
npm run build
npm run dev
```

Production `build` requires `SITE_ORIGIN=https://blog.cloverhearts.com`. An
absent or blank `CLARITY_PROJECT_ID` is the supported analytics-off state.

## Fixed implementation inputs and outputs

The implementation agent must preserve these lane boundaries:

| Owner                            | Inputs                                                                    | Required output                                                            |
| -------------------------------- | ------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| `packages/project-config`        | `config/*.yaml`, declared public environment values                       | Validated immutable configuration and normalized route/URL services        |
| `packages/content-compiler`      | `docs/<language>/`, `assets/content/`, validated config, embed core       | `.artifacts/content/<mode>/`                                               |
| `apps/blog-web`                  | Validated content artifact, matching managed route availability, shared config, root `DESIGN.md` | `.artifacts/web/<mode>/` |
| `packages/search-indexer`        | Eligible final blog HTML plus exact web/content provenance                | `.artifacts/search/<mode>/`                                                |
| `packages/managed-page-compiler` | `managed-pages/<id>/`, its local `DESIGN.md`, validated config/embed core | `.artifacts/managed/<mode>/`                                               |
| `packages/site-discovery`        | Matching production content/web/managed manifests and crawler config      | `.artifacts/discovery/production/`                                         |
| `packages/release-assembler`     | Matching production web/search/managed/discovery artifacts                | Verified root `dist/` plus release manifest and separate diagnostic report |

No consumer may repair an invalid producer artifact. Preview artifacts never
enter the production release. The blog application never reads Markdown, and
the content compiler never imports blog presentation.

## Required implementation sequence

The executable phases are present. Remaining work is content and operations:

1. Completed: collection, RSS, and metadata summaries use the trimmed
   150-character localized `description`; Pagefind excerpts stay independent;
   compatibility excerpts skip leading non-prose Markdown.
2. Completed: optional managed `thumbnail` overrides list images; otherwise
   the web build derives a responsive `16:9` thumbnail from the representative
   image without changing Open Graph or Article image approval.
3. Completed: Archive is a localized footer/recovery link, not a primary-header
   item. Archive routes and discovery remain.
4. Completed: shared `listings.pageSize` is 10 for home and pageable
   collections, with `10 / 10 / 1` boundary coverage.
5. Completed: public author identity, reachable empty managed profile shells, All
   Posts / Selected Work / Daily Notes / Explore / Search navigation, generic
   curated collections, and in-place search-dialog enhancement.
6. Add the first reviewed Korean source post and independently reviewed
   translations when the owner supplies them.
7. Completed: the first reviewed local provider supports privacy-enhanced
   YouTube embeds with strict ID/title validation, a `noscript` normal-link
   fallback, and no build-time network access.
8. Complete custom-domain, HTTPS, Search Console, and rollback operations after
   the first Pages deployment.

Each later change must still satisfy the exit criteria in `DEVELOPMENT.md`,
`DEVELOPMENT_PLAN.md`, and `QUALITY_GATES.md`.

## Approved specification gap: localized post summaries

This gap is **implemented**. Collection, RSS, and metadata summaries use each
variant's trimmed, maximum 150-character `description`. Compatibility
`excerpt` skips leading non-prose Markdown and is not shown on lists.

## Approved specification gap: post thumbnails

This gap is **implemented**. An optional `thumbnail` override is accepted;
otherwise the web build derives a 16:9 list thumbnail from the representative
image. Open Graph and Article images remain independent of that list asset.

## Approved specification gap: Archive navigation prominence

This gap is **implemented**. Primary header navigation is Posts, Categories,
Tags, and Search. Archive remains at `/archive/`, `/en/archive/`, and
`/ja/archive/` and is linked once from the footer plus search/404 recovery.

## Approved specification gap: ten-item pagination

This gap is **implemented**. `config/site.yaml` `listings.pageSize` is 10, and
home plus Posts/category/tag/Archive collections consume that shared value.
Page 1 stays at the collection root; later pages use `/page/<n>/`.

## Approved specification gap: public author and curated discovery

`IMPLEMENTATION_SPEC.md` now approves a public author identity with localized
short bios and validated contact points, three independently authored/indexable
managed profile variants, and visible author-to-profile links that back one
stable `Person` identity referenced by every post. It also approves the exact
primary navigation order All Posts, Selected Work, Daily Notes, Explore, and
Search; Profile remains a separate author-identity destination, while Archive
stays secondary in the footer.

This gap is **implemented**. `config/site.yaml` carries a validated owner
record. Primary navigation is All Posts, Selected Work, Daily Notes, Explore,
and Search. `/work/`, `/daily/`, and `/explore/` exist. Collection membership
is compiler-derived from `config/curated-collections.yaml`. Content artifacts
are schema 8 and include presentation-neutral curated records and optional
`workEvidence`. Three managed profile packages are published as empty noindex
shells at the owner's request; real biography content awaits authoring. Search remains a
real `/search/` route and opens an in-page dialog when enhancement loads.

The owner finalized the blog design on 2026-09-13. All 20 sample translation
groups, their thumbnails, and sample category/topical-tag definitions have been
removed from authoring sources. Work and Daily retain only their generic marker
selectors. Profiles keep their stable routes, title, return control and local
design, but no biography. Playwright and assistive-technology checks remain
separate manual gates.

Clarity replaces the earlier GA4 scaffold as the sole analytics adapter. Its
external module, localized consent/withdraw controls, preview exclusions,
masking and CSP are wired into the web build. Unit/contract checks use synthetic
IDs only. The owner-supplied project ID is configured in the GitHub repository
variable and validated in a local production build; deployment, dashboard
receipt and provider-network verification remain activation gates in ANALYTICS.md.

Targeted image-viewer browser regression checks now exist under `tests/browser/`
for viewport containment, captions, and keyboard behavior. They use synthetic
images without restoring sample posts; broad cross-browser and assistive-
technology coverage remains a follow-up gate.

## High-risk rules the implementation must not reinterpret

- Korean is unprefixed. English uses `/en/`; Japanese uses `/ja/`.
- Only exact-root entry can select a browser language (ADR 0009); all other
  URLs retain their language. Explicit Korean home selection uses `?lang=ko`.
  No stored preference is used. The root-only enhancement is implemented in
  the blog renderer with preference, direct-link, and base-path regression tests.
- Post navigation target order is active language, English, then Korean. A
  missing target produces no link; a cross-language fallback is labeled.
- The authored original publishes before translations. Reviewed translations
  may publish independently; `ai-draft` never enters production.
- Every published variant is complete static HTML, self-canonical, and usable
  without JavaScript. Only published variants enter `hreflang`, sitemap, RSS,
  and language switching as applicable.
- `docs/` is build input, never the GitHub Pages publishing directory.
- Managed pages do not inherit blog design or post taxonomy. Each owns a local
  uppercase `DESIGN.md` and keeps only the shared return control.
- External providers are explicit reviewed build-time plugins. No provider
  scanning, runtime marketplace, arbitrary iframe/script, or implicit network
  access is allowed.
- Clarity is optional, blog-only, consent-gated, and disabled when its public
  project ID is absent. It never influences search or recommendations.
- Open Design is an authoring input, not a production dependency.
- Comments remain out of scope until a new accepted privacy/security/cost ADR.

## Definition of done for every implementation work item

An implementation agent must report all of the following:

1. the authoritative contract and phase being implemented;
2. explicit inputs, outputs, error cases, and dependency direction;
3. production code and runtime validation, without weakening an existing rule;
4. focused positive, negative, boundary, deterministic, and regression tests as
   applicable;
5. updated fixtures and `tests/policy-coverage.json` when governed sources
   change;
6. updated `CONTENT_RULES.md` for any content/schema/author action change;
7. a newest-first `History.md` entry containing only checks actually run;
8. an update to this status matrix when a lane moves from specified/scaffolded
   to partial or implemented;
9. exact remaining limitations, manual/deployed checks, and migration needs.

Passing TypeScript or one focused unit test is not evidence that a build lane is
complete. A lane becomes complete only when the corresponding commands and exit
criteria in `DEVELOPMENT.md`, `DEVELOPMENT_PLAN.md`, and `QUALITY_GATES.md` are
executable and pass.

## Authoritative document order for implementation

1. `AGENTS.md` for repository-wide workflow and safety.
2. `IMPLEMENTATION_STATUS.md` for the actual baseline and next work.
3. `IMPLEMENTATION_SPEC.md` and accepted ADRs for fixed technical decisions.
4. `ARCHITECTURE.md` for ownership and artifact boundaries.
5. `DEVELOPMENT_PLAN.md` for phase order and exit criteria.
6. The scoped contract: `CONTENT_RULES.md`, `I18N.md`, `SEO.md`,
   `AI_DISCOVERY.md`, `PUBLISHING.md`, `DESIGN.md`, `UX_FLOW.md`,
   `GITHUB_PAGES.md`, `TESTING.md`, or `QUALITY_GATES.md`.

If documents conflict, do not guess silently. Follow the authority rules in
`AGENTS.md`, identify the exact conflict, and resolve it through the appropriate
contract or superseding ADR before implementation.
