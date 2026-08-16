# ADR 0008: Multilingual publication, manual language switching, and link fallback

- Status: accepted
- Date: 2026-08-17
- Supersedes: ADR 0007 browser-selection and complete-group publication clauses

## Context

English and Japanese post variants exist primarily so each language can be
independently crawled, indexed, cited, and discovered by search engines and AI
agents. Treating them mainly as browser-language convenience obscures that
purpose and introduces automatic navigation that can prevent a reader from
viewing an intentionally requested document.

Translations also pass independent owner review. Requiring all three languages
to publish simultaneously delays a valid original and makes it impossible for
navigation to represent a temporarily unavailable translation safely.

## Decision

- Korean remains the unprefixed public default and normal authored source.
  English uses `/en/`; Japanese uses `/ja/`.
- Each published variant is a complete static, self-canonical document with its
  own localized metadata. Published siblings use reciprocal `hreflang`,
  structured-data translation relations, and sitemap entries.
- Browser language, stored preference, IP location, and analytics state never
  redirect, replace, or translate a requested document. Language changes use
  visible normal links only.
- The authored original must be published before any translation. Each reviewed
  translation may publish independently; missing and draft translations are
  absent from production alternates and discovery output.
- A logical post appears at most once in a list, taxonomy, archive, pagination,
  or related-post region. Its target preference is the active page language,
  then English, then Korean. If none is published, no link is emitted.
- A cross-language fallback uses the selected variant's title and description,
  exposes its language programmatically and visibly, and never pretends that
  the content was translated into the surrounding page language.
- Search indexes and RSS feeds remain language-specific document collections;
  the fallback order applies to navigation links, not to search-result text or
  feed content.
- `originalLanguage` and published alternates remain required artifact data. An
  optional post-body context may identify the authored original, but it does
  not infer browser preference or replace the explicit language switcher.

## Consequences

- `config/site.yaml` uses `browserSelection: "manual-only"` and records the
  deterministic English-then-Korean fallback after the active language.
- Translation-group publication changes from all-or-nothing to per-variant
  review while still requiring one published authored original.
- Collection and recommendation builders operate on logical post groups and
  resolve one localized target per group. Fallback entries need language
  labeling and accessibility tests.
- Existing content artifact alternates already support a variable-length array,
  so the provisional content artifact schema remains version 7. The shared site
  configuration advances to schema version 6 because language-selection and
  link-fallback semantics changed.
- No published post routes exist, so this policy change needs no compatibility
  redirect. A future change to the fallback order is a configuration, UX,
  publishing, SEO, and test-contract change.
