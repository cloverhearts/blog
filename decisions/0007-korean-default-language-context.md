# ADR 0007: Korean-default routes and optional post-language context

- Status: superseded
- Date: 2026-08-16
- Supersedes: ADR 0005 and the locale-default clause of ADR 0006
- Superseded by: ADR 0008 for browser selection and publication semantics;
  Korean-default route ownership remains in force

## Context

The owner has selected Korean, not English, as the blog's public default. All
three languages still need complete static HTML and browser-aware entry without
making an explicitly requested language unstable. A reader who intentionally
opens a post in a language different from the browser preference may benefit
from original-language and preferred-sibling links, but that treatment should
remain optional UX rather than mandatory post chrome.

## Decision

- Korean is the unprefixed default, unsupported-browser fallback, and
  no-JavaScript fallback. English uses `/en/`; Japanese uses `/ja/`.
- Language preference order is explicit choice, stored explicit choice, first
  supported browser language, then Korean.
- Only an unprefixed Korean route may navigate once to an existing English or
  Japanese static alternate. A prefixed or otherwise explicit route is always
  respected and never automatically redirected to the browser language.
- Persistent language navigation uses normal canonical alternate links and
  remains available without JavaScript.
- Every post artifact supplies current language, `originalLanguage`, and the
  complete validated alternate set. These existing fields are the required
  presentation-neutral metadata for post-language context; no author-controlled
  browser-language field is added.
- A renderer may optionally place a concise language-context region after the
  article body. It may identify/link the authored original and may separately
  offer an existing sibling matching the resolved browser language when it
  differs from the current document.
- The optional treatment is not a publication or release requirement. It never
  exposes `translationStatus`, invents an alternate, or redirects the current
  route. The required static language navigation and `hreflang` relationships
  remain the fallback.
- The Open Design-compatible design contract and approved classless baseline
  remain unchanged apart from consuming this language behavior when a future UX
  chooses to render the optional context.

## Consequences

- `hreflang="x-default"`, the root route tree, root RSS feed, and root 404 now
  represent Korean. English discovery and system routes move under `/en/`.
- Existing preference and route helpers change their default constant to `ko`;
  the one-time navigation guard continues to rely on the default language.
- No content artifact schema bump is required because current language,
  `originalLanguage`, and validated alternates already exist in schema version
  7. Browser preference is transient local state and does not enter provenance.
- No public post routes currently exist, so this planned-route change requires
  no redirect entries. Any route published under the earlier model would need
  an explicit compatibility plan before migration.
