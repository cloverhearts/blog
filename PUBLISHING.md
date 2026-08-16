# Publishing and Derived-Data Policy

## Publication state

- `draft: true` is never present in production artifacts.
- `draft: false` publishes on the next production build. The repository does not
  initially provide scheduled publication.
- `createdAt` is displayed as authored even when it is in the future; a future
  timestamp produces a validation warning because it does not delay publishing.
  Content intended for later release must remain a draft until an explicit
  scheduling feature is designed.
- `updatedAt` records a material revision and does not replace the original
  publication date.

## Stable identity and deletion

- Language plus category plus slug identifies a source variant;
  `translationKey` identifies the multilingual post group. Every normalized
  public route must be globally unique.
- `originalLanguage` identifies the authored original within the group and is
  stable after publication. A translated variant always retains a normal link
  to that original; revision recency does not change origin.
- A published slug and route are stable.
- Moving or renaming published content requires an explicit entry in
  `config/redirects.yaml` before the old route disappears.
- Permanent deletion requires explicit user authorization. GitHub Pages cannot
  emit HTTP 410, so the release either keeps a static explanatory tombstone or
  accepts a normal 404 and removes the item from discovery.

## Listing and archive order

- Post lists sort by `createdAt` descending.
- Equal timestamps use normalized slug ascending as a deterministic tie-break.
- `updatedAt` does not move a post to the top of chronological lists.
- Category, tag, and archive counts include published production posts only.
- Lists, counts, pagination, archives, and related posts represent each
  translation group at most once. A link uses the active-language variant when
  published, otherwise English, otherwise Korean. If none is available, the
  group is omitted. A fallback entry uses the target variant's real localized
  summary and carries a visible and machine-readable language label.
- Pagination size comes from `config/site.yaml`; changing it never requires post
  edits.
- The route segment comes from `config/routes.yaml`. Page one uses the
  collection root only; `/page/1/` is never emitted. Later pages use stable
  directory URLs such as `/posts/page/2/`, `/categories/<id>/page/2/`,
  `/tags/<id>/page/2/`, and `/archive/page/2/`, with the active language prefix
  applied by the shared resolver.
- Every pagination page canonicalizes to itself and exposes sequential previous,
  next, and useful page-number navigation as normal `<a href>` links in initial
  HTML. Infinite-scroll or load-more behavior may enhance these links but never
  replace the crawlable paginated routes.
- Pagination never uses URL fragments. Alternate sort/filter/query variants are
  not indexable collection pages, and page 2 or later never canonicalizes to
  page one.

## Related-post derivation

The content compiler emits at most the configured number of recommendations.

1. Valid manual `related` slugs resolve to the active-language variant, then
   English, then Korean, and appear first in authored order. A group with none
   of those published variants is excluded.
2. Duplicate, self, missing, and draft references are rejected or excluded as
   appropriate to build mode.
3. Remaining slots are filled by deterministic automatic translation-group
   candidates and use the same link fallback order.
4. Each shared normalized tag contributes three points; the same category
   contributes two points.
5. Candidates with zero points are not recommended automatically.
6. Ties sort by score descending, `createdAt` descending, then slug ascending.

The algorithm uses no analytics, reader identity, network service, random value,
or wall-clock input.

## Heading anchors and table of contents

- The content compiler derives ordered heading records from parsed post
  headings; authors do not maintain a separate TOC list.
- Generated heading IDs follow the deterministic algorithm in
  `CONTENT_RULES.md`. Identical heading input produces identical IDs.
- Duplicate generated IDs use document-order numeric suffixes. Duplicate
  explicit IDs are errors rather than silently renamed.
- The blog renderer uses the emitted IDs and anchors verbatim and does not
  re-slug heading text.
- A visible heading rename may change an automatically generated fragment. Use
  an explicit `{#stable-id}` before publication when durable deep links matter.
- Heading fragment changes do not create redirect pages because URL fragments
  are not server routes. Published explicit IDs therefore have the same
  stability expectation as other externally referenced identifiers.

## Search expectations

Pagefind extended is the approved static search engine, but its acceptance
fixture must prove:

- English, Korean, and Japanese each have a separate static index;
- Korean phrases, Japanese text, English terms, and mixed Korean/Latin text are
  findable in their corresponding index;
- `C++`, code identifiers, titles, headings, categories, and tags retain useful
  search behavior;
- exact title and tag matches rank above incidental body matches;
- only eligible final blog HTML is indexed;
- drafts, managed pages, navigation boilerplate, and hidden fallback duplicates
  are excluded;
- identical final HTML produces identical index bytes.
- the active index never returns a translation sibling from another language.

## Discovery relationship

- Blog lists and recommendations come from the content artifact.
- Search comes from eligible final blog HTML and is partitioned by language.
- Sitemap, robots, and RSS come from the site discovery artifact.
- Managed pages may enter sitemap only through explicit page policy, but never
  enter post lists, recommendations, RSS, or default search.
- Per-post Open Graph tags and social cards are blog web output derived from the
  published localized record. They do not alter publication order, related-post
  scoring, search eligibility, or content identity.
