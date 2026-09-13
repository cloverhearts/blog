# ADR 0011: Immediate cookieless Clarity

- Status: accepted by explicit owner request on 2026-09-13.
- Supersedes: only the pre-consent loading and consent-request UI in ADR 0010.

Eligible production blog pages start Clarity without waiting for a button click.
Before inserting the remote SDK, queue ConsentV2 with both analytics_Storage
and ad_Storage denied. Never send granted or persist inferred permission.
Clarity Settings / Setup must disable cookies by default; actual cookie and
network verification is an external activation gate, not proved by a stub SDK.

Keep body masking, current query/fragment/referrer guards, blank-ID disabling,
preview/search/noindex/managed exclusions and the existing origin restrictions.
Existing saved Clarity denial still blocks loading. Old grants do not authorize
cookie use. Replace the request with collapsed, localized information and a
stop control. An explicit stop is stored using the existing key and reloads to
unload the SDK. Cross-tab denial stops collection too. Unavailable storage means
the stop cannot persist across reloads; do not promise otherwise.

This is limited third-party collection, not anonymous analytics or a legal
exemption for personal blogs. Returning visitors, multi-page journeys and
session measurements are limited. The owner accepted this trade-off.
No author syntax, content artifact, route, hosting or dependency changes.

Tests intentionally replace opt-in expectations with immediate denied-storage
initialization, no allow control, no inferred permission writes, old denial
compatibility, explicit/cross-tab stop, exclusions and deterministic rendering.
Official behavior: https://learn.microsoft.com/en-us/clarity/setup-and-installation/clarity-consent-api-v2
