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

| Lane                 | Status         | Present now                                                                                                                    | Still required                                                                     |
| -------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------- |
| Root tooling         | Implemented    | npm workspaces, lockfile, Node/npm pins, TypeScript, Vitest, documented command surface, quality and Pages workflows           | Live custom-domain/Search Console operational checks                               |
| Artifact contracts   | Implemented    | Zod 4 schemas, inferred types, parse helpers, generated JSON Schema                                                            | None for the current schema versions                                               |
| Shared configuration | Implemented    | Zod-backed loader for every `config/*.yaml` file, URL resolver, route registry, GA4/provenance/budget validation               | None for the current configuration set                                             |
| Content compiler     | Implemented    | Discovery, frontmatter, sanitization, assets, headings/TOC, translation groups, related posts, preview/production artifacts    | First reviewed production posts under `docs/`                                      |
| Embed core           | Implemented    | Runtime schemas, explicit registry, sanitizer, deterministic execution, synthetic test plugin                                  | First reviewed real provider plugin                                                |
| Blog web             | Implemented    | Static renderer, localized routes, classless shell, TOC, Open Graph, authorship meta, social-card derivatives, GA4-off default | Branded design remains deferred; Playwright visual checks against a populated site |
| Search               | Implemented    | Pagefind per-language indexes tied to the web artifact hash                                                                    | Acceptance fixtures against published multilingual posts                           |
| Managed pages        | Implemented    | `page.yaml` loader, document/presentation/application adapters, return control, preview/production manifests                   | First real managed-page package                                                    |
| Site discovery       | Implemented    | Config/artifact ingestion, sitemap, robots, llms.txt, per-language RSS, discovery manifest                                     | None until indexable managed pages exist                                           |
| Release assembly     | Implemented    | Production-only merge, collision checks, `dist/`, `verify:pages`, release manifest and diagnostic report                       | Isolated `/blog` portability build in CI after Pages environment exists            |
| Content/plugins      | Specified only | Empty language and asset directories; no production post, managed page, or provider plugin                                     | First reviewed content groups and separately approved providers                    |
| Delivery             | Partial        | Quality workflow plus Pages upload/deploy workflow                                                                             | Custom-domain DNS, HTTPS enforcement, Search Console, rollback drill               |

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
absent or blank `GA4_MEASUREMENT_ID` is the supported analytics-off state.

## Fixed implementation inputs and outputs

The implementation agent must preserve these lane boundaries:

| Owner                            | Inputs                                                                    | Required output                                                            |
| -------------------------------- | ------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| `packages/project-config`        | `config/*.yaml`, declared public environment values                       | Validated immutable configuration and normalized route/URL services        |
| `packages/content-compiler`      | `docs/<language>/`, `assets/content/`, validated config, embed core       | `.artifacts/content/<mode>/`                                               |
| `apps/blog-web`                  | Validated content artifact, shared config, root `DESIGN.md`               | `.artifacts/web/<mode>/`                                                   |
| `packages/search-indexer`        | Eligible final blog HTML plus exact web/content provenance                | `.artifacts/search/<mode>/`                                                |
| `packages/managed-page-compiler` | `managed-pages/<id>/`, its local `DESIGN.md`, validated config/embed core | `.artifacts/managed/<mode>/`                                               |
| `packages/site-discovery`        | Matching production content/web/managed manifests and crawler config      | `.artifacts/discovery/production/`                                         |
| `packages/release-assembler`     | Matching production web/search/managed/discovery artifacts                | Verified root `dist/` plus release manifest and separate diagnostic report |

No consumer may repair an invalid producer artifact. Preview artifacts never
enter the production release. The blog application never reads Markdown, and
the content compiler never imports blog presentation.

## Required implementation sequence

The executable phases are present. Remaining work is content and operations:

1. Add the first reviewed Korean source post and independently reviewed
   translations when the owner supplies them.
2. Add a managed-page package only when a standalone profile or application is
   requested.
3. Add a real embed provider only after an explicit local plugin review.
4. Complete custom-domain, HTTPS, Search Console, and rollback operations after
   the first Pages deployment.

Each later change must still satisfy the exit criteria in `DEVELOPMENT.md`,
`DEVELOPMENT_PLAN.md`, and `QUALITY_GATES.md`.

## High-risk rules the implementation must not reinterpret

- Korean is unprefixed. English uses `/en/`; Japanese uses `/ja/`.
- Requested URLs never change because of browser language or stored preference.
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
- GA4 is optional, blog-only, consent-gated, and disabled when its public
  Measurement ID is absent. It never influences search or recommendations.
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
