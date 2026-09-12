# Applied AI Engineer profile design

## Intent and ownership

This standalone profile is an editorial introduction, not a normal blog page
or a dashboard. The page-local `profile.css` is declared in `page.yaml`.
No root blog CSS, components, external fonts, scripts, trackers or media.

## Content hierarchy

The owner approved an intentionally empty, directly accessible profile shell.
Only the compiler-owned CloverHearts h1 and floating return link are visible;
content.md is empty. Do not add a biography, role, projects, contact section,
placeholder message, or invented claims until the owner supplies real content.
Retain the page-local layout and typography for future profile authoring.

## Layout and tokens

- Desktop: a 68rem maximum canvas, 12rem section-label column, 4rem gap and a
  flexible reading column. Intro and closing quotation span both columns.
- At 55rem and below: single source-order column with 1.25rem outside gutters.
- Paper #fafbf9, ink #17211c, secondary #526259, accent #086444,
  hairline #cbd5ce. Dark mode uses #101813, #edf4ef, #afc0b5, #83ddb1, #354c3e.
- System sans-serif stack with Korean/Japanese fallbacks. Body 1.0625rem/1.8,
  zero English letter spacing; h1 fluid 2.75–5.5rem; lead 1.75–2.75rem.
- No decorative cards, shadows, score meters or motion. Whitespace and thin
  section rules establish hierarchy.

## Accessibility, behavior and review

Source order is reading/keyboard order; headings, paragraphs and lists are
static semantic HTML. Links have persistent underlines and visible focus.
The required floating return link stays clear of the content with top space.
Small screens reflow without horizontal scrolling. Dark mode preserves contrast.
Print removes the return control, uses light colors and avoids stranded headings.
No JavaScript is required. No external requests are needed to render the page.

All three localized routes are published but noindex, with sitemap disabled.
This makes the empty shell reachable without implying biography review or
search-engine indexing approval. No JavaScript or blog chrome is introduced.

Locale: Korean.
