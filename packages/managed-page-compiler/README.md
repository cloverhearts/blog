# Managed Page Compiler Boundary

This package transforms self-contained packages in `managed-pages/` into `.artifacts/managed/<mode>/` according to `CONTENT_RULES.md` and `packages/contracts/`.

Run it through `npm run build:managed`. An empty `managed-pages/` directory
produces a valid empty production manifest.

It owns managed-page runtime validation, Open Design-compatible page-local `DESIGN.md` ingestion, declared entrypoint adapters, standalone documents or bundles, page-local assets, security declarations, the invariant return control, no-script fallbacks, print behavior, route claims, deterministic provenance, and separate preview/production manifests.

Provider directives in a managed Markdown entry are delegated through
`packages/embed-core/`; this package never imports an individual provider.
Approved provider requirements are combined with direct page capabilities that
survive the `config/security.yaml` intersection, then recorded in the emitted
artifact.

Document, presentation, and TypeScript-application adapters are versioned inside
this package. Managed pages select one through validated `kind` and `entry`
fields; they cannot provide package lifecycle scripts or arbitrary build
commands.

It must not import the blog application, post content, post taxonomies, or blog CSS. Every emitted page must be complete without release-time blog markup.

Managed pages are never automatically translated. When independent page
packages explicitly share a `translationKey`, this compiler validates their
configured `en`/`ko`/`ja` identity and emits alternates only for variants that
actually exist and are published. Each variant keeps its own local `DESIGN.md`.
