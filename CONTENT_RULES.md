# Blog Content Rules

This file is the authoritative contract for transforming source material into publishable blog content. It applies to every Markdown post under `docs/`, every post-owned asset under `assets/content/`, and every standalone managed page under `managed-pages/`. `I18N.md` is the required companion contract for language routes, translation grouping, localized UI, and language selection.

## 1. Goals

A valid post must:

- preserve the supplied author's meaning and factual integrity;
- produce semantic, accessible static HTML;
- expose useful SEO metadata without keyword stuffing;
- keep local media reproducible and independent of temporary machine paths;
- remain readable without client-side JavaScript;
- be deterministic enough for category, tag, recommendation, archive, and final-HTML search indexes to be generated at build time;
- keep drafts structurally outside production artifacts and releases.
- publish each reviewed English, Korean, or Japanese variant as an independent,
  discoverable static document without requiring JavaScript to read it.

## 2. Source material policy

Source material may be unstructured text, notes, existing Markdown, office documents, PDFs, URLs, code, screenshots, images, audio/video files, or map locations.

- Correct spelling, spacing, Markdown structure, and obvious formatting defects while preserving meaning.
- Do not add claims, personal experiences, quotes, citations, benchmarks, or conclusions not supported by the source.
- Clearly distinguish the author's claims from quoted or referenced material.
- Preserve source links when they support the article.
- Do not present inferred information as verified fact.
- If essential publishing information cannot be determined safely, set `draft: true`, record a short `TODO` at the relevant location, and report it to the user.
- Do not leave TODOs in a post with `draft: false`.

## 3. Canonical paths

### Post

```text
docs/<language>/<category>/<YYYY-MM-DD>-<slug>.md
```

Example:

```text
docs/ko/programming/2026-09-13-cpp-programming.md
docs/en/programming/2026-09-13-cpp-programming.md
docs/ja/programming/2026-09-13-cpp-programming.md
```

### Post-owned assets

```text
assets/content/<category>/<slug>/<asset-file>
```

Example:

```text
assets/content/programming/cpp-programming/memory-layout.png
```

Rules:

- Use an existing category directory when one accurately fits the post.
- `<language>` is exactly `en`, `ko`, or `ja`. The directory is the language
  source of truth; do not repeat it in frontmatter.
- Available variants in a post translation group use the same category,
  filename, slug, and `translationKey` in their language directories.
- Create a new category only when no existing category is suitable.
- Category and slug identifiers use lowercase ASCII kebab-case: `a-z`, `0-9`, and `-` only.
- Use `YYYY-MM-DD`, not underscores, in new post filenames.
- The filename date is an authoring aid; `createdAt` is the publication-date source of truth.
- A published slug is stable. Renaming it requires an explicit redirect or alias plan.
- Asset filenames use lowercase kebab-case and retain the correct lowercase extension.
- Never place binary assets inside `docs/`.

## 4. Canonical frontmatter

Frontmatter must begin on the first line and use valid YAML.

```yaml
---
title: "C++ 프로그래밍에 대해서"
description: "좋은 C++ 프로그램을 설계하기 위한 기본 원칙과 접근 방법을 설명합니다."
translationKey: "cpp-programming"
originalLanguage: "ko"
translationStatus: "source"
slug: "cpp-programming"
tags:
  - "cpp"
  - "programming"
  - "methodology"
createdAt: "2026-09-13T13:00:00+09:00"
representativeImage: "social-image"
socialImage:
  src: "asset:/programming/cpp-programming/social-preview.png"
  alt: "C++ 코드와 메모리 구조를 표현한 포스트 미리보기"
draft: false
---
```

### Required fields

- `title`: accurate, specific, and written for humans.
- `description`: one or two standalone sentences summarizing the article; aim for roughly 60–160 characters when natural.
- `translationKey`: stable lowercase ASCII kebab-case identity shared by the
  English, Korean, and Japanese variants. It is not a route.
- `originalLanguage`: language in which the post was originally authored. It
  is exactly `en`, `ko`, or `ja` and is identical in every translation variant.
  For a Korean source supplied by the owner, use `ko`.
- `translationStatus`: provenance and review state for this language variant.
  It is `source` only when the file language equals `originalLanguage`,
  `ai-draft` for an AI-created translation that the owner has not approved, or
  `reviewed` for a translated variant the owner has explicitly approved.
  `ai-draft` requires `draft: true`; production rejects it.

- `slug`: stable lowercase ASCII kebab-case identifier.
- `tags`: YAML list of two to eight stable tag IDs declared in
  `config/taxonomy.yaml`; IDs use lowercase ASCII kebab-case.
- `createdAt`: ISO 8601 timestamp including an explicit timezone.
- `representativeImage`: the owner-approved representative-image mode. It is
  exactly `social-image`, `cover`, or `generated-card`. `social-image` requires
  `socialImage`; `cover` requires `cover`; `generated-card` uses the
  deterministic design renderer even when a cover exists. Missing or
  inconsistent mode/asset combinations are build errors.
- `draft`: boolean, never a quoted string.

For example, a newly generated English translation uses:

```yaml
originalLanguage: "ko"
translationStatus: "ai-draft"
draft: true
```

After the owner reviews and approves that translation, use
`translationStatus: "reviewed"`; publish that variant when it satisfies the
representative-image approval and every other production rule. Another missing
or draft translation does not block it.

### Optional fields

- `updatedAt`: include only when the post has been materially revised; it must not precede `createdAt`.
- `cover`: include only when a real cover asset exists; both `src` and `alt` are
  required together. It is required when `representativeImage: cover` but may
  still exist as an article cover for another representative mode.
- `socialImage`: preferred source image for this variant's Open Graph preview.
  `src` and localized `alt` are required together. It is required when
  `representativeImage: social-image` and may be omitted for the other modes;
  the renderer never silently changes the approved mode.
- `related`: stable slugs for intentional editorial recommendations. Omit when there are no manual recommendations; the build may derive additional related posts.

### Derived authorship disclosure

Post authors must not add an authorship or AI-use disclosure field to
frontmatter. `config/content-provenance.yaml` supplies one required shared owner
declaration for every post artifact:

```yaml
authorshipDisclosure:
  statementLanguage: "en"
  statement: "The original work for this article is a reliable document written by a human. AI was used only in a limited capacity for proofreading to reduce typographical errors, transcription mistakes, and awkward wording."
  claimSource: "owner"
  appliesTo: "original-work"
  primaryCreation: "human"
  aiAssistance:
    - "proofreading"
```

This artifact field is required and derived. It is not author-controlled,
localized, or optional. The web build emits the English statement and its
structured values only as custom `<meta>` records in the static document head.
It must not create a `display:none`, off-screen, zero-opacity, or otherwise
hidden body element; enter the article body, excerpt, description, RSS, social
metadata, recommendation input, or final-HTML search index; or be presented as
a Schema.org/rich-result property for content readers cannot see.

The declaration applies to the original work, not to the process used to create
each localized variant. `originalLanguage` and `translationStatus` remain the
authoritative translation provenance. A translated variant may therefore carry
this original-work declaration while separately identifying an AI-assisted,
owner-reviewed translation. It must never use the declaration to conceal that
translation history.

