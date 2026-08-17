# Approved Implementation Specification

## Status

This is the concise implementation handoff for coding agents. The architecture,
content, localization, SEO, testing, design, and deployment documents remain
authoritative for their respective subjects. When this summary conflicts with
an accepted ADR or an authoritative contract, the accepted ADR and scoped
contract win.

This file describes the approved target, not the current completion state.
`IMPLEMENTATION_STATUS.md` is the authoritative inventory of executable,
partial, scaffolded, and missing work. An implementation agent must read both
files before coding and update the status document whenever a lane materially
advances.

## Current baseline

- The repository can install dependencies, type-check sources, run Vitest
  contract/policy tests, and execute the documented build command surface.
- Runtime Zod schemas, the shared configuration loader, embed-core registry,
  content compiler, static blog renderer, Pagefind indexer, managed-page
  compiler, discovery builder, and release assembler are present.
- `.github/workflows/quality.yml` validates configuration, contracts, and a
  production build. `.github/workflows/pages.yml` uploads verified `dist/`.
- Custom-domain DNS, Search Console, and field Core Web Vitals remain
  operational follow-up after the first HTTPS deployment.

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

## Approved localized post-summary target

This target is implemented. `CONTENT_RULES.md`, `I18N.md`, `PUBLISHING.md`, and
`SEO.md` describe the executable behavior.

- Keep the existing required `description` frontmatter field as the only
  author-controlled post summary. Do not add a duplicate `summary` field.
- An authoring agent creates or updates `description` whenever it creates,
  translates, or materially regenerates a post variant. Each English, Korean,
  and Japanese variant has its own faithful, natural-language description; a
  source-language description must not be copied unchanged into another
  language.
- After trimming surrounding whitespace, `description` is non-empty and no
  longer than 150 Unicode characters. It is one or two standalone sentences,
  accurately summarizes the full localized post, introduces no unsupported
  claim, and does not contain Markdown, a URL, placeholder text, or duplicated
  title boilerplate. There is no shared language-independent minimum because a
  natural Japanese summary may be shorter than an equivalent English summary.
- The validated localized `description` is the single deterministic summary
  for home and post lists, category/tag/archive/pagination collections,
  related-post and cross-language fallback links, RSS item summaries, document
  metadata, Open Graph, and structured data. Renderers escape it and display it
  verbatim; they do not regenerate link-card copy from the Markdown body.
- Pagefind search-result excerpts remain query-dependent search snippets and
  are not replaced by `description`. This exception does not permit Pagefind or
  any other consumer to overwrite the authored description in collection or
  metadata surfaces.
- The existing derived artifact `excerpt` is not author-controlled and must not
  be used as a collection/link summary. It may remain temporarily for content
  schema version 7 compatibility, but its derivation must skip image-only,
  media-only, heading-only, and other non-prose blocks and fall back to the
  validated `description`. Removing or renaming it requires an explicit content
  artifact schema-version change and coordinated producer/consumer migration.

The implementation task is incomplete until it does all of the following in
one change:

1. enforce the trimmed 150-character boundary at frontmatter ingestion and the
   content artifact write/read boundaries, using Unicode-aware counting;
2. make every collection, related/fallback link, RSS, and metadata consumer use
   the selected variant's `description` while retaining Pagefind's independent
   query snippets;
3. prevent a leading body image, media directive, heading, link, or other
   non-prose block from entering a retained compatibility `excerpt`;
4. update `CONTENT_RULES.md`, `I18N.md`, `PUBLISHING.md`, `SEO.md`, relevant
   examples/checklists, and `tests/policy-coverage.json` together with the code;
5. add Vitest coverage for a valid localized trio, exactly 150 characters,
   rejection at 151 characters, surrounding-whitespace handling, a leading
   image regression, exact localized collection output, active-language/
   English/Korean fallback selection, RSS/metadata parity, and separation from
   Pagefind query excerpts;
6. migrate any description over the new limit without changing its supported
   meaning, rebuild preview and production artifacts, inspect representative
   English/Korean/Japanese collection HTML, update `IMPLEMENTATION_STATUS.md`,
   and record only checks actually run in `History.md`.

The sixty temporary development variants present when this target was approved
already have localized descriptions at or below 139 Unicode characters, so
they require no length migration. Their body-image-derived excerpts remain a
known preview defect until the implementation above is completed.

## Approved post-thumbnail target

This target is implemented. It supplements rather than replaces the existing
`representativeImage`, `cover`, and `socialImage` contracts. A representative
image continues to own Open Graph and `BlogPosting.image`; a thumbnail is the
compact visual displayed with an on-site post link or summary.

Post frontmatter may provide an explicit localized thumbnail override:

```yaml
thumbnail:
  src: "asset:/programming/cpp-programming/thumbnail.png"
  alt: "메모리 구조를 검토하는 C++ 개발 환경"
```

