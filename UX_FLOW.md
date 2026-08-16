# Blog UX Flow Contract

## Status and priorities

This is the authoritative interaction and information-architecture baseline for
the normal blog. The initial visual treatment is deliberately classless and
minimal; content discovery, reading continuity, localization, accessibility,
and no-JavaScript behavior take priority over branding.

Korean and English are the primary UX review languages. Japanese remains a
fully supported published locale and must pass structural, overflow, navigation,
and accessibility checks, but it does not drive the first typography or copy
review pass.

## Persistent page frame

Every normal blog document uses the same semantic order in its initial HTML:

1. skip link to `main`;
2. site header containing a home link;
3. primary navigation: Posts, Categories, Tags, Archive, Search;
4. language navigation with real links and a programmatically identified
   current language;
5. one `main` landmark containing the route-specific task;
6. site footer containing secondary intentional links and analytics controls
   only when analytics is configured.

The header does not require a hamburger menu for the baseline. Links wrap on
small screens. A later compact navigation control may enhance the same links,
but the links remain present and usable when JavaScript or CSS is unavailable.

## Entry and language flow

- Direct URLs always open the requested static document.
- An unprefixed Korean route may navigate once to an existing browser-preferred
  English or Japanese alternate as defined by `I18N.md`.
- A prefixed route, explicit language choice, or stored choice is respected.
- The language navigation remains visible after automatic selection and always
  uses canonical alternate URLs.
- Korean and English labels receive the first human UX review; Japanese labels
  remain complete and are verified for layout and meaning before release.

## Discovery flow

The home page answers three questions without interaction: what this site is,
what was published recently, and how to browse all work. It exposes recent
posts plus direct links to Posts, Categories, Tags, Archive, Search, and any
owner-selected managed page such as a profile.

Collection pages follow one pattern:

- one page heading and short scope description;
- item count when known;
- chronological post list with title, description, publication date, category,
  and tags;
- normal previous/next pagination links, with page one at the collection root;
- empty states that link back to broader discovery surfaces.

Categories communicate editorial grouping. Tags communicate cross-category
topics. Archive communicates chronology. These concepts are not combined into
one ambiguous filter interface.

## Reading flow

A post presents, in order:

1. title and localized description;
2. publication/modification dates, category, tags, and reading time;
3. representative media when approved;
4. semantic table of contents when at least two eligible headings exist;
5. article body with stable heading anchors;
6. optional language context derived from original and alternate metadata;
7. related posts;
8. links back to the post category and broader post list.

The table of contents and all post navigation are normal links in initial HTML.
No sticky treatment may cover a fragment target. Reading progress, current-TOC
highlighting, and similar conveniences are optional enhancements and never
replace the static structure.

The optional language-context region sits after the article body when the
chosen UX enables it. It may identify and link the authored original and may
offer the same post in the reader's browser-preferred language when that sibling
exists and differs from the current page. It never exposes translation review
state, never redirects an explicitly requested `/en/` or `/ja/` route, and is
not required for publication. The persistent real-link language navigation is
the static and no-JavaScript fallback.

## Search flow

Search is an enhancement-only capability over the generated Pagefind index.
The search route includes a labeled query field, submit behavior, result count,
result list, clear empty state, and keyboard-reachable results. It does not
search until the user enters a query and does not send queries to a server or
analytics.

Without JavaScript, the search page explains the limitation and provides normal
links to Categories, Tags, and Archive. Search never becomes the only route to
published content.

## Managed-page flow

A normal blog page may intentionally link to a managed page. After entry, the
managed page owns its design and interaction model. It must retain the floating
localized return link required by its local `DESIGN.md`, pointing to the exact
blog route that launched it when safely available or the configured home route
otherwise.

## Error and recovery flow

- A 404 document names the failure plainly and offers Home, Posts, Categories,
  Tags, Archive, Search, and language links.
- Empty category, tag, archive, related-post, and search states are valid UI
  states rather than rendering errors.
- Blocked fonts, analytics, embeds, images, or JavaScript never remove primary
  navigation or article text.
- External embeds retain descriptive fallback links.

## Responsive, accessibility, and print flow

- Source order is the visual and keyboard order.
- Navigation wraps before it collapses; horizontal page scrolling is not a
  navigation mechanism.
- Focus is always visible, touch controls meet the project target, and labels
  do not depend on icons or color.
- At 200% zoom, the main task and all navigation remain available.
- Print removes navigation and consent controls while preserving article
  hierarchy, code, tables, meaningful media, any rendered language context, and
  link URLs.

## Enhancement boundary

The baseline requires JavaScript only for browser-language navigation, local
search, and optional consented analytics. All other listed flows work as static
HTML links and forms or expose a useful static fallback. A future visual system
may change presentation but not this flow without updating this contract,
tests, and `History.md` together.
