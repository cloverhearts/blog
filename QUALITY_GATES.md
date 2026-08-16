# Quality Gates

These gates define completion for executable work. A feature is not complete
merely because it compiles or looks correct in one browser.

## Change-to-test traceability

- Every behavioral or machine-enforceable policy addition, change, deprecation,
  or removal has a corresponding test addition or update in the same task, as
  required by `TESTING.md`.
- Bug fixes include a regression case that fails under the defective behavior
  whenever safe reproduction is possible.
- Relevant positive, negative, boundary/compatibility, deterministic, security,
  accessibility, and no-JavaScript cases are covered rather than relying on one
  happy-path assertion.
- Governed high-impact policies match `tests/policy-coverage.json`; every source
  hash and exact mapped test-case name passes the policy governance test.
- Test expectations are not weakened merely to obtain a passing run. Intentional
  contract changes update policy, implementation, fixtures, tests, compatibility
  notes, and `History.md` together.
- Pure non-semantic documentation edits may reuse existing tests but still pass
  Markdown/link/whitespace checks and explicitly record the exemption.

## Static and no-JavaScript behavior

- Post title, metadata, body, headings, links, local media alternatives,
  navigation, and related links exist in initial HTML.
- Post TOC navigation is semantic initial HTML; every fragment link resolves to
  exactly one matching heading ID and works without JavaScript.
- Category, tag, archive, and post lists expose normal links without JavaScript.
- English, Korean, and Japanese routes each contain complete localized page
  chrome and document content in initial HTML; language switching uses normal
  links. A navigation-only fallback summary may use another language only when
  it is explicitly labeled as required by `I18N.md`.
- Every post artifact exposes a resolvable original route and validated language
  alternates. Optional post-body language context may link the original, but no
  post chrome exposes translation review state and its absence is not a release
  failure.
- Every post carries one English owner-declared original-work authorship record
  in document-head metadata, without a matching visually hidden body element.
- Search explains its client-side requirement and offers normal taxonomy/archive
  navigation when JavaScript is unavailable.
- Document and presentation managed pages expose complete readable content or an
  equivalent static fallback.
- Application managed pages expose title, description, return link, and a useful
  no-JavaScript explanation.

## Accessibility

- Target WCAG 2.2 AA for authored interfaces and generated documents.
- Semantic landmarks, one page-level heading, ordered headings, skip navigation,
  visible focus, keyboard operation, labels, alternative text, and error
  identification are required where applicable.
- The TOC has an accessible name, communicates nesting structurally, wraps long
  English/Korean/Japanese labels, and fragment targets are not obscured by
  sticky UI.
- The language switcher announces its purpose/current language, uses text rather
  than flags alone, and remains usable with keyboard, touch, and JavaScript off.
- Browser language never redirects or replaces a requested document. Language
  changes use persistent, keyboard-accessible normal links only.
- Content remains usable at 200% zoom and does not require horizontal scrolling
  for normal prose.
- Touch targets, color contrast, reduced motion, and forced/system color modes
  are checked for representative routes.
- Automated checks supplement but do not replace keyboard and screen-reader
  review of representative flows.

## Performance and resilience

- Primary content does not wait for hydration, analytics, fonts, embeds, or
  search-index downloads.
- Blog JavaScript is progressive enhancement and is split by route/capability.
- Images have intrinsic dimensions and appropriate lazy/eager loading behavior;
  responsive `srcset`/`sizes` candidates are emitted, and the primary visible
  image is not accidentally lazy-loaded.
- Fonts have licensed local files or resilient system fallbacks and do not block
  readable text.
- Third-party embeds use lazy or consent-aware loading and retain normal-link
  fallbacks when blocked.
- Field Core Web Vitals target the 75th percentile on both mobile and desktop:
  LCP at or below 2.5 seconds, INP at or below 200 milliseconds, and CLS at or
  below 0.1. Before field data exists, equivalent Lighthouse/PageSpeed lab
  checks and explicit regression budgets act as launch proxies.
- `config/performance-budgets.yaml` fixes byte, image, font, route-count,
  deployment-time, and bandwidth-warning budgets. CI treats violations as
  failures: 512 MiB release/repository, 10,000 routes, 25 MiB largest file,
  8-minute deployment, 1 MiB normal-route initial transfer, 24-megapixel/
  20 MiB source images, 512 KiB rendered images, 4 MiB published fonts,
  2,400 monthly Actions minutes, and 512 MiB retained Actions artifacts.

## Security and privacy

- Generated HTML contains no secrets, local paths, raw untrusted scripts,
  inline event handlers, or undeclared external origins.
