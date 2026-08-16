# Architecture Decision Records

This directory records decisions that materially constrain implementation.
Records are immutable history: supersede an accepted record with a new record
rather than silently rewriting its outcome. Implementation and authoritative
contracts must still be updated in the same change.

Status values are `proposed`, `accepted`, `superseded`, or `rejected`.

Accepted records:

- `0001-github-pages-hosting.md`
- `0002-open-design-contract.md`
- `0003-comments-deferred.md`
- `0004-implementation-stack.md`
- `0006-production-ux-and-capacity-baseline.md`
- `0008-multilingual-publication-and-link-fallback.md`

Superseded records:

- `0005-browser-language-and-original-reference.md` — superseded by ADR 0007
- `0007-korean-default-language-context.md` — browser selection and publication
  semantics superseded by ADR 0008; Korean-default route ownership retained
