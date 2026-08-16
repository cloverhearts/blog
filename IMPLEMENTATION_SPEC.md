# Approved Implementation Specification

## Status

This is the concise implementation handoff for coding agents. The architecture,
content, localization, SEO, testing, design, and deployment documents remain
authoritative for their respective subjects. When this summary conflicts with
an accepted ADR or an authoritative contract, the accepted ADR and scoped
contract win.

## Approved platform

- Runtime: Node.js `24.19.0` LTS.
- Package manager: npm `11.17.0` with npm workspaces and `package-lock.json`.
- Language: strict TypeScript, ESM.
- Blog renderer: Astro static output in `apps/blog-web/`.
- Runtime contracts: Zod 4 with inferred TypeScript types and generated JSON
  Schema.
- Markdown: `yaml` and a unified/remark/rehype pipeline with explicit directive
  handlers and `rehype-sanitize`.
- Search: Pagefind extended release, executed after final blog HTML exists.
- Images: Sharp, local and deterministic.
- Tests: Vitest is the only unit/contract runner; Playwright and axe-core own
  rendered-browser and accessibility checks, plus release-level static
  validation.
- Hosting: verified `dist/` uploaded to GitHub Pages by a custom GitHub Actions
  workflow using `npm ci`.
- Production origin: `https://blog.cloverhearts.com` with an empty base path.
- Initial presentation: semantic classless CSS and the `UX_FLOW.md` interaction
  contract, using locally bundled Pretendard Variable for the Korean/English
  primary review pair while retaining Japanese support.
- Capacity: enforce `config/performance-budgets.yaml`; do not size the project
  to GitHub Pages' service ceilings.

The full rationale and replacement rules are in
`decisions/0004-implementation-stack.md`.

## Non-negotiable boundaries

1. `docs/` and `assets/content/` are read only by the content compiler.
2. Astro consumes runtime-validated production/preview content artifacts and
   never parses source Markdown.
3. Managed pages build independently and do not import the blog presentation.
4. Search indexes eligible final blog HTML, not Markdown or managed pages.
5. Provider-specific embed behavior lives only in explicitly registered local
   packages under `plugins/embeds/`.
6. Release assembly validates and copies production artifacts; it does not
   render or repair them.
7. Published article content, navigation, TOC, taxonomy links, related posts,
   and static language alternate links exist in initial HTML.

## Language behavior

- Korean: `/` and other unprefixed routes; default and no-JavaScript fallback.
- English: `/en/`.
- Japanese: `/ja/`.
- A requested route never redirects or changes content based on browser
  language or stored preference. Language changes use published static
  alternate links only.
- Every post artifact carries its current language, original language, and
  published validated alternates. A post UX may optionally use them after the
  body to link the original; review state remains artifact metadata.
- Post lists, taxonomies, archives, pagination, and related links resolve a
  group to the active language, then English, then Korean, omitting a group
  with no eligible published target and labeling every cross-language fallback.

See ADR 0008 and `I18N.md`.
See ADR 0006, `DESIGN.md`, `UX_FLOW.md`, and
`config/performance-budgets.yaml` for the production/UX baseline.

## Implementation order

1. Bootstrap npm workspaces, runtime schemas, config loading, normalized URLs,
   and route collision checks.
2. Implement deterministic content compilation, translation-group validation,
   assets, headings/TOC, and the provider-neutral embed boundary.
3. Implement Astro static routes, the semantic `UX_FLOW.md` shell, and the
   approved classless baseline before optional Open Design refinement.
4. Index final HTML with Pagefind and build managed pages independently.
5. Generate discovery files, assemble `dist/`, run conformance twice for the
   custom-domain root and `/blog` base path, then add deployment automation.

Every behavioral or policy change includes tests and a `History.md` entry as
required by `AGENTS.md` and `TESTING.md`.
