# CloverHearts Blog Design System

## Status and scope

- Status: approved classless baseline; branded visual direction is deferred.
- Scope: the normal blog experience rendered by `apps/blog-web/`.
- Excluded scope: every package under `managed-pages/`; each managed page owns
  its own local `DESIGN.md` and does not inherit this file.
- Runtime role: source specification for people, Open Design, and coding agents.
  This file is not shipped as page content and is not read in the browser.

This document follows the portable `DESIGN.md` approach used by Open Design. It
is intentionally a source-level brand and interface contract rather than a
framework configuration file. Open Design may create or refine the values in
this file, but the repository remains buildable without an Open Design daemon,
CLI, MCP server, account, or network connection.

## 1. Visual theme and atmosphere

The initial design is a restrained, classless reading interface. Semantic HTML
receives useful defaults without a component-class visual system. Until a later
owner-approved brand direction replaces it:

- optimize first for calm, long-form reading in English, Korean, and Japanese;
- keep post content visually primary over navigation and decoration;
- do not introduce a generic AI-product aesthetic, decorative gradients,
  glassmorphism, excessive cards, or invented brand motifs;
- keep the blog visually coherent while allowing managed pages to be completely
  independent experiences;
- use native system colors, visible underlines, borders, whitespace, and type
  hierarchy instead of decorative surfaces or brand imagery.

## 2. Color palette and semantic roles

The classless baseline follows the browser/operating-system light or dark
preference through `color-scheme: light dark` and CSS system colors. It defines
no independent brand palette. A later palette must retain these semantic roles.

| Role          | Value                               | Purpose                           |
| ------------- | ----------------------------------- | --------------------------------- |
| `canvas`      | `Canvas`                            | Page background                   |
| `surface`     | `Canvas`                            | Grouped content without elevation |
| `text`        | `CanvasText`                        | Primary reading text              |
| `text-muted`  | `GrayText`                          | Secondary information             |
| `border`      | `color-mix(CanvasText 22%, Canvas)` | Dividers and controls             |
| `accent`      | `LinkText`                          | Links and primary actions         |
| `focus`       | `Highlight`                         | Keyboard focus indicator          |
| `code-canvas` | `Canvas` + border                   | Code block background             |
| `danger`      | system error semantics              | Destructive or invalid state      |

Every approved combination must meet the accessibility target in
`QUALITY_GATES.md`. Do not use color as the only carrier of meaning.

## 3. Typography rules

- Korean and English are the primary typography and UX review languages.
- `Pretendard Variable` is the normal blog's primary UI/body family, supplied
  by the pinned `pretendard` npm package and bundled by the web build. Production
  HTML does not load a font stylesheet from a public CDN.
- Use the variable dynamic subset so a document requests only the glyph slices
  it uses. The initial route font transfer must meet
  `config/performance-budgets.yaml`.
- The fallback order is Pretendard, Apple/system UI sans-serif, then generic
  `sans-serif`. Japanese remains supported and receives Japanese system-font
  fallbacks before Pretendard where available.
- Display, body, and UI use the same family in this baseline. Code uses the
  platform monospace stack.
- Body line height is `1.65`, heading line height is `1.25`, and the reading
  measure is at most `48rem`. Browser defaults provide the remaining type scale.

Post body text remains readable with all custom fonts blocked. Pretendard is
distributed under the SIL Open Font License; its exact package version is
locked. Any copied font file and license would belong under the blog web layer,
never `docs/`.

## 4. Spacing and layout principles

The baseline uses a fluid `1rem`–`1.5rem` page gutter, a `72rem` page frame,
and a `48rem` reading measure. Navigation wraps naturally without a hamburger
dependency. It introduces no grid or ornamental spacing scale; a future Open
Design pass may refine these values without changing `UX_FLOW.md`.

Invariant layout requirements:

- primary post content follows a single, understandable reading order;
- navigation remains usable without JavaScript;
- headings and anchors are not obscured by sticky interface elements;
- tables, code blocks, media, and embeds do not force page-wide horizontal
  scrolling;
