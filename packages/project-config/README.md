# Shared Project Configuration Boundary

This package will runtime-validate `config/*.yaml`, normalize shared route and URL policy, and provide the route registry used by all route-producing build lanes.

It owns:

- configuration schemas and field-level diagnostics;
- normalized supported/source/default languages, locale prefixes, browser
  preference policy, HTML/hreflang/Open Graph locale values, localized labels,
  and timezone values;
- reserved route and namespace checks, including the configured pagination
  segment and rejection of page zero, duplicate `/page/1/`, fragment-based
  pagination, and route collisions;
- intentional navigation validation, including internal target checks;
- taxonomy aliases and explicit redirects;
- static-document defaults and the maximum managed-page external-origin policy;
- the explicit local embed-plugin registry and global embed safety policy;
- AI crawler/data-use policy and the shared owner-declared original-work
  authorship/proofreading-only provenance policy;
- optional GA4 configuration, including strict Measurement ID validation,
  blog-only scope, consent defaults, and conditional analytics origins;
- production-origin parity and the GitHub Pages repository, release, route,
  deployment, page-transfer, image, and font budgets;
- route-claim collision detection before rendering.

It must remain framework-neutral. It must not contain blog design, parse post Markdown, render managed pages, or read environment secrets beyond resolving explicitly declared public build values such as the canonical site origin. `GA4_MEASUREMENT_ID` is also an explicitly declared public build value: blank disables analytics and an invalid non-blank value fails validation.

`src/i18n.ts` is the provisional pure language/route resolver. The future YAML
runtime schema must validate that `config/site.yaml` expresses the same
supported set instead of allowing these values to drift.

`src/performance-budgets.ts` is the provisional host-ceiling and relationship
validator. The future Zod schema must preserve its positive-integer, headroom,
and nested-budget checks with field-level errors.