- `thumbnail` is optional and, when present, contains exactly `src` and `alt`.
  `src` is a managed local raster `asset:` reference owned by the post, and
  `alt` is a concise localized description. Remote, signed, temporary, local
  machine, SVG, animated, or non-image values are invalid thumbnail sources.
- Supplying `thumbnail` is an explicit override for list presentation only. It
  does not silently change `representativeImage`, `cover`, `socialImage`, Open
  Graph, structured data, or article-body media.
- If the owner explicitly supplies or selects a thumbnail, that decision wins.
  Otherwise this request grants the authoring agent standing permission to
  choose a suitable owned post asset or generate a new thumbnail without an
  additional per-post confirmation. The agent must keep the choice faithful to
  the article, avoid unsupported factual or brand claims, use only assets whose
  provenance permits reuse, and report whether the result was selected,
  generated, or derived.
- An AI-generated thumbnail is created during authoring, reviewed by the agent
  for relevance and obvious defects, stored under the canonical
  `assets/content/<category>/<slug>/` directory, and referenced through
  `thumbnail.src`. Production builds never call an image-generation service.
  This standing permission does not authorize downloading third-party media,
  inventing a logo or identifiable person, or promoting the result to cover or
  social-image use.
- When neither the owner nor the agent creates a distinct thumbnail asset, the
  web build derives the thumbnail from the already resolved representative
  source: explicit social image, cover, or the deterministic generated card.
  The existing `16:9` representative derivative is the default source, so
  omission of `thumbnail` never leaves a valid post without a thumbnail and
  does not require a duplicate frontmatter value.
- A language-neutral thumbnail binary is shared across translations while each
  variant supplies localized alternative text when an explicit override is
  authored. Visible text inside a thumbnail requires separate locale-specific
  assets. A generated-card-derived thumbnail is rendered from the localized
  title/category and therefore remains locale-specific.
- Home, post, category, tag, archive, pagination, related-post, and labeled
  cross-language fallback summaries render the resolved thumbnail together
  with the approved localized `description`. Output uses intrinsic dimensions,
  a stable `16:9` crop, responsive local derivatives, and native lazy loading
  except for an intentionally above-the-fold primary thumbnail. The title and
  summary remain readable and linked when the image fails or JavaScript is
  disabled.
- The renderer must avoid duplicate accessible link names when an image and
  visible title point to the same post. Crop behavior must preserve meaningful
  text, faces, and the selected subject; an unsafe crop uses padding or a
  separately generated/selected source instead of silently cutting away the
  subject.

The thumbnail implementation is incomplete until one cohesive change:

1. adds the optional `thumbnail` frontmatter/runtime schema and normalized
   artifact record, validates managed raster ownership and localized alt text,
   and defines its relationship to the content schema version;
2. implements owner override, agent-selected/generated asset, and
   representative-derived fallback precedence without build-time network or AI
   generation;
3. emits deterministic, content-addressed responsive `16:9` thumbnail files
   within the configured image and initial-transfer budgets and renders them on
   every specified collection/fallback surface without breaking no-JavaScript
   output, accessibility, base paths, or language isolation;
4. keeps Open Graph, `BlogPosting.image`, cover, social image, and body media
   unchanged unless the owner separately changes their existing fields;
5. updates `CONTENT_RULES.md`, `I18N.md`, `PUBLISHING.md`, `SEO.md`, `DESIGN.md`,
   `QUALITY_GATES.md`, artifact/package documentation, examples/checklists, and
   `tests/policy-coverage.json` together with the implementation;
6. adds Vitest coverage for an explicit valid thumbnail, missing/empty alt,
   escaping/non-image/remote sources, user override precedence, automatic
   representative fallback for all three representative modes, localized
   shared and text-bearing assets, deterministic derivatives, crop dimensions,
   base-path URLs, leading-image posts, cross-language fallback selection, and
   proof that thumbnail selection does not mutate SEO/social metadata;
7. adds rendered-browser checks for desktop/mobile layout, failed-image
   fallback, keyboard and screen-reader naming, lazy/eager loading, and all
   three languages; rebuilds preview output; updates
   `IMPLEMENTATION_STATUS.md`; and records only checks actually run in
   `History.md`.

The sixty temporary development variants currently use
`representativeImage: generated-card`, so the target fallback can provide
localized deterministic thumbnails without immediately adding sixty duplicate
frontmatter blocks or generating new raster source files. An implementation AI
may create distinct thumbnails later when they materially improve layout
testing.

## Approved primary-navigation archive target

This target is implemented. The archive page and its localized routes remain
part of the blog; only their navigation prominence changes.

- The normal blog header primary navigation contains exactly Posts,
  Categories, Tags, and Search in that order. Archive/보관함/アーカイブ is not a
  primary-header item and must not be inserted into a compact/mobile primary
  menu as a hidden equivalent.
