# CloverHearts Labs Design System

## Status and scope

- Status: approved and implemented Open Design “Refined Current 01” direction.
- Scope: the normal static blog rendered by `apps/blog-web/`.
- Excluded: every package under `managed-pages/`; each managed page owns its
  local `DESIGN.md` and never inherits this system.
- Runtime: this is the Open Design-compatible source of truth for people and
  implementation agents. Production does not require Open Design software or a
  network service.

The site is a Korean-first editorial technical blog for CloverHearts, an
**AI Workflow Engineer**. Its identity is “clear engineering notes”: bright,
precise, calm, and human. The visual system supports real posts and validated
artifacts; it never invents projects, metrics, testimonials, or publication
content to fill a layout.

## 1. Visual direction

The normal experience uses a white editorial canvas, clear green accents,
measured type hierarchy, fine rules, numbered log rows, and generous
whitespace. It should feel more like a carefully edited technical journal than
a SaaS landing page. Faint workflow geometry may overlap the hero as atmosphere,
but the written message always remains the primary visual object.

Use:

- white space and typographic contrast as the primary hierarchy;
- one clear-green accent family for actions, status, and identity;
- pale mint surfaces only for meaningful grouping;
- restrained technical diagrams or terminal motifs made from local CSS/HTML;
- straight edges or minimal `4px` rounding.

Avoid gradients, glassmorphism, decorative blur, excessive cards, large rounded
containers, generic AI imagery, stock dashboard graphics, and animation that
competes with reading. A surface is introduced only when a divider or spacing
cannot communicate the relationship clearly.

## 2. Color tokens

| Token | Light value | Role |
| --- | --- | --- |
| `--bg` | `#FFFFFF` | page and article canvas |
| `--surface` | `#F6FBF8` | quiet grouped region |
| `--text` | `#17211C` | primary text |
| `--muted` | `#66736C` | descriptions and secondary UI |
| `--tertiary` | `#829089` | dates and low-emphasis metadata |
| `--primary` | `#12B76A` | identity and primary emphasis |
| `--primary-dark` | `#087A4F` | accessible links and controls |
| `--mint` | `#36D399` | terminal and small highlights |
| `--primary-surface` | `#ECFDF3` | featured/quote background |
| `--border` | `#DDE7E1` | normal rules |
| `--border-strong` | `#C7D5CD` | controls and strong rules |
| `--code-bg` | `#101A15` | terminal/code canvas |
| `--code-text` | `#EAF7EF` | code text |

The dark palette follows `prefers-color-scheme: dark` and preserves the same
semantic roles. Green is never the sole carrier of state. Text, icons, labels,
or structure must also communicate meaning. Every interactive combination must
meet WCAG 2.2 AA contrast targets.

## 3. Typography

- Primary UI and reading family: `Pretendard Variable`, bundled from the pinned
  npm dependency using its dynamic subset; no public font CDN.
- Fallbacks: Pretendard, Apple/system UI sans-serif, then `sans-serif`.
- Japanese: Hiragino Sans and Yu Gothic UI precede Pretendard when available.
- Code: the platform monospace stack.
- Article body: the selected “spacious journal” hierarchy uses `18px` with
  `1.82` line height on wide screens, `17px` with `1.78` on compact screens,
  and a maximum `40rem` measure.
- General interface: `16px`, approximately `1.7` line height.
- Display headings: tight `1.06–1.24` line height and modest negative tracking.
  The home hero uses weight `620`; post, collection, and list titles use `600`
  so large Korean glyphs retain clear internal space instead of appearing
  overly dense. Supporting headings generally use `620`.

Korean is the primary readability reference, with English and Japanese treated
as equal static experiences. Long mixed-script identifiers, paths, and inline
code must wrap without collapsing the reading column. Body copy remains
readable when custom fonts fail.

## 4. Page frame and navigation

The desktop frame is at most `76rem` plus fluid gutters. The header is sticky,
white, and separated by one fine rule. It contains:

1. `CloverHearts Labs` wordmark link;
2. All Posts, Selected Work, Daily Notes, Explore, and Search;
3. explicit KO, EN, and JA links with a non-color current state.