- safe-area insets are respected where controls touch viewport edges.
- target headings use sufficient `scroll-margin-block-start` so fragment
  navigation is not hidden beneath sticky blog chrome.

## 5. Components and interaction states

The baseline styles semantic elements directly from
`apps/blog-web/src/styles/classless.css`; data attributes are reserved for
state/accessibility hooks such as the skip link and analytics consent. It does
not create card, stack, grid, or utility class vocabularies. The rendered HTML
and `UX_FLOW.md` must provide at least:

- global header, skip link, and primary navigation of Posts, Categories,
  Tags, and Search;
- a footer secondary Archive link that is not duplicated in the header;
- post header, metadata, table of contents, body, and related-post links;
- one optional compact post-language context region that may link the authored
  original;
- category, tag, archive, and pagination/list items with the localized
  `description` and a 16:9 thumbnail (explicit override or representative
  fallback), using empty image `alt` when the adjacent title shares the
  same link;
- search form, results, empty state, and no-JavaScript state;
- links, buttons, inputs, code blocks, tables, quotes, notices, and downloads;
- local media and provider-neutral embed containers;
- 404 and other system states.
- a persistent language switcher with real `en`, `ko`, and `ja` links, a clear
  current-language state, and labels understandable without flags alone;
- visibly and programmatically labeled fallback-language post summaries when a
  collection cannot link to its active-language variant;
- deterministic `1200 × 630` post-specific social cards for posts without a
  user-approved `socialImage` or cover when deterministic card generation was
  the owner-selected representative-image mode;
- safe-crop rules for `1:1`, `4:3`, and `16:9` Article image derivatives and a
  stable square favicon/identity asset.

Every interactive component documents default, hover, focus-visible, active,
disabled, loading, empty, and error states when applicable. Hover must not be
the only way to discover an action.

The post table of contents is generated as semantic navigation in the initial
HTML. It uses normal fragment links supplied by the content artifact and works
without JavaScript. The approved design must define:

- a localized visible label and accessible name (`Table of contents`, `목차`,
  or `目次`);
- nested list treatment that preserves heading hierarchy without relying on
  indentation alone;
- desktop placement and a compact small-screen treatment that never hides the
  only navigation path behind JavaScript;
- current-section highlighting only as optional progressive enhancement;
- fragment-link focus, target-heading visibility, long-label wrapping, and
  print behavior.

When a post has fewer than two eligible headings, the renderer may omit the TOC
container while retaining heading IDs and direct fragment navigation. Sticky
behavior must not cover article content and must not be required to understand
the hierarchy.

A post may place one compact language-context region after the article body. It
may identify and link the authored original. It never exposes review status or
redirects the current route. When present, it must not rely on an icon, tooltip,
or color alone and must remain legible in print.

Social cards are presentation assets owned by this design system. The baseline
uses a plain light canvas, dark text, one neutral border, Pretendard with locale
fallbacks, a small site/category line, and the localized post title inside a
fixed safe area. It contains no body excerpt, logo, portrait, illustration,
gradient, or decorative texture. The renderer wraps without splitting a word
when possible and truncates only after the tested locale-specific line limit.
Open Design may later refine these values with approval. Cards remain legible
at small preview sizes, and identical validated inputs produce identical pixels.

Representative-image selection itself is editorial and follows
`CONTENT_RULES.md`; this design contract only controls rendering after owner
approval. Derivative crops preserve the approved focal subject, meaningful
text, and faces. If one source cannot satisfy every required ratio, the design
provides padding/background treatments or asks for a separately approved source
rather than applying a misleading crop.

## 6. Depth, elevation, and motion

The baseline uses no elevation, shadow, overlay, decorative animation, or
autoplay motion. Borders and document flow communicate grouping. If a later
visual direction introduces motion:

- use the smallest surface hierarchy that communicates structure;
- define shadows, borders, overlays, and sticky layers as tokens;
- keep reading and navigation usable when animation is disabled;
- respect `prefers-reduced-motion` and avoid essential information conveyed
  only through animation;