This is an owner assertion, not an independent accuracy score, ranking signal,
or third-party verification. If supplied material was substantially drafted or
rewritten by AI rather than merely proofread, the authoring agent must not
publish it under this global declaration. Keep the translation group as draft,
report the conflict, and request an explicit provenance-policy/schema decision.

### Metadata rules

- Language and category are derived from the first and second directories below
  `docs/`; do not repeat them in frontmatter.
- Prefer an explicit date in the source. For a newly authored post intended for immediate publication, use the actual creation time with the project timezone. Never guess an original publication date.
- Reuse existing category/tag IDs. Their human-readable `en`, `ko`, and `ja`
  labels are centralized in `config/taxonomy.yaml`.
- Do not add promotional keywords that the body does not substantively cover.
- Do not include empty strings, empty arrays, placeholder URLs, or unknown fields.
- Do not copy or override the shared authorship statement in frontmatter or
  body Markdown.

### Translation-group metadata

`translationKey`, `originalLanguage`, `slug`, category, relative filename,
tags, `createdAt`, `updatedAt`, `representativeImage`, and `related`
must be identical across available variants. `translationStatus`, `draft`,
`title`, `description`, body text, headings, cover and social-image
references/alternative text, media alternative text, captions, and descriptive
link text may be localized. The authored original must exist and be published
before a translation is published. Production may contain any independently
approved subset of translations; unpublished variants do not appear in
alternates, sitemap, RSS, or language switching.

The variant whose path language equals `originalLanguage` must use
`translationStatus: "source"`; every other variant must use `ai-draft` or
`reviewed`. Every published translated variant requires `reviewed`. New AI
translations remain `ai-draft` and `draft: true` until the owner reviews that
specific translation and approves its publication.

`translationStatus` is internal publication provenance, not reader-facing post
chrome. Every post artifact exposes its current language, `originalLanguage`,
and published validated language alternates as derived metadata. A renderer may
use these fields for optional original-language context after the article body
and for an explicit real-link language switcher. No browser language is read or
used to redirect a document. Authors do not add a translation banner, nuance
warning, review message, browser preference, or handwritten original URL to
frontmatter or body Markdown.

Korean is the configured authoring source and unprefixed public default. When a
Korean source is created or materially revised, create/update English and
Japanese draft variants in the same task. Preserve facts, code, identifiers,
URLs, citations, asset references, and explicit heading IDs. When ambiguity
prevents a trustworthy translation, keep the affected translation as a draft
and report the uncertainty instead of inventing content; this does not block a
valid reviewed source or sibling. The complete workflow and routing rules are
in `I18N.md`.

`originalLanguage` records authorship origin, not the visitor's preferred
language, the file's current language, or the language used by an editing tool.
It is stable after publication. Do not change it merely because a translation
was revised more recently. If the source provenance is genuinely unknown, keep
the group as draft and report the missing decision instead of guessing.

Legacy `docs/<category>/<date>-<slug>.md` paths are no longer valid. Migrate one
by placing the source under `docs/ko/` with the same category/filename, adding
`translationKey`, `originalLanguage`, `translationStatus`, and an explicitly
approved `representativeImage`, converting tags to configured IDs, and creating matching
`docs/en/` and `docs/ja/` draft variants for review. The Korean original may be
published independently; each translation enters production only after review.
Preserve an already published slug; add redirects only if the actual public URL
changes.

## 5. Markdown body

- Do not repeat the title as an `#` heading. The post template renders the single page-level heading from `title`.
- Begin with a concise introductory paragraph, then use `##` and deeper headings in order.
- Do not skip heading levels solely for visual size.
- Keep paragraphs focused and use lists only when the information is genuinely list-shaped.
- Add a language identifier to every fenced code block, such as `ts`, `cpp`, `bash`, `json`, or `text`.
- Preserve executable code exactly unless the user asks to correct or modernize it.
- Use descriptive link text instead of bare “여기” or “클릭”.
- Use root-relative site URLs for internal published links when the final slug is known.
- Do not include raw `<script>`, `<style>`, `<iframe>`, event-handler attributes, tracking pixels, or executable HTML.
- Plain semantic HTML should be avoided unless Markdown cannot express the structure and the content pipeline explicitly permits that element.

### Heading anchors and table of contents

Post authors do not write or maintain a table-of-contents list in frontmatter or
body Markdown. The content compiler derives it from parsed `##` through
`######` headings and emits one ordered, presentation-neutral heading record for
each heading. The same parse result must supply both the generated HTML heading
`id` and the metadata consumed by the blog table-of-contents navigation.

A normal heading needs no additional syntax:

```markdown
## 어떻게 접근해야 좋은 프로그램인가?

### 작은 단위로 검증하기
```

The compiler derives deterministic anchors such as:

```text
#어떻게-접근해야-좋은-프로그램인가
#작은-단위로-검증하기
```

For a heading whose fragment must remain stable after its visible wording is
edited, append an explicit anchor in lowercase ASCII kebab-case:

```markdown
## API 호환성 유지하기 {#api-compatibility}
```

This renders the visible heading `API 호환성 유지하기` with
`id="api-compatibility"`; the `{#...}` marker is not visible text. Explicit
anchors are optional author-controlled syntax. They are not frontmatter and
must not be generated for every heading merely for convenience.

Anchor derivation and validation rules:

- The Markdown parser supplies plain heading text after removing Markdown
  formatting and an optional trailing `{#explicit-id}` marker.
- Generated IDs normalize plain text with Unicode NFKC, lowercase it, remove
  apostrophes, replace every other run of non-letter/non-number characters with
  `-`, and trim leading/trailing `-`.
- A generated empty ID falls back to `section-<document-order>`.
- Duplicate generated IDs receive `-2`, `-3`, and later deterministic suffixes
  in document order.
- An explicit ID must match lowercase ASCII kebab-case, begin with `a-z`, and be
  unique in the post. Invalid or duplicate explicit IDs are build errors.
- The first body heading is `##`. A descent may increase by only one level;
  returning to any shallower level is allowed.
- Each derived record contains visible text, depth, ID, `#fragment`, and the ID
  of its nearest preceding shallower parent when one exists.
- The sanitized `bodyHtml` contains exactly one matching `h2`–`h6` element for
  each derived record. Authored raw HTML cannot inject competing heading IDs.
- A same-document Markdown link such as
  `[호환성 절로 이동](#api-compatibility)` must resolve to a derived heading ID;
  a missing fragment is a content build error.

Existing posts require no migration because anchors and table-of-contents
metadata are derived automatically. Changing the visible text of a heading
without an explicit ID may change its generated fragment. Add an explicit ID
before publishing when another page or durable external reference is expected
to link directly to that section.

