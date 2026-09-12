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
- Only the exact deployment root may redirect to a supported browser language
  using `location.replace`; other routes keep their language. Korean home menu
  links use `?lang=ko` to preserve explicit selection. No stored preference is
  read or written; complete static alternate documents remain authoritative.
- Every post artifact carries its current language, original language, and
  published validated alternates. A post UX may optionally use them after the
  body to link the original; review state remains artifact metadata.
- Post lists, taxonomies, archives, pagination, and related links resolve a
  group to the active language, then English, then Korean, omitting a group
  with no eligible published target and labeling every cross-language fallback.

See ADR 0008, ADR 0009, and `I18N.md`.
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

## Approved public-author and curated-discovery target

This target is implemented. It adds a durable public
author identity, an indexable managed profile, and two curated views over the
existing post corpus without copying posts or changing their canonical routes.
The target fixes information architecture and semantic behavior only. Final
branding, card composition, portrait treatment, and other visual direction
remain a later owner-approved `DESIGN.md` task.

### Primary information architecture

The normal blog primary navigation contains exactly these content-discovery
items in this order:

| Route key | Korean    | English       | Japanese     | Purpose                                               |
| --------- | --------- | ------------- | ------------ | ----------------------------------------------------- |
| `posts`   | 전체 보기 | All Posts     | すべての記事 | Every eligible published post group                   |
| `work`    | 주요 작업 | Selected Work | 主な実績     | Curated evidence of work the author created or led    |
| `daily`   | 일상 기록 | Daily Notes   | 日々の記録   | Curated everyday, family, hobby, and personal records |
| `explore` | 둘러보기  | Explore       | 探す         | Combined category and tag discovery hub               |
| `search`  | 검색      | Search        | 検索         | In-place post-search trigger with a route fallback    |

- `config/routes.yaml` must register locale-neutral `/work/`, `/daily/`, and
  `/explore/` route keys. Korean remains unprefixed; English and Japanese use
  their existing locale prefixes. All routes use the shared base-path and
  trailing-slash resolver.
- Categories and Tags leave the persistent primary navigation but retain their
  current index and detail routes. The Explore page becomes their primary
  entry point and links to those static routes without JavaScript.
- Archive remains the existing secondary footer/recovery link and does not
  return to primary navigation.
- Profile is an author-identity destination rather than a sixth content menu
  item. It is linked by the visible author/site identity in the header, the
  home author introduction, post author context, the footer, and relevant
  curated-page context. Those access points are normal links in initial HTML.
- Home introduces the blog and author, links the public profile, and then
  exposes recent posts and the approved discovery destinations. The global
  presentation must not add a second privacy filter or suppression list over
  the reviewed source content.

### Shared site and author identity

`config/site.yaml` remains the only source for the normal blog identity. Its
next schema version must replace the single flat `authorName` value with one
validated owner record while retaining one canonical site name and localized
site descriptions. The target shape is:

```yaml
identity:
  name: "Canonical blog title"
  descriptions:
    en: "What this blog publishes."
    ko: "이 블로그가 다루는 내용을 설명합니다."
    ja: "このブログで公開する内容を説明します。"
  owner:
    displayName: "Public author name"
    shortBios:
      en: "Short public author introduction."
      ko: "블로그 주인을 짧게 표현하는 공개 소개입니다."
      ja: "ブログ運営者の短い公開プロフィールです。"
    profileRoutes:
      en: "/en/profile/"
      ko: "/profile/"
      ja: "/ja/profile/"
    contacts:
      - id: "github"
        kind: "github"
        labels:
          en: "GitHub"
          ko: "GitHub"
          ja: "GitHub"
        href: "https://github.com/example"
```

The example URL is documentation-only and must never be published as a
placeholder. Implementation and content rules must enforce all of the
following:

- `displayName`, every short bio, profile route, contact label, and contact URL
  comes from the reviewed identity configuration. This target defines no
  site-wide prohibited set of employer, tenure, account, credential, or
  personal-information fields. Each post and managed profile controls which
  supported facts it publishes, and the presentation layer renders rather than
  silently removes those approved values.
