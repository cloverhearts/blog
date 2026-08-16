# SEO and Discovery Contract

## Scope

This document defines how the static blog and independently built managed pages
become discoverable. `CONTENT_RULES.md` remains authoritative for author-supplied
post and managed-page fields. `packages/site-discovery/` owns the final discovery
files.

## Canonical URL policy

- Every indexable HTML document emits exactly one absolute HTTPS canonical URL.
- Absolute URLs use the validated `SITE_ORIGIN` and `SITE_BASE_PATH` resolver.
- Directory routes follow the trailing-slash policy in `config/routes.yaml`.
- Query parameters, fragments, preview routes, aliases, and redirect pages are
  never canonical.
- Each English, Korean, and Japanese page canonicalizes to its own localized
  URL. Localized pages never canonicalize to the English variant.
- Each pagination page has a unique stable URL and canonicalizes to itself.
  Page 2 and later never canonicalize to the first listing page, and
  `/page/1/` is not emitted as a duplicate route.
- A production build fails when visible internal links, structured data, social
  metadata, RSS, or sitemap entries use a different origin/base path.

## Normal blog metadata

The blog renderer owns presentation of:

- unique document title and description;
- canonical link;
- robots directive;
- Open Graph and social-card fields;
- the correct `<html lang>` and reciprocal absolute `rel="alternate"
  hreflang="en|ko|ja"` links for every available translation;
- `Blog`, `BlogPosting`, `BreadcrumbList`, and other appropriate structured
  data derived from the same validated record rendered on the page.

The default blog identity and author display name come from `config/site.yaml`.
They are not copied into every post. A future multi-author feature requires an
explicit content-schema change rather than inferring authorship from Git history.

The home page emits one `WebSite` JSON-LD node with a stable `@id`, absolute
canonical `url`, configured `name`, and optional explicitly configured
`alternateName`. Its site name is consistent with visible home-page identity,
`og:site_name`, and document titles. Do not add the obsolete sitelinks-search
`SearchAction` merely because the blog has client-side search.

When a published managed profile route is explicitly configured as the public
author identity, it emits `ProfilePage` containing a stable `Person` node, and
`BlogPosting.author` references that same `Person` `@id` and URL. Until such a
public route exists, retain the display-name-only author and do not invent a
profile or social URL. A personal blog must not label its author as an
`Organization` merely to fill a publisher field.

Post pages use post-owned metadata and a real post image when available. They
must not silently inherit a generic social image that misrepresents the post.
Category, tag, archive, search, and 404 pages have route-specific titles and
descriptions; search-result and 404 documents are `noindex`.

Every indexable page has one concise visible page-level heading consistent with
its localized title. Avoid repetitive title boilerplate and do not mix scripts
or languages in a title unless the visible subject requires it. `meta keywords`,
AMP, and a separate mobile URL tree are not part of this project.

Every post additionally emits the owner-declared English authorship statement
from its validated artifact as custom document-head metadata named
`content-authorship-disclosure`, with companion values for claim source,
original-work applicability, human primary creation, and proofreading-only AI
assistance. This data is not a ranking or independent trust signal. It is not
inserted as visually hidden body text and is not added to `BlogPosting` JSON-LD
or `creditText`, because structured-data claims must represent reader-visible
content. It is excluded from descriptions, Open Graph, RSS, and search text.

## Per-post Open Graph contract

Every published localized post emits a complete Open Graph object in its
initial static `<head>`. The document declares the `og` and `article` namespace
prefixes (`https://ogp.me/ns#` and `https://ogp.me/ns/article#`). The core
properties appear once and in this relative order:

1. `og:title` from the localized post title;
2. `og:type` with `article`;
3. `og:image` from the resolved post-specific social derivative;
4. `og:url` equal to the localized absolute canonical URL.

Each post also emits `og:description`, `og:locale`, one
`og:locale:alternate` for each other published language, and `og:site_name`.
The locale values come from `config/site.yaml` in `language_TERRITORY` form.
The image root tag is immediately followed by `og:image:secure_url`,
`og:image:type`, `og:image:width`, `og:image:height`, and non-empty localized
`og:image:alt`.

Article metadata includes `article:published_time`, optional
`article:modified_time`, localized `article:section`, and one localized
`article:tag` per tag. It does not emit `article:author` until a durable public
profile URL is explicitly configured; a display name alone is not fabricated
into a profile URL.