Heading anchors were introduced in content artifact schema version `2`, and
multilingual grouping in version `3`. Version `4` added `originalLanguage`, and
version `5` added paired cover/social-image asset and alternative-text records.
Version `6` added per-variant `translationStatus`. The current content artifact
contract is version `7` because it adds required original-work
`authorshipDisclosure` metadata. It retains the earlier heading, image,
language, and translation shapes.
Earlier intermediate artifacts are not migrated or released; rebuild content
and every downstream web, search, discovery, and release artifact from the
locale-grouped source described above.

## 6. Local assets

The Markdown source and asset source do not need to be colocated. All managed local references use the logical `asset:` scheme.

```markdown
![C++ 메모리 구조](asset:/programming/cpp-programming/memory-layout.png)
```

The logical path resolves relative to `assets/content/`. Therefore the example above resolves to:

```text
assets/content/programming/cpp-programming/memory-layout.png
```

Rules:

- Copy supplied assets into the canonical post-owned asset directory; never delete or move the supplied originals unless explicitly requested.
- Never commit `file://` URLs, home-directory paths, absolute filesystem paths, temporary upload paths, or chat attachment identifiers.
- Every meaningful image requires concise alt text that describes its relevant content or purpose.
- Decorative images use empty alt text: `![](asset:/...)`.
- Do not use the filename as alt text unless it is already a useful human description.
- Reuse the same logical path when an asset appears more than once.
- Do not manually create hashed build filenames. The content build owns hashing, responsive variants, optimization, deduplication, and output URLs.
- Generated asset records use stable asset IDs and artifact-relative paths. Deployment-specific public URLs are resolved later from shared route configuration and must not be authored in Markdown.
- Preserve original image files. Lossy conversion and responsive derivatives belong to the build pipeline.
- A source image must not exceed 20 MiB or 24 megapixels. A rendered image must
  not exceed 512 KiB; the build fails rather than silently reducing dimensions
  or quality below the approved output policy.
- No published asset may exceed 25 MiB. Larger video, archive, dataset, or
  download files require separately approved object storage and remain normal
  HTTPS links from the static page.
- The build emits intrinsic dimensions and responsive `srcset`/`sizes`
  candidates for content images. Renderers use eager/high-priority loading only
  for the primary above-the-fold image and native lazy loading for eligible
  below-the-fold images; image discovery never depends on a click or scroll
  handler.
- Record attribution or license information in visible prose when the asset requires it.

### Representative and social preview images

Representative-image selection is an owner approval checkpoint in the post
conversion workflow. After the article structure and localized metadata are
stable, the authoring agent presents a short set of relevant choices rather
than silently selecting or generating an image. Depending on available source
material, the choices may include:

1. a supplied or already owned post asset with a described crop;
2. reuse of an appropriate approved cover;
3. a deterministic typography-led card generated from the approved blog design;
4. one or more AI-generated visual concepts, only when image generation would
   add value and the owner is offered that option explicitly;
5. supplying an image later, which keeps the group as draft.

Each proposed option states its subject, expected crop, whether visible text
requires locale-specific sources, and known provenance/license limitations.
The agent must not download, generate, promote, or set a representative image
before the owner chooses. When AI generation is selected, the generated result
is shown for final owner approval before it is copied into the canonical asset
directory or referenced by `socialImage`. An unanswered or rejected image
decision keeps the translation group as draft. The completion report records
the approved option and the required `representativeImage` frontmatter is its
durable build-time source of truth.

Every published post must resolve exactly one Open Graph image without a
network request:

1. `representativeImage: social-image` resolves that variant's explicit
   `socialImage`;
2. `representativeImage: cover` resolves that variant's `cover`;
3. `representativeImage: generated-card` resolves a deterministic card
   generated by the blog web build from the localized title, category label,
   site name, and approved root `DESIGN.md`.

An explicit image uses an `asset:` reference, meaningful localized `alt`, and a
supported raster source. The web build owns the social derivative, crop,
encoding, content-addressed filename, and final absolute HTTPS URL. It emits a
`1200 × 630` Open Graph card and high-resolution `1:1`, `4:3`, and `16:9`
representative derivatives for the post's `BlogPosting.image` data. Crops must
preserve the approved subject and must not cut off meaningful text or faces. A
text-bearing image may use locale-specific source files; an identical
language-neutral image should be shared.

Generated deterministic cards and derivatives are post-specific presentation
output, not authored content.
They use bundled/local fonts and assets only, include no untrusted HTML, and
remain deterministic for identical content, design, and configuration inputs.
Do not call an image-generation service during production builds. Never use an
unrelated global image merely to satisfy `og:image`, and never place generated
card files under `docs/` or `assets/content/`.

## 7. Remote images and downloads

```markdown
![Astro 프로젝트 화면](https://example.com/image.png)
```

- An `https:` reference remains remote by default and is not treated as a managed local asset.
- Do not download or vendor remote media unless the user requests it and its reuse is authorized.
- Do not copy expiring, authenticated, signed, private, or session-bound URLs into a post.
- Prefer durable source pages over direct download links when linking to third-party material.
- If a remote asset is essential but unreliable, mark the post as a draft and report the risk rather than silently copying it.

## 8. Video and audio

Standard Markdown links remain links. Do not automatically turn every media link into an embed.

### Managed local video

```markdown
::video{src="asset:/programming/cpp-programming/demo.mp4" poster="asset:/programming/cpp-programming/demo-poster.jpg" title="C++ 프로그램 실행 예제"}
```

- `src` and `title` are required.
- `poster` is strongly recommended and, when supplied, must be a valid managed image asset.
- Prefer broadly supported delivery formats such as MP4/H.264 or WebM.
- Large source videos may require an external video host; do not silently add oversized files to the repository.

### YouTube

```markdown
::youtube{id="VIDEO_ID" title="C++ 프로그래밍 강의"}
```

### Vimeo

```markdown
::vimeo{id="VIDEO_ID" title="C++ 프로그래밍 강의"}
```

- Store only the stable provider video ID, not a copied iframe snippet.
- `title` is required for accessibility and no-script fallback text.
- Do not add autoplay, tracking parameters, or arbitrary iframe permissions.
- When the source only cites a video rather than asking to embed it, use a normal descriptive link.
- YouTube and Vimeo directives are provider-plugin syntax. They become publishable only after their reviewed local plugins are installed and enabled in `config/embeds.yaml`.

## 9. Maps

Map embeds are provider plugins rather than built-in content-compiler behavior. The following is the reserved authoring contract for a future Google Maps plugin:

```markdown
::google-map{query="서울특별시청" title="서울특별시청 위치" link="https://maps.google.com/?q=서울특별시청"}
```

- `query`, `title`, and a durable user-facing `link` are required.
- Never place a Google Maps API key in Markdown.
- Do not paste the provider's raw iframe HTML.
- When the corresponding plugin is installed, it must produce a responsive, lazy-loaded embed and a normal map link fallback.
- If an exact place cannot be identified confidently, use a normal map link or leave the post as a draft instead of guessing coordinates.
- A future Naver Maps integration must be introduced as its own provider plugin and define its own canonical identifier and directive attributes before use.
- No real map provider plugin is installed by the current scaffold. Until one is registered, use a normal descriptive map link or keep the post as a draft; do not treat this example as implemented renderer support.

## 10. Other embeds