- Archive remains a complete static chronological index at `/archive/`,
  `/en/archive/`, and `/ja/archive/`. Removing it from the header does not
  delete, redirect, `noindex`, or remove those routes from eligible discovery.
- The footer contains one localized secondary Archive link so the route remains
  deliberately reachable without JavaScript from every normal blog page. A
  post-list footer or adjacent secondary discovery region may link to the same
  route only when it does not create duplicate adjacent links.
- Search's no-JavaScript explanation and 404/error recovery may continue to
  link Archive because those are task-specific recovery paths rather than the
  persistent primary menu.
- Home and collection pages present Posts, Categories, Tags, and Search as
  primary discovery choices. Archive is described as a secondary chronological
  index, not as a second general post feed.
- Every visible Archive label remains localized and every internal href remains
  locale-neutral until resolved by the shared language/base-path services.

The navigation change is incomplete until one cohesive implementation:

1. moves the existing localized Archive item from `primary` to `footer` in
   `config/navigation.yaml` without changing its locale-neutral `/archive/`
   href or the archive route configuration;
2. updates `UX_FLOW.md`, `DESIGN.md`, any affected README/runbook wording, and
   the header/footer renderer so the primary order is exactly Posts,
   Categories, Tags, Search and Archive is a secondary footer link;
3. preserves the Korean, English, and Japanese archive pages, pagination,
   canonical/SEO/discovery behavior, search no-JavaScript fallback, 404
   recovery, keyboard access, mobile wrapping, and no-JavaScript navigation;
4. updates the `defines primary exploration as localized static links`
   contract case and adds rendered assertions that the header omits Archive,
   the footer contains it once, and all localized/base-path archive links and
   routes still resolve;
5. reviews and refreshes every affected `tests/policy-coverage.json` mapping
   only after its named cases cover the new semantics, runs the full relevant
   suite and preview build, updates `IMPLEMENTATION_STATUS.md`, and records
   only checks actually run in `History.md`.

## Approved ten-item pagination target

This target is implemented. Every pageable normal-blog post collection uses
exactly 10 logical post groups per page.

- The shared `listings.pageSize` target is `10`. It applies to Posts, category,
  tag, and Archive collections in Korean, English, and Japanese, including a
  collection whose visible entries were resolved through the documented
  cross-language fallback order.
- A translation group counts as one logical post after locale availability and
  fallback resolution. Its language variants must never consume multiple
  positions on the same collection page.
- The home recent-post collection also shows at most 10 logical post groups
  because it currently consumes the same shared setting. Splitting home from
  pageable collection sizing would require a later explicit configuration and
  contract decision.
- Page 1 remains at the collection root. Later pages remain at `/page/2/`,
  `/page/3/`, and so on; implementations must not emit or canonicalize a
  `/page/1/` route. Existing localized prefixes and non-empty deployment base
  paths continue to use the shared route resolver.
- Ordering, tie-breaking, canonical URLs, previous/next links, total logical
  result counts, post identities, publication eligibility, and empty/404
  behavior remain governed by `PUBLISHING.md` and `UX_FLOW.md`. Only the page
  boundary and resulting number of collection pages change.
- The target does not alter post permalinks, translation metadata, Archive
  route ownership, search indexing, RSS inclusion, sitemap eligibility, or
  related-post derivation.
- With the current 20 temporary logical post groups, a complete all-posts or
  Archive collection produces two pages of 10 entries per locale after this
  target is implemented. Category and tag subsets paginate independently from
  their own eligible logical-group counts.

The pagination change is incomplete until one cohesive implementation:

1. changes `config/site.yaml` `listings.pageSize` from `20` to `10` without
   adding a renderer-local constant or duplicating the setting elsewhere;
2. updates `PUBLISHING.md`, `UX_FLOW.md`, affected examples/runbooks, and any
   acceptance wording so the governed behavior and shared configuration agree;
3. adds a deterministic fixture containing at least 21 eligible logical post
   groups and proves `10 / 10 / 1` distribution on Posts and Archive
   collections, plus representative category and tag boundary cases;
4. tests root-only page 1, `/page/2/` and `/page/3/`, absence of `/page/1/`,
   self-canonical URLs, previous/next links, stable same-timestamp ordering,
   translation-group deduplication, cross-language fallback counting, all three
   locales, and root/non-empty base-path output;
5. proves the home recent-post limit is 10 and that search, RSS, sitemap,
   related posts, post routes, and total logical counts are unchanged;
6. reviews and refreshes affected `tests/policy-coverage.json` mappings only
   after the named cases cover the new behavior, runs the full relevant suite
   and preview build, updates `IMPLEMENTATION_STATUS.md`, and records only
   checks actually run in `History.md`.

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

The agent must not mark a phase complete merely because one helper or package
exists. Completion requires the executable commands and exit criteria in
`IMPLEMENTATION_STATUS.md`, `DEVELOPMENT_PLAN.md`, and `QUALITY_GATES.md`.