The required `representativeImage` field records the owner-approved mode:
explicit `socialImage`, cover, or a deterministic `1200 × 630` post-specific
card generated by the blog web build. The approval workflow is defined in
`CONTENT_RULES.md`; the renderer follows that field and never makes a new
editorial choice or silently falls through to another source.
The generated-card mode uses the localized post record and approved root `DESIGN.md`;
it is not a shared generic image. All image output is local, content-addressed,
and available before HTML rendering. Production does not call a remote image
service. If no valid image can be resolved or generated, the post build fails
rather than emitting incomplete or misleading Open Graph metadata.

From the approved representative source, the web build also emits crawlable,
high-resolution `1:1`, `4:3`, and `16:9` derivatives and lists them in
`BlogPosting.image`. These files are content-addressed, accurately represent
the visible article, and remain reachable without JavaScript. Destructive crops
that remove the approved subject, meaningful text, or a face are build/review
failures.

Every URL is absolute HTTPS and resolved through the same origin/base-path
logic as canonical links. Metadata values are HTML-attribute escaped, do not
contain secrets or signed URLs, and are never injected by client JavaScript.
Other social-card protocols may derive from this same validated record later;
they must not introduce a second authoring source.

## Multilingual discovery

- English is unprefixed and is also the `hreflang="x-default"` target. Korean
  uses `/ko/` and Japanese uses `/ja/`.
- Each normal blog translation declares itself and every other published
  variant. Alternate relationships are reciprocal and use fully qualified
  canonical URLs.
- Every localized page contains one visible language and same-language chrome;
  translated text is never hidden in one combined document.
- All variants are reachable through normal `<a>` links. Browser detection is
  progressive enhancement that may perform one same-site navigation from an
  unprefixed route to an existing alternate; it never swaps article content in
  place and must respect prefixed and explicit/persisted selection as specified
  in `I18N.md`.
- HTML links are the authoritative `hreflang` implementation. The sitemap lists
  each canonical localized route but does not duplicate alternate annotations.
- Structured data uses the visible page language and localized canonical while
  preserving the same translation-group identity where an identifier is useful.
- Every `BlogPosting` declares the current variant through `inLanguage`.
  Translated variants use Schema.org `translationOfWork` with the original
  variant's canonical `@id`; the original may use `workTranslation` for its
  published translations. Do not emit a `translator` unless the responsible
  person or organization is explicitly known and authorized for publication.

## Managed-page metadata

The managed-page compiler emits metadata from `page.yaml` and real page-owned
assets. A managed page does not inherit post metadata or taxonomy.

- `robots: noindex` always emits a noindex directive.
- `sitemap: true` is honored only when the page is published and indexable.
- A page uses its own title, description, canonical URL, social metadata, and
  structured-data type appropriate to its visible content.
- A profile/resume normally maps to `ProfilePage` plus `Person`, an interactive
  published tool may map to `SoftwareApplication`/`WebApplication`, a
  presentation or project artifact may map to `CreativeWork`, and a generic
  standalone document remains `WebPage`. Markup is omitted when the visible
  content does not support the selected type.
- Profiles and resumes require an explicit exposure decision; `noindex` is not
  access control.

## Discovery documents

`packages/site-discovery/` generates:

- `sitemap.xml` from canonical published blog routes plus eligible managed
  pages;
- `robots.txt` with the absolute sitemap location and explicit crawler policy
  generated from `config/ai-crawlers.yaml`;
- `llms.txt` with a concise AI-oriented site guide, canonical language homes,
  sitemap/feed links, intentional navigation, eligible managed pages, and
  interpretation/citation guidance;
- `/rss.xml`, `/ko/rss.xml`, and `/ja/rss.xml` from same-language published
  posts only.

AI search, user-directed retrieval, training/model-development, and public
dataset crawlers remain explicitly allowed for public, indexable content. This
includes `GPTBot`, `ClaudeBot`, `Google-Extended`, and Common Crawl's `CCBot`;
unlisted crawlers inherit the open wildcard policy. Provider User-Agent names
are verified against current official documentation whenever the registry
changes. Crawler access and the `dataUse` declaration express operational
intent but do not replace applicable copyright or license terms.

`llms.txt` is an optional proposal, not a formal permission mechanism or a
replacement for `robots.txt`, page-level robots metadata, canonical HTML, or a
license. It never contains raw Markdown, drafts, previews, search-index data,
private/noindex routes, or every post; the sitemap remains the complete
canonical route inventory. See `AI_DISCOVERY.md` for the full contract.