- External-content providers are implemented as reviewed local packages under `plugins/embeds/<plugin-id>/` using the provider-neutral API in `packages/embed-core/`.
- `packages/content-compiler/` may call embed-core but must not import an individual provider package. The blog application receives only sanitized HTML and framework-neutral artifact records; it must not import provider code.
- `config/embeds.yaml` is the explicit registry and global policy. Directory scanning, remote plugin packages, runtime marketplace installation, and unregistered directive execution are forbidden.
- New embed providers require a provider package, an explicit enabled registry entry, an explicit content-rule change, runtime directive schema, provider fixtures, and security review before use.
- Each provider must define an allowlisted host, canonical identifier, accessible title, responsive rendering, privacy mode, content-security-policy requirements, iframe permissions, searchable fallback text, and normal-link fallback.
- Privacy mode is required and must declare whether output is `local-only`, makes an `external-request`, or is `consent-required`. A plugin may not silently load a third party before the approved policy allows it.
- Plugins execute at build time. Network access is denied by default; any future exception must be explicitly configured, cached or frozen for reproducibility, and represented in build provenance.
- Optional browser behavior must be progressive enhancement. Failure or absence of JavaScript may disable the rich embed interaction, but must not remove the title, relevant explanation, or normal external link.
- Embed-core must sanitize plugin output and reject undeclared origins or permissions even though provider plugins are reviewed local code.
- Unknown, disabled, duplicated, malformed, or policy-violating provider directives are content build errors.
- API keys, access tokens, secrets, signed URLs, and private identifiers must not appear in Markdown, normalized embed artifacts, HTML, or browser bundles.
- Arbitrary HTML supplied by a source is untrusted content. Preserve it as a fenced `html` example when it is educational, not as executable page markup.

## 11. Build-owned derived data

Authors and content agents must not manually maintain generated indexes. Build ownership is split so content semantics, presentation, and final-document search remain independent.

The content compiler derives:

- translation-group category post counts and localized/fallback-resolved lists;
- translation-group tag post counts and localized/fallback-resolved lists;
- translation-group archive groupings;
- translation-group automatic related-post scores with localized link
  resolution;
- reading time and excerpts;
- ordered heading/anchor metadata for static table-of-contents navigation;
- asset hashes, dimensions, variants, stable IDs, and artifact-relative paths;
- the asset manifest;
- normalized embed records, plugin identity/version records, fallback text, and declared security requirements;
- optional post-owned cover/social-image records; final Open Graph derivatives,
  `1:1`, `4:3`, and `16:9` Article image derivatives, and tags remain blog
  web-build responsibilities;
- published translation-group alternates, route claims, language-scoped search
  eligibility metadata, and deterministic post-navigation targets resolved in
  active-language, English, then Korean order; together with
  `originalLanguage`, these alternates are the complete
  presentation-neutral input for explicit language switching and optional
  original-language context.
- the validated shared original-work authorship/AI-assistance declaration for
  every post variant.

Publication timing, deterministic listing order, pagination, stable-route
changes, deletion, related-post scoring, and search expectations follow
`PUBLISHING.md`. Authors may provide manual `related` slugs but must not store
automatic scores or generated recommendations in frontmatter.

The blog web build derives public asset URLs, final post/category/tag/archive routes, static HTML, canonical URLs, and structured SEO presentation from the validated content artifact and shared configuration.

The site discovery builder runs after both normal blog and managed-page routes
are known. It generates `sitemap.xml`, `robots.txt`, and post-only English,
Korean, and Japanese RSS feeds
from validated production manifests. It includes a managed page only when that
page is published with `robots: index` and `sitemap: true`; managed pages never
enter RSS.

The search indexer runs after the blog web build. It creates separate English,
Korean, and Japanese indexes from eligible final static blog HTML so searchable
text matches the page delivered to readers. It writes
`.artifacts/search/<mode>/`; it does not parse Markdown or derive taxonomy.
Managed pages are excluded by default.

Do not commit generated values into frontmatter unless this contract explicitly declares the field.

The content compiler writes its values to `.artifacts/content/<mode>/` using the versioned runtime contract in `packages/contracts/`. Post source must not depend on artifact filenames, generated hashes, blog framework types, components, CSS classes, or templates.

### Shared configuration

Cross-lane values come from runtime-validated files under `config/`:

- `site.yaml`: localized site identity descriptions, the production origin,
  origin/base-path environment keys, supported/source/default and primary UX
  review languages, language route prefixes and preference key, timezone, and
  global discovery policies;
- `performance-budgets.yaml`: GitHub Pages capacity, route, initial-transfer,
  image, font, deployment-time, and bandwidth-warning limits;
- `routes.yaml`: normalized route prefixes, system routes, and reserved namespaces;
- `taxonomy.yaml`: stable category/tag IDs, their required localized labels, and
  tag aliases;
- `navigation.yaml`: intentional primary/footer links with all required
  localized labels, including a managed page only when the owner chooses to
  surface it;
- `redirects.yaml`: explicit compatibility routes for published URL changes;
- `security.yaml`: project-wide static-document defaults and the maximum direct managed-page external-origin and iframe-permission policy;
- `embeds.yaml`: explicit local provider-plugin registry and global embed safety policy;
- `analytics.yaml`: optional blog-only GA4 activation, consent, and collection policy; it does not add any author-controlled post or managed-page field.
- `content-provenance.yaml`: required owner-declared post authorship and limited
  AI-assistance metadata; it is derived into artifacts and cannot be overridden
  by a post.

Content agents may read these files to select existing identifiers and routes, but must not copy derived configuration values into post frontmatter. Blog visual design does not belong in shared configuration.

Taxonomy entries use this shape when the first real identifiers are added:

```yaml
categories:
  programming:
    labels:
      en: "Programming"
      ko: "프로그래밍"
      ja: "プログラミング"
tags:
  methodology:
    labels:
      en: "Methodology"
      ko: "방법론"
      ja: "方法論"
tagAliases:
  "방법론": "methodology"
  "方法論": "methodology"
```

Every ID uses lowercase ASCII kebab-case. Every published ID has all three
non-empty labels. An alias maps source wording to exactly one declared tag ID;
it is an authoring-normalization aid and never becomes a second public tag.

Analytics is presentation-layer behavior. Authors must not add GA4 Measurement
IDs, tracking snippets, analytics event declarations, consent values, or user
identifiers to Markdown, assets, post frontmatter, or `page.yaml`. Managed pages
are excluded from analytics by default. This analytics addition does not change
the canonical post or managed-page metadata formats.

Navigation entries use the following explicit shape when added:

```yaml
primary:
  - labels:
      en: "Archive"
      ko: "보관함"
      ja: "アーカイブ"
    type: "internal"
    href: "/archive/"
footer:
  - labels:
      en: "GitHub"
      ko: "GitHub"
      ja: "GitHub"
    type: "external"
    href: "https://github.com/example"
```

- `labels`, `type`, and `href` are required. `labels` contains non-empty `en`,
  `ko`, and `ja` strings.
