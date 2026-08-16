# ADR 0003: Public comments deferred

- Status: accepted
- Date: 2026-08-16

## Context

The initial blog is a static GitHub Pages site whose primary responsibilities
are publishing, multilingual navigation, SEO, search, and independently built
managed pages. Anonymous or account-backed comments require a writable service,
abuse prevention, moderation, privacy and deletion policies, and an ongoing
operational dependency.

Those responsibilities add disproportionate complexity to the initial release
and are not required for readers to use the published content.

## Decision

Exclude public comments from the initial release. Do not add a comment provider,
submission API, account system, moderation queue, comment database, comment
metadata contract, or comment-specific client script to the current build plan.

A future proposal may add comments only through a new explicit decision that
defines provider isolation, cost ceilings, anonymous-user handling, spam and
abuse controls, moderation, retention and deletion, accessibility,
no-JavaScript behavior, and failure isolation.

## Consequences

- The production release remains static and has no comment-related writable
  runtime.
- Readers cannot publish comments on the site in the initial release.
- Content, search, navigation, SEO, analytics, and managed pages have no
  dependency on comment availability.
- No comment placeholder, dormant SDK, provider key, database schema, or unused
  security origin is shipped.
- Reconsidering comments is a later scoped feature, not an implicit extension
  of the blog renderer or content compiler.
