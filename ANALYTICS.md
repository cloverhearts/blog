# Microsoft Clarity analytics

Microsoft Clarity is the only blog analytics provider. This replaces the former
GA4 scaffold; do not install both providers or reuse GA4 consent. No paid
service, new server or third-party npm dependency is required.

## Activation

1. Create a web project for `https://blog.cloverhearts.com` in Clarity.
2. Copy only the project ID from Settings / Setup (the last segment of
   `https://www.clarity.ms/tag/<project-id>`), not the entire script.
3. Set `CLARITY_PROJECT_ID` as a GitHub repository or `github-pages` environment
   variable. It is public, not a credential. This integration accepts 1–32
   lowercase ASCII letters/digits, trims surrounding whitespace and rejects
   snippets/URLs. Blank means disabled; legacy `GA4_MEASUREMENT_ID` is ignored.
4. In Clarity, require consent, use Strict text masking, and keep advertising
   features disabled. The local adapter also masks the body and requests
   `analytics_Storage: granted`, `ad_Storage: denied` only after consent.
5. Build with the production origin and deploy through the existing Pages
   workflow. Check actual collection and masking in Clarity before considering
   activation verified; a successful local stub test is not that verification.

## Scope and consent

- `config/analytics.yaml` schema 2 is the executable policy. Only eligible
  production blog documents load the local adapter. Preview, noindex/search/404
  documents and every managed page/profile remain untracked.
- No Clarity request occurs before explicit or saved Clarity consent. The new
  storage key is `blog.clarity-consent.v1`; old GA4 consent never carries over.
- The footer explains Microsoft processing and session replay in the document
  language, links to Microsoft's privacy statement, and retains allow and
  decline/withdraw buttons. No-JavaScript pages remain readable and untracked.
- Withdrawing saves denial, sends ConsentV2 denial and reloads the page to unload
  the recorder. ConsentV2 denial alone can still permit cookieless collection,
  so it is not treated as stopping the SDK. Cross-tab denial also triggers this.
- Storage failure preserves the current-page choice only. Do not infer that
  denial can persist across pages when browser storage itself is unavailable.

## Data and limitations

Clarity measures clicks, scroll depth, page visits and masked session replay.
Attention maps measure time in page regions, not gaze or proof of reading.
The adapter masks all body text and inputs and provides no identity, arbitrary
event-payload or unmask API. Never add sensitive data to URLs, link destinations,
attributes, styles, or media: text masking is not universal metadata redaction.

Unlike GA4's custom sanitized page views, the Clarity SDK reads browser metadata
itself. This integration skips loading when the current URL has a query or
fragment, or the available referrer has either. It does not rewrite navigation.
Consequently campaign-query entries, explicit `?lang=ko` entries, fragment entry
links and some referrals are not measured. Search documents are excluded and
in-page search text is masked. These safeguards do not promise removal of every
URL captured later by the vendor (for example clicked links or DOM attributes).
Review replay samples and request provider URL masking before widening scope.

Only `https://*.clarity.ms` is allowed for analytics scripts, connections and
images. No Google, Bing advertising origin, `unsafe-inline`, or broad external
default-source permission is added. The remote SDK may change independently:
check the real network/CSP behavior after activation; don't widen policy merely
to remove a console warning. Builds never fetch the SDK.

Sessions are generally retained for 30 days; heatmaps and labeled/favorited
sessions for 9 months under the provider's current retention policy. Consent
refusal, blockers and these exclusions make the data a partial sample, not a
complete visitor count. Microsoft's processing is governed by its terms and
privacy statement; masking does not make the service first-party-only.

## Validation

Run `npm run test:analytics`, `npm run typecheck`, `npm test`, and the normal
production build/Pages verifier. Validate enabled/disabled, root/subpath,
preview/excluded-route, fresh consent, legacy consent, storage failure,
withdrawal and deterministic provenance cases. Before deployment activation,
verify a real project ID, dashboard receipt, masking, denial/revocation and
network behavior. Those external checks cannot pass with a synthetic test ID.

## Official references

- [ConsentV2](https://learn.microsoft.com/en-us/clarity/setup-and-installation/clarity-consent-api-v2)
- [Masking and client API](https://learn.microsoft.com/en-us/clarity/setup-and-installation/clarity-api)
- [CSP guidance](https://learn.microsoft.com/en-us/clarity/setup-and-installation/clarity-csp)
- [Retention](https://learn.microsoft.com/en-us/clarity/setup-and-installation/data-retention)
- [Microsoft privacy statement](https://privacy.microsoft.com/privacystatement)