- `type` is `internal` or `external`.
- A normal-blog internal `href` is a locale-neutral normalized route; the web
  renderer applies the active language prefix and it must resolve to a
  production route claim. A managed-page item uses an explicit published route
  because that page may not have every locale. Adding it here is intentional,
  not automatic discovery.
- An external `href` is an absolute durable HTTPS URL. External links do not
  receive access to the opener context when opened in a new tab.
- Navigation configuration contains no categories, post counts, or generated
  lists; the web build derives those from the content artifact.

The deployment host is GitHub Pages, but authored content remains host-neutral.
Markdown must not contain the GitHub account name, repository name, Pages
default URL, custom production origin, or deployment base path as a substitute
for an internal logical link. The web and managed-page builds resolve internal
links, assets, canonical URLs, discovery documents, and return navigation from the
validated `SITE_ORIGIN` and `SITE_BASE_PATH` inputs.

GitHub Pages cannot emit application-defined HTTP redirects. An entry in
`config/redirects.yaml` therefore produces a static compatibility page with a
canonical target, `noindex`, an immediate redirect, and a visible normal link.
Because this is not a real HTTP 301 response, published slugs and routes should
remain stable whenever possible.

Provider output must remain safe on a static host without configurable response
headers. Renderers emit the validated document-level CSP metadata supported by
browsers, while every iframe carries its own validated `title`, sandbox,
referrer policy, permission policy, and normal-link fallback. A provider that
cannot satisfy those restrictions is not compatible with the GitHub Pages
target.

### Preview and production artifacts

- `draft: true` is allowed in source and preview artifacts only.
- Preview outputs are written beneath `.artifacts/<lane>/preview/` and may contain draft and published records.
- Production outputs are written beneath `.artifacts/<lane>/production/`; their manifest types cannot represent a draft record.
- A production build omits draft posts and draft-only assets before rendering.
- A production build rejects any translated variant with
  `translationStatus: ai-draft` and any missing/inconsistent
  `representativeImage` choice.
- Release assembly accepts production artifacts only and fails on a preview artifact or any draft record.

Every artifact includes reproducible provenance containing producer and schema
versions, build mode, input hash, shared-config hash, `CONTENT_RULES.md` hash,
and `I18N.md` hash. Content artifacts containing embeds also record
contributing plugin IDs/versions and the embed-policy hash. Plugin source,
configuration, frozen external responses, and enhancement assets participate
in the input hash. Uncontrolled wall-clock timestamps are not part of
integrity-bearing manifests.

For managed pages, the per-page source hash includes `page.yaml`, local
`DESIGN.md`, the declared entry dependency graph, security requests, and all
page-owned assets. Open Design caches and unreviewed staging exports are excluded
because they are not production inputs.

## 12. Manual validation checklist

Until an automated `content:check` command exists, verify all of the following before reporting completion:

- Frontmatter starts on line 1, has matching `---` delimiters, and parses as YAML.
- Every required field exists and has the correct scalar, list, or boolean type.
- `representativeImage` matches the owner-approved choice and its required
  `socialImage` or `cover` record exists when applicable.
- The original variant is `translationStatus: source`; every translated variant
  is `ai-draft` or `reviewed`, and no `ai-draft` variant is published.
- Every production variant carries a validated published original route and
  all published language alternates. If optional post-language context is
  rendered, its original link resolves to those alternates and review state is
  not rendered as post chrome.
- Post list, taxonomy, archive, pagination, and related links prefer the active
  language, then English, then Korean; an unmatched group is omitted and every
  cross-language fallback is visibly and programmatically labeled.
- Category, filename, filename date, slug, and `createdAt` are internally consistent.
- The target post and asset paths do not overwrite existing content unintentionally.
- There is no body-level `#` heading.
- Heading levels are ordered, the first heading is `##`, explicit anchor IDs are
  valid and unique, and every code fence has a language.
- Every derived heading record has exactly one matching HTML heading ID, and
  every authored same-document fragment link resolves to one of those IDs.
- Tags are relevant and consistently spelled.
- Every managed `asset:` reference resolves inside `assets/content/` and the file exists.
- The generated post route does not conflict with shared reserved routes, redirects, or another route claim.
- Every meaningful image and embed has accessible alternative text or a title.
- `socialImage`, when present, has paired localized alt text and resolves to a
  valid managed raster asset; otherwise the cover or deterministic generated
  card path is available for a complete post-specific Open Graph image. The
  representative-image mode and any promoted AI-generated asset have explicit
  owner approval, and the build can create the required Open Graph plus
  `1:1`/`4:3`/`16:9` derivatives without destructive cropping.
- Every provider directive resolves to exactly one enabled local plugin, declares its privacy mode, and produces a durable normal-link fallback.
- Plugin output requests only registered external origins and approved iframe permissions, and its searchable fallback text is present in final HTML.
- Local paths, temporary URLs, secrets, API keys, raw scripts, and raw iframes are absent.
- External links use durable HTTPS URLs where available.
- Factual claims, quotes, dates, and citations remain supported by the supplied source.
- A published post contains no TODO, placeholder, or unresolved media reference.
- Every post artifact carries the exact validated English original-work
  authorship declaration; final HTML contains its escaped custom `<meta>` data
  and contains no matching hidden body text or unsupported JSON-LD property.
- The source genuinely fits the configured human-authored/proofreading-only
  declaration; otherwise the group remains draft pending a provenance decision.

## 13. Completion report

After converting content, report:

- all created or updated translation-variant paths;
- each copied or newly referenced managed asset;
- the owner-approved `representativeImage` option, selected explicit social
  image, cover fallback, or deterministic generated-card fallback;
- each variant's translation review status;
- whether the post is published or draft;
- important transformations or assumptions;
- unresolved items requiring user review;
- the content validation result.

## 14. Maintaining this contract

This document must evolve with the content system. A format or behavior change is not complete until this file accurately describes it.

Update this file in the same change whenever implementation or configuration changes:

- frontmatter fields, types, defaults, required status, or validation;
- translation review statuses, publication approval, or translated-page
  disclosure;
- post filenames, category inference, slugs, tags, timestamps, or canonical URLs;
- supported Markdown syntax, body structure, code blocks, links, or raw HTML policy;
- heading-anchor derivation, explicit anchor syntax, table-of-contents metadata,
  or same-document fragment validation;
- image, video, audio, map, download, or external embed handling;
- representative-image approval, mode values, required source assets, social
  derivatives, or crop behavior;
- embed-core API, provider-plugin registration, directive ownership, security policy, network policy, or fallback behavior;
- asset source paths, `asset:` resolution, optimization, hashing, copying, or output paths;
- draft and publication rules;
- generated category, tag, recommendation, archive, search, RSS, sitemap, or SEO data;
- shared site configuration, route registration, taxonomy aliases, redirects, build modes, or provenance;
- managed-page kinds, routes, package structure, `DESIGN.md`, entrypoints, security declarations, return navigation, discovery, print, or application behavior;
- cross-boundary artifact schemas, semantic HTML guarantees, asset records, compiler ownership, or release assembly behavior;
- warnings, build failures, size limits, allowed formats, or author-facing validation;
- any information a content agent must add, remove, or express differently in a post.
- shared authorship, content-provenance, AI-assistance, visibility, or
  machine-readable disclosure behavior.