The footer contains only the site identity, localized description, and optional
analytics controls; it has no copyright line, Profile navigation, or Archive
navigation.
Primary navigation uses real links and works without JavaScript. On compact
screens it becomes a horizontally scrollable second row; the language links
remain visible. The DOM reading order is unchanged.
The wordmark and language selector share a `44px` minimum row and the same
vertical center. The named inner-header container uses `border-box`, keeping
its declared width and fluid gutters inside the viewport without styling
browser-injected controls.
At the two-row header breakpoint, both controls are centered inside an explicit
`64px` first grid row. The primary-navigation row follows without an additional
grid gap, preventing its reserved second row from pulling the first-row content
above the visible center.
Every primary and language-navigation link uses the same centered `44px`
interaction row. The active primary navigation state adds an independently
positioned `1px` line approximately `5–6px` below the label, so selection never
changes the label's height or vertical baseline. In the compact second row,
every link keeps the same `48px` interaction height. Category and tag filter
group labels share a `1.5` line-height baseline with their selectable items.
The group labels retain full opacity, while selectable category and tag links
rest at `50%` opacity and return to `100%` on hover or keyboard focus. Their
pressed state uses the shared `68%` opacity feedback.

## 5. Home page

The hierarchy is fixed:

1. Hero
2. horizontal author introduction
3. featured post
4. recent posts
5. selected work

Desktop hero gives the message roughly `82%` of the frame and lets a pale,
slightly rotated workflow trace occupy the right side behind it. The supporting
paragraph remains substantially narrower so the title, description, and single
underlined all-posts link form one clear reading path. The workflow trace is
decorative and hidden from assistive technology.

On mobile, the canvas remains white. The workflow trace becomes larger, fainter,
and partially cropped behind the copy; it never becomes a dark terminal surface
or an essential source of information. The title, description, and link retain
their source order and contrast without the visual.

The author row immediately establishes CloverHearts and the role “AI Workflow
Engineer,” and keeps `1rem` of trailing space after its Profile action so the
link does not touch the frame edge. Featured content gets one pale-mint
editorial feature. Featured,
Recent Posts, and Selected Work are separated from the preceding content by one
responsive `3.5rem–5rem` block margin rather than a decorative top divider or
stacked margin and padding. Recent Posts and Selected Work deliberately share
one section-heading pattern and the same thin ruled log rows with a two-digit
sequence, copy, and optional thumbnail. Empty states use localized, honest
copy; no dummy project is created.

On wide screens the featured post uses an equal two-column composition: the
approved or generated visual occupies the left half and the editorial summary
occupies the right half. Both halves share one continuous pale-mint surface and
the visual fills its half with `object-fit: cover`. At compact widths the visual
and summary stack in the same source order.

The hero owns its minimum height and responsive block padding through its named
`border-box` container, so padding does not create an unintended second band of
empty space. The home page uses a compact `2.5rem–4rem` final content inset and
a separate `2.5rem–4rem` footer transition; this preserves section hierarchy
without producing an oversized blank area before the footer.

## 6. Lists, discovery, and recovery

Post lists show only validated title, description, category, date, reading time,
language fallback, and optional approved/derived thumbnail data. Filters contain
only taxonomy values present in the current artifact; empty links are forbidden.
All desktop post-list rows—including Home, All Posts, taxonomy, archive,
curated, and related-post lists—use `44px / fluid copy / 35% thumbnail`
columns. The right-aligned thumbnail fills the row vertically and crops with
`object-fit: cover`, giving every collection the same visual rhythm as Home.
List descriptions use a compact Korean-readable `1.6` line height, and their
date/reading-time metadata begins `.75rem` below the description. Human-visible
timestamps use `YYYY. MM. DD HH:mm`; date-only values use `YYYY. MM. DD`, and
year-month work periods use `YYYY. MM`. Machine-readable `datetime` attributes
retain the source ISO 8601 value. Mobile uses
an index/copy row with the thumbnail at `16:9` beneath the copy, keeping each
post as one semantic list item.

Explore separates its introductory title/description from discovery content
with a full-width fine rule. Curated collections appear first as two strong
desktop cards with a green top rule, localized post count, dark title, muted
description, and directional arrow. Categories and tags follow in two distinct
columns; each has a dark section rule and full-row links whose dark labels and
tertiary counts establish clear contrast. Cards and taxonomy columns stack to
one column on compact screens. This keeps collections, categories, and tags
visually related without presenting them as one undifferentiated grid.
Pagination uses ordinary numbered links
with a programmatic current state. On desktop, previous, numbered, and next
controls remain in one centered horizontal flex row; compact screens may wrap
that row without changing its semantic order.

The 404 page is a calm recovery surface with an oversized dark-text “404,” a short
localized explanation, and working routes back to home, posts, categories,
tags, archive, and search. Search has a labeled form, result/empty states, a
dialog enhancement, and a complete no-JavaScript browse fallback. The enhanced
search uses a centered command-palette surface up to `48rem` wide: a compact
title/ESC-close header, one large green-outlined query field, a truthful search
scope hint, and full-row results composed of a small document mark, title,
excerpt, and arrow. The document mark is a local inline SVG with a fixed
`24 × 24` view box and current-color strokes; it must not depend on an icon font,
external sprite, or pseudo-element approximation. Search must not invent or
persist a “recent search” history.
The palette becomes nearly full-viewport on mobile without creating horizontal
overflow.

