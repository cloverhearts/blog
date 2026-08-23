# Blog UX Flow Contract

## Status and priorities

This is the authoritative interaction and information-architecture baseline for
the normal blog. The visual treatment uses named presentation classes over
semantic static HTML; content discovery, reading continuity, localization,
accessibility, and no-JavaScript behavior take priority over decoration.

Korean and English are the primary UX review languages. Japanese remains a
fully supported published locale and must pass structural, overflow, navigation,
and accessibility checks, but it does not drive the first typography or copy
review pass.

## Persistent page frame

Every normal blog document uses the same semantic order in its initial HTML:

1. skip link to `main`;
2. site header containing a home link;
3. primary navigation: All Posts, Selected Work, Daily Notes, Explore, Search;
4. language navigation with real links and a programmatically identified
   current language;
5. one `main` landmark containing the route-specific task;
6. site footer containing identity, localized description, copyright, and
   analytics controls only when analytics is configured; it contains no
   Profile or Archive navigation.

The header does not require a hamburger menu for the baseline. Links wrap on
small screens. A later compact navigation control may enhance the same links,
but the links remain present and usable when JavaScript or CSS is unavailable.

## Entry and language flow

- Direct URLs always open the requested static document.
- Browser language, stored preference, IP location, and analytics state never
  redirect or replace the requested document.
- The language navigation always remains visible, uses canonical alternate
  URLs, and lists only published variants. Readers change language explicitly.
- Korean and English labels receive the first human UX review; Japanese labels
  remain complete and are verified for layout and meaning before release.

## Discovery flow

The home page answers three questions without interaction: what this site is,
what was published recently, and how to browse all work. It exposes recent
posts plus the author introduction and Profile link, then All Posts, Selected
Work, Daily Notes, Explore, and Search. Categories and Tags remain available
from Explore and their existing static routes. Archive remains a secondary
chronological index, reachable from search/404 recovery rather than the footer.

Collection pages follow one pattern:

- one page heading and short scope description;
- item count when known;
- chronological post list with title, description, publication date, category,
  and tags;
- normal previous/next pagination links, with page one at the collection root
  and later pages under `/page/<n>/` using the shared `listings.pageSize` of
  10 logical post groups;
- empty states that link back to broader discovery surfaces.

Each rendered post row is one normal link across its index, title, description,
metadata, and thumbnail. Keyboard focus and pointer hover apply to the same
target, while the initial HTML remains fully navigable without JavaScript.

Each logical post appears at most once in a collection. Its link and summary
use the current page language when that variant is published, otherwise
English, otherwise Korean. A cross-language fallback is visibly labeled and
uses matching `lang` metadata; if none of those variants exists, the item is
omitted.

Categories communicate editorial grouping. Tags communicate cross-category
topics. Archive communicates chronology. These concepts are not combined into
one ambiguous filter interface.

## Reading flow

A post presents, in order:

1. title and localized description;
2. publication/modification dates, category, tags, and reading time; every tag
   chip is a normal localized link to its tag collection;
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

Article images remain visible in initial HTML. When the optional image-viewer
enhancement loads, unlinked images open a native modal enlargement by pointer,
Enter, or Space. The dialog provides a localized close button, native Escape
dismissal, a blurred backdrop, and focus restoration to the originating image.
Images that are already links keep their authored destination.

The optional language-context region sits after the article body when the
chosen UX enables it. It may identify and link the authored original. It never
exposes translation review state, redirects the current route, or replaces the
persistent real-link language navigation used to change languages.

## Search flow

Search is an enhancement-only capability over the generated Pagefind index.
The search route includes a labeled query field, submit behavior, result count,
result list, clear empty state, and keyboard-reachable results. It does not
search until the user enters a query and does not send queries to a server or
analytics.

The Search primary item is a real `/search/` link. When the client enhancement
loads, that same control opens an accessible in-page dialog over the current
document. Without JavaScript, or when enhancement fails, the link opens the
search route. That route explains the limitation and provides normal links to
Categories, Tags, and Archive. Search never becomes the only route to
published content. The dialog initially shows a localized scope hint rather
than fabricated suggestions or saved query history. After submission, every
result is one full keyboard-reachable link containing its title and excerpt.
The close control and native Escape behavior return focus to the Search link.

## Managed-page flow

A normal blog page may intentionally link to a managed page. After entry, the
managed page owns its design and interaction model. It must retain the floating
localized return link required by its local `DESIGN.md`, pointing to the exact
blog route that launched it when safely available or the configured home route
otherwise.

## Error and recovery flow

- A 404 document names the failure plainly and offers Home, All Posts, Selected
  Work, Daily Notes, Explore, Categories, Tags, Archive, Search, and language
  links.
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

The baseline requires JavaScript only for local search and optional consented
analytics. All other listed flows work as static
HTML links and forms or expose a useful static fallback. A future visual system
may change presentation but not this flow without updating this contract,
tests, and `History.md` together.
