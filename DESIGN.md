# CloverHearts Blog Design System

## Status and scope

- Status: draft; visual direction has not yet been selected by the owner.
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

The final visual direction is pending owner approval. Until it is selected:

- optimize first for calm, long-form reading in English, Korean, and Japanese;
- keep post content visually primary over navigation and decoration;
- do not introduce a generic AI-product aesthetic, decorative gradients,
  glassmorphism, excessive cards, or invented brand motifs;
- keep the blog visually coherent while allowing managed pages to be completely
  independent experiences.

## 2. Color palette and semantic roles

The palette is not selected yet. Open Design must record approved colors here
with semantic roles rather than component-specific names.

Required roles before implementation:

| Role | Value | Purpose |
| --- | --- | --- |
| `canvas` | pending | Page background |
| `surface` | pending | Raised or grouped content |
| `text` | pending | Primary reading text |
| `text-muted` | pending | Secondary information |
| `border` | pending | Dividers and control boundaries |
| `accent` | pending | Links and primary actions |
| `focus` | pending | Keyboard focus indicator |
| `code-canvas` | pending | Code block background |
| `danger` | pending | Destructive or invalid state |

Every approved combination must meet the accessibility target in
`QUALITY_GATES.md`. Do not use color as the only carrier of meaning.

## 3. Typography rules

Typography is not selected yet. Open Design must define:

- Korean, Japanese, and Latin body font stacks;
- display, body, UI, and monospace roles;
- locally hosted or system-font fallback behavior;
- font weights actually loaded by the site;
- fluid or stepped type sizes for headings and body text;
- line height, measure, letter spacing, and code typography;
- failure behavior when a web font cannot load.

Post body text must remain readable with all custom fonts blocked. Licensed
font files belong under `apps/blog-web/assets/`, not in `docs/`.

## 4. Spacing and layout principles

Open Design must define the spacing scale, content width, grid, gutters,
breakpoints, and vertical rhythm before broad UI implementation.

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

The approved system must specify at least:

- global header, navigation, footer, and skip link;
- post header, metadata, table of contents, body, and related-post links;
- one compact post-footer original-work reference on translated variants,
  containing only the original language and original-post link;
- category, tag, archive, and pagination/list items;
- search form, results, empty state, and no-JavaScript state;
- links, buttons, inputs, code blocks, tables, quotes, notices, and downloads;
- local media and provider-neutral embed containers;
- 404 and other system states.
- a persistent language switcher with real `en`, `ko`, and `ja` links, a clear
  current-language state, and labels understandable without flags alone.
- a local browser-language bootstrap whose automatic navigation never obscures
  the persistent real-link language switcher or creates a redirect loop;
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

A translated post places one compact original-work reference after the article
body. It contains only the original language and a real link to the original;
the post header contains no translation banner or review-status message. The
footer reference must not rely on an icon, tooltip, JavaScript, or color alone,
and it must remain legible in print. The source-language post omits it.

Social cards are presentation assets owned by this design system. Open Design
must define their background, typography, spacing, safe area, site identity,
category treatment, title wrapping/truncation, and English/Korean/Japanese font
fallbacks before the generated-card renderer ships. Cards must remain legible
at small preview sizes, avoid body excerpts and decorative clutter, and never
invent a logo, portrait, or illustration. Identical validated inputs must
produce identical pixels.

Representative-image selection itself is editorial and follows
`CONTENT_RULES.md`; this design contract only controls rendering after owner
approval. Derivative crops preserve the approved focal subject, meaningful
text, and faces. If one source cannot satisfy every required ratio, the design
provides padding/background treatments or asks for a separately approved source
rather than applying a misleading crop.

## 6. Depth, elevation, and motion

No elevation or motion style is approved yet. When selected:

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
- English is the default and no-JavaScript fallback language. Korean and
  Japanese are equal first-class static experiences. Latin code, paths, and
  identifiers must remain legible within Korean and Japanese text.
- Navigation, pagination, search, taxonomy, consent, error, and accessibility
  copy must come from the active locale; components must not hard-code Korean.
- Dates, categories, tags, reading time, and related links are presented from
  validated artifacts rather than inferred in components.

## 8. Responsive, accessibility, and print behavior

Open Design must define concrete breakpoints and component transformations. The
implementation must also satisfy `QUALITY_GATES.md`.

- The site works with keyboard, touch, zoom, and screen readers.
- Focus is visible and reading order matches DOM order.
- Post content and primary navigation are present without client-side
  JavaScript.
- Small screens retain full post meaning and usable navigation.
- Language switching remains keyboard/touch accessible and shows the current
  language without relying on color. Automatic browser-language navigation is
  limited to an existing alternate from an unprefixed route and cannot loop.
- Print output removes nonessential navigation and preserves article hierarchy,
  URLs, code, tables, and meaningful media.
- Dark mode is implemented only after both palettes and media behavior are
  explicitly approved here.

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
- default light/dark behavior;
- major home-page composition and navigation model.

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

No external design system, font, icon library, or brand asset has been adopted
yet. Record each adopted source, version or commit, license, local asset path,
and material modification here before use.
