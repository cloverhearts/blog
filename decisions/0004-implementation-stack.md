# ADR 0004: TypeScript static-site implementation stack

- Status: accepted
- Date: 2026-08-16

## Context

The architecture requires reproducible TypeScript builds, complete static HTML,
GitHub Pages root and repository-base-path portability, runtime-validated
cross-package artifacts, sanitized Markdown directives, multilingual final-HTML
search, deterministic local image processing, and executable browser quality
checks. Another coding agent must be able to start without selecting a
different tool in each build lane.

## Decision

Use the following initial implementation profile:

- Node.js `24.19.0` LTS and its bundled npm `11.17.0`;
- npm workspaces and a committed `package-lock.json`; do not use pnpm, Yarn, or
  Bun for this repository;
- Astro in static-output mode inside `apps/blog-web/`, consuming validated
  content artifacts rather than source Markdown;
- Zod 4 as the runtime schema source with TypeScript inference and JSON Schema
  generation;
- `yaml` plus unified/remark/rehype, `remark-directive`, and `rehype-sanitize`
  for controlled Markdown processing;
- Pagefind extended release for the post-build English, Korean, and Japanese
  final-HTML search indexes;
- Sharp for deterministic local image metadata, optimization, and derivatives;
- Vitest for focused unit/contract suites and Playwright plus axe-core for
  rendered-page, no-JavaScript, accessibility, and browser conformance.

Provider plugins remain reviewed local npm workspace packages under
`plugins/embeds/<plugin-id>/`. They are loaded through an explicit static
registry; workspace discovery, remote installation, and runtime plugin loading
remain forbidden.

Exact dependency versions are resolved by and committed in `package-lock.json`.
Node and npm versions are pinned in root project metadata and CI. A dependency
upgrade is a reviewed change with relevant tests; changing any selected tool
requires an ADR that supersedes this record.

## Consequences

- Root scripts use `npm run ...`, and GitHub Actions installs with `npm ci`.
- npm install scripts are denied by default; the root `allowScripts` record
  pins reviewed build-time exceptions and explicitly denies unneeded scripts.
- Astro owns presentation only and may not become a second Markdown/content
  compiler.
- Pagefind is accepted subject to the required Korean, Japanese, mixed-script,
  and `C++` search fixtures; fixture failure requires a superseding search
  decision rather than hidden custom behavior.
- Sharp performs no remote generation. Video is initially validated and copied,
  not transcoded in CI, until explicit media budgets are approved.
- Production remains independent of Open Design, browser automation, and all AI
  authoring tools.
