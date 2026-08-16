# Blog Web Application Boundary

This directory contains the Astro static web application boundary and the
complete blog presentation layer.

## Current scaffold

Only presentation primitives exist today: a semantic `BlogShell.astro`, the
classless stylesheet, localized message/original-language helpers, the GA4
adapter, and Open Graph/authorship helpers. There is no Astro configuration,
page directory, artifact loader, route generator, post/list renderer, image
pipeline, or web artifact writer. The statements below define the target
boundary for that future implementation; see the repository-root
`IMPLEMENTATION_STATUS.md` for the complete handoff matrix.

The repository-root `DESIGN.md` is the authoritative Open Design-compatible
visual contract for this application. It is read by people and design/coding
agents, not imported by runtime code or shipped as public content. Approved
tokens and assets are implemented inside this application. A change to blog
layout, typography, components, responsive behavior, motion, or visual assets
must update `DESIGN.md` in the same task.

`src/styles/classless.css` is the approved initial implementation. It styles
semantic elements directly, imports the pinned local Pretendard variable
dynamic-subset package, and uses system colors/fallbacks. `UX_FLOW.md` owns page
and navigation order; branded classes or a component framework must not replace
that static flow without a later approved design change.

Allowed inputs:

- interfaces from `packages/contracts/`;
- runtime-validated, read-only artifacts from `.artifacts/content/<mode>/`;
- validated shared route/locale configuration;
- validated optional analytics configuration, with only a public GA4
  Measurement ID exposed to the browser adapter;
- the reviewed root `DESIGN.md`, blog-specific implementation tokens, and web assets owned by this application.

Forbidden dependencies:

- direct filesystem reads from `docs/` or `assets/content/`;
- Markdown parsing or source-asset resolution;
- imports from `managed-pages/` or `packages/managed-page-compiler/`;
- assumptions about undocumented content artifact fields.

Changing this application may rerender the site, but must not require edits to post or managed-page source.

The completed application must render the required static route set for `en`,
`ko`, and `ja`.
`src/i18n/messages.ts` owns framework UI copy, while artifacts/config own post
text and taxonomy/navigation labels. Requested documents never redirect or
replace content based on browser language or stored preference. Every page
includes real published alternate links and Korean remains the unprefixed
no-JavaScript fallback. Post navigation uses the shared active-language,
English, then Korean resolver and labels a cross-language fallback.

`src/i18n/translation-origin.ts` compares the current artifact language with
required `originalLanguage` and resolves the original from validated published
alternates. This is presentation-neutral metadata for optional post-body
language context; it never accepts a handwritten URL, exposes review state, or
redirects the current route.

The completed application emits final static blog HTML to
`.artifacts/web/<mode>/`. Search indexing happens afterward in
`packages/search-indexer/` so indexed text matches the delivered HTML.

Post pages render their table of contents from the validated ordered
`HeadingArtifact[]`. The application must not parse Markdown or regenerate
heading slugs. It emits a semantic `nav` with normal fragment links in initial
HTML, verifies each target exists once in `bodyHtml`, and treats active-section
highlighting as optional progressive enhancement.

The framework-specific component must preserve this semantic shape (nested
lists are abbreviated here):

```html
<nav data-post-toc aria-labelledby="post-toc-label">
  <p id="post-toc-label">목차</p>
  <ol>
    <li><a href="#api-compatibility">API 호환성 유지하기</a></li>
  </ol>
</nav>

<article>
  <h2 id="api-compatibility">API 호환성 유지하기</h2>
</article>
```

Nested lists follow `parentId`, not visual indentation guesses. The TOC
container is excluded from final-HTML search indexing so navigation labels do
not duplicate article heading text in the index.

`src/seo/open-graph.ts` creates ordered, escaped per-post Open Graph records
from validated localized data. The authoring workflow has already obtained the
owner's representative-image choice. The web build follows that choice and
creates the `1200 × 630` social derivative plus crawlable `1:1`, `4:3`, and
`16:9` Article derivatives before the static `<head>` is rendered. It also owns
home-page `WebSite`, conditional public-author identity markup, pagination SEO,
responsive image presentation, and the stable favicon. No client script or
remote production service may add or repair these tags.

`src/seo/authorship-disclosure.ts` emits the validated English owner declaration
as custom `<meta>` records in each post's static `<head>`. It emits no visually
hidden body element, CSS hiding technique, JSON-LD `creditText`, or unsupported
SEO claim. The final-HTML search index ignores document-head metadata. Existing
translation-origin and review metadata remain independent.

External embeds arrive as sanitized semantic markup and framework-neutral records. The application may style a generic embed container and host approved progressive enhancement, but it must not import or contain provider-specific plugin logic.

Optional aggregate analytics is blog-owned progressive enhancement. The
framework shell wires `src/analytics/google-analytics.ts` to accessible consent
controls. It must pass `null` when `GA4_MEASUREMENT_ID` is absent, must not load
Google before consent, and must keep managed pages outside this integration.