- do not add autoplaying decorative motion to post pages.

## 7. Voice, content presentation, and brand behavior

- The interface voice is concise, calm, and direct.
- UI labels do not exaggerate, advertise, or invent authority.
- Post prose remains owned by Markdown content and is not rewritten by the
  presentation layer.
- Korean is the default and no-JavaScript fallback language. English and
  Japanese are equal first-class static experiences. Latin code, paths, and
  identifiers must remain legible within Korean and Japanese text.
- Navigation, pagination, search, taxonomy, consent, error, and accessibility
  copy must come from the active locale; components must not hard-code Korean.
- Dates, categories, tags, reading time, and related links are presented from
  validated artifacts rather than inferred in components.

## 8. Responsive, accessibility, and print behavior

The classless baseline is fluid and needs no layout breakpoint: navigation
wraps and document widths use `min()`/`clamp()`. A richer design must define
concrete breakpoints and component transformations and satisfy
`QUALITY_GATES.md`.

- The site works with keyboard, touch, zoom, and screen readers.
- Focus is visible and reading order matches DOM order.
- Post content and primary navigation are present without client-side
  JavaScript.
- Small screens retain full post meaning and usable navigation.
- Language switching remains keyboard/touch accessible and shows the current
  language without relying on color. Browser language never redirects or
  replaces the requested document; explicit language changes use normal links.
- Print output removes nonessential navigation and preserves article hierarchy,
  URLs, code, tables, and meaningful media.
- Light/dark follows the operating-system preference through CSS system colors;
  a branded palette or manual theme control requires later approval.

## 9. Do, do not, and protected decisions

Do:

- derive implementation tokens from approved values in this file;
- prefer semantic HTML and CSS over client-side layout logic;
- use representative English, Korean, and Japanese content—including long
  labels and mixed-script code—when reviewing layouts;
- check a post, taxonomy page, search page, and 404 page in all three languages
  before accepting a system-wide design change.

Do not:

- copy the visual identity or proprietary assets of a third-party brand without
  authorization;
- make a downloaded Open Design package authoritative without reviewing its
  license, provenance, fonts, imagery, and anti-patterns;
- apply this design automatically to a managed page;
- introduce a visual token only in component code without recording it here;
- change content metadata or Markdown authoring rules through a visual change.

Protected decisions requiring owner approval:

- primary palette and accent;
- font families and externally hosted fonts;
- logo, wordmark, portrait, or signature brand imagery;
- any override of the approved operating-system light/dark behavior;
- major home-page composition and navigation model.

The current classless values are an approved temporary baseline, not approval
for an agent to invent branded replacements. `UX_FLOW.md` owns the current
home, discovery, reading, search, recovery, and managed-page transition flow.

## 10. Open Design handoff and agent prompt guide

When using Open Design for the blog:

1. Use the repository root as the project and this file as the active design
   system.
2. Preserve the status, scope, invariants, accessibility requirements, and
   protected decisions above.
3. Fill pending tokens only from an owner-approved direction or supplied brand
   evidence.
4. Keep optional Open Design exports under `design/open-design/` until reviewed.
5. Promote approved runtime tokens to the blog application's style source; do
   not make production builds call Open Design.
6. Update this file in the same change as a system-wide visual implementation
   change.
7. Record third-party design-system provenance and license in the section below.

For a managed page, open that page directory as the Open Design project and use
its local `DESIGN.md`; never use this root file as an implicit fallback.

## Provenance and licenses

- Pretendard `1.3.9`, by Kil Hyung-jin and contributors, is consumed from the
  pinned npm package under the SIL Open Font License 1.1. The web build imports
  `dist/web/variable/pretendardvariable-dynamic-subset.css`; no font files are
  modified and no CDN is contacted at runtime.

No external design system, icon library, or brand asset has been adopted yet.
Record each future source, version or commit, license, local asset path, and
material modification here before use.
