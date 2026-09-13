# ADR 0010: Clarity-only consent-gated blog analytics

- Status: accepted by the owner request to use Clarity alone (2026-09-13).
- Scope: replaces the earlier GA4 adapter/configuration; no hosting or content
  processing dependency changes, and no new paid services.

## Decision

Use Microsoft Clarity for visitor behavior, click/scroll/attention heatmaps and
masked session replay. The executable schema-2 policy is config/analytics.yaml.
Only the blog web layer consumes CLARITY_PROJECT_ID. No GA4 script, legacy
environment fallback or inherited GA4 consent remains. A new Clarity-specific
consent key requires fresh permission for the expanded recording capability.

The external loader is emitted only in configured, eligible production blog
pages and requests the remote SDK only after consent. Managed pages, previews,
search and noindex pages remain outside scope. Body text is masked, advertising
storage is denied, and the UI always permits withdrawal. Withdrawal reloads to
remove the SDK because provider consent denial alone allows limited telemetry.

## Privacy and trade-offs

The SDK, unlike the previous custom GA4 page-view adapter, owns URL/DOM metadata
collection. Entry URLs and referrers with queries/fragments are conservatively
excluded, without rewriting the visitor's URL. This undercounts campaign and
explicit-language entries. Full redaction of clicked URLs/attributes is not
claimed; no personal data may be put in those fields. ANALYTICS.md defines
masking, exclusions, provider disclosure, retention and activation review.

The repository does not add Bing advertising origins or unsafe inline script
permissions to match broad vendor CSP examples. Real-project verification may
reveal blocked optional requests; expanding the allowlist requires review.
The owner must provide a real project ID and verify the dashboard and masked
recordings before treating the integration as operational. Synthetic tests do
not establish receipt by Microsoft.

## Validation

The clarity contract suite covers configuration, new consent, legacy consent,
load-once, advertising denial, masking, withdrawal, unavailable storage, unsafe
entry metadata, weakened-policy rejection, locale/base-path output, preview and
noindex exclusions, disabled output and deterministic web provenance.