There is no newsletter or subscription interface.

## 7. Post page and long-form content

The post header is centered on wide screens and contains breadcrumb, category,
title, description, author, publication date, reading time, and tags. The
title uses the full `47.5rem` post-header measure so long Korean titles form
fewer, more natural lines. Explicit `.875rem` top and `1.375rem` bottom margins
plus a small block inset separate it from the category and description. Its
responsive scale is `34–48px` on wide layouts and `30px` on compact screens.
The supporting description uses `16px / 1.7` and the same `40rem` measure as
the article body so it remains clearly subordinate and aligned. The category link is
presented without an underline. Header metadata uses the same
compact `0.75rem` scale as the tags with a lighter weight, while each tag is a
separate low-contrast outlined chip with enough inset space to scan as an
individual item. Every tag chip is a normal localized link to that tag's
listing page. On wide screens the author/date/reading-time row uses the full
`40rem` reading measure without wrapping; compact screens may wrap the row to
avoid overflow. The
article area can use:

- left: table of contents;
- center: article body;
- right: compact author context.

The wide article frame uses approximately `132px / 640px / 132px` columns with
`28px` gaps. The center remains the only primary reading column. At tablet width the author
context moves below it. On mobile, the TOC is a native `details` region before
the body and the author context follows the article. TOC fragment links use the
compiler-emitted anchors verbatim and work without JavaScript. A TOC is omitted
only when no eligible heading exists.

The post header leaves a clear `3rem` transition into the reading frame. TOC
and author rails begin with matching inset spacing, while the author identity
uses explicit internal gaps rather than collapsed paragraph margins. The
article, original-language reference, previous/next navigation, and related
posts are separated as distinct reading phases with approximately `4–4.5rem`
of vertical space on wide screens and `3.5rem` on compact screens. A leading
article image starts flush with the reading column rather than adding an empty
top margin.

Article images remain ordinary readable media without JavaScript. With the
post enhancement loaded, an unlinked article image becomes a pointer- and
keyboard-operable zoom target. It opens in a large native modal dialog with a
contained image, a transparent dialog surface over a blurred `30%` white
backdrop, localized top-right close control, and native Escape dismissal;
closing returns focus to the source image. The caption sits `.75rem` directly
below the image with `1rem` padding on a `50%` white surface and stable dark
text. Linked images retain their original link behavior and are not
intercepted.

Article rules:

- paragraphs, lists, and headings follow the `40rem` measure;
- wide prose uses `18px` Pretendard at a Korean-readable `1.82` line height,
  while compact prose uses `17px / 1.78`; both use `1.55em` separation after
  paragraphs and other prose blocks so line
  spacing and paragraph spacing remain visually distinct;
- H2 uses `30px / 1.38`, weight `600`, generous top spacing, and a fine bottom
  rule; H3 uses `23px / 1.4` at the same weight;
- code uses a dark, horizontally scrollable surface;
- inline code uses a pale mint highlight;
- quotes use a mint surface and green left rule;
- tables scroll inside their own width rather than the page;
- images, video, screenshots, diagrams, and embeds are responsive;
- YouTube/provider embeds preserve `16:9`; their durable normal-link fallback
  is exposed only inside `noscript`, avoiding a duplicate visible link beneath
  a working player;
- captions remain visually secondary but readable;
- previous/next and related posts follow the article, never interrupt it;
- each previous/next link places its localized direction label on a separate
  line above the post title with a small explicit gap;
- previous and next links occupy separate equal-width bordered regions on wide
  screens and stack on compact screens. Their compact title uses `0.9375rem`;
  each region rests at `50%` opacity and transitions to `100%` on hover or
  keyboard focus, while retaining a visible boundary at rest.

Images are not forced into a decorative crop inside article prose. Screenshots
may use their intrinsic ratio. Unsupported or missing media falls back to the
content pipeline’s accessible link/text contract.

## 8. Interaction, accessibility, and motion

All actions have default, hover, focus-visible, active, disabled, loading,
empty, and error behavior where applicable. Focus uses a visible green outline
with sufficient offset. Hover is never the only indication of action. Touch
targets are at least `44px` high where controls are used.

Primary content, navigation, localization, TOC, pagination, recovery, and
managed-page return links are available in static HTML. JavaScript enhances
search and optional post-image enlargement without replacing static content.
Requested routes are never redirected based on browser language.