- `shortBios` are required, plain text, localized independently, and concise
  enough for the home introduction and compact post author context. They are
  visible reader content, not hidden SEO copy.
- `contacts` is an ordered list with a stable lowercase ASCII `id`, a supported
  kind (`linkedin`, `github`, `instagram`, `email`, `website`, or `custom`),
  complete localized labels, and one durable public destination. HTTPS is
  required except for a validated `mailto:` email destination. Empty values,
  URL-embedded authentication credentials, signed/private URLs, tracking
  parameters, duplicates, and unsafe schemes are rejected.
- Public social-profile URLs may derive Schema.org `sameAs` values and visible
  identity links. Email is a contact point, not `sameAs`. The implementation
  must not claim that a configured link independently verifies expertise.
- Presentation chooses an appropriate subset for each surface, but source data
  is not duplicated into post frontmatter, managed-page metadata, UI message
  files, or component constants.
- Making a public email visible carries scraping/spam risk and requires an
  explicit real value from the owner. Omission of email remains valid when
  other contact points exist.

### Public managed profile

The profile is a managed `kind: document` publication, not a post and not a
post-taxonomy collection. The target creates independently authored Korean,
English, and Japanese managed-page packages for `/profile/`, `/en/profile/`,
and `/ja/profile/`, sharing one stable translation key. Each package owns its
content, assets, and local uppercase `DESIGN.md`; no package imports the root
blog design or post taxonomy.

The published profile must:

- explain the author's professional direction, problems addressed, capability
  areas, selected work, leadership approach, collaboration and decision-making
  principles, and public contact paths;
- support an evidence-oriented organization around work performed and results
  produced without imposing a site-wide ban on company names, tenure,
  organization/client names, metrics, contact details, credentials, or other
  personal information. Whether each fact appears is an editorial decision in
  that managed profile or linked post, not a renderer or shared-config filter;
- link the normal-blog Selected Work collection and may manually feature a
  small owner-approved set of canonical post links, but must not query, import,
  or duplicate the blog content artifact or taxonomy;
- use `robots: index` and `sitemap: true` after the real visible content and
  exposure have been reviewed. The user has approved external indexing as the
  target, but an empty, placeholder, unreviewed, or privacy-conflicting profile
  remains draft and must not be published merely to satisfy the route;
- emit a `ProfilePage` containing one stable visible-content-backed `Person`
  identity. Every `BlogPosting.author` references that Person `@id` and profile
  URL, and eligible public social links supply `sameAs`. The author must not be
  relabeled as an `Organization`; any employer, credential, affiliation, or
  personal-detail structured data must match reviewed information visibly
  presented on the relevant public page;
- remain excluded from Pagefind's post-only search, post lists, curated
  collections, categories, tags, Archive, recommendations, and RSS while still
  entering the sitemap and `llms.txt` when its publication policy permits;
- preserve the managed-page return control, standalone accessibility, print
  behavior, canonical/hreflang relationships, and no-JavaScript readability.

### Curated post collections

Selected Work and Daily Notes are normal-blog collection routes derived from
the validated post artifact. They never create copies of post source or body
HTML. A post retains one canonical route and may appear in All Posts, one or
both curated collections, category/tag pages, Archive, related posts, search,
RSS, and sitemap according to each existing surface's rules.

A new runtime-validated `config/curated-collections.yaml` owns reusable
collection definitions. The implementation must use one generic collection
engine rather than hard-code two template queries. The target configuration is:

```yaml
schemaVersion: 1
collections:
  work:
    routeKey: "work"
    labels:
      en: "Selected Work"
      ko: "주요 작업"
      ja: "主な実績"
    descriptions:
      en: "A selection of projects, research, documentation, technical outcomes, and work improvements I created or led."
      ko: "직접 만들거나 주도한 프로젝트, 연구, 문서, 기술적 결과와 업무 개선 사례를 소개합니다."
      ja: "自ら制作または主導したプロジェクト、研究、ドキュメント、技術的成果、業務改善の事例を紹介します。"
    selector:
      anyTags: ["work-evidence"]
      anyCategories: []
      includeTranslationKeys: []
      excludeTranslationKeys: []
    order:
      primary: "work-evidence-date"
      fallback: "created-at"
      direction: "descending"
    presentation: "work"
    robots: "index"
  daily:
    routeKey: "daily"
    labels:
      en: "Daily Notes"
      ko: "일상 기록"
      ja: "日々の記録"
    descriptions:
      en: "Everyday stories about time with my children, hobbies, and life beyond work."
      ko: "아이들과 함께한 시간과 취미 생활 등 일상의 이야기를 기록합니다."
      ja: "子どもたちと過ごした時間や趣味など、日々の暮らしを記録します。"
    selector:
      anyTags: ["daily-record"]
      anyCategories: ["life-notes", "family-life", "everyday-lab"]
      includeTranslationKeys: []
      excludeTranslationKeys: []
    order:
      primary: "created-at"
      fallback: "created-at"
      direction: "descending"
    presentation: "journal"
    robots: "index"
```

Collection behavior is fixed as follows:

- Every configured category/tag ID must exist in `config/taxonomy.yaml`; every
  route key must exist in `config/routes.yaml`; labels and descriptions are
  non-empty in English, Korean, and Japanese. Descriptions are plain prose,
  contain no Markdown or URL, and become the visible introduction plus the
  collection document, Open Graph, and Explore-card description.
- `work-evidence` and `daily-record` are explicit taxonomy marker tags. Adding
  the appropriate marker to a post is the routine authoring path. Other tags
  communicate capabilities or topics and do not independently assert that an
  item is selected work unless the collection definition names them.
- A group is automatically eligible when at least one configured `anyTags` or
  `anyCategories` value matches. `excludeTranslationKeys` has first priority,
  `includeTranslationKeys` has second priority, and automatic matching is
  third. Include/exclude overrides use stable translation keys, not localized
  slugs or routes. The same key in both lists is invalid.
- A published translation group occupies at most one collection position and
  resolves to active language, then English, then Korean. Draft-only groups are
  absent. Cross-language fallbacks retain the existing visible and machine
  language labels.
- Collection membership is non-exclusive. One post may appear in both curated
  collections when the declared taxonomy supports both; it still appears once
  per collection and retains its canonical post URL.
- Curated collections use the shared 10-group pagination, deterministic
  fallback selection, base-path resolution, self-canonical numbered pages,
  and `/page/1/` exclusion. They do not create a new feed, search index, post
  identity, recommendation score, or alternate filtered canonical.
- Each collection page starts with a common semantic introduction containing
  one localized `h1`, the exact configured localized description, and the
  eligible logical-group count before the post list. Later pagination pages
  retain the collection introduction and add localized page context without
  changing the collection's meaning.
- `presentation` is a closed semantic role used to expose stable rendering
  hooks and acceptance fixtures. It does not authorize colors, card designs,
  layouts, portrait imagery, animation, or other unapproved visual decisions.
  The current classless design may render a readable baseline until the owner
  approves a later visual design.
- Curated route structured data may use `CollectionPage`/`ItemList` only when
  it matches the visible list. It must not duplicate or reclassify linked
  `BlogPosting` objects as new works.

Selected Work posts may optionally record real work chronology separately from
their publication date:

```yaml
workEvidence:
  sortDate: "2025-06-01"
  period:
    start: "2025-01"
    end: "2025-06"
```

- `workEvidence` is optional, allowed only with the `work-evidence` tag, and
  contains exactly `sortDate` plus optional `period`. `sortDate` is a real ISO
  calendar date used for Selected Work order. A period, when present, contains
  `YYYY-MM` start/end values with end not earlier than start.
- `workEvidence` is identical across translation variants and represents the
  chronology stated by that post. The shared target does not prohibit using a
  supported employment-related period, but it must remain an explicit authored
  value rather than being derived from Git history or file modification time.
- When absent, Selected Work sorts by `createdAt` and visibly labels that value
  as the post/publication date rather than implying it was the work period.
  Daily Notes always sorts by `createdAt`.