For each change:

1. Update the canonical example and the relevant rule section.
2. Mark affected fields as required, optional, derived, or deprecated.
3. Document accepted values, constraints, and failure behavior.
4. Add or update a representative valid example.
5. Describe migration or backward compatibility when existing posts are affected.
6. Update automated content validation when available.
7. Verify that implementation, tests, examples, and this document agree before completion.

Never treat application code or a schema change as sufficient documentation by itself. Do not report documented syntax as publishable until the renderer and validator support it; planned contracts must remain clearly identified as implementation work.

## 15. Managed pages

A managed page is a standalone publication surface that does not behave like a blog post. Typical uses include:

- a profile or printable resume;
- a presentation or slide experience;
- a portfolio, campaign, or project microsite;
- an interactive single-page application;
- another intentionally designed, directly addressable experience.

Managed pages:

- have stable direct URLs;
- may be linked manually from a post, navigation item, profile link, or another page;
- own their full visual design through a page-local Open Design-compatible `DESIGN.md`;
- do not inherit the normal blog header, footer, sidebar, post layout, or post typography;
- do not participate in post categories, tags, archives, recommendations, reading time, RSS, or the default post search index;
- are not placed in an automatically generated managed-page directory or listing;
- still provide standalone document metadata, accessibility, security, and a reliable route back to the blog.

The build may scan managed-page packages to create routes, but it must not expose the scan result as a public catalog unless the user explicitly requests one later.

## 16. Managed-page package structure

Each managed page is a self-contained package:

```text
managed-pages/<page-id>/
├── page.yaml
├── DESIGN.md
├── content.md          # document-like content, when applicable
├── slides.md           # presentation content, when applicable
├── src/                # custom TypeScript/CSS application source, when applicable
├── design/             # optional reviewed Open Design working exports
└── assets/             # page-owned images, video, fonts, and downloads
```

Rules:

- `<page-id>` uses lowercase ASCII kebab-case and is stable after publication.
- `page.yaml` and uppercase `DESIGN.md` are required for every managed page. The casing is exact because Linux and GitHub Actions filesystems are case-sensitive.
- A page includes only the entry source required for its `kind`; empty placeholder entry directories are not required.
- The exact entry source is declared by `entry` in `page.yaml`; the compiler never guesses between `content.md`, `slides.md`, and `src/`.
- The package must remain movable as one unit without relying on absolute filesystem paths or temporary attachments.
- Shared blog implementation components belong in the web source, not inside a page package. A page-specific component remains inside its page package.
- Generated HTML, optimized assets, caches, screenshots, PDFs, and build output do not belong in the source package unless the user explicitly requests a committed export.
- Unreviewed Open Design exports remain under the package's `design/` staging directory and are not production build inputs.

## 17. Managed-page configuration

`page.yaml` contains operational routing and publication information, not blog taxonomy.

```yaml
schemaVersion: 1
id: "profile-ko"
route: "/profile/"
kind: "document"
entry:
  format: "markdown"
  path: "content.md"
status: "published"
language: "ko"
translationKey: "profile"
title: "CloverHearts 프로필"
description: "경력, 기술, 프로젝트 경험을 정리한 프로필입니다."
returnTo: "/"
robots: "index"
sitemap: true
security:
  externalOrigins:
    frame: []
    script: []
    connect: []
    image: []
    style: []
    font: []
    media: []
  iframePermissions: []
```

### Required fields

- `schemaVersion`: currently `1`; unsupported versions are build errors.
- `id`: must exactly match the package directory name.
- `route`: root-relative route beginning and ending with `/`; it must not collide with a post, system page, asset path, or another managed page.
- `kind`: one of `document`, `presentation`, or `application`.
- `entry`: object with required `format` and `path` fields. `format` is `markdown` or `typescript`; `path` is a normalized package-relative path that exists and cannot escape the page package.
- `status`: one of `draft` or `published`.
- `language`: exactly one configured supported language: `en`, `ko`, or `ja`.
- `title`: standalone document and social title.
- `description`: standalone document and social description.
- `returnTo`: root-relative internal route rendered by the return control.
- `robots`: explicitly `index` or `noindex`; never infer this for a profile or resume containing personal information.
- `sitemap`: boolean. It should normally be `false` when `robots` is `noindex`.
- `security`: explicit page-level direct external-origin and iframe-permission request for page-owned application source. Every list is empty by default and every requested capability must be permitted by the project security policy.

### Optional fields

- `translationKey`: stable lowercase ASCII kebab-case value shared only by
  explicitly authored managed-page translations. Each localized managed page
  remains a separate package with its own entry, assets, and `DESIGN.md`.

### Entry compatibility

- A `document` page may use `format: markdown` or `format: typescript`. The conventional Markdown path is `content.md`.
- A `presentation` page may use `format: markdown` or `format: typescript`. The conventional Markdown path is `slides.md`.
- An `application` page must use `format: typescript`; its conventional path is `src/main.ts`.
- A Markdown entry is parsed by the controlled managed-page Markdown adapter. It is not treated as arbitrary executable HTML.
- A TypeScript entry uses the repository-managed adapter and dependency allowlist. A page cannot provide its own package manager lifecycle script or bypass the compiler.
- Exactly one entry is declared. Other notes or sources may exist, but they do not become public unless the entry imports them through an approved adapter.

### Security declaration

`security.externalOrigins` accepts direct page-application requests for `frame`, `script`, `connect`, `image`, `style`, `font`, and `media`. Values are exact HTTPS origins without paths, queries, fragments, wildcards, credentials, or opaque URLs.

The compiler maps those keys to `frame-src`, `script-src`, `connect-src`,
`img-src`, `style-src`, `font-src`, and `media-src` respectively. This mapping is
part of the versioned contract; a new capability requires a schema and policy
change rather than accepting an unknown key.

- Empty arrays are the secure default.
- Page declarations request capability; they do not grant it. The managed-page compiler intersects them with `config/security.yaml` and rejects anything outside the project allowlist.
- `iframePermissions` uses the project-approved permission vocabulary and is empty by default.
- Raw inline scripts, event-handler attributes, remote module imports, `javascript:` URLs, secrets, signed URLs, and undeclared network requests are forbidden.
- Provider directives in a managed Markdown entry, when enabled, pass through `packages/embed-core/` under the same registry and fallback rules as post directives. A managed page compiler must not implement a second provider adapter.
- Provider requirements are declared and approved through `config/embeds.yaml`; authors do not duplicate provider origins in `page.yaml`. The compiler unions approved provider requirements with the page's approved direct requests.
- The aggregated emitted security requirements become part of the page artifact and provenance. The release verifier checks final document metadata, iframe attributes, and requested origins.

### Forbidden post fields

Do not add `category`, `tags`, `createdAt`, `updatedAt`, `related`, `readingTime`, or archive fields to `page.yaml`. Managed pages are not post records.

### Configuration behavior

