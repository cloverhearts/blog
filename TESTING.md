# Testing and Change-Traceability Policy

## Purpose

Tests are part of a change, not a follow-up. A behavioral or policy change is
incomplete until its expected behavior, failure behavior, and relevant boundary
conditions are represented by tests or by an explicitly documented manual gate
when automation is genuinely impossible.

This document is authoritative for test ownership, required change-to-test
pairing, regression coverage, policy traceability, and validation reporting.
`QUALITY_GATES.md` remains authoritative for release acceptance criteria, while
`DEVELOPMENT.md` owns the command surface used to run the tests.

## Changes that require tests in the same task

Adding, changing, reinterpreting, deprecating, or removing any of the following
requires a corresponding test addition or update before the task is complete:

- executable TypeScript, rendering, parsing, indexing, generation, or build
  behavior;
- runtime or provisional artifact schemas and compatibility versions;
- YAML/JSON configuration fields, defaults, validation, or policy meaning;
- content/managed-page authoring formats, metadata, assets, routes, embeds, or
  publication rules;
- SEO, canonical, Open Graph, structured data, sitemap, RSS, robots, llms, AI
  crawler, AI data-use, or authorship-provenance behavior;
- localization, translation provenance, browser-language behavior, navigation,
  search, pagination, related-post, or taxonomy behavior;
- analytics, consent, privacy, security, external-origin, plugin, and deployment
  behavior;
- accessibility, no-JavaScript, print, responsive, performance, and release
  verification requirements;
- a defect fix, including a case that would have failed before the fix whenever
  that can be demonstrated safely;
- a policy or guide change that creates or changes a machine-enforceable rule.

Pure spelling, punctuation, link-label, comment, or prose-clarity edits that do
not change behavior are exempt from creating a new test case. The task must
still run the relevant existing documentation checks and record that the edit
was non-semantic. A normal post addition does not require a new unit-test file
when it uses only existing supported syntax, but that post must pass the full
content/translation/link/asset validation. A post that introduces a new syntax,
edge case, regression, or shared behavior requires a fixture and automated test.

## Required test shape

For each changed behavior, add the smallest meaningful combination of:

1. a positive case proving the supported result;
2. a negative case proving invalid, unsafe, or contradictory input is rejected;
3. a boundary or compatibility case when paths, dates, sizes, languages,
   versions, base paths, browser state, or provider behavior are involved;
4. a deterministic/reproducibility case for generated artifacts;
5. a regression case for every corrected defect.

Do not write an assertion that merely repeats an implementation constant when
observable output or failure behavior can be checked. Do not weaken, delete,
skip, or rewrite an existing test solely to make a behavior change pass; update
it only when the intended contract has deliberately changed and document that
contract change.

## Policy coverage manifest

`tests/policy-coverage.json` maps high-impact policy source files to their
executable test files and exact test-case names. It also stores SHA-256 hashes
of governed sources. `tests/contracts/policy-governance.test.ts` verifies that:

- every governed source and test file exists inside the repository;
- every source hash matches the reviewed policy version;
- every mapped test case exists in the declared test file;
- policy IDs, paths, and case names are unique and non-empty;
- each policy maps to at least one test file and test case.

Changing a governed policy file therefore requires reviewing its existing cases,
adding or updating cases when semantics change, and refreshing the manifest hash
in the same task. Updating only a hash without reviewing test adequacy violates
this policy even if the mechanical governance test passes.

New high-impact policies—especially security, privacy, AI/data use, content
provenance, publication, routing, and deployment policies—must be added to the
manifest when introduced. The manifest is traceability support, not a substitute
for the actual behavioral tests.

## Fixtures and ownership

- Cross-boundary and policy conformance tests live under `tests/contracts/`.
- Valid, invalid, malicious, multilingual, base-path, no-JavaScript, and
  compatibility sources live under `tests/fixtures/` when reusable input is
  needed.
- A package may own focused unit tests, but cross-package artifact behavior must
  also be covered at the shared contract boundary.
- Golden files are used only for stable serialized output and must be reviewed
  rather than blindly regenerated.
- Tests must not depend on network access, current wall-clock time, local home
  paths, secrets, repository credentials, or mutable third-party responses.

## When automation is not yet available

The repository is still a scaffold in several lanes. A required behavior that
cannot yet execute must receive a concrete named test case and fixture plan in
the relevant test README or development phase, plus the strongest executable
pure-function/configuration test possible now. A task must not claim the future
integration passed. Once the owning runtime becomes executable, converting the
planned case into an automated test is part of that implementation's completion
criteria.

Manual-only checks are acceptable only for genuinely visual, assistive-
technology, external-service, or deployed-environment behavior that cannot be
reliably automated. Record the exact route, environment, procedure, and result;
pair it with automated structural checks wherever possible.

## Required validation and reporting

Before completion:

1. run the new or changed test directly;
2. run the full relevant package/contract suite;
3. run configuration, Markdown/link, and whitespace checks when affected;
4. inspect failures rather than retrying until an intermittent pass;
5. record exact passed/failed/skipped counts and any unavailable integration or
   manual checks in `History.md`.

A passing test suite does not override an inaccurate test. Completion review
must compare the user request, authoritative policy, implementation, fixtures,
and assertions together.