- Existing posts are not automatically promoted from broad tags such as
  `developer-career`. Adding marker tags or work chronology requires a source-
  supported editorial review; temporary development posts may remain preview
  fixtures.

### Curated-container implementation and extension workflow

The first implementation establishes one generic source-to-route pipeline.
Selected Work and Daily Notes are acceptance fixtures for that pipeline, not
two one-off page components. Ownership and data flow are fixed as follows:

1. `packages/project-config/` validates the curated-collection file, dynamic
   curated route map, taxonomy references, localized copy, selector rules,
   ordering, presentation role, and robots policy. It rejects unknown IDs,
   route collisions, contradictory overrides, unsupported selector/order
   fields, and unsupported presentation roles before content rendering.
2. `config/routes.yaml` gains a runtime-validated dynamic map for curated
   collection routes keyed by stable collection ID. Adding a new collection
   route that uses existing behavior must not require a new TypeScript property
   or hard-coded route case.
3. `packages/content-compiler/` owns collection membership because it alone
   reads validated post taxonomy, translation groups, publication state, and
   optional `workEvidence`. It applies exclusion, inclusion, automatic-match,
   ordering, deduplication, draft removal, and deterministic tie-break rules.
4. The versioned content artifact emits presentation-neutral curated records:
   stable collection ID and route key, localized labels/descriptions,
   presentation/robots values, ordered logical translation-group identities,
   applicable sort/period data, and eligible total count. It uses existing
   post-summary/alternate records rather than duplicating post bodies.
5. `apps/blog-web/` consumes those validated records through one generic
   collection renderer and route generator. It renders the common introduction,
   localized/fallback post cards, count, and shared pagination; it does not
   inspect tags, reinterpret selectors, resort entries, or read `docs/`.
6. The web and discovery lanes emit canonical, hreflang, Open Graph,
   `CollectionPage`/`ItemList` when justified, sitemap, navigation, Explore,
   and route claims from the same validated collection record. Release
   assembly rejects route/file collisions but does not derive membership.

The implementation agent must perform the initial engine work in this order:

1. add the configuration schemas and dynamic curated-route registry;
2. add marker taxonomy IDs and the approved work/daily configuration;
3. add and version the curated content-artifact contract, then update producer
   and consumer validation together;
4. implement deterministic compiler derivation and fixtures before rendering;
5. implement one generic collection route/renderer and the common static
   introduction/list/pagination structure;
6. connect primary navigation and Explore without deleting category/tag detail
   routes or Archive recovery;
7. add SEO/discovery, multilingual fallback, base-path, accessibility, and
   no-JavaScript behavior;
8. update every governed contract and policy-coverage mapping, run the focused
   and full relevant suites, rebuild preview/production output, and record
   actual results in status and history.

After the generic engine is implemented, an ordinary additional curated
container using existing selector, order, and presentation vocabulary follows
this authoring/configuration workflow:

1. choose a stable lowercase ASCII collection ID, purpose, and whether it
   belongs in primary navigation, Explore only, or intentional direct links;
2. add one locale-neutral route to the dynamic curated route map and verify it
   does not collide with system, post, taxonomy, asset, managed-page, redirect,
   or another curated route;
3. add the collection's complete English/Korean/Japanese labels and
   descriptions, selector, override lists, order, existing presentation role,
   and robots policy to `config/curated-collections.yaml`;
4. add any new marker tag/category with all localized labels to
   `config/taxonomy.yaml`, then add that stable taxonomy ID to each qualifying
   post variant according to translation-group rules;
5. add rare manual includes/excludes only by stable `translationKey`, never by
   localized slug, filename, or route;
6. add an intentional navigation entry only when required and ensure Explore
   links every public curated collection with its configured title,
   description, and count;
7. run configuration, content/translation, route, collection, link, SEO,
   accessibility, preview-build, and policy-governance checks, then record the
   addition in `History.md` when shared configuration/routes change.