The sitemap excludes drafts, previews, redirects, aliases, search results, 404,
assets, and `noindex` pages. RSS excludes managed pages, even when they are
indexable.

Sitemap `lastmod` is emitted only from a real `updatedAt` or `createdAt` content
value and never from an incidental build time. `robots.txt` must not block CSS,
JavaScript, fonts, content images, social images, or other resources needed to
understand an indexable page. Empty category/tag pages and alternate sort or
filter URLs are not emitted as indexable pages.

## Image discovery and site identity assets

- Every meaningful content image has localized purpose-based alternative text,
  intrinsic dimensions, crawlable `src`, and responsive `srcset`/`sizes` when
  derivatives exist.
- The primary above-the-fold image is not lazy-loaded. Eligible below-the-fold
  images and iframes may use native lazy loading, but no indexable image depends
  on a click, custom scroll event, or hidden client-rendered duplicate.
- The site exposes a stable crawlable favicon through `<link rel="icon">`.
  It is square and has at least one `48 × 48` or larger multiple-of-48 raster
  variant; application/touch icons may derive from the same approved identity
  asset.
- An image sitemap is deferred unless launch monitoring shows that important
  images cannot be discovered through their owning HTML pages.

## Search engine registration and monitoring

After the custom domain is configured, the owner verifies a Google Search
Console Domain property using a Route 53 DNS TXT record and submits the emitted
`/sitemap.xml`. This external operational state never enters post frontmatter.
The launch and recurring checks cover Page Indexing, sitemap processing, URL
Inspection for representative routes, Core Web Vitals, rich-result/
structured-data reports, security issues, and manual actions. A deployment is
not described as indexed merely because the files exist on GitHub Pages.

Rich Results Test and URL Inspection are run against representative home,
post, pagination, profile, and other indexed managed-page routes. Structured
data must describe visible content, and eligibility never guarantees that a
rich result will appear.

## Redirect limitations

GitHub Pages cannot provide application-defined HTTP 301 responses. Static
compatibility pages use canonical/noindex metadata, an immediate client redirect,
and a visible normal link. Stable public slugs and routes are therefore a core
SEO requirement.

## Required validation

A production check verifies:

- one title, description, canonical, and robots policy per HTML document;
- one consistent home-page `WebSite` node and, when configured, one resolvable
  public `Person` identity shared by profile and `BlogPosting.author`;
- unique canonical URLs and no route collisions;
- post-specific metadata on representative post routes;
- exactly one complete per-post Open Graph core set, correct `article:*`
  fields, ordered image structured properties, escaped content, and a
  resolvable post-specific `1200 × 630` image;
- crawlable `1:1`, `4:3`, and `16:9` Article image derivatives from the approved
  representative source, plus valid responsive body-image attributes and
  non-lazy primary imagery;
- managed-page-specific metadata on every published managed page;
- valid structured data referencing the visible record;
- sitemap/RSS XML parseability and only eligible canonical URLs;
- reciprocal `en`/`ko`/`ja`/`x-default` alternate links, self canonicals, valid
  document language, loop-free browser-language navigation, and no
  mixed-language page chrome;
- `originalLanguage` parity across each group, an existing original canonical,
  valid `translationStatus` with no published `ai-draft`, and correct
  `inLanguage`/`translationOfWork`/`workTranslation` relationships;
- one escaped English owner-declared authorship meta record per post with exact
  granular values, and no matching hidden body markup, JSON-LD property,
  snippet/feed field, or search-index text;
- stable sequential pagination links using normal anchors, unique page routes,
  self canonicals, and no `/page/1/` duplicate;
- `robots.txt` references the emitted sitemap;
- `robots.txt` matches the validated AI crawler registry, leaves required
  render assets crawlable, and points readers to the emitted `llms.txt`;
- `llms.txt` is deterministic, contains only absolute HTTPS canonical links,
  includes the expected language/discovery guidance, and leaks no source,
  draft, local path, or build timestamp;
- sitemap `lastmod` values reflect authored dates rather than build time, and
  required render/image/font assets remain crawlable;
- a stable favicon and appropriate content-matching managed-page structured
  data are present;
- no preview origin, local path, repository URL, or wrong base path appears;
- internal links and media references resolve in the assembled release.