- Managed-page requests are a subset of `config/security.yaml`; provider
  requests are a subset of `config/embeds.yaml`.
- Every iframe has a title, referrer policy, sandbox/permission policy, declared
  origin, and normal-link fallback.
- GA4 is disabled when `GA4_MEASUREMENT_ID` is absent and an invalid configured
  value fails the build. The Google loader and analytics CSP origins are emitted
  only for an enabled production build.
- GA4 makes no external request before explicit analytics consent, retains an
  equally accessible reject/revoke path, and does not block page behavior.
- Google Signals, advertising personalization, raw search terms, user IDs,
  email addresses, URL queries/fragments, post text, and code are not collected.
- Managed pages remain outside blog analytics by default. Any future expansion
  of scope, comments, or other telemetry requires a new explicit privacy and
  architecture decision.

## SEO and link integrity

- All checks in `SEO.md` pass.
- Internal links, assets, anchors, canonical URLs, sitemap entries, RSS links,
  and managed return routes resolve under both the custom-domain root and
  `/blog` portability build.
- Duplicate heading IDs, unresolved authored fragments, TOC/body mismatches,
  and renderer-side re-slugging fail validation.
- A route change has an explicit compatibility entry and never silently breaks a
  published URL.
- Each localized page has the correct `lang`, a self canonical, reciprocal
  published `hreflang` alternates, and a resolvable `x-default`; partial
  translation publication is valid when the authored original is published.
- Post navigation resolves each group once in active-language, English, then
  Korean order. Cross-language fallbacks are visibly and programmatically
  labeled, and groups with no eligible target do not produce broken links.
- Post artifacts and structured data agree on `originalLanguage`; translated
  variants are owner-reviewed before publication, `BlogPosting` records point
  `translationOfWork` to the original canonical. Any optional language-context
  chrome uses validated alternates and exposes no review state.
- Authorship disclosure metadata exactly matches the validated owner statement,
  applies only to the original work, declares human primary creation and
  proofreading-only AI assistance, and is absent from JSON-LD, descriptions,
  RSS, Open Graph, and indexed article text.
- Every published post has one static, localized `article` Open Graph set with
  the four core properties, optional/repeated properties in valid order, an
  absolute self URL, escaped values, and a resolvable post-specific image with
  MIME type, dimensions, and alternative text.
- Home-page `WebSite`, optional public author `Person`/`ProfilePage`, and
  content-specific managed-page structured data pass syntax and visible-content
  consistency checks.
- Every paginated collection uses unique `/page/<n>/` routes, self canonicals,
  sequential normal links, and no duplicate `/page/1/`.
- Favicon and post/body images are crawlable; Article image data resolves to
  approved high-resolution `1:1`, `4:3`, and `16:9` derivatives.
- AI search, user-directed, training/model-development, and public-dataset
  crawler rules remain allowed, and the wildcard policy does not block public
  indexable content or required render assets.
- `llms.txt` is present, deterministic, concise, and limited to canonical HTTPS
  language/discovery/intentional links plus non-executable interpretation and
  citation guidance. It exposes no raw Markdown, drafts, previews, private or
  `noindex` managed pages, local paths, or build timestamps.

## Build and reproducibility

- Runtime schemas validate every producer output and consumer input.
- Production artifacts contain no drafts or preview records.
- Two clean builds with the same sources and explicit environment inputs produce
  byte-identical integrity-bearing artifacts.
- Generated social-card bytes and content-addressed paths are identical across
  clean builds with the same content, design, fonts, and configuration.
- The final Pages artifact contains regular files only, stays below the 512 MiB
  project guard, and contains no source Markdown, source map, cache, or
  intermediate artifact.

## Representative release matrix

Before launch, automated and manual checks cover at least:

- home, one translated post with code/media, category, tag, archive, search,
  RSS, and 404 in English, Korean, and Japanese;
- one post with an explicit localized social image, one using its cover, and one
  using an owner-selected generated social card; their `1200 × 630`, `1:1`,
  `4:3`, and `16:9` derivatives are checked for meaningful crops at small
  display size and under both deployment base paths;
- first and later pages of global, category, tag, and archive listings;
- direct Korean, English, and Japanese URLs; explicit language-link choices;
  partial translation groups, fallback-link order, and JavaScript-disabled
  behavior;
- managed document, presentation, and application fixtures;
- desktop and narrow mobile viewport;
- keyboard-only, reduced-motion, print, and JavaScript-disabled modes;
- custom-domain and `/blog` base-path builds;
- missing/blocked external embed and font conditions;
- Search Console URL Inspection/Rich Results checks for representative deployed
  routes and a recorded post-launch Core Web Vitals review.
