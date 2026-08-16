# Source Fixtures

This directory contains small, committed sources used to prove content and managed-page behavior. The synthetic test embed plugin lives at `tests/fixtures/plugins/test-embed/`. Additional post and managed-page fixtures are created in temporary directories by the contract suite.

Planned fixture groups include valid and invalid posts, complete and broken
English/Korean/Japanese translation groups, localized routes/taxonomy/search,
assets and embeds, a synthetic test-only embed plugin, malicious input,
plugin-policy failures, draft/published variants, all managed-page kinds,
missing/mis-cased `DESIGN.md`, entry-format/path mismatches, managed-page
security-policy failures, arbitrary managed routes, discovery
inclusion/exclusion, mixed-script and `C++` tag handling, generated and explicit
heading anchors, duplicate headings, punctuation-only headings, skipped levels,
unresolved fragments, nested TOC relationships, route collisions,
no-JavaScript fallbacks, complete localized Open Graph metadata, explicit,
cover-derived and generated social cards, hostile metadata escaping, and print
expectations.

Fixtures must use synthetic or redistributable content and must not contain secrets or personal production data.