- A `draft` page is omitted from production output unless an explicit preview build is requested.
- Preview output may contain draft and published pages; the production manifest type permits published pages only.
- `robots: noindex` must generate the appropriate robots directive even when the page is reachable by URL.
- A published route is stable. Route changes require an explicit redirect or compatibility plan.
- New page packages should initialize `returnTo` from `config/site.yaml`, but must store the chosen route explicitly in `page.yaml` so the destination remains reviewable.
- The page defines its own Open Graph and social metadata from `title`, `description`, and a real page-owned preview image when available.
- Do not use the site's generic social image when it misrepresents the managed page.
- A managed page is never automatically translated. When `translationKey` is
  present, only published sibling packages with the same key become language
  alternates; missing variants are not synthesized or linked.

## 18. Design contract

Every managed page has an uppercase `DESIGN.md` that is authoritative for its visual and interaction design. It is an Open Design-compatible source specification and is not rendered as public page content.

Read `DESIGN.md` completely before creating or modifying the page. It defines the following Open Design sections, extended with this project's accessibility, static-output, and print requirements:

1. status, scope, page kind, purpose, audience, and desired impression;
2. visual theme and atmosphere;
3. color palette and semantic roles;
4. typography rules and font fallback/licensing strategy;
5. spacing, layout, content hierarchy, and viewport behavior;
6. component styling and interaction states;
7. depth, elevation, motion, transitions, and reduced-motion behavior;
8. voice, imagery, iconography, and brand behavior;
9. responsive, keyboard, touch, focus, screen-reader, no-JavaScript, and print behavior;
10. do/do-not guardrails, protected decisions, agent prompt guidance, and provenance.

Rules:

- The managed page owns the viewport beneath the return control.
- The root blog `DESIGN.md` is not inherited. Open Design must use the managed-page directory and local `DESIGN.md` as its active project context.
- Do not import blog post typography or global page chrome merely for convenience.
- Shared resets and accessibility primitives are allowed only when they do not override the page's design contract.
- A design change and its implementation change must update `DESIGN.md` in the same task.
- Do not add design claims or brand assets that were not supplied or approved.
- Open Design is an authoring aid, not a production dependency. Generated exports must be reviewed, licensed, and promoted into maintained page source before use.

## 19. Return control

Every published managed page must expose a floating return link in the upper-left corner.

- The compiler-owned visible label follows `language`: `← Back` for `en`,
  `← 돌아가기` for `ko`, and `← 戻る` for `ja`. Authored content does not
  duplicate or override it.
- Destination: the exact internal route from `returnTo`.
- It must be a semantic `<a href>` link and work without JavaScript.
- It must be keyboard reachable, have a visible focus state, meet contrast requirements, and remain usable over the page's backgrounds.
- It must respect device safe areas and must not cover essential page content.
- It should remain visible while scrolling unless `DESIGN.md` specifies an equally reliable accessible treatment.
- It must be hidden in print output.
- The managed page may style the control through the stable shell variables below, but may not remove it or change its destination without updating `page.yaml`.
- The renderer, not authored page content, injects `<a data-managed-page-return>` so document, presentation, and application pages behave consistently.

The managed-page shell exposes only these stable styling hooks:

```css
:root {
  --managed-return-background: Canvas;
  --managed-return-color: CanvasText;
  --managed-return-border: currentColor;
  --managed-return-offset-inline: max(1rem, env(safe-area-inset-left));
  --managed-return-offset-block: max(1rem, env(safe-area-inset-top));
  --managed-return-radius: 999px;
}

[data-managed-page-return] { /* invariant compiler-owned element */ }
```

Pages may set the variables but must not replace the element, suppress its focus state, change its stacking behavior so it becomes unreachable, or override the compiler-owned print hiding. The compiler's shell stylesheet loads after page reset styles and before page-specific variable assignments.

Following the link loads the normal blog route and therefore restores the standard blog design. The managed page does not need to recreate or embed the blog layout.

## 20. Managed-page kinds

### Document

Use `kind: document` for profiles, resumes, reports, and print-oriented long-form pages.

- Primary content lives in `content.md` unless the approved implementation requires a custom TypeScript entrypoint.
- Important content must be present in the initial static HTML.
- Print styles must preserve reading order, links, headings, and meaningful graphics.
- Hide navigation, interactive-only decoration, animation, and the return control when printing.
- Avoid splitting headings from their following content and avoid clipping tables or project entries.
- A profile or resume must not be indexed unless the user explicitly selected `robots: index` after considering personal information exposure.

### Presentation

Use `kind: presentation` for slide-based or step-based experiences.

- Primary slide content lives in `slides.md` unless a custom entrypoint is required.
- Keyboard and touch navigation must be available when the presentation is interactive.
- Each slide or section must have a stable anchor or equivalent direct position when practical.
- Reduced-motion preferences must be respected.
- Without JavaScript, the initial HTML must expose the slides in a readable linear order or provide an equivalent complete fallback.
- Print or PDF output should render one coherent slide per page when the design calls for export.

### Application

Use `kind: application` for an interactive tool or single-page web application.

- Application source lives under `src/` and is written in TypeScript unless the chosen framework imposes another generated form.
- Client-side JavaScript may be required for the primary interaction.
- The initial HTML must still provide the page title, description, return link, loading state, and a concise explanation or fallback when JavaScript is unavailable.
- A runtime failure must not remove the return link.
- Do not add server, database, authentication, upload, or external-service requirements unless the user explicitly requests and authorizes them.
- Treat user input and external content as untrusted and apply appropriate validation and output escaping.

## 21. Managed-page assets

Page-owned source assets live in:

```text
managed-pages/<page-id>/assets/<asset-file>
```

Managed-page Markdown and configuration refer to them using:

```text
asset:/managed/<page-id>/<asset-file>
```

Example:

```markdown
![프로필 사진](asset:/managed/profile/headshot.jpg)
```

Rules:

- The path after `asset:/managed/<page-id>/` resolves inside that package's `assets/` directory and may not escape it.
- Page assets use the same provenance, license, secret, remote-download, hashing, optimization, and accessibility policies as post assets.
- Build output should collect managed-page assets under the managed namespace configured in `config/routes.yaml`, using stable asset IDs and artifact-relative paths before release URL resolution.
- A page-local font must include a valid license and fallback stack; do not copy an installed system font from a local machine.
- All blog and managed-page font files combined must remain within the 4 MiB
  published-font budget in `config/performance-budgets.yaml`.
- Downloadable resumes or PDFs are explicit managed assets and must have human-readable link text and a declared file size when practical.

## 22. Discovery and linking

- Managed pages are reachable by their configured URL and by intentional links authored elsewhere.
- Adding a managed page to blog navigation requires an explicit item in `config/navigation.yaml`; package scanning never creates navigation automatically.
- Do not automatically add them to the blog home, navigation, post lists, category pages, tag pages, archives, related-post recommendations, RSS, or the default post search index.
- A manual link may be added to any appropriate blog page or post when explicitly requested.
- `robots` and `sitemap` control search-engine discovery independently from blog navigation.
- A `noindex` page may still be accessible to anyone who has its URL; do not describe `noindex` as access control.
- Sensitive or private pages require real access control, which is a separate capability and must not be approximated with an obscure route.

