# Blog analytics integration

The blog renderer resolves `GA4_MEASUREMENT_ID` at build time through
`packages/project-config`. It passes either the validated `G-...` value or
`null` to `createGoogleAnalytics`.

- Missing or blank value: analytics is disabled and no Google script is loaded.
- Invalid non-blank value: configuration validation fails the build.
- Valid value with no consent: the adapter makes no Google request.
- Valid value with stored or newly granted consent: GA4 loads once and records
  a query-free page view.

The future framework shell owns the accessible consent controls. Its accept
action calls `grantConsent()`, its reject/revoke action calls `denyConsent()`,
and a persistent “쿠키 설정” control must reopen the choice. Accept and reject
must be equally easy to operate with keyboard and touch.

Custom events must use lower-case names such as `related_post_click`. Do not
send raw search terms, full URLs containing queries, user IDs, email addresses,
post body text, or code snippets. The adapter rejects several high-risk field
names, but call sites remain responsible for data minimization.

Managed pages do not import this module and are not tracked by default.
