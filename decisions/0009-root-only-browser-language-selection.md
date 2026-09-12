# ADR 0009: Root-only browser-language selection

- Status: accepted
- Date: 2026-09-11
- Supersedes: only the blanket browser-selection prohibition in ADR 0008

## Context

The owner explicitly requested that root visits choose English or Japanese
from browser preferences while every other URI retains its own language.

## Decision

- The exact deployment root alone uses the first supported preference from
  `navigator.languages`, with `navigator.language` as the missing-list fallback.
  Primary subtags are matched case-insensitively. Korean, unsupported-only,
  unavailable preferences, and JavaScript failure retain static Korean.
- Use `location.replace` for the local English/Japanese home, preserving query
  and fragment. Route destinations are derived from validated configuration.
  No server negotiation, body replacement, storage, cookies, or telemetry.
- Explicit Korean home language links add `?lang=ko` so automatic entry does
  not undo the reader's selection. This works with blocked storage and no JS.
  It is not canonical; canonical, hreflang, sitemap, and ordinary home links
  remain unchanged and query-free.
- English/Japanese homes, posts, collections, search, pagination, 404s,
  `/index.html`, and managed pages do not automatically switch language.
- Site configuration schema advances from 7 to 8 and requires
  `browserSelection: "root-only"`. Existing post/artifact contracts, source
  language, independent publication, and post-link fallback are unchanged.

## Consequences and validation

GitHub Pages still serves complete static localized files, not HTTP language
redirects. JavaScript-enabled root visitors can see a brief Korean fallback
before navigating. Explicit Korean selection remains available through normal
links. Tests cover preference ordering, region variants, unknown preferences,
no preference access on deep links, storage-independent explicit choice,
same-origin destinations, repeatability, canonical/no-JS output, and `/blog`
portability. The existing manual-only configuration test is intentionally
updated to the owner-approved root-only policy, not removed.
