# Contract Conformance Tests

This directory tests the boundaries defined by `packages/contracts/` and `ARCHITECTURE.md`.

The mandatory change-to-test workflow is defined in `TESTING.md`.
`tests/policy-coverage.json` maps high-impact policy sources to exact executable
case names, and `policy-governance.test.ts` rejects missing paths, stale source
hashes, duplicate entries, or mappings to nonexistent test cases.

All focused contract and policy suites run with Vitest. Playwright and axe-core
are reserved for the later rendered-page conformance lane; `node:test` is not a
parallel project runner.

Planned checks include producer output validation, consumer rejection of malformed or unsupported artifacts, preview/production isolation, provenance compatibility, route and asset collisions, managed entry/design/security conformance, public-route-to-file mapping, embed registry/security/fallback conformance with a synthetic test plugin, heading-anchor determinism, TOC hierarchy and body-HTML parity, fragment-link integrity, final-HTML search coverage, sitemap/robots/RSS discovery coverage, no-JavaScript readability, and golden deterministic artifacts.

Multilingual conformance additionally covers complete, partial, and mismatched
translation groups, Korean-default and English/Japanese-prefixed route
resolution, manual-only language switching, active-language/English/Korean
post-link fallback, missing-target omission, fallback-language labeling,
localized UI message completeness, reciprocal published alternates,
language-isolated search/RSS data, and shared asset behavior. It also verifies
original-language consistency, translation review status, production rejection
of `ai-draft`, translated vs. original classification, validated original
metadata for optional post-language context, and no visible translation-review
banner.

Open Graph conformance covers required core ordering, localized locale and
alternate values, article dates/category/tags, post-specific image structured
properties, HTTPS/base-path integrity, attribute escaping, and deterministic
generated-card output.
Article image conformance additionally checks the owner-approved source and
`1:1`, `4:3`, and `16:9` derivatives.

AI discovery conformance covers explicitly open search, user-directed,
training/model-development, and public-dataset crawler groups, open wildcard
behavior, duplicate and malformed User-Agent rejection, HTTPS sitemap/guide
URLs, deterministic `llms.txt` output, and source/timestamp leak prevention.

Post authorship conformance covers the exact English owner statement,
original-work scope, human primary creation, proofreading-only AI assistance,
safe HTML-attribute escaping, custom head metadata, and rejection of hidden
body or unsupported structured-data representations.

Site-baseline conformance covers the production origin, Korean/English UX
review priority with retained Japanese support, localized static primary
navigation, GitHub Pages/Pro capacity headroom, invalid budget rejection,
classless semantic shell/CSS behavior, Pretendard subset size, and static
fallbacks for every primary UX flow.

The current executable scaffolding covers localized route and post-link
fallback selection, UI-message parity, GA4 disabled/pending consent,
single-load initialization, query/search-term minimization, invalid Measurement
IDs, and consent revoke/re-grant behavior.