An ordinary addition must require no new post copy, duplicated Markdown, route
component, template query, artifact schema field, or compiler branch. The
following are not ordinary additions and require a new approved contract plus
implementation/tests: a new selector operator, order source, presentation
role, post metadata field, feed, search partition, URL filter/sort variant,
client-only membership rule, or collection-specific structured-data type.

Removing a curated container is also a route/publication change. The
implementing agent must remove intentional navigation and configuration,
preserve the underlying posts, and apply the existing redirect/tombstone and
discovery rules to the retired collection route rather than silently deleting
it. Marker tags may remain meaningful taxonomy or be migrated through the
normal reviewed content workflow; they must not be mass-removed merely because
one collection stopped using them.

### Explore and in-place search

- `/explore/` and its localized variants are indexable static discovery hubs
  containing localized headings/descriptions, category links and counts, tag
  links and counts, and links to Selected Work and Daily Notes. Existing
  `/categories/`, `/tags/`, and detail routes remain independently usable.
- The Search primary item is a normal localized `/search/` link in initial
  HTML. When the approved client enhancement loads, activating that same
  control opens an accessible in-page dialog and prevents navigation. Without
  JavaScript or when enhancement fails, the link opens the existing search
  route and its no-JavaScript explanation.
- The search dialog queries only the active-language Pagefind post index. It
  does not index or return the managed profile, other managed pages, navigation
  text, hidden fallback duplicates, or another language's post index.
- The dialog has a visible label, close control, keyboard-reachable results,
  constrained focus, Escape dismissal, and focus restoration to its trigger.
  Closing it preserves the underlying page and must not create an indexable
  query route or send query text to analytics or a server.
- Direct `/search/` routes remain `noindex`, localized, and functional. The
  overlay is progressive enhancement, not a replacement for the route or a
  reason to remove static recovery links.

### Required cohesive implementation

This target is incomplete until one implementation change:

1. adds and runtime-validates the new author identity, curated-collection, route,
   navigation, taxonomy-marker, and optional `workEvidence` contracts with
   explicit schema-version and migration decisions;
2. extends project configuration and the route registry without duplicating
   labels, descriptions, selectors, contact data, or route constants in the
   renderer;
3. extends the content artifact with presentation-neutral curated membership,
   ordering, counts, and work chronology derived by the content compiler,
   updating every producer/consumer and `ARCHITECTURE.md` together rather than
   letting the web app traverse `docs/` or infer source metadata;
4. renders the exact five-item localized primary navigation, author-profile
   access points, All Posts, Selected Work, Daily Notes, Explore, and the
   enhanced/fallback Search behavior as accessible static-first output;
5. creates the three independently reviewed managed profile packages and their
   page-local `DESIGN.md` files only from owner-supplied facts and public links;
   until that content exists, implements the capability but keeps the profile
   packages draft rather than filling required content with placeholders;
6. implements the stable Person/ProfilePage/BlogPosting author relationship,
   canonical/hreflang/Open Graph/sitemap/llms rules, visible identity parity,
   and post-only search exclusion without using hidden authority claims;
7. updates `CONTENT_RULES.md`, `I18N.md`, `PUBLISHING.md`, `SEO.md`,
   `UX_FLOW.md`, `DESIGN.md`, `ARCHITECTURE.md`, `QUALITY_GATES.md`, relevant
   runbooks/examples, and every affected `tests/policy-coverage.json` mapping
   together with executable behavior;
8. adds positive, invalid, boundary, deterministic, multilingual, fallback,
   pagination, base-path, route-collision, migration, privacy, and regression
   fixtures for identity/contact validation, selector precedence, overlapping
   membership, work dates, collection intros/counts, profile publication, and
   search isolation;
9. adds rendered-browser checks for the five-item desktop/mobile navigation,
   author/profile access, all three collection introductions, Explore links,
   search-dialog focus/Escape/restoration/failure behavior, no-JavaScript
   fallback, long localized labels, zoom, and screen-reader names;
10. rebuilds preview and production output, inspects representative Korean,
    English, and Japanese routes at root and `/blog` base paths, updates
    `IMPLEMENTATION_STATUS.md`, and records only checks actually run in
    `History.md`.

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