Motion is limited to native scrolling and tiny state transitions. Links animate
color, underline color/offset, and opacity over `180ms`; their active state
briefly lowers opacity to communicate activation without moving surrounding
content. Enabled buttons and disclosure controls rise by `1px` on hover and
press by `1px` with a restrained `0.985` scale on activation. Form-field borders
transition to green on pointer hover. These effects never alter layout, and the
stylesheet honors `prefers-reduced-motion: reduce`. Decorative autoplay,
parallax, and essential animated explanations are forbidden.

Post-list rows expose one full-card link covering the index, category, title,
description, metadata, and thumbnail instead of limiting activation to the
title. The index and copy rest at `50%` opacity while the thumbnail rests at
`85%`; all transition to full opacity on pointer hover or keyboard focus. The
featured post follows the same one-link pattern, with `50%` copy and `85%`
visual opacity transitioning to full opacity. Images never scale or change the
card geometry during interaction, so focus is communicated through contrast
without spatial motion. Reduced-motion preferences still suppress transition
duration. Recent Posts and Selected Work place `1rem` of vertical inset between
each divider and its card so adjacent thumbnails never touch. The hero's
underlined all-posts action keeps its rule immediately beneath the text rather
than using control-height padding as visual spacing.

## 9. Responsive and print behavior

- Wide: full header, overlapping editorial hero, numbered log rows, and
  three-region post layout.
- `≤64rem`: navigation moves to a scrollable second row; post author moves
  below the reading column.
- `≤57.5rem`: TOC and article move into a single reading flow and the author
  context follows the article.
- `≤38.75rem`: white mobile hero with faint cropped workflow geometry,
  index/copy post rows with stacked media, centered post header, inline TOC,
  and stacked search and pagination controls.

At 200% zoom, controls and text reflow without two-dimensional page scrolling.
Safe-area insets are respected when a future fixed control touches a viewport
edge.

Print removes site chrome, search UI, TOC, author rail, and article navigation;
it preserves article hierarchy, code, tables, quotes, meaningful media, and
readable links. Large semantic blocks avoid breaking across pages when practical.

## 10. Social cards and media identity

Generated post cards use the same white, dark-text, green-rule system with a
fixed safe area and locale-aware Pretendard fallback. They contain the site or
category line and localized title, not body excerpts, portraits, gradients, or
invented illustrations. Output is deterministic and remains legible at small
preview sizes.

Representative-image selection remains editorial and follows
`CONTENT_RULES.md`. The renderer may create required `1:1`, `4:3`, and
`16:9` derivatives only after the source/mode is approved. Crops preserve
meaningful text, faces, and the selected focal subject.

## 11. Open Design and implementation handoff

Open Design is an authoring aid, not a runtime dependency. The approved
“Refined Current 01” owner-supplied export is the reference composition for
this version:

1. open the repository root and use this file for normal blog work;
2. preserve the semantic HTML and no-JavaScript reading contract;
3. export unreviewed work under `design/open-design/`;
4. promote approved tokens and layouts to
   `apps/blog-web/src/styles/blog.css` and the static renderer;
5. update this file and tests in the same design change;
6. use a managed page’s local `DESIGN.md` for that page.

Do not introduce a token only in component code, copy a third-party identity,
or change content schemas through a visual task. Major changes to palette,
font, navigation model, home composition, logo/portrait, or OS theme behavior
require explicit owner approval.

The normal blog uses descriptive component classes such as `site-header`,
`home-hero`, `post-card`, and `post-layout`. CSS must not use `data-*` hooks as
component selectors; those attributes are reserved for runtime state,
enhancement, indexing, and test observability. Presentation remains in the
external `blog.css` stylesheet, with no generated inline `<style>` blocks or
`style` attributes. Typography element defaults remain scoped to the blog-owned
header, `#main`, footer, search dialog, image viewer, consent UI, and skip link.
Control resets, minimum target sizes, button surfaces, field motion, box-sizing,
and reduced-motion overrides apply only to explicit `site-control` classes and
named blog interactions. Descendant universal selectors and generic
`button`/`input`/`summary` selectors are forbidden because third-party browser
overlays and annotation controls may be injected inside blog surfaces.

## Provenance and licenses

- Pretendard `1.3.9`, Kil Hyung-jin and contributors, SIL Open Font License
  1.1. It is consumed from the pinned npm package and no CDN is contacted.
- The white/clear-green direction and “Refined Current 01” reference composition
  were supplied and approved by the repository owner in the 2026-08 Open Design
  handoff. Its HTML and handoff notes were reviewed as design input only; they
  are not production code or dependencies.
- No external design system, icon library, remote image, or third-party brand
  asset is part of this implementation.
