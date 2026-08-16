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

As of 2026-08-17, this repository is a specification-led scaffold, not a
buildable or deployable blog. The committed source contains useful policy
primitives and contract tests, but there is no end-to-end content build, Astro
route build, search build, managed-page build, release assembly, or Pages
deployment workflow.

| Lane | Status | Present now | Still required |
| --- | --- | --- | --- |
| Root tooling | Partial | npm workspaces, lockfile, Node/npm pins, strict TypeScript, `typecheck`, Vitest contract/policy scripts, quality workflow | All documented config/content/web/search/managed/discovery/release/build/dev commands |
| Artifact contracts | Scaffold only | Versioned provisional TypeScript interfaces and artifact constants | Zod runtime schemas, inferred types, JSON Schema, producer/consumer parsing, compatibility failures |
| Shared configuration | Partial | Declarative YAML; focused pure helpers for analytics, provenance, i18n/link fallback, and performance budgets | One Zod-backed loader for every config file, environment resolution, normalized URLs, route registry, collision checks, field-level diagnostics |
| Content compiler | Partial | Heading-anchor/TOC primitive and translation-publication primitive | Filesystem discovery, frontmatter/Markdown parsing, sanitization, assets, embeds, taxonomy, recommendations, artifact writing, preview/production manifests |
| Embed core | Scaffold only | Provider-neutral TypeScript interfaces and policy/config documents | Runtime schemas, explicit registry, sanitizer/security aggregation, deterministic plugin execution, synthetic test provider; no real provider is approved yet |
| Blog web | Partial | Astro dependency, semantic shell, classless CSS, localized messages, GA4 adapter, authorship/original-language and Open Graph helpers | Astro configuration, pages/routes, artifact ingestion, lists/pagination, post renderer, TOC component, language switcher, fallback-link presentation, images/social cards, web manifest |
| Search | Scaffold only | Package and Pagefind dependency | Eligible final-HTML ingestion, per-language indexes, deterministic manifest, search page integration |
| Managed pages | Scaffold only | Package declaration and reusable managed-page template | Schema/config loader, document/presentation/application adapters, independent design/assets/security build, static fallbacks and manifests |
| Site discovery | Partial | Deterministic `robots.txt` and `llms.txt` rendering primitives | Config/artifact ingestion, sitemap, per-language RSS, canonical URL integration, discovery manifest and output writer |
| Release assembly | Scaffold only | Package declaration and complete release contract | Manifest ingestion, compatibility/collision/reference checks, `dist/` assembly, deterministic release manifest and diagnostic report |
| Content/plugins | Specified only | Empty language and asset directories; no post, managed page, or provider plugin | First reviewed content groups, managed-page package, and separately approved provider implementations |
| Delivery | Partial | Pull-request/main quality workflow for type checking and contract tests | Production builds, Pages verification, artifact upload/deploy workflow, custom-domain operational verification and rollback drill |

## Commands that exist now

The following are the only supported executable repository commands at this
baseline:

```text
npm ci
npm run typecheck
npm run test:contracts
npm run test:policy
npm test
```

There is no working `dev`, `build`, `build:content`, `build:web`,
`build:search`, `build:managed`, `build:discovery`, `build:release`, or
`verify:pages` command yet. Those names in `DEVELOPMENT.md` are required command
contracts for the implementation agent, not current capabilities.

## Fixed implementation inputs and outputs

The implementation agent must preserve these lane boundaries:

| Owner | Inputs | Required output |
| --- | --- | --- |
| `packages/project-config` | `config/*.yaml`, declared public environment values | Validated immutable configuration and normalized route/URL services |
| `packages/content-compiler` | `docs/<language>/`, `assets/content/`, validated config, embed core | `.artifacts/content/<mode>/` |
| `apps/blog-web` | Validated content artifact, shared config, root `DESIGN.md` | `.artifacts/web/<mode>/` |
| `packages/search-indexer` | Eligible final blog HTML plus exact web/content provenance | `.artifacts/search/<mode>/` |
| `packages/managed-page-compiler` | `managed-pages/<id>/`, its local `DESIGN.md`, validated config/embed core | `.artifacts/managed/<mode>/` |
| `packages/site-discovery` | Matching production content/web/managed manifests and crawler config | `.artifacts/discovery/production/` |
| `packages/release-assembler` | Matching production web/search/managed/discovery artifacts | Verified root `dist/` plus release manifest and separate diagnostic report |

No consumer may repair an invalid producer artifact. Preview artifacts never
enter the production release. The blog application never reads Markdown, and
the content compiler never imports blog presentation.

## Required implementation sequence

The next development agent should begin with Phase 1 rather than expanding the
UI prototypes:

1. Replace provisional contract interfaces with Zod 4 schemas and inferred
   TypeScript types while preserving the approved schema versions or writing an
   explicit migration.
2. Implement the complete shared configuration loader, public environment
   resolution, normalized URL builder, locale policy, and route registry.
3. Add the documented root command surface and deterministic preview/production
   artifact directories.
4. Complete the content compiler and its reusable fixture matrix before
   implementing Astro post/list routes.
5. Complete the static blog renderer, then Pagefind, managed pages, discovery,
   release assembly, Pages verification, and deployment in the dependency order
   defined by `DEVELOPMENT_PLAN.md`.

Each phase must satisfy its exit criteria before a downstream phase treats its
artifacts as stable. Small vertical slices are acceptable, but they must retain
runtime validation at every producer and consumer boundary.

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
