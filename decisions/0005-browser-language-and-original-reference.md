# ADR 0005: Browser language selection and post original reference

- Status: superseded
- Date: 2026-08-16
- Superseded by: ADR 0007

## Context

English, Korean, and Japanese are emitted as complete static documents. GitHub
Pages cannot vary an HTML response by `Accept-Language`, but a browser helper
can select an already-rendered alternate. Reader-facing translation notices
should remain minimal: the owner wants only a reference to the original work at
the bottom of a translated post.

## Decision

- English remains the unprefixed default and no-JavaScript fallback.
- On an unprefixed English blog route, a small local bootstrap selects the
  preferred language in this order: explicit user choice, stored user choice,
  browser language, English.
- When a complete alternate route exists and the selected language differs, the
  bootstrap performs one same-site `location.replace` navigation to that static
  route. It never fetches or replaces article content in place.
- A language-prefixed URL is respected and does not automatically redirect.
- The persistent language switcher uses normal links and stores an explicit
  choice when storage is available.
- With JavaScript disabled or storage/browser APIs unavailable, the requested
  static document remains fully readable; an unprefixed URL remains English.
- Post headers do not display translation banners, nuance warnings, or review
  status. A translated post emits one semantic original-work reference after
  the article body, containing only the original language and a normal link to
  the original static post.
- The source-language variant does not render a redundant original-work footer.
  `translationStatus` remains validated publication provenance but is not
  reader-facing post chrome.

## Consequences

- Automatic language navigation is progressive enhancement and cannot change
  the canonical, `hreflang`, sitemap, or complete static-document requirements.
- Redirect loops are prevented by respecting prefixed routes and navigating
  only to an existing validated alternate.
- The original route is derived from the validated translation group; authors
  never write it by hand.
- Search excludes the repeated original-reference footer while structured data
  may use the same visible original relationship.
