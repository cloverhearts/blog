# Executable Artifact Contracts

This package is the only cross-boundary TypeScript dependency shared by compilers and consumers.

Zod 4 runtime schemas are the source of truth. TypeScript types are inferred
from those schemas. JSON Schema is generated from the same definitions into
`packages/contracts/json-schema/` during `validate:config`.

It must remain:

- framework-neutral;
- runtime-light and free of UI dependencies;
- JSON-serializable;
- explicitly versioned;
- compatible with the behavior documented in `CONTENT_RULES.md` and `ARCHITECTURE.md`.

Every producer must validate immediately before writing and every consumer must validate immediately after reading. The contracts also distinguish preview from production, use artifact-relative asset paths, describe provider-neutral external embeds and their security requirements, and carry deterministic provenance for stale/mixed input detection.

Post artifacts expose one ordered `HeadingArtifact[]` as the
presentation-neutral table-of-contents source. Every item carries its generated
heading `id`, same-document `anchor`, visible text, depth, and optional parent
ID. The semantic `bodyHtml` must contain exactly one matching heading element
for every record.

The required, metadata-only `authorshipDisclosure` advances the content artifact
schema to version `7`. Per-variant `translationStatus` was version `6`; paired
post-owned `cover`/optional `socialImage` records were version `5`, and
`originalLanguage` was version `4`. AI-aware `robots.txt` plus `llms.txt`
output advances the discovery schema to version `3`; the web, search,
managed-page, and release schemas remain version `2`. Provenance binds the
localization contract as well as the content contract. Earlier intermediate artifacts are
rebuild-only and must be rejected by consumers. Source posts migrate to the
locale directory, translation-group, original-language, and translation-review
format in
`CONTENT_RULES.md`.

Each post summary also carries required `representativeImage`, the durable
owner-approved choice among `social-image`, `cover`, and `generated-card`.
It also carries the validated owner-declared authorship statement applying to
the original work. The web renderer emits that statement as custom `<meta>`
data, never as hidden body text or an unsupported Schema.org claim.

A breaking change requires coordinated producer, consumer, fixture, documentation, and migration updates.