## 23. Managed-page validation

Before reporting a managed page complete, verify:

- `page.yaml` and uppercase `DESIGN.md` exist and were read completely.
- The package directory, `id`, route, kind, status, entry source, and asset references agree.
- The declared entry exists, stays inside the package, and its format is compatible with the selected page kind.
- The route is unique, stable, root-relative, and does not collide with posts or system routes.
- The route and `returnTo` pass the shared route registry, reserved-route, and redirect checks.
- `robots` and `sitemap` express the user's intended exposure.
- No forbidden post taxonomy fields appear in `page.yaml`.
- The normal blog chrome and post layout are absent.
- The floating return link is present, functional without JavaScript, keyboard accessible, print-hidden, and points to `returnTo`.
- The page follows its own `DESIGN.md` at desktop, mobile, reduced motion, and print sizes when those modes apply.
- Open Design exports, external visual references, fonts, imagery, and icons have reviewed provenance and licenses before promotion into page source.
- Document and presentation content has a complete static or no-JavaScript reading path.
- An application provides meaningful initial HTML and a no-JavaScript fallback.
- Managed assets resolve inside the package and the production HTML contains no local machine or temporary paths.
- Declared external origins and iframe permissions are the minimum required subset of `config/security.yaml`; final HTML contains no undeclared request capability.
- The page is absent from post category, tag, archive, recommendation, RSS, and default search outputs.
- A production build contains no draft page record or draft-only asset, and a preview artifact cannot be accepted by release assembly.
- Standalone title, description, canonical URL, robots directive, and social metadata match the visible page.
- The assembled physical file path matches the normalized public `route` rather than the intermediate page-ID directory.
- No API key, access token, signed URL, private attachment URL, or unauthorized third-party asset is committed.

## 24. Managed-page completion report

After creating or updating a managed page, report:

- the package path and public route;
- the selected kind, status, robots policy, and sitemap policy;
- the entry source and `DESIGN.md` path;
- each copied or referenced managed asset;
- the return-link destination;
- important assumptions, privacy considerations, and unresolved items;
- the standalone-page validation result.

## 25. Content and presentation isolation

Content source, blog presentation, and managed pages are separate ownership boundaries governed by `ARCHITECTURE.md`.

### Post boundary

- Post Markdown describes semantic content and approved embeds only.
- Posts do not import UI components, templates, framework modules, or style sheets.
- Posts do not depend on blog CSS class names or generated public asset names.
- The content compiler emits sanitized, semantic, unstyled HTML and JSON metadata as separate `.artifacts/content/<mode>/` preview and production artifacts.
- The compiler attaches the validated shared original-work authorship
  declaration to every post artifact without injecting it into `bodyHtml`.
- Heading IDs and ordered table-of-contents metadata come from the same parsed
  heading nodes; post source never imports a TOC component or maintains a
  duplicate navigation list.
- The content compiler never creates the final static search index.
- Registered provider directives are handled through embed-core; posts and the compiler do not depend directly on provider packages.
- The blog application consumes that artifact and owns all post presentation.

### Blog presentation boundary

- The blog application may read only the runtime-validated content artifact, not `docs/` or `assets/content/` directly.
- Blog layouts and styles may change without rewriting post Markdown or managed-page source.
- Blog code must not infer undocumented metadata from source filenames or directories; the content artifact supplies normalized values.
- Blog code provides only provider-neutral embed presentation and optional progressive-enhancement hosting; it does not import provider plugins.
- Blog code emits the authorship declaration only as escaped custom metadata in
  each post document head; it must not fabricate visible/hidden body content or
  reinterpret the owner claim.
- The blog build emits final static HTML before the independent search stage indexes it.

### Search boundary

- The search indexer consumes final blog HTML and validated search-eligibility metadata.
- It does not read Markdown, render blog pages, derive taxonomy, or modify managed pages.
- Managed pages and drafts are excluded from the default index.
- The search manifest records the exact web artifact hash so a stale index cannot enter a release.

### Discovery boundary

- The site discovery builder consumes validated content, web, and managed-page manifests after final routes are known.
- It owns `sitemap.xml`, `robots.txt`, and one post-only RSS feed per language.
- It does not parse Markdown, render pages, expose a managed-page catalog, add managed pages to RSS, or modify upstream output.
- Its manifest records the exact input hashes so stale discovery files cannot enter a release.

### Managed-page boundary

- Each managed page owns its content, `DESIGN.md`, source, and assets as one package.
- Managed pages do not import blog layout, blog CSS, post components, or post taxonomy.
- The managed-page compiler emits complete standalone output to `.artifacts/managed/<mode>/`.
- The only shared visual invariant is the accessible return control described in this document; it is provided without importing blog presentation code.

### Release boundary

- Release assembly merges completed production web, search, managed, and discovery outputs into `dist/`.
- Assembly validates routes and assets but does not parse, restyle, or reinterpret content.
- A route collision is a build error and must not be resolved by silently renaming a published route.
- Mixed schema versions, incompatible provenance hashes, preview inputs, and stale search artifacts are build errors.

Changing an artifact contract requires coordinated updates to its producer, consumers, validation, `packages/contracts/`, `ARCHITECTURE.md`, and this document in the same change.

## 26. Executable validation and conformance

The runtime schemas in `packages/contracts/` will become the executable source of truth for cross-boundary artifact shapes. TypeScript types must be inferred from them, and producers and consumers must both validate at their respective write/read boundaries.

The contract test suite must include valid and invalid posts, malicious markup,
missing and escaping assets, complete and partial translation groups,
missing/mismatched translation groups, valid/invalid translation statuses,
attempted publication of an AI-draft translation, locale routing, absence of
browser-language redirects, active-language/English/Korean post-link fallback,
missing-fallback omission, original-route resolution, optional
original-language post-context metadata,
localized taxonomy,
English/Korean/Japanese search separation, Korean/Latin/`C++` heading anchors,
generated-ID collisions, explicit anchors, skipped heading levels, unresolved
fragments, heading-to-HTML/metadata parity, draft/published variants, all three
managed-page kinds, managed-page translation grouping, route collisions,
no-JavaScript output, print behavior, and deterministic golden artifacts. Embed
conformance also requires a synthetic test-only plugin plus unknown/disabled
directives, duplicate registrations, unsafe output, missing fallbacks, CSP
escalation, undeclared network access, and plugin-version provenance cases.

Authorship-disclosure conformance additionally requires the exact English
owner statement, original-work applicability, human primary creation,
proofreading-only AI scope, head-only escaped metadata, translation-provenance
independence, and rejection of overrides or expanded AI-assistance scopes.

Zod 4 is the approved runtime schema library. The current pure TypeScript
contract tests are executable, while producer/consumer runtime schemas, source
fixtures, integration commands, rendered-site checks, and release conformance
remain implementation work. Report only the suites actually run; do not treat
the passing provisional unit/contract suite as a completed site build.
