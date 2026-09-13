# Blog Modification History

This file records non-routine changes to the blog project. Entries are ordered
newest first and use the `Asia/Seoul` timezone. Routine post authoring is omitted
unless it changes shared content behavior, routes, schemas, or project rules.

## 2026-09-13T18:39:29+09:00 — Prepare the aligned footer release

- Change type/reason: Owner requested committing, pushing and deploying the
  approved footer analytics-information alignment change.
- Scope: Footer CSS, design contract, browser/contract regressions and reviewed
  policy mappings; existing GitHub Pages workflow and unsigned commit retained.
- Validation: Re-ran full Vitest: 134 passed in 23 files; whitespace check
  passed. The preceding task passed typecheck and both desktop/mobile browser
  cases. Remote main matches the local parent before committing.
- Follow-up: CI, deployment and public CSS checks are pending at commit
  preparation and will be reported separately. Analytics policy is unchanged.

## 2026-09-13T18:38:30+09:00 — Align analytics information with the footer identity

- Change type/reason: Owner requested matching the analytics disclosure's
  alignment and type size to the CloverHearts Labs text immediately above it.
- Scope/result: Share the identity container's width, automatic margins and
  gutters; inherit the footer's .82rem size and muted color. Keep the summary
  bold, replace its leading native marker with a small trailing chevron, and
  align expanded copy to the same edge with a 65ch maximum measure. Preserve
  the 44px keyboard/touch target and unchanged cookieless/stop behavior.
- Tests: Added `aligns analytics information with footer identity typography
  and gutters` and extended both production-HTML browser cases to compare
  exact horizontal alignment, computed text size/color, expanded-copy position
  and target height. Reviewed and updated design/style policy coverage.
- Validation: Full Vitest 134 passed in 23 files; typecheck and two Chromium
  desktop/mobile cases passed. Inspected collapsed desktop and expanded mobile
  screenshots. Browser fixtures block remote activity and use fallback fonts;
  other engines and physical devices were not tested.
- Compatibility: CSS-only change; content contracts and analytics collection
  policy are unchanged. No commit, push or deployment in this task.

## 2026-09-13T17:44:02+09:00 — Prepare the cookieless analytics deployment

- Change type/reason: Owner requested committing, pushing and deploying the
  approved immediate cookieless analytics change.
- Scope/result: Release the schema-3 adapter, collapsed information/stop UI,
  ADR 0011, documentation and paired tests together using the existing main
  branch GitHub Pages workflow and previously requested unsigned commit.
- Validation: Re-ran full Vitest: 133 passed in 23 files; whitespace check
  passed. The preceding change also passed typecheck, production build/Pages
  verification and two stubbed Chromium cases. Read back the repository project
  ID and confirmed the custom domain, Actions publishing and HTTPS enforcement.
- Follow-up: At commit preparation, remote CI/deployment and public-site checks
  are pending and will be reported separately. Microsoft dashboard cookie
  settings and actual collection remain unverified; deployment alone does not
  establish that external-service gate. No collection scope was expanded.

## 2026-09-13T17:42:47+09:00 — Start limited cookieless Clarity without a consent request

- Change type/reason: Owner explicitly accepted the limited cookieless mode
  and requested immediate collection without a consent prompt. ADR 0011
  supersedes ADR 0010 only for loading/consent UI; analytics schema moves to 3.
- Scope/result: Queue both ConsentV2 storage purposes as denied before loading
  the SDK. Remove the allow action and inferred permission writes. Replace the
  large request with collapsed localized information, privacy link and stop
  control. Preserve saved Clarity refusal, cross-tab stop/reload, body masking,
  blank-ID disabling, query/fragment/referrer guards and all route/preview
  exclusions. Cookie use is never enabled by a previous grant.
- Tests/contracts: Intentionally replace opt-in expectations with
  `starts cookieless without consent but honors saved denial and disabled IDs`
  and `queues both storage denials before immediate SDK loading without saving
  permission`. Retain opt-out, storage failure, entry exclusion and deterministic
  locale/base-path cases. Browser cases cover automatic loading, collapsed UI,
  keyboard stop and persisted/cross-tab refusal. Reviewed policy mappings;
  updated runbooks and all README translations. CONTENT_RULES.md still accurately
  forbids author tracking fields; no content syntax or artifact change is needed.
- Validation: Focused analytics suite 8 passed; full Vitest 133 passed in 23
  files; typecheck passed. Two Chromium desktop/mobile cases passed, and their
  collapsed/expanded screenshots were inspected. Production build with the
  configured ID, Pages verification and whitespace checks passed. Initial
  checks caught a test callback return type and duplicate policy ownership;
  both were corrected before the passing runs. Browser launch required sandbox
  approval; all provider requests were stubbed, not sent to Microsoft.
- Compatibility/follow-up: No commit, push or deployment in this task. Verify
  Clarity Settings / Setup cookies OFF, real cookie/network behavior and dashboard
  receipt before activation. Cookieless data cannot reliably join returning
  users or multi-page journeys and is not a privacy-law exemption. Blocked
  browser storage prevents persisting opt-out across reloads. Local preview and
  query entries such as `?lang=ko` remain untracked.

## 2026-09-13T17:28:25+09:00 — Prepare the approved design and Clarity release

- Change type/reason: Owner requested committing, pushing and deploying all
  pending approved changes, using the previously requested unsigned commit.
- Scope: Image-viewer caption containment, viewport-sized arrow-free 404
  recovery, Clarity-only consent-gated analytics and the related documentation,
  policy mappings and regression suites. The earlier sample-content removal
  commit is also ahead of the remote and will be included in the push.
- Validation: Full Vitest: 133 passed in 23 files; typecheck passed. All 20
  Chromium tests passed (2 Clarity consent, 6 image-viewer, 12 recovery layout).
  Real-ID production build, Pages verification and whitespace checks passed.
  Browser analytics tests stub Microsoft requests and do not verify its dashboard.
- Compatibility/follow-up: Repository Clarity variable was read back successfully.
  At preparation time GitHub deployment and public-site checks are pending and
  will be reported separately after the push. No source content was added and
  existing privacy exclusions remain unchanged.

## 2026-09-13T17:25:20+09:00 — Connect the owner-supplied Clarity project

- Change type/reason: Owner supplied the manual Clarity snippet to connect the
  existing consent-gated integration to the real project.
- Scope/result: Extracted the public project ID without embedding the inline
  snippet. Checked repository and Pages-environment variables, then set and
  read back the repository CLARITY_PROJECT_ID variable for cloverhearts/blog.
  Existing production build/verification steps consume this variable; test and
  preview jobs remain unconfigured. No consent or collection scope was widened.
- Tests: Added `passes the public Clarity variable only to production build
  and verification`, covering both consumers, exclusion from quality jobs and
  absence of a legacy GA4 variable or pasted vendor loader. Updated policy mapping.
- Validation: Focused workflow/Clarity suites: 17 passed; full Vitest: 133
  passed in 23 files; typecheck and whitespace checks passed. Production build
  with the supplied ID and Pages verification passed. Inspected generated HTML
  for the ID in three localized homes and for absence of the analytics module
  in profile, search and 404 outputs. No test activity was sent to Microsoft.
- Compatibility/follow-up: The public ID is a deployment variable, not post
  metadata or a hard-coded script. Code remains uncommitted and undeployed;
  real SDK/network/CSP behavior, dashboard receipt and replay masking still
  require post-deployment verification. Local preview remains untracked.

## 2026-09-13T13:11:20+09:00 — Replace GA4 scaffold with consent-gated Clarity

- Change type/reason: Owner selected Clarity as the single analytics provider
  for visitor behavior and reading-region analysis, without paid services.
- Scope/result: Replaced the GA4 adapter/configuration with Clarity schema 2,
  public CLARITY_PROJECT_ID validation and production-workflow wiring. The old
  GA4 scaffold was not wired to execute in rendered pages; the new local ES
  module is wired to localized disclosure and allow/decline-withdraw controls.
  Fresh Clarity-specific consent is required; old GA4 consent is ignored.
- Privacy: No remote loader before consent; advertising storage denied; body
  text masked; no custom identity/event-payload API. Preview, managed/profile,
  search and noindex pages are excluded. Query/fragment entries and sensitive
  referrers suppress loading. Withdrawal saves denial and reloads to unload the
  SDK because vendor consent denial alone permits limited cookieless tracking.
  Only Clarity origins are allowed, with no Google/Bing advertising origins or
  unsafe-inline permission. Provider-owned URL/attribute collection is not
  represented as fully sanitized; ANALYTICS.md explains limitations and gates.
- Contracts/migration: ADR 0010, shared policy, authoring restriction references,
  architecture, UX/design, runbooks and all three README translations updated.
  The public ID participates in web provenance, not content artifacts. Existing
  GA4 tests were replaced with equivalent Clarity activation/consent regressions;
  custom GA4 event sanitization intentionally becomes conservative entry
  exclusion and masked provider recording, not an equivalent page-view API.
  No post metadata, managed routes, dependencies or sample content changed.
- Validation: Focused Clarity Vitest: 8 passed; full Vitest: 132 passed in 23
  files; typecheck and whitespace checks passed. Two Chromium production-HTML
  desktop/mobile tests passed for no pre-consent request, keyboard grant,
  load-once, masking and revoke/reload; the remote SDK was stubbed and no test
  traffic reached Microsoft. Enabled root and /blog production builds passed,
  then a blank-ID root build restored tracking-disabled output. Pages verification
  passed; generated profiles were checked for absence of the analytics module.
  Local preview was started with analytics excluded.
- Remaining gates: No real project ID has been supplied. GitHub variable setup,
  actual SDK/network/CSP behavior, dashboard receipt and real replay masking
  are not verified. No live activation, commit, push or deployment performed.

## 2026-09-13T00:22:14+09:00 — Give recovery content a viewport-sized reading area

- Change type/reason: Owner requested a taller 404 content area occupying
  roughly 80% of the screen's internal content height with generous alignment.
- Scope/result: The recovery section now has a minimum height of 80% of the
  dynamic viewport below the desktop/two-row header. It owns its padding and
  centers the content stack vertically. Enlarged the responsive error code and
  separated the title, description and recovery actions with explicit spacing.
  Removed inherited main padding and extra footer margin only on 404 pages.
  Short viewports and wrapped translations expand naturally, without a fixed
  height or clipping. Arrow-free green-highlight links remain unchanged.
- Contracts/tests: Updated DESIGN and reviewed its CSS policy mappings. Added
  `sizes recovery content to the available viewport without a fixed height` and
  twelve real-renderer Playwright recovery layout cases, documented in the
  browser-test guide. The empty temporary fixture does not restore sample posts.
- Validation: Focused Vitest: 19 passed; full Vitest: 129 passed in 23 files;
  typecheck and whitespace checks passed. Chromium: 12 recovery cases passed
  across Korean, English and Japanese at 1137x905, 1920x1080, 390x844 and
  320x320. Checks cover minimum/natural height, centered spacing, content/footer
  separation, all nine links, 44px targets and horizontal bounds. Inspected
  desktop Korean and mobile Japanese screenshots. The browser fixtures block
  network requests and use fallback fonts; other engines, physical devices and
  explicit browser-zoom checks were not run.
- Compatibility/follow-up: CSS-only presentation change; content authoring,
  routes and publication contracts are unchanged. No commit, push or deployment.

## 2026-09-13T00:18:27+09:00 — Simplify 404 recovery link feedback

- Change type/reason: Owner requested arrow-free recovery navigation with
  transparent resting backgrounds and a highlight on hover/focus.
- Scope/result: Removed decorative arrows only from the 404 recovery links.
  Added 44px-minimum link targets with horizontal inset and wrapping gaps.
  Hover and keyboard focus use the existing green `--primary-surface` token;
  no shadow, movement or underline is added. The shared focus outline and all
  localized static destinations/order are preserved.
- Contracts/tests: Updated DESIGN and reviewed the renderer/style policy
  mappings. Added `renders arrow-free recovery links in source order across
  locales and deployment bases` and `keeps recovery links transparent until
  hover or keyboard focus`. The route fixture covers three locales, root and
  `/blog` bases, and omission of unavailable curated actions.
- Validation: Full Vitest: 128 passed in 23 files. Typecheck and whitespace
  checks passed. Local Chromium checks passed for 1137px and 320px widths in
  light/dark mode: all nine live recovery links, transparent rest, green hover
  and keyboard focus, visible outlines, 44px targets and no horizontal overflow.
  Inspected the desktop screenshot. Other browser engines and physical-device
  checks were not run. Restarted local preview to load the renderer change.
- Compatibility/follow-up: Presentation-only change; no route, author syntax,
  content contract or publication change. Existing sample removals and blank
  profiles remain intact. No commit, push or deployment performed.

## 2026-09-13T00:12:18+09:00 — Keep enlarged-image captions visible and slim

- Change type/reason: Fix caption clipping in the image enlargement dialog and
  reduce the caption surface's vertical padding as requested by the owner.
- Scope/result: The figure now uses border-box sizing, so its 100% height
  includes padding instead of overflowing the clipped dialog. A shrinkable,
  contained image shares the available height with a non-shrinking caption.
  Caption padding is 6px vertically/12px horizontally, with an 8px image gap.
  Long text wraps; exceptionally long captions have a bounded, keyboard-
  focusable scrolling region. Empty captions remain hidden. The close control,
  Escape behavior and return focus are preserved.
- Contracts/tests: Updated DESIGN, UX_FLOW, component/renderer assertions and
  their reviewed policy hashes. Added six Playwright image-viewer regressions
  using the actual renderer, CSS and enhancement with synthetic images, without
  restoring deleted sample posts. Documented the separate browser-test command.
- Validation: Focused Vitest: 19 passed; full Vitest: 126 passed in 23 files;
  typecheck and whitespace checks passed. Chromium browser tests: 6 passed,
  covering desktop landscape, large portrait, mobile portrait, mobile landscape
  with a long caption, compact unbroken text and an empty caption. They verify
  geometry, wrapping, 6px padding, keyboard scrolling, Escape and focus return.
  Desktop/mobile screenshots were inspected. Browser fixtures use system-font
  fallbacks and block network requests; physical-device, other-engine and
  assistive-technology checks were not performed. Local preview was restarted.
- Compatibility/follow-up: Presentation-only change with no new content syntax
  or author metadata; CONTENT_RULES remains accurate. Empty post sources and
  reachable blank profiles are unchanged. No commit, push or deployment.

## 2026-09-13T00:06:33+09:00 — Finalize design and clear layout-review content

- Change type/reason: Owner accepted the blog design and requested a clean
  starting point for real posts and profiles, committed locally.
- Scope/result: Removed 20 sample translation groups (60 draft Markdown files),
  20 sample thumbnails, 20 layout-note copies, five sample categories and 18
  topical tags. Removed sample collection inclusions/category selectors;
  permanent Work/Daily routes and their two marker tags remain. Empty taxonomy
  and post lists do not expose sample routes. All removed material and previous
  profile drafts were backed up outside the repository before removal; tracked
  samples also remain recoverable from earlier Git history.
- Profiles: Preserved `/profile/`, `/en/profile/` and `/ja/profile/` as published
  document shells with empty content, truthful identity metadata, the existing
  local design and required return links. They are noindex and excluded from
  sitemap, RSS and search. No biography, projects or placeholder prose was
  published. CONTENT_RULES documents this use of the existing empty Markdown
  entry; no schema or post publication rule changed.
- Tests/contracts: Added `publishes empty noindex profiles without sample
  discovery at root and subpath`. Existing rich-Markdown and draft-profile
  checks now create their own explicit fixtures instead of depending on the
  live biography. Curated fixtures retain their synthetic taxonomy; the live
  selector baseline intentionally changes from sample keys to empty selectors.
  Corrected the pipeline test to build managed routes before web profile links,
  matching release orchestration. Reviewed affected policy mappings/hashes.
- Validation: Focused suites: 14 passed; full Vitest: 126 passed in 23 files;
  typecheck and configuration validation passed. Production builds at the root
  and `/blog` base passed, followed by a restored root build and `verify:pages`.
  Actual preview/production manifests contain zero posts and three profiles;
  production profiles have empty bodies and working author links. Local HTTP
  checks returned 200 for home, Explore and all profiles, and 404 for removed
  sample post/category routes. Whitespace checks passed. Interactive visual,
  assistive-technology and live deployment checks were not performed.
- Compatibility/follow-up: This commit also preserves the previously approved,
  uncommitted design, avatar, search, language-selection, security and README
  work recorded in earlier entries. Author real content separately; no sample drafts were
  promoted. Commit only: no push or deployment was requested.

## 2026-09-12T23:47:53+09:00 — Replace the author monogram with the approved avatar

- Change type/reason: Owner supplied their GitHub avatar URL to replace the CH
  author icon after the earlier image attachment lacked an accessible file.
- Scope/result: Home introductions and post author rails now show the unchanged
  192px PNG at the existing 48px square size, without cropping, tinting or a
  green background. The image is decorative beside the author name. The web
  layer bundles it locally under a content-addressed URL and includes its hash
  in build provenance; CI and visitors make no avatar request to GitHub.
  Root DESIGN records the authorized source and display treatment.
- Validation: Added `bundles the approved author avatar for localized homes
  and posts at both bases` (static markup, locale/root/subpath URLs, exact PNG
  bytes and dimensions) and `preserves the author avatar square and colors
  across themes`. Fixed an initially overbroad test selector that also counted
  the existing post-rail margin rule. Full Vitest: 125 passed in 23 files;
  typecheck and `git diff --check` passed. Reviewed DESIGN/CSS/renderer policy
  hashes. Local home and sample post returned HTTP 200 with the new avatar;
  both image responses matched the approved local PNG exactly. Source image
  inspected visually; interactive page and high-density device review not run.
- Compatibility/follow-up: No post metadata, authoring contract, routes,
  publication state, dependencies, favicon or standalone managed profile
  changed. Existing layout and source content remain intact. No production
  deployment or commit performed.

## 2026-09-12T23:44:21+09:00 — Reuse the green highlight on Explore collections

- Change type/reason: Owner-requested refinement of the preceding Explore
  design change: replace the separate neutral hover wash with the established
  green highlight color.
- Scope/result: Collection hover and keyboard focus now use `--primary-surface`
  directly, matching taxonomy links and search results in light and dark modes.
  Removed the redundant gray hover token. Transparent resting backgrounds,
  borderless layout, neutral text, focus outlines and reduced motion remain.
- Validation: Updated `keeps explore collections transparent with the shared
  green hover surface` to intentionally replace the previous gray-color
  expectations, while retaining geometry, text and accessibility assertions;
  reviewed the DESIGN/CSS policy mappings and hashes. Focused suite: 15 passed;
  full Vitest: 123 passed in 23 files. `git diff --check` passed. Confirmed the
  regenerated preview CSS uses the shared light/dark highlight values.
  Interactive browser visual review was not performed.
- Compatibility/follow-up: CSS-only behavior change; no content authoring,
  routes, publication, dependencies or managed-page changes. No commit or
  deployment performed.

## 2026-09-12T23:39:00+09:00 — Quiet transparent collection links on Explore

- Change type/reason: Owner-requested removal of the prominent card treatment
  from Explore's curated collection links.
- Scope/result: Both collections now have transparent resting backgrounds and
  no enclosing border or green top highlight. Counts/arrows use neutral muted
  text. Hover/focus adds a near-white gray wash at 30% opacity without dimming
  text, shadows, motion, or underlines. Dark mode uses a neutral 6% white wash
  to retain contrast. Keyboard focus outlines and responsive columns remain;
  reduced-motion handling includes these links.
- Validation: Added `keeps explore collections transparent with a subtle neutral
  hover wash` covering rest/hover/focus styling, absence of green accents and
  elevation, dark mode, reduced motion and responsive layout. Intentionally
  replaced the old green-top-border baseline assertion to match this explicit
  design change; reviewed DESIGN/CSS policy hashes. Focused tests: 16 passed;
  full Vitest: 123 passed in 23 files; `git diff --check` passed. Confirmed the
  updated neutral-wash rules in the regenerated preview stylesheet. Interactive
  browser visual review was not performed.
- Compatibility/follow-up: Presentation-only change; content, destinations,
  publication, taxonomy links and managed profiles remain unchanged. No new
  dependencies, commit or deployment.

## 2026-09-12T22:58:53+09:00 — Link the home hero title and remove Read More underline

- Change type/reason: Owner-selected browser feedback on the home hero h1 and
  the featured card's Read More label.
- Scope/result: Read More has no underline at rest or on hover. The hero h1 is
  now a static, keyboard-accessible link to the post supplying its visual:
  first Selected Work, otherwise featured. The accessible name includes the
  destination title; cross-language fallback is labeled. Empty homes keep a
  plain h1. The separate All Posts action and article-body links are unchanged.
- Contracts: Updated DESIGN, UX_FLOW and the presentation note in CONTENT_RULES;
  no new author fields or publication/selection changes. Reviewed corresponding
  policy mappings/hashes. The previous persistent Read More underline test
  expectation changed intentionally to match this new explicit request.
- Validation: Added `links the hero title to its featured fallback across
  languages and deployment bases`, extended curated-image target and empty-home
  regressions, and updated underline/focus CSS coverage. Focused suites: 31
  passed; full Vitest: 122 passed in 23 files; typecheck and `git diff --check`
  passed. Restarted preview and confirmed the served hero points to
  `/posts/building-ai-skills/` with HTTP 200 and the served Read More rule is
  `text-decoration: none`. Interactive browser testing was not performed.
- Compatibility/follow-up: Links work without JavaScript and honor root/subpath
  deployments and existing locale selection. No commit or deployment performed.

## 2026-09-12T22:55:00+09:00 — Remove hover-added link underlines

- Change type/reason: Owner-requested interaction refinement; hovering a link
  must not add a new underline.
- Scope/result: Featured/list titles and category/tag filters use dark-green
  feedback without hover/focus underlines. Keyboard focus outlines, fully opaque
  text, persistent prose-link underlines and the hero action rule remain intact.
  Updated the root design contract and reviewed its policy coverage hashes.
- Validation: Added `keeps hover links free of new underlines while preserving
  keyboard focus`; intentionally changed the baseline filter expectation to
  match the owner's new contract. Focused baseline/policy tests: 15 passed.
  Full Vitest suite: 121 passed across 23 files. `git diff --check` passed.
  Confirmed both new rules in the regenerated preview stylesheet. Interactive
  browser testing was not performed.
- Compatibility/follow-up: Presentation only; no content, routes, dependencies,
  managed-page design or publication changes. No commit or deployment performed.

## 2026-09-12T21:52:00+09:00 — Harden preview and metadata; build evidence-based profile drafts

- Change type/reason: Owner-requested remediation of the security/readability
  review and a grounded Applied AI Engineer introduction.
- Security scope/result: Preview decodes request paths once, rejects malformed
  requests with 400, and refuses lexical or symlink escapes with 403. Blog and
  managed JSON-LD escape HTML script boundaries while preserving JSON values.
  These address a local-development file exposure and a build-time metadata
  injection risk; they are not evidence of an exploited production incident.
- Design scope/result: Post, featured, filter and previous/next text remains
  opaque. Metadata/text-link tokens meet AA contrast on normal light/dark
  surfaces. Empty homes use a compact text-only hero and one empty state.
  Profile actions and profile alternates omit unavailable locale routes.
- Profile scope/result: Created Korean source and English/Japanese draft
  introductions around connected workflows, explicit execution boundaries,
  review criteria, and two grounded examples. Read the owner's Drive knowledge
  base: the LUI Skills development record and the Guro IT Guy Vlog planning
  documents. Omitted employers, internal system details, private destinations,
  unverified metrics and unsupported career claims. Local sample AI posts were
  explicitly not used as career evidence. The page remains draft/noindex in all
  locales for biography and translation review; no sample post was published.
- Implementation: Added static sanitized managed Markdown and optional
  `entry.stylesheet` with network-free CSS validation, package/symlink bounds,
  deterministic stylesheet provenance and page-local responsive/print design.
  The web lane reads validated managed route availability, not source files.
  Managed builds precede web rendering; preview copies standalone pages after
  search indexing. Corrected the status matrix: interactive TypeScript and
  presentation adapters remain partial rather than implemented.
- Validation: `security-profile.test.ts` adds six named cases covering JSON-LD
  escaping, safe Markdown/CSS, draft/static/deterministic profiles, root/subpath
  route availability and empty states, managed path/symlink bounds, and AA
  text-token contrast. `dev-preview.test.ts` adds traversal/symlink and malformed
  request regressions and extends managed-source rebuild coverage. Updated the
  baseline dimming and draft-link expectations intentionally because this user
  request changes those contracts; no tests were skipped. Reviewed governed
  mappings and refreshed affected policy hashes. Full Vitest: 120 passed in
  23 files; typecheck passed; root and `/blog` production builds including Pages
  verification passed; `git diff --check` passed. Restarted the preview server
  and verified HTTP 200 for all three profiles, 403 for encoded traversal,
  400 for malformed encoding, 404 for a missing route, and continued home 200.
- Compatibility/follow-up: `entry.stylesheet` is optional; source schema 1 and
  existing routes remain compatible. No dependencies, DNS, commits, pushes or
  deployments changed. Profile source HTML is readable without JavaScript;
  interactive browser, screen-reader and printed-page visual review were not
  performed. Owner review and production publication remain explicit gates.

## 2026-09-11T18:34:10+09:00 — Select browser language only on root entry

- Change type/reason: Owner-requested routing exception. The exact deployment
  root chooses the first supported browser preference; English and Japanese
  enter their static homes, while Korean or unavailable/unsupported preferences
  retain Korean. Other URIs are never redirected by this enhancement.
- Scope/result: Added the blog-owned root entry module, configuration-derived
  home destinations, schema-8 `root-only` configuration, and normal Korean home
  menu links with `?lang=ko` so explicit selection survives reload without
  cookies/storage. Query/fragment survive automatic `location.replace`.
  Canonical, hreflang, x-default, and no-JavaScript Korean HTML stay unchanged.
  ADR 0009 supersedes only ADR 0008's blanket browser-selection prohibition;
  updated the related guides and all three README languages consistently.
- Validation: Added i18n cases `selects the first supported browser language
  only at the root`, `preserves explicit Korean choice query fragments and
  base-path boundaries`, `redirects with replace and keeps static fallback when
  preferences are unavailable`, and `requires site schema eight and the
  explicit root-only routing policy`. Added the rendered/base-path regression
  `emits root language enhancement without changing direct documents or
  canonical alternates`. The existing configuration expectation intentionally
  changes from manual-only/schema 7 to owner-approved root-only/schema 8.
  Reviewed mapped policy coverage and refreshed hashes; no existing valid
  publication or post-navigation test was removed or weakened.
- Checks: Focused i18n/navigation/baseline/README suites passed 37/37; full
  contract suite passed 112/112 across 22 files; type checking passed. Root
  production build and Pages verification passed, then `/blog` build and Pages
  verification passed; regenerated the final release with the root base path.
  Preview content and web builds passed. An initial preview command supplied
  an HTTP origin and was correctly rejected; it was rerun with the configured
  HTTPS origin. Whitespace validation passed.
- Browser checks: Local English and Japanese homes retained their languages
  without the root helper. Explicit Korean selection and reload retained
  Korean; a direct Korean post retained its URI language and omitted the helper.
  Browser preference combinations were covered by automated injected-runtime
  tests; device language settings were not changed. Live production rollout
  and external cross-browser checks were not performed.
- Compatibility/follow-up: CONTENT_RULES remains accurate after documenting
  this presentation-only entry exception; no author fields, post publication,
  managed-page behavior, search eligibility, or content artifact contract
  changed. Preserved prior local README, typography, and search work. No commit,
  push, or deployment was performed in this task.

## 2026-09-11T18:22:01+09:00 — Refine search dialog controls and dismissal

- Change type: Owner-requested search interaction, icon, and visual refinement.
- Scope/result: The close control now uses a 44px target and flat hover/focus/
  press feedback with heavier text and green highlighting, without the generic
  button shadow or transform. Keyboard focus outlines remain. Backdrop gestures
  close the native dialog through the existing focus-restoration path; interior
  clicks, border clicks, right clicks, cancelled gestures, and drags originating
  inside do not dismiss it. Native Escape and the close button are preserved.
- Icon provenance: Replaced the CSS-drawn lens with Lucide's Search SVG at
  commit `6bbe5ddb07525b0d0056c622c550517f727d08b4`. Reviewed the official SVG
  and ISC/Feather MIT notices; retained both complete notices in source and
  emitted HTML. The decorative, nonfocusable inline SVG needs no external
  request, runtime icon package, new dependency, or content-owned asset.
- Contracts: Updated DESIGN, UX_FLOW, and reviewed policy mappings/hashes.
  No authoring syntax, content search eligibility, index ownership, or query
  behavior changed; the existing CONTENT_RULES search contract still applies.
- Validation: Added `dismisses search only for completed backdrop gestures`,
  `keeps search close feedback flat with visible keyboard focus`, and
  `embeds the licensed Lucide search SVG without a runtime icon dependency`.
  Search tests passed 8/8; type checking passed; the full suite passed 107/107
  across 22 files; preview web output wrote 172 files; production build and
  Pages verification passed; whitespace checks passed.
- Browser validation: Desktop interior click preserved the open dialog;
  backdrop, close button, and Escape each closed it and restored Search-link
  focus. Actual hovered close-button styles reported no shadow/transform and
  weight 750. At 390px the icon was 24px wide, neither dialog nor page overflowed,
  and backdrop dismissal restored focus. Desktop/mobile visuals were inspected
  and the viewport was reset afterward.
- Compatibility/follow-up: No post, publication, locale, managed-page, or
  analytics change. Prior uncommitted README/typography changes remain intact.
  This task did not commit, push, or deploy the changes.

## 2026-09-11T18:15:35+09:00 — Use natural letter spacing for identity labels

- Change type: Owner-directed typography follow-up.
- Reason/result: The owner preferred zero letter spacing for the English
  labels. Changed shared eyebrow tracking from `.04em` to `0`, retaining
  `.12em` additional word spacing and all other typography and layout rules.
- Scope: Shared blog CSS, DESIGN, the existing eyebrow regression assertion,
  and reviewed design-policy hashes. The assertion intentionally changes to
  match the new owner-approved value and rejects both previous tracking values.
- Validation: Focused site-baseline/governance suites passed 14/14; the full
  suite passed 104/104 across 22 files; preview web build wrote 172 files;
  whitespace validation passed. Browser inspection of both home labels reports
  natural letter spacing (`normal`, the browser serialization of zero) while
  retaining the prior word spacing.
- Compatibility: Local preview only; no commit or deployment. Existing README
  changes and all content, publication, routing, and managed pages are untouched.

## 2026-09-11T18:14:47+09:00 — Improve uppercase identity word spacing

- Change type: Owner-commented typography refinement and regression coverage.
- Reason: The hero and author role looked like separated letters instead of
  clear English words. Browser measurement found `.12em` tracking with no
  additional word spacing on both shared eyebrow labels.
- Scope/result: Shared eyebrow tracking is now `.04em`, with `.12em` additional
  word spacing. Hero, author introduction/rail, and collection labels stay
  consistent; text, uppercase treatment, weight, size, ordinary prose, display
  headings, and the existing responsive wrapping rules remain unchanged.
  Updated DESIGN and reviewed the mapped cases before refreshing policy hashes.
- Validation: The new `keeps eyebrow letters grouped with distinct word spacing`
  case protects the spacing and rejects the old tracking and forced no-wrap or
  break-all behavior. Focused site-baseline/governance tests passed 14/14;
  all 104 tests passed across 22 files. Preview web build wrote 172 files and
  whitespace validation passed. Browser checks at 1137px measured hero/author
  tracking of 0.4992/0.5888px and additional word spacing of 1.4976/1.7664px.
  At 390px, Korean mixed-script and English home labels fit on single lines
  without horizontal overflow. Visually inspected desktop and Korean mobile
  views; restored the normal viewport and Korean home afterward.
- Compatibility/follow-up: No content, locale, route, or managed-page changes.
  Earlier uncommitted README changes remain intact. This task updated the local
  preview only; no commit, production build, or deployment was performed.

## 2026-09-11T18:10:45+09:00 — Separate localized README documents

- Change type: Owner-requested documentation organization, agent-rule update,
  and documentation-navigation regression coverage.
- Reason: Interleaved English and Korean sections made the README difficult
  to read. The owner requested an English default and separate translations
  with reciprocal language navigation, extensible to Japanese and other languages.
- Scope/result: `README.md` now contains English prose; `README.ko.md` preserves
  the Korean companion content, and `README.ja.md` adds the matching Japanese
  translation. Each has a dedicated top selector identifying the current
  language and linking to the other two files. All versions retain the same
  commands, sections, and reference destinations. Stale implementation and
  deployment descriptions were corrected using the executable repository and
  previously verified HTTPS deployment as evidence.
- Policy: Replaced the superseded inline English/Korean rule in `AGENTS.md`
  with separate `README.<language-code>.md` files, synchronized translations,
  and links only to existing files. README locales do not change blog locales.
  Reviewed the existing governance cases and added the README tests before
  refreshing the agent-instruction hash in policy coverage.
- Validation: New `readme-localization.test.ts` cases verify reciprocal top
  navigation, reject missing/nonreciprocal language links, check separated
  prose plus section/command/reference parity and relative-link existence,
  and enforce aligned agent rules. Focused README/governance tests passed 5/5;
  type checking passed; the full suite passed 103/103 across 22 files with no
  failures or skips. Whitespace checks passed; the old inline-translation
  instruction no longer appears in active project guides.
- Compatibility/follow-up: Documentation and tests only; no content contract,
  post, route, runtime behavior, dependency, or deployment configuration changed.
  Production build, external-link checks, commit, and deployment were not run
  for this documentation-only task. Existing temporary output remains untouched.

## 2026-09-11T18:02:47+09:00 — Dependency security remediation

- Change type: Owner-requested dependency patches, security regression tests,
  policy traceability, and redeployment preparation.
- Reason: GitHub reported eight open Dependabot alerts covering Astro, Sharp,
  js-yaml, SVGO, Vitest, and its mocker package. Reviewed advisory fixed-version
  ranges and registry metadata before updating the existing approved stack.
- Scope/result: Raised declared minimums and locked Astro 7.2.8, Sharp 0.35.4
  in all three consumers, Vitest/@vitest/mocker 4.1.11, js-yaml 4.3.2, and
  SVGO 4.1.0 with their required transitive updates. No alert was dismissed,
  install-script permissions expanded, or production/content policy changed.
  Added reviewed dependency manifests and the lockfile to stack-policy coverage.
- New regression suite: `dependency-security.test.ts` checks every locked copy,
  including nested dependencies; accepts fixed and later stable patch releases;
  rejects the previously vulnerable versions; and rejects missing dependencies
  or unreviewed prereleases. Existing behavioral and policy tests are unchanged.
- Validation: Node 24.19.0/npm 11.17.0 clean `npm ci` passed; `npm audit --json`
  reported zero vulnerabilities across all severities; type checking passed.
  Focused dependency-security, implementation-stack, and policy-governance
  suites passed 13/13; the full suite passed 99/99 across 21 files with no
  failures or skips. Complete `/blog` and root production builds plus matching
  Pages verification passed; root was built last. Whitespace validation passed.
- Compatibility/follow-up: No source post, managed-page content, route, design,
  or publication status changed. Temporary authoring output remains local.
  The preceding release `9892392` is already live over verified HTTPS; this
  security release still requires push, CI/deployment confirmation, and GitHub's
  post-push alert rescan. This entry does not claim those external gates passed.

## 2026-09-11T17:41:11+09:00 — Production deployment checkpoint

- Change type: Owner-authorized commit, push, and deployment checkpoint.
- Scope: All pending tracked home/design, Applied AI Engineer branding,
  responsive article-spacing, Pages/Quality workflow, documentation, and test
  changes recorded below. Temporary `outputs/` authoring copies remain local.
- Validation: The preceding completed validation passed 95/95 tests, type
  checking, and root plus `/blog` production builds and Pages verification;
  the pre-commit whitespace check passed. No source behavior changed since
  those checks. All source posts remain drafts under existing publication rules.
- Deployment state at checkpoint: Remote main matches the local parent commit.
  GitHub Pages uses workflow deployment. Custom-domain registration was retried
  and again rejected as already taken. None of the accessible Pages-enabled
  repositories returned that domain. The live HTTPS domain currently returns
  GitHub's 404. CI and deployment results will be verified after push; this entry
  does not claim a successful release or completed custom-domain association.

## 2026-09-11T17:36:22+09:00 — Custom-domain deployment prepared

- Change type: Pages workflow configuration, CI portability correction,
  test-fixture lifecycle correction, bilingual deployment documentation, and
  policy traceability.
- Reason: The owner requested GitHub deployment configuration for
  `https://blog.cloverhearts.com`. The origin and main-branch Pages workflow
  already existed, but the README incorrectly described deployment as absent.
  Quality CI rebuilt only the web lane for `/blog` before checking the old root
  release. The latest remote Quality run also timed out while constructing the
  shared pagination fixture inside the first two 5-second test windows.
- Scope/result: Pages explicitly verifies `dist/` before upload and grants
  deployment write permissions only to the deployment job. Quality builds root
  and `/blog` variants in separate matrix jobs through every production lane.
  The shared pagination fixture now builds in a bounded 30-second `beforeAll`
  hook; all existing assertions and individual test limits remain intact.
  README deployment instructions now include domain registration, DNS, HTTPS,
  and draft exclusion. Workflow contracts are mapped in policy coverage.
- Validation: Focused implementation-stack, pagination-navigation,
  site-baseline, and policy-governance suites passed 25/25; type checking
  passed; the full suite passed 95/95 across 20 files. Complete root and `/blog`
  production builds and their matching `verify:pages` commands passed. The
  root build was run last and contains zero published posts. The added case is
  `deploys only a verified custom-domain release and isolates portability builds`.
- External result / follow-up: GitHub reports `cloverhearts/blog` as a public
  repository using workflow Pages, with no custom domain. Setting the requested
  domain returned HTTP 400 because it is already taken by another Pages site;
  the attempted update did not succeed. DNS A records resolve to GitHub Pages.
  Domain ownership verification or release of the existing association remains
  necessary. No DNS mutation, commit, push, or deployment was performed.

## 2026-09-11T17:36:22+09:00 — Post sidebar spacing made responsive

- Change type: Owner-requested presentation adjustment and design alignment.
- Reason: The fixed 28px gaps made the table of contents and author profile
  feel crowded against the article on wide screens.
- Scope/result: The shared post grid now distributes available width equally
  into 28–80px side gaps while preserving the 640px desktop reading column.
  At 1024px and below the two-column layout restores 28px spacing, and the
  existing single-column breakpoint remains. Updated DESIGN and policy hashes.
- Validation: Preview web build wrote 172 files; the existing site-baseline
  cases passed in the focused and full suites above. Browser measurements on
  `/posts/building-ai-skills/` found 640px body width with 80px gaps at 1440px,
  77px gaps at 1137px, and a 28px left gap at 1024px with author below the body.
  At 768px and 390px the layout was one column with 707px and 335px body widths.
  No tested viewport overflowed horizontally; the temporary viewport was reset.
- Compatibility: This reversible spacing change reuses the existing structural
  tests and direct responsive measurements. Content contracts, routes, article
  typography, and managed pages are unchanged.

## 2026-09-04T01:44:04+09:00 — Public role rebranded as Applied AI Engineer

- Change type: Owner-directed identity copy change, localized UI/configuration
  update, design-contract alignment, regression coverage, and governed
  policy-hash refresh.
- Reason: The owner selected “Applied AI Engineer” as the public professional
  identity and asked to replace the previous “AI Workflow Engineer” wording
  throughout the normal blog.
- Scope: English, Korean, and Japanese home-page eyebrow and author-role copy;
  localized owner biographies; `DESIGN.md`; i18n regression coverage; and
  policy traceability. Hero title, article content, routes, layout, assets,
  managed pages, and publication state are unchanged.
- Result: Every localized home page now identifies CloverHearts as an “Applied
  AI Engineer,” and each localized owner biography uses the same role while
  preserving its existing description of systems, experiments, and life beyond
  work. The design source of truth now names the same public identity.
- Validation: The focused i18n suite passed 11 of 11 cases, including `keeps
  Applied AI Engineer branding consistent across localized owner copy`; the
  final policy-governance run passed 1 of 1 case after an initial duplicate
  test-mapping registration was removed; `npm run typecheck` and `npm run
  validate:config` passed; `npm test` passed 94 of 94 cases across 20 files;
  preview content and web builds wrote 60 post artifacts and 172 web files;
  generated Korean, English, and Japanese home pages each contained three
  “Applied AI Engineer” occurrences; and `git diff --check` passed.
- Compatibility / follow-up: This is a localized identity-copy change only.
  Static HTML, no-JavaScript reading, SEO page descriptions, responsive layout,
  and existing workflow-focused subject matter remain compatible. No browser
  visual QA or production deployment was requested or performed.

## 2026-09-04T01:28:21+09:00 — Home hierarchy and hero media refined

- Change type: Owner-commented home-page hierarchy correction, shared list
  divider refinement, approved hero-composition change, design-contract update,
  renderer/CSS regression coverage, and governed policy-hash refresh.
- Reason: The Featured Post heading repeated the same article title shown in
  its card, while Recent Posts and Selected Work rendered a pale first-row rule
  beneath the dark section rule and still read as a double divider. The pale
  workflow trace in the hero also looked like a placeholder rather than a real
  technical visual.
- Scope: Normal-blog home renderer, shared section/list boundary CSS, responsive
  hero composition, `DESIGN.md`, site-baseline and curated-discovery assertions,
  and policy traceability. Post sources, asset files, publication state, routes,
  localization values, and managed pages are unchanged.
- Result: The Featured Post header now contains only its localized section
  label and the article title appears once inside the feature card. A post list
  directly following a shared section heading omits only its first pale top
  rule; later row separators remain. The hero now reuses the content-pipeline
  thumbnail for the first Selected Work item, producing the requested dark
  terminal visual without duplicating the post-owned asset. Desktop uses a
  `48% / 50%` editorial split and compact layouts stack the image at `16:9`.
- Validation: The focused site-baseline, curated-discovery, and
  policy-governance run passed 17 of 17 cases; `npm run typecheck` passed; the
  preview web build wrote 172 files; `npm test` passed 93 of 93 cases across 20
  files; and `git diff --check` passed. Browser inspection at `1512px` wide
  measured a `610 × 424px` absolute hero image, `0px` first-row top borders,
  the single “추천 글” heading, and zero horizontal overflow. At `390 × 844`,
  the image was a `337 × 188px` relative `16:9` block, both first-row borders
  remained `0px`, and horizontal overflow was zero.
- Compatibility / follow-up: Static HTML, no-JavaScript reading, full-card
  links, later row dividers, and content-asset provenance remain intact. The
  public role is still “AI Workflow Engineer”; choosing a replacement is a
  separate owner identity decision and was not silently applied. No production
  deployment was requested or performed.

## 2026-09-04T01:15:19+09:00 — Home section boundary rhythm aligned

- Change type: Owner-reported normal-blog spacing correction, CSS regression
  coverage, and governed policy-hash refresh.
- Reason: The dark section-heading rule and the first post row's pale rule were
  separated by only `6px`, so Recent Posts and Selected Work read as stacked
  double dividers instead of a heading followed by content.
- Scope: The shared normal-blog `section-heading` boundary spacing,
  site-baseline assertions, and policy traceability. Markup, content, routes,
  localization, post-row dimensions, and managed pages are unchanged.
- Result: Every shared section heading now leaves `1rem` (`16px`) before its
  following feature, post list, or related-post content. Featured, Recent
  Posts, and Selected Work therefore use the same boundary rhythm already
  required by `DESIGN.md`.
- Validation: The focused site-baseline and policy-governance run passed 13 of
  13 cases; `npm run typecheck` passed; the preview web build wrote 172 files;
  `npm test` passed 93 of 93 cases across 20 files; and `git diff --check`
  passed. In-app browser inspection at `1280 × 720` and `390 × 844` measured a
  `16px` heading-to-content gap for Featured, Recent Posts, and Selected Work
  with zero horizontal overflow.
- Compatibility / follow-up: This is a presentation-only correction that
  brings CSS back into alignment with the existing design contract, so
  `DESIGN.md`, `CONTENT_RULES.md`, static HTML, and no-JavaScript behavior remain
  accurate. A production-mode `npm run build:web` attempt was not a valid local
  preview check because `SITE_ORIGIN` was absent; the explicit preview-mode
  build passed instead. No production deployment was requested or performed.

## 2026-08-23T22:45:14+09:00 — Blog implementation checkpoint prepared

- Change type: Source-control checkpoint and cumulative implementation record.
- Reason: The owner requested that the completed blog design, responsive UX,
  localized content presentation, discovery, search, media, managed profile,
  development-preview, and validation work be recorded together before commit
  and push.
- Scope: Normal-blog presentation and routes; Korean, English, and Japanese
  post metadata; representative media; curated collections; search and image
  enhancements; YouTube embed support; managed profile pages; content and
  runtime contracts; development workflow; documentation; tests and policy
  traceability. Transient files under `outputs/` are excluded from the source
  checkpoint.
- Result: The repository contains the current serviceable static-blog
  implementation and the detailed chronological entries below document each
  design and behavior decision included in this checkpoint.
- Validation: The latest cumulative run passed 93 of 93 contract tests across
  20 files, TypeScript checking, configuration and embed validation, preview
  content/web builds, production build, GitHub Pages verification, browser
  layout inspection, and `git diff --check`.
- Compatibility / follow-up: Generated `.artifacts/` and `dist/` remain outside
  source control. The local `outputs/` working directory is retained but is not
  part of this checkpoint; canonical post sources and assets remain under
  `docs/` and `assets/content/`.

## 2026-08-23T22:28:51+09:00 — Active navigation underline raised

- Change type: Owner-requested selected-navigation visual refinement,
  design-contract update, and regression coverage.
- Reason: The active underline was attached to the bottom edge of the full
  interaction box, leaving an approximately `13.4px` visual gap below the menu
  label even after compact-row padding was reduced.
- Scope: Normal-blog primary-navigation selected indicator, compact navigation
  inset, `DESIGN.md`, site-baseline assertions, and policy hashes. Link sizes,
  alignment, order, destinations, and language navigation are unchanged.
- Result: The selected indicator is now an independent `1px` pseudo-element
  inset `.5rem` from the interaction box bottom. It sits approximately `4.9px`
  below the rendered label while preserving the shared `44px`/`48px` link
  heights and centered label baseline.
- Validation: `npm test` passed 93 of 93 cases across 20 files; `npm run
  typecheck`, `npm run validate:config`, and `npm run validate:embeds` passed;
  preview content/web builds passed; production build and GitHub Pages
  verification passed. In-app browser inspection of `/work/` measured the
  selected line at a `4.9px` visual gap with zero horizontal overflow.
- Compatibility / follow-up: Keyboard focus, `aria-current`, touch targets,
  compact scrolling, and browser-injected-control isolation remain unchanged.

## 2026-08-23T11:59:33+09:00 — Compact header first row centered

- Change type: Owner-reported responsive header correction, design-contract
  refinement, and regression coverage.
- Reason: Although the wordmark and language controls had matching link-box
  centers, the grid's shared row gap sat between the first and second header
  rows. This left the first-row controls centered at `22px` inside a visibly
  `64px`-high region whose actual center was `32px`.
- Scope: Normal-blog two-row header grid at the `64rem` breakpoint,
  `DESIGN.md`, site-baseline assertions, and policy hashes. Desktop composition,
  navigation semantics, routes, and labels are unchanged.
- Result: The compact header now declares an explicit `64px` first row and no
  inter-row grid gap. The wordmark and language selector remain `44px` controls
  but are both centered at `32px`; the primary row follows directly beneath.
- Validation: `npm test` passed 93 of 93 cases across 20 files; `npm run
  typecheck`, `npm run validate:config`, and `npm run validate:embeds` passed;
  preview content/web builds passed; production build and GitHub Pages
  verification passed. In-app browser inspection of `/explore/` at
  `876 × 905` measured zero offset for both controls from the first-row center
  and zero horizontal overflow.
- Compatibility / follow-up: The selected-menu underline, compact horizontal
  navigation, touch target sizes, DOM order, and CSS isolation from injected
  browser controls remain unchanged.

## 2026-08-23T11:55:16+09:00 — Selected navigation alignment stabilized

- Change type: Owner-requested responsive navigation alignment correction,
  design-contract update, and regression strengthening.
- Reason: The selected primary item used different block padding from adjacent
  links, so applying the active underline changed its height and visual
  baseline, especially in the compact second navigation row.
- Scope: Normal-blog primary and language navigation link boxes, compact header
  navigation, `DESIGN.md`, site-baseline assertions, and policy hashes. Link
  order, labels, routes, selection semantics, and browser annotation isolation
  are unchanged.
- Result: Every primary and language link now uses the same centered `44px`
  interaction row and reserved transparent underline slot. The current primary
  link changes only the underline color; compact primary links likewise share
  one `48px` row without a selected-state padding override.
- Validation: `npm test` passed 93 of 93 cases across 20 files; `npm run
  typecheck`, `npm run validate:config`, and `npm run validate:embeds` passed;
  preview content/web builds passed; production build and GitHub Pages
  verification passed. In the in-app browser at `876 × 905`, all five primary
  links shared a `48px` height and identical center, all three language links
  shared a `44px` height and identical center, and horizontal overflow was
  zero.
- Compatibility / follow-up: Keyboard focus, active-page semantics, compact
  horizontal scrolling, and the named CSS boundary for browser-injected
  controls remain intact.

## 2026-08-23T11:50:51+09:00 — Home vertical rhythm and header alignment refined

- Change type: Owner-requested responsive layout correction, home spacing
  refinement, design-contract update, and regression coverage.
- Reason: At the tablet-width home layout, the wordmark and language selector
  did not share a visible vertical center, content-box sizing made hero padding
  increase its declared minimum height, and the stacked main/footer spacing
  produced an oversized blank transition.
- Scope: Named normal-blog header, home hero, home main, and footer containers;
  `DESIGN.md`; site-baseline assertions; policy hashes. Content, routes,
  navigation order, browser-injected controls, and non-home footer spacing are
  unchanged.
- Result: The wordmark and language selector now share a `44px` alignment row;
  named width- and height-bearing containers use explicit `border-box` sizing;
  the home hero keeps its intended minimum height without adding padding on top
  of it; and the final home-to-footer transition uses compact responsive
  spacing. At `876 × 905`, both header centers matched exactly, horizontal
  overflow was zero, the hero measured approximately `424px`, and the
  main-to-footer gap measured approximately `53px`.
- Validation: `npm test` passed 93 of 93 cases across 20 files; `npm run
  typecheck`, `npm run validate:config`, and `npm run validate:embeds` passed;
  preview content/web builds passed; production build and GitHub Pages
  verification passed. The in-app browser rendered the Korean home at
  `876 × 905` with the expected alignment and spacing, and the temporary
  viewport was reset afterward.
- Compatibility / follow-up: The fix intentionally avoids restoring a global
  universal box-model selector, preserving the isolation boundary for ChatGPT
  Desktop annotation controls. Compact navigation remains a second scrollable
  row and all semantic link order is unchanged.

## 2026-08-23T11:18:07+09:00 — Annotation control isolation completed

- Change type: Follow-up compatibility correction, named-control markup
  refinement, design-contract clarification, and regression strengthening.
- Reason: The previous root-scoping fix remained insufficient because ChatGPT
  Desktop injects annotation controls inside the blog header or main surface;
  descendant `button`, `input`, `summary`, and universal selectors therefore
  still matched those controls.
- Scope: Normal-blog search, TOC, analytics-consent, search-dialog, and
  image-viewer control classes; foundational control and motion CSS; responsive
  search selectors; `DESIGN.md`; search/site-baseline tests; policy hashes.
- Result: Blog-owned controls now opt into presentation with explicit
  `site-control`, `site-control--button`, `site-control--field`, and
  `site-control--summary` classes. No generic or descendant-universal rule sets
  their size, padding, surface, box model, hover motion, or reduced-motion state,
  so controls injected within blog surfaces retain their own UI styling.
- Validation: `npm run validate:config`, `npm run validate:embeds`, and
  `npm run typecheck` passed; preview content/web builds passed; the final
  `npm test` rerun passed 93 of 93 cases across 20 files after one preceding
  transient timeout in the unchanged pagination fixture; production build and
  GitHub Pages verification passed. The in-app browser rendered `/en/work/`
  correctly at its normal width and at a temporary `485 × 905` compact
  viewport, which was reset afterward.
- Compatibility / follow-up: Existing named search, TOC, consent, and image
  controls retain their behavior and minimum target sizes. ChatGPT's annotation
  implementation remains external, so local coverage prevents matching its
  anonymous controls rather than asserting private extension markup.

## 2026-08-23T11:10:19+09:00 — Blog CSS isolated from browser annotations

- Change type: Owner-reported UI compatibility fix, embed fallback presentation
  refinement, design/content contract update, and regression coverage.
- Reason: Broad element and universal selectors were styling ChatGPT Desktop's
  injected annotation controls, and the working YouTube player duplicated its
  canonical link immediately beneath the frame.
- Scope: Normal-blog foundational CSS scope; YouTube embed fallback placement;
  `DESIGN.md`, `CONTENT_RULES.md`, `ARCHITECTURE.md`, implementation status,
  site-baseline/embed contract tests, and policy traceability. Post prose,
  routes, provider permissions, and publication state are unchanged.
- Result: Element defaults, control resets, focus, box-sizing, hover, and reduced
  motion rules now apply only within blog-owned surfaces rather than arbitrary
  browser-injected UI. The YouTube canonical link remains in static HTML inside
  `noscript` for no-JavaScript access but no longer appears below a working
  player.
- Validation: `npm run validate:config`, `npm run validate:embeds`, and
  `npm run typecheck` passed; `npm test` passed 93 of 93 cases across 20 files,
  including `keeps blog element defaults out of injected browser UI` and the
  updated `renders a privacy-enhanced YouTube iframe with a static fallback`;
  preview content/web builds passed; `SITE_ORIGIN=https://blog.cloverhearts.com
  npm run build` and the matching `npm run verify:pages` passed. The in-app
  browser snapshot retained the iframe and no longer exposed the duplicate
  visible link.
- Compatibility / follow-up: The no-JavaScript fallback, iframe security
  declaration, responsive player, blog focus styles, and reduced-motion behavior
  remain intact. ChatGPT's annotation chrome is external to the page and cannot
  be contract-tested directly, so the regression test enforces the local
  isolation boundary that prevents the observed collision.

## 2026-08-23T10:47:24+09:00 — Privacy-enhanced YouTube preview enabled

- Change type: Owner-requested draft-content embed, first reviewed provider
  implementation, provider-neutral iframe hardening, policy/configuration
  update, implementation-status update, and regression coverage.
- Reason: The owner wanted to inspect how one supplied YouTube video appears in
  the currently viewed draft post without committing the copied raw iframe or
  its tracking query parameter.
- Scope: The Korean, English, and Japanese draft variants of
  `ai-changes-developer-work`; the local `youtube` provider package; explicit
  embed registry; embed-core safe iframe/origin/permission validation;
  content-compiler sanitized embed insertion; provider documentation,
  `CONTENT_RULES.md`, `ARCHITECTURE.md`, `IMPLEMENTATION_STATUS.md`, package
  workspace metadata, and policy traceability. No post was published.
- Result: `::youtube` accepts only an 11-character ID plus localized accessible
  title and renders a lazy `youtube-nocookie.com` 16:9 iframe with sandbox,
  strict referrer policy, declared minimum permissions, and a durable normal
  YouTube link fallback. Unknown attributes, malformed IDs, undeclared iframe
  permissions, unsafe markup, and origin-prefix tricks are rejected. The
  supplied `si` parameter is not stored.
- Validation: `npm run validate:config` and `npm run validate:embeds` passed
  with one enabled provider; focused embed-core and policy-governance suites
  passed 6 of 6 cases; `npm run typecheck` passed; `npm test` passed 92 of 92
  cases across 20 files; preview content and web builds emitted the iframe and
  fallback; `SITE_ORIGIN=https://blog.cloverhearts.com npm run build` and
  `SITE_ORIGIN=https://blog.cloverhearts.com npm run verify:pages` passed. The
  in-app browser loaded the responsive player, exposed its accessible controls,
  and retained the fallback link beneath it.
- Compatibility / follow-up: All three edited variants remain `draft: true`,
  so the experiment is excluded from production discovery and release output.
  Loading the visible player makes a request to YouTube's privacy-enhanced
  origin; it is not represented as local-only or consent-gated. Other providers
  remain disabled until separately reviewed.

## 2026-08-22T22:16:46+09:00 — Image viewer surface and caption refined

- Change type: Owner-directed image-viewer presentation refinement, design
  contract update, CSS regression coverage, and governed policy coverage.
- Reason: The enlarged image's surrounding white panel obscured the page
  context, while its caption sat too far below the image and lacked sufficient
  local contrast.
- Scope: Normal-blog image-viewer dialog surface, figure flow, image height,
  caption spacing and surface, `DESIGN.md`, CSS contract assertions, and
  governed source hashes. Source images, article content, routes, and managed
  pages are unchanged.
- Result: The dialog panel is transparent with no panel border or shadow while
  retaining the blurred `30%` white modal backdrop. The figure now groups the
  image and caption vertically; the caption sits `.75rem` below the image with
  `1rem` padding, stable dark text, and a `50%` white background. The image
  height budget reserves space for the caption inside the viewport.
- Validation: Focused site-baseline and policy-governance suites passed 12 of 12
  cases; `npm run typecheck` passed; `npm test` passed 89 of 89 cases across 20
  files; `SITE_ORIGIN=https://blog.cloverhearts.com npm run build` and
  `SITE_ORIGIN=https://blog.cloverhearts.com npm run verify:pages` passed. The
  live-rebuilt in-app preview was opened, and the transparent panel, adjacent
  caption, close control, and blurred background rendered together.
- Compatibility / follow-up: Native Escape dismissal, focus restoration,
  linked-image behavior, compact dialog sizing, and no-JavaScript article media
  remain compatible.

## 2026-08-22T22:09:54+09:00 — Post header measures aligned to content

- Change type: Owner-directed post-header layout refinement, named-component
  markup update, design contract update, CSS regression coverage, and governed
  policy coverage.
- Reason: The title needed to use the full post-header width with clearer
  vertical separation, while the supporting description needed to align with
  the article body's reading measure.
- Scope: Normal-blog post-header title and description measures, vertical title
  spacing, description class naming, `DESIGN.md`, CSS contract assertions, and
  governed source hashes. Post content, routes, SEO, and managed pages are
  unchanged.
- Result: Wide post titles now use the complete `47.5rem` header measure rather
  than an `18ch` cap, with explicit `.875rem` top and `1.375rem` bottom margins
  and `.125rem` block padding. Supporting descriptions now use the same `40rem`
  reading measure as article content through the named
  `post-header__description` component class.
- Validation: Focused site-baseline and policy-governance suites passed 12 of 12
  cases; `npm run typecheck` passed; `npm test` passed 89 of 89 cases across 20
  files; `SITE_ORIGIN=https://blog.cloverhearts.com npm run build` and
  `SITE_ORIGIN=https://blog.cloverhearts.com npm run verify:pages` passed. The
  restarted in-app preview rendered the updated Korean post title and
  description in the expected document structure.
- Compatibility / follow-up: Compact title sizing, metadata, tags, article
  typography, image enlargement, print output, and no-JavaScript reading remain
  compatible.

## 2026-08-22T22:03:51+09:00 — Post title scale reduced again

- Change type: Owner-directed post-title scale refinement, responsive design
  contract update, CSS regression coverage, and governed policy coverage.
- Reason: The post title still appeared too prominent after the first size
  reduction and needed one additional visual step down.
- Scope: Normal-blog wide and compact post-title sizes, `DESIGN.md`, CSS
  contract assertions, and governed source hashes. Description sizing, the
  `18ch` measure, content, routes, SEO, and managed pages are unchanged.
- Result: Wide titles now scale from `34px` to `48px` using a `3.8vw` fluid
  value, which resolves near `41px` at the reviewed desktop width. Compact
  titles use `30px`.
- Validation: Focused site-baseline and policy-governance suites passed 12 of 12
  cases; `npm run typecheck` passed; `npm test` passed 89 of 89 cases across 20
  files; `SITE_ORIGIN=https://blog.cloverhearts.com npm run build` and
  `SITE_ORIGIN=https://blog.cloverhearts.com npm run verify:pages` passed. The
  restarted in-app preview rendered the updated post title.
- Compatibility / follow-up: Title wrapping width, description, metadata,
  article typography, image enlargement, print output, and no-JavaScript
  reading remain compatible.

## 2026-08-22T21:51:26+09:00 — Post header type scale reduced

- Change type: Owner-directed post-header typography refinement, responsive
  design contract update, CSS regression coverage, and governed policy coverage.
- Reason: The post title and supporting description remained visually too large
  after widening the title measure.
- Scope: Normal-blog post-title responsive scale, description size/leading,
  compact title size, `DESIGN.md`, CSS contract assertions, and governed source
  hashes. The `18ch` title measure, post content, routes, SEO, and managed pages
  are unchanged.
- Result: Wide title sizing now scales from `36px` to `52px` instead of roughly
  `38px` to `58px`; compact titles use `32px` instead of `34px`. The description
  now uses `16px / 1.7` instead of `17px / 1.75`, preserving a clear subordinate
  relationship and the wider natural wrapping measure.
- Validation: Focused site-baseline and policy-governance suites passed 12 of 12
  cases; `npm run typecheck` passed; `npm test` passed 89 of 89 cases across 20
  files; `SITE_ORIGIN=https://blog.cloverhearts.com npm run build` and
  `SITE_ORIGIN=https://blog.cloverhearts.com npm run verify:pages` passed. The
  restarted preview rendered one post title and one supporting description.
- Compatibility / follow-up: Header metadata, tags, mobile width, article
  typography, image enlargement, print output, and no-JavaScript reading remain
  compatible.

## 2026-08-22T21:03:36+09:00 — Post title measure widened

- Change type: Owner-directed post-header typography refinement, design
  contract update, CSS regression coverage, and governed policy coverage.
- Reason: Long Korean post titles wrapped within an unnecessarily narrow
  measure and needed slightly more horizontal expression space.
- Scope: Normal-blog wide post-title maximum measure, `DESIGN.md`, CSS contract
  assertion, and governed source hashes. Mobile title width, title size/weight,
  content, routes, SEO, and managed pages are unchanged.
- Result: Wide post titles now use an `18ch` maximum instead of `15ch`, producing
  fewer and more natural Korean line breaks while compact layouts continue to
  use the available width.
- Validation: Focused site-baseline and policy-governance suites passed 12 of 12
  cases; `npm run typecheck` passed; `npm test` passed 89 of 89 cases across 20
  files; `SITE_ORIGIN=https://blog.cloverhearts.com npm run build` and
  `SITE_ORIGIN=https://blog.cloverhearts.com npm run verify:pages` passed. The
  restarted preview rendered one post title, and its served stylesheet exposed
  `18ch` on wide screens with the existing `100%` compact override.
- Compatibility / follow-up: Mobile wrapping, header metadata, breadcrumbs,
  article measure, print output, and no-JavaScript reading remain compatible.

## 2026-08-22T20:53:40+09:00 — Image viewer backdrop lightened

- Change type: Owner-directed modal presentation refinement, design contract
  update, CSS regression coverage, and governed policy coverage.
- Reason: The article image enlargement needed a lighter overlay that better
  preserves the blog's white visual system.
- Scope: Normal-blog image-viewer backdrop color/opacity, `DESIGN.md`, CSS
  contract assertion, and governed source hashes. Dialog behavior, images,
  content, routes, search, SEO, and managed pages are unchanged.
- Result: The previous dark overlay is replaced by a white backdrop at `30%`
  opacity while retaining the existing `.5rem` blur, native modal containment,
  close control, and Escape behavior.
- Validation: Focused site-baseline and policy-governance suites passed 12 of 12
  cases; `npm run typecheck` passed; `npm test` passed 89 of 89 cases across 20
  files; `SITE_ORIGIN=https://blog.cloverhearts.com npm run build` and
  `SITE_ORIGIN=https://blog.cloverhearts.com npm run verify:pages` passed. In
  the restarted in-app preview, the article image opened one modal and the
  close control returned the count to zero.
- Compatibility / follow-up: Image enlargement interaction, focus restoration,
  static media, print output, dark theme, and no-JavaScript reading remain
  compatible.

## 2026-08-22T20:33:10+09:00 — Spacious journal typography selected

- Change type: Owner-selected post typography refinement, responsive design
  contract update, CSS regression coverage, and governed policy coverage.
- Reason: The owner selected concept 03 “spacious journal” from five Pretendard
  hierarchy previews to give Korean long-form posts a calmer reading rhythm.
- Scope: Normal-blog reading measure, article body size/leading/tracking,
  paragraph rhythm, H2/H3 scale and spacing, compact prose treatment,
  `DESIGN.md`, CSS contract assertions, and governed source hashes. Post source,
  metadata, media behavior, routes, search, SEO, and managed pages are unchanged.
- Result: Wide articles now use a `40rem` measure with `18px / 1.82` prose,
  `-.006em` tracking, and `1.55em` block separation. H2 uses `30px / 1.38` at
  weight `600` with more section space, H3 uses `23px / 1.4`, and compact prose
  uses `17px / 1.78`. Header metadata follows the same narrowed measure.
- Validation: Focused site-baseline and policy-governance suites passed 12 of 12
  cases; `npm run typecheck` passed; `npm test` passed 89 of 89 cases across 20
  files; `SITE_ORIGIN=https://blog.cloverhearts.com npm run build` and
  `SITE_ORIGIN=https://blog.cloverhearts.com npm run verify:pages` passed. The
  restarted local preview rendered one article, four H2 sections, and one
  metadata row, and its served stylesheet contained every selected wide and
  compact typography token.
- Compatibility / follow-up: Article HTML, image enlargement, code, tables,
  print output, responsive rail collapse, and no-JavaScript reading remain
  compatible.

## 2026-08-22T19:47:23+09:00 — Post metadata and image viewing refined

- Change type: Owner-directed post layout and progressive-enhancement change,
  localized interaction copy, design/UX/i18n contract updates, regression
  coverage, governed policy coverage, and preview-only typography exploration.
- Reason: Wide post-header metadata wrapped despite having enough reading width,
  article screenshots could not be inspected at a larger size, and the owner
  requested five Pretendard hierarchy concepts before choosing a body redesign.
- Scope: Normal-blog post metadata sizing, post-only image-viewer dialog and
  client enhancement, localized labels, asset copying, responsive/print CSS,
  `DESIGN.md`, `UX_FLOW.md`, `I18N.md`, renderer/CSS/i18n/pipeline tests, policy
  hashes, and five uncommitted design-preview images. Post source, media assets,
  routes, search, SEO, and managed pages are unchanged.
- Result: Wide metadata occupies the same `44rem` measure as the article and
  stays on one line while compact layouts may wrap. Unlinked article images now
  open by pointer, Enter, or Space in a large native dialog with a blurred
  backdrop, contained media, localized top-right ESC/close control, and focus
  restoration; linked images and no-JavaScript reading remain unchanged. Five
  labeled Pretendard concepts compare balanced editorial, compact technical,
  spacious journal, documentation grid, and focused reading hierarchies; none
  has been applied pending owner selection.
- Validation: Focused site-baseline, i18n, pipeline, and policy-governance suites
  passed 24 of 24 cases after replacing an invalid empty-production fixture
  assumption with a renderer boundary test; `npm run typecheck` passed; `npm
  test` passed 89 of 89 cases across 20 files;
  `SITE_ORIGIN=https://blog.cloverhearts.com npm run build` and
  `SITE_ORIGIN=https://blog.cloverhearts.com npm run verify:pages` passed.
  In-app browser review opened the first article image in one native modal,
  found one close control, and confirmed the dialog closed to zero open modals.
- Compatibility / follow-up: Static article media, authored image links,
  localized routes, compact wrapping, print output, and reduced-motion behavior
  remain compatible. A selected typography concept still requires a separate
  owner-directed CSS application and visual review.

## 2026-08-22T19:29:40+09:00 — Post filter link affordance clarified

- Change type: Owner-directed interaction hierarchy refinement, design contract
  update, CSS regression coverage, and governed policy coverage.
- Reason: Category and tag group labels were visually too similar to their
  selectable links, so the interactive filter targets were difficult to scan.
- Scope: Normal-blog post-filter link opacity states, `DESIGN.md`, CSS contract
  assertions, and governed source hashes. Filter labels, taxonomy data, routes,
  selection behavior, search, SEO, and managed pages are unchanged.
- Result: Category and tag labels remain at full opacity. Selectable links rest
  at `50%`, return to `100%` on hover or keyboard focus, and retain the shared
  `68%` pressed-state feedback.
- Validation: Focused site-baseline and policy-governance suites passed 12 of 12
  cases; `npm run typecheck` passed; `npm test` passed 88 of 88 cases across 20
  files; `SITE_ORIGIN=https://blog.cloverhearts.com npm run build` and
  `SITE_ORIGIN=https://blog.cloverhearts.com npm run verify:pages` passed. The
  restarted local preview stylesheet contains the `50%`, `100%`, and `68%`
  filter-link states. An initial production build without the required
  `SITE_ORIGIN` was rejected as designed before the configured build passed.
- Compatibility / follow-up: Static HTML, no-JavaScript navigation, keyboard
  focus visibility, filter URLs, and compact layouts remain compatible.

## 2026-08-22T19:26:05+09:00 — Visible date and time formats standardized

- Change type: Owner-directed timestamp presentation change, locale/design
  contract update, renderer regression coverage, and governed policy coverage.
- Reason: Curated collection evidence exposed raw ISO timestamps while other
  views showed inconsistent date-only punctuation, making time metadata
  difficult to scan.
- Scope: Normal-blog visible timestamp and work-period formatter, `DESIGN.md`,
  `I18N.md`, curated/pagination/i18n contract assertions, and governed source
  hashes. Source metadata, ISO offsets, ordering, structured data, routes, SEO,
  and managed pages are unchanged.
- Result: Full timestamps display as `YYYY. MM. DD HH:mm`, date-only values as
  `YYYY. MM. DD`, and year-month values as `YYYY. MM` in every supported
  language. `<time datetime>` and structured data retain their validated ISO
  8601 source values, and partial dates never receive invented time values.
- Validation: Focused curated-discovery, pagination/navigation, i18n, and policy
  governance suites passed 19 of 19 cases; `npm run typecheck` passed; `npm
  test` passed 88 of 88 cases across 20 files;
  `SITE_ORIGIN=https://blog.cloverhearts.com npm run build`,
  `SITE_ORIGIN=https://blog.cloverhearts.com npm run verify:pages`, and local
  preview inspection passed. The live Work route displays `2026. 08. 17 02:30`
  while preserving `2026-08-17T02:30:11+09:00` in each `datetime` attribute.
- Compatibility / follow-up: Chronological sorting, source offsets, feed and
  structured-data dates, static HTML, and `CONTENT_RULES.md` remain compatible.

## 2026-08-22T19:18:53+09:00 — Explore page hierarchy reorganized

- Change type: Owner-directed discovery-page hierarchy redesign, renderer and
  responsive CSS enhancement, design contract update, regression coverage, and
  governed policy coverage.
- Reason: The Explore introduction, curated collections, categories, and tags
  had weak separation and nearly identical typographic weight, making the page
  difficult to scan as a discovery hub.
- Scope: Normal-blog Explore renderer classes and link grouping, introduction
  divider, curated-card and taxonomy-row CSS, compact stacking, `DESIGN.md`,
  curated/CSS contract assertions, and governed source hashes. Collection and
  taxonomy data, routes, counts, SEO, search, and managed pages are unchanged.
- Result: A full-width rule now separates the introduction from content.
  Curated collections render as two full-link cards with post count, dark title,
  muted description, green top rule, and arrow. Categories and tags occupy two
  separately ruled columns with dark labels and tertiary localized counts. All
  discovery groups stack to one column on compact screens.
- Validation: Focused curated-discovery, CSS, and policy-governance suites
  passed 16 of 16 cases; `npm run typecheck` passed; `npm test` passed 88 of 88
  cases across 20 files; `SITE_ORIGIN=https://blog.cloverhearts.com npm run
  build`, `SITE_ORIGIN=https://blog.cloverhearts.com npm run verify:pages`, and
  browser review passed. At 1090×905, the introduction had a 1px divider, two
  497.5×192px curated cards, two taxonomy columns, and distinct dark/muted/green
  text roles. At 390×844, both card and taxonomy grids resolved to one 335px
  column with no horizontal overflow.
- Compatibility / follow-up: Static full-row links, localized counts,
  keyboard focus, reduced-motion behavior, and `CONTENT_RULES.md` remain
  compatible.

## 2026-08-22T19:14:00+09:00 — Search result document icon repaired

- Change type: Owner-directed search-result visual repair, design contract
  update, search/CSS regression coverage, and governed policy coverage.
- Reason: The CSS-only empty rectangle used as a document mark rendered like a
  broken or incomplete icon in live search results.
- Scope: Local search-result rendering, document-icon CSS, `DESIGN.md`, search
  and CSS contract assertions, and governed source hashes. Search indexing,
  queries, result ranking, routes, analytics, and managed pages are unchanged.
- Result: Every result now includes a self-contained, decorative inline SVG
  document icon with a fixed 24×24 view box, folded corner, text lines, and
  current-color strokes. It has no icon-font, external sprite, or network
  dependency.
- Validation: Focused search, CSS, and policy-governance suites passed 17 of 17
  cases; `npm run typecheck` passed; `npm test` passed 88 of 88 cases across 20
  files; `SITE_ORIGIN=https://blog.cloverhearts.com npm run build`,
  `SITE_ORIGIN=https://blog.cloverhearts.com npm run verify:pages`, and browser
  review passed. A live “업무” search rendered two 40×40 icon containers, each
  with one 22×22 SVG, a 24×24 view box, 1.5px green stroke, and no horizontal
  overflow.
- Compatibility / follow-up: Full-row result links, accessible hidden
  decoration, local-only Pagefind behavior, static search fallback, and
  `CONTENT_RULES.md` remain compatible.

## 2026-08-22T19:11:02+09:00 — Pagination controls aligned horizontally

- Change type: Owner-directed responsive pagination refinement, design contract
  update, CSS regression coverage, and governed policy coverage.
- Reason: The generated pagination uses previous, numbered, and next sibling
  containers, but only the unused list-form selector had horizontal layout,
  causing desktop controls to stack vertically.
- Scope: Normal-blog pagination container CSS, `DESIGN.md`, CSS contract
  assertions, and governed source hashes. Pager markup, routes, publication
  behavior, content, SEO, localization, and managed pages are unchanged.
- Result: Previous, numbered, and next controls now share one centered flex row
  on desktop and may wrap in semantic order when compact width requires it.
- Validation: Focused CSS, pagination/navigation, and policy-governance suites
  passed 16 of 16 cases; `npm run typecheck` passed; `npm test` passed 88 of 88
  cases across 20 files; `SITE_ORIGIN=https://blog.cloverhearts.com npm run
  build`, `SITE_ORIGIN=https://blog.cloverhearts.com npm run verify:pages`, and
  browser review passed. At 1090×905, the numbered and Next containers shared
  the same top coordinate in a 43.44px-high row. At 390×844, the pager remained
  within its 335px content width with no horizontal overflow.
- Compatibility / follow-up: Static links, current-page semantics, keyboard
  focus, responsive wrapping, and `CONTENT_RULES.md` remain compatible.

## 2026-08-22T19:08:26+09:00 — Listing geometry and navigation alignment unified

- Change type: Owner-directed navigation, filter, and collection-list layout
  refinement, design contract update, CSS regression coverage, and governed
  policy coverage.
- Reason: The active menu underline sat too far below its label, filter group
  labels and options did not share a visual baseline, and non-home listing
  thumbnails were smaller than the established Home list treatment.
- Scope: Normal-blog primary-navigation current state, category/tag filter
  alignment, shared post-list row and responsive thumbnail CSS, `DESIGN.md`,
  CSS contract assertions, and governed source hashes. Markup, content, routes,
  localization, SEO, and managed pages are unchanged.
- Result: The active underline now sits `.2rem` below its label. Filter labels
  and options use the same 18px computed line box and top position. Every
  desktop post list now uses a 35%-wide thumbnail that fills the 240px row;
  mobile lists place the same image below the copy at 16:9.
- Validation: Focused CSS and policy-governance tests passed 12 of 12 cases;
  `npm run typecheck` passed; `npm test` passed 88 of 88 cases across 20 files;
  `SITE_ORIGIN=https://blog.cloverhearts.com npm run build`,
  `SITE_ORIGIN=https://blog.cloverhearts.com npm run verify:pages`, and browser
  review passed. At 1090×905, Home and All Posts both measured 240px rows with
  35%-wide, full-height images; the current underline gap was 3.2px and filter
  text shared the same baseline. At 390×844, images were static 16:9 blocks and
  no horizontal overflow occurred.
- Compatibility / follow-up: Full-card links, resting/hover opacity, mobile
  stacking, static HTML, reduced-motion behavior, and `CONTENT_RULES.md` remain
  compatible.

## 2026-08-22T18:56:56+09:00 — Footer copyright line removed

- Change type: Owner-directed footer simplification, design contract update,
  renderer regression coverage, and governed policy coverage.
- Reason: The standalone `© CloverHearts` line was redundant beneath the site
  identity and localized description.
- Scope: Normal-blog footer renderer, `DESIGN.md`, footer contract assertion,
  and governed design hash. Content, routes, localization, SEO, analytics
  controls, and managed pages are unchanged.
- Result: The copyright paragraph is no longer emitted. The footer retains only
  the site identity, localized description, and optional analytics controls.
- Validation: Focused pagination/navigation and policy-governance suites passed
  5 of 5 cases; `npm run typecheck` passed; `npm test` passed 88 of 88 cases
  across 20 files; `SITE_ORIGIN=https://blog.cloverhearts.com npm run build`,
  `SITE_ORIGIN=https://blog.cloverhearts.com npm run verify:pages`, and browser
  review passed. The live footer contains no `data-footer-meta` element and has
  no horizontal overflow.
- Compatibility / follow-up: Footer identity, description, optional consent
  controls, static HTML, and `CONTENT_RULES.md` remain compatible.

## 2026-08-22T18:54:38+09:00 — Links and controls gained restrained interaction motion

- Change type: Owner-directed interaction-motion enhancement, design contract
  update, CSS regression coverage, and governed policy coverage.
- Reason: Links and controls changed state abruptly, providing limited tactile
  feedback on pointer hover and activation.
- Scope: Normal-blog link, button, disclosure, and form-control state CSS,
  shared motion tokens, `DESIGN.md`, CSS contract assertions, and governed
  source hashes. Markup, content, routes, localization, SEO, and managed pages
  are unchanged.
- Result: Links transition color, underline color/offset, and opacity over
  180ms and briefly lower opacity on activation. Enabled buttons and disclosure
  controls rise by 1px on hover and press by 1px with a restrained 0.985 scale;
  form-field borders transition to green on pointer hover. Disabled controls
  remain still and visibly unavailable. No effect changes layout geometry.
- Validation: Focused CSS and policy-governance tests passed 12 of 12 cases;
  `npm run typecheck` passed; `npm test` passed 88 of 88 cases across 20 files;
  `SITE_ORIGIN=https://blog.cloverhearts.com npm run build`,
  `SITE_ORIGIN=https://blog.cloverhearts.com npm run verify:pages`, and browser
  review passed. Browser-computed link and search-control transitions were
  180ms at 1090×905, with no horizontal overflow at 1090×905 or 390×844.
- Compatibility / follow-up: Existing card opacity behavior, keyboard focus
  outlines, reduced-motion suppression, static HTML, print output, and
  `CONTENT_RULES.md` remain compatible.

## 2026-08-22T18:51:28+09:00 — Post prose rhythm aligned with list summaries

- Change type: Owner-directed long-form readability refinement, design contract
  update, CSS regression coverage, and governed policy coverage.
- Reason: Post prose retained a looser line height than the recently refined
  Korean list summaries, so the reading rhythm was inconsistent and visually
  wider than intended.
- Scope: Normal-blog article-body line height and prose-block spacing,
  `DESIGN.md`, CSS contract assertions, and governed source hashes. Post
  content, headings, code-block typography, routes, localization, SEO, and
  managed pages are unchanged.
- Result: Article prose now uses `1.6` line height on wide and compact screens.
  Paragraphs, lists, and quotes use `1.35em` trailing separation so individual
  lines remain compact while adjacent prose blocks stay clearly distinct.
- Validation: Focused CSS and policy-governance tests passed 12 of 12 cases;
  `npm run typecheck` passed; `npm test` passed 88 of 88 cases across 20 files;
  `SITE_ORIGIN=https://blog.cloverhearts.com npm run build`,
  `SITE_ORIGIN=https://blog.cloverhearts.com npm run verify:pages`, and browser
  review passed. At both 1090×905 and 390×844, the computed 17px prose uses a
  27.2px line height and 22.95px block gap with no horizontal overflow.
- Compatibility / follow-up: Heading hierarchy, media spacing, code-block line
  height, static HTML, reduced-motion behavior, and `CONTENT_RULES.md` remain
  compatible.

## 2026-08-22T18:47:50+09:00 — Command-palette search and post navigation refined

- Change type: Owner-selected search design implementation, tag-navigation
  enhancement, post-navigation interaction refinement, localized UI expansion,
  design/UX contract update, regression coverage, and governed policy coverage.
- Reason: The original search dialog did not match the selected centered
  command-palette concept, post tag chips were not actionable, and adjacent
  previous/next links read as one undifferentiated block.
- Scope: Normal-blog search dialog markup, local Pagefind result rendering,
  localized search copy, tag-chip links, previous/next markup and CSS,
  `DESIGN.md`, `UX_FLOW.md`, related contract tests, and governed source hashes.
  Post sources, content schemas, publication rules, SEO, analytics, and managed
  pages are unchanged.
- Result: Search now opens as a centered 48rem command palette with a compact
  title/ESC header, large green-outlined query field, truthful scope hint, and
  full-row local results. No recent-query data is fabricated or persisted.
  Every localized tag chip links to its generated tag collection. Previous and
  next posts occupy separate equal-width bordered regions, use smaller labels
  and titles, rest at 50% opacity, and transition to full opacity on hover or
  keyboard focus; compact screens stack the regions.
- Validation: Focused search, pagination/navigation, CSS baseline, and policy
  governance suites passed 21 of 21 cases; `npm run typecheck` passed; `npm
  test` passed 88 of 88 cases across 20 files;
  `SITE_ORIGIN=https://blog.cloverhearts.com npm run build`,
  `SITE_ORIGIN=https://blog.cloverhearts.com npm run verify:pages`, and `git
  diff --check` passed. Browser review at 1090×905 confirmed a 768px dialog,
  76px query field, 12 local results for “AI,” localized tag destinations,
  equal 333.5px previous/next regions at 50% resting opacity, and no horizontal
  overflow. At 390×844, the navigation stacked into two 335px regions and the
  search palette remained within the viewport without horizontal overflow.
- Compatibility / follow-up: The real `/search/` fallback, server-free query
  handling, static post links, native dialog Escape behavior, reduced-motion
  rules, print suppression, and `CONTENT_RULES.md` remain compatible.

## 2026-08-22T18:32:35+09:00 — Home list typography and author action spacing refined

- Change type: Owner-directed list readability and author-row spacing
  refinement, design contract update, CSS regression coverage, and governed
  policy coverage.
- Reason: List metadata sat too close to descriptions, inherited body line
  height made Korean summaries feel loose, and the Profile action sat too close
  to the content-frame edge.
- Scope: Normal-blog post-card description/metadata CSS, home author action
  spacing, `DESIGN.md`, CSS contract assertions, and governed source hashes.
  Renderer markup, post sources, routes, localization, SEO, and managed pages
  are unchanged.
- Result: Post-card descriptions use `1.6` line height, metadata starts `.75rem`
  below the description, and the Profile action has `1rem` trailing margin.
- Validation: Focused CSS and policy-governance tests passed 12 of 12 cases;
  `npm run typecheck` passed; `npm test` passed 88 of 88 cases across 20 files;
  `SITE_ORIGIN=https://blog.cloverhearts.com npm run build`,
  `SITE_ORIGIN=https://blog.cloverhearts.com npm run verify:pages`, and `git
  diff --check` passed. Browser review at 1117×905 measured a 27.2px description
  line height, 12px metadata gap, 16px Profile trailing margin and 48px total
  frame gap. At 390×844 it measured 25.6px line height, 12px metadata gap, and
  no horizontal overflow.
- Compatibility / follow-up: Card interaction, image behavior, responsive
  stacking, full-card links, static HTML, and `CONTENT_RULES.md` remain
  compatible.

## 2026-08-22T18:28:01+09:00 — Card resting copy opacity lowered to 50 percent

- Change type: Owner-directed interaction contrast refinement, design contract
  update, CSS regression coverage, and governed policy coverage.
- Reason: The 70% resting copy opacity still did not create enough contrast
  between idle and focused post cards.
- Scope: Normal-blog post-list and featured-card copy opacity, `DESIGN.md`, CSS
  contract assertions, and governed source hashes. Images, markup, post content,
  routes, localization, SEO, and managed pages are unchanged.
- Result: Card index/category/title/description/metadata and featured copy now
  rest at 50% opacity and transition to full opacity on pointer hover or keyboard
  focus. Thumbnail and featured-image resting opacity remains 85%.
- Validation: The focused CSS suite passed 11 of 11 cases; `npm run typecheck`
  passed; `npm test` passed 88 of 88 cases across 20 files;
  `SITE_ORIGIN=https://blog.cloverhearts.com npm run build`,
  `SITE_ORIGIN=https://blog.cloverhearts.com npm run verify:pages`, and `git
  diff --check` passed. Browser review confirmed 0.50 resting copy/index, 0.85
  resting image opacity, full hover opacity, and no horizontal overflow.
- Compatibility / follow-up: Image behavior, stable card geometry, full-card
  links, keyboard focus, reduced motion, static HTML, and `CONTENT_RULES.md`
  remain compatible.

## 2026-08-22T18:18:37+09:00 — Home section spacing consolidated

- Change type: Owner-directed home spacing refinement, design contract update,
  CSS regression coverage, and governed policy coverage.
- Reason: Featured, Recent Posts, and Selected Work combined a large top margin
  with equally large top padding, making section separation feel excessive.
- Scope: Normal-blog home-section spacing CSS, `DESIGN.md`, CSS contract
  assertions, and governed source hashes. Renderer markup, post content,
  routes, localization, SEO, and managed pages are unchanged.
- Result: Every home content section now uses one responsive block margin from
  `3.5rem` to `5rem`; the duplicate section-specific top padding and larger
  override were removed. Sections remain separated by whitespace without
  decorative top dividers.
- Validation: Focused CSS and policy-governance tests passed 12 of 12 cases;
  `npm run typecheck` passed; `npm test` passed 88 of 88 cases across 20 files;
  `SITE_ORIGIN=https://blog.cloverhearts.com npm run build`,
  `SITE_ORIGIN=https://blog.cloverhearts.com npm run verify:pages`, and `git
  diff --check` passed. Browser review measured consistent 67.02px gaps at
  1117×905 and 56px gaps at 390×844, zero top padding/borders, and no horizontal
  overflow.
- Compatibility / follow-up: Home hierarchy, one-link card interactions,
  responsive stacking, static HTML, and `CONTENT_RULES.md` remain compatible.

## 2026-08-22T18:14:56+09:00 — Home card focus now uses contrast without image scaling

- Change type: Owner-directed interaction and motion refinement, design
  contract update, CSS regression coverage, and governed policy coverage.
- Reason: The `1.05` thumbnail enlargement introduced unnecessary spatial
  motion, while the former 85% resting copy opacity did not distinguish the
  focused card strongly enough.
- Scope: Normal-blog post-list and featured-card interaction CSS, `DESIGN.md`,
  CSS contract assertions, and governed source hashes. Renderer markup, post
  sources, content contracts, routes, localization, SEO, and managed pages are
  unchanged.
- Result: Card index/category/title/description/metadata copy now rests at 70%
  opacity, thumbnails and featured visuals rest at 85%, and both reach full
  opacity on pointer hover or keyboard focus. Image scaling and its transform
  transition were removed entirely, leaving card geometry stable.
- Validation: Focused CSS and policy-governance tests passed 12 of 12 cases;
  `npm run typecheck` passed; `npm test` passed 88 of 88 cases across 20 files;
  `SITE_ORIGIN=https://blog.cloverhearts.com npm run build`,
  `SITE_ORIGIN=https://blog.cloverhearts.com npm run verify:pages`, and `git
  diff --check` passed. Browser review of `/` confirmed 0.70 copy/index and
  0.85 image resting opacity, full hover opacity, `transform: none` before and
  during hover, and no horizontal overflow.
- Compatibility / follow-up: The one-link card target, keyboard focus,
  reduced-motion handling, responsive layout, static HTML, and
  `CONTENT_RULES.md` remain compatible.

## 2026-08-22T18:01:38+09:00 — Home cards now share one coordinated focus treatment

- Change type: Owner-directed home interaction polish, section-spacing and CTA
  refinement, featured-card semantics, design contract update, renderer/CSS
  regression coverage, and governed policy coverage.
- Reason: Post-list hover emphasized only the thumbnail, featured content did
  not share the same card interaction, decorative section-top dividers added
  visual noise, and the hero action underline sat too far below its label.
- Scope: Home featured-post markup, shared normal-blog CSS, `DESIGN.md`, static
  renderer and CSS contract tests, and governed source hashes. Post sources,
  content contracts, routes, localization, SEO, and managed pages are unchanged.
- Result: List indexes, category/title/description copy, metadata, and images
  now move together from 85% to full opacity on hover or keyboard focus while
  images scale to `1.05`. The featured post is one full-card link with the same
  treatment and no nested links. Featured, Recent Posts, and Selected Work use
  whitespace instead of a decorative top rule, and the hero action underline
  sits 2px below its text.
- Validation: Focused CSS, renderer, and policy-governance tests passed 16 of
  16 cases; `npm run typecheck` passed; `npm test` passed 88 of 88 cases across
  20 files; `SITE_ORIGIN=https://blog.cloverhearts.com npm run build`,
  `SITE_ORIGIN=https://blog.cloverhearts.com npm run verify:pages`, and `git
  diff --check` passed. Browser review at 1117×905 confirmed 85% resting and
  100% hover opacity for featured and list copy/images, `1.05` image scaling,
  zero-pixel section top borders, and no horizontal overflow. Review at 390×844
  confirmed the single-column layout and no horizontal overflow.
- Compatibility / follow-up: Static HTML, no-JavaScript card navigation,
  localized labels, reduced-motion behavior, content artifacts, and
  `CONTENT_RULES.md` remain compatible.

## 2026-08-22T17:35:27+09:00 — Blog presentation moved to named component classes

- Change type: Owner-directed HTML/CSS architecture refinement, list-card
  interaction and spacing improvement, motion/accessibility behavior, design
  and UX contracts, renderer regression coverage, implementation status, and
  governed policy coverage.
- Reason: Normal-blog presentation depended on classless `data-*` selectors,
  list rows linked only their titles, adjacent full-height thumbnails touched
  row dividers, and the requested hover treatment could not apply consistently
  to one shared card target.
- Scope: Static document shell, home/collection/post/search renderer markup,
  translation-origin markup, the renamed external `blog.css`, Astro shell,
  normal-blog documentation, CSS/static-render/search/navigation regressions,
  and policy hashes. Content artifacts, routes, publication semantics, SEO,
  managed pages, and post source are unchanged.
- Result: Presentation now uses descriptive classes such as `site-header`,
  `home-hero`, `post-card`, and `post-layout`; `data-*` attributes remain only
  as state, indexing, enhancement, and test hooks. Each post row is one link
  containing its title, description, metadata, and thumbnail. Thumbnails rest
  at 85% opacity and transition to full opacity plus `1.05` scale on hover or
  keyboard focus, with reduced-motion compatibility. Recent Posts and Selected
  Work rows have 1rem divider inset above and below. Generated HTML links only
  the external `blog.css` and emits no inline style blocks or attributes.
- Validation: Focused `tests/contracts/site-baseline.test.ts`,
  `tests/contracts/pagination-navigation.test.ts`,
  `tests/contracts/curated-discovery.test.ts`,
  `tests/contracts/dev-preview.test.ts`, `tests/contracts/i18n.test.ts`, and
  `tests/contracts/policy-governance.test.ts` passed; `npm run typecheck`
  passed; `npm test` passed 88 of 88 cases across 20 files;
  `SITE_ORIGIN=https://blog.cloverhearts.com npm run build`,
  `SITE_ORIGIN=https://blog.cloverhearts.com npm run verify:pages`, and `git
  diff --check` passed. Browser review of `/` at 1117×905 and 390×844 confirmed
  one full-card link, successful image-click navigation, 85% resting opacity,
  0.24-second opacity/scale transitions, 16px row inset on both sides, external
  `blog.css`, and no horizontal overflow. The only observed runtime inline
  style belonged to the Codex browser-comment overlay, not generated site HTML.
- Compatibility / follow-up: Static HTML, no-JavaScript navigation,
  localization, search hooks, Pagefind attributes, print, dark mode, and
  content contracts remain compatible. `CONTENT_RULES.md` remains accurate.

## 2026-08-22T13:34:36+09:00 — Footer navigation removed

- Change type: Owner-directed global navigation simplification, UX and design
  contract alignment, localized renderer regression coverage, and governed
  policy coverage.
- Reason: The Profile and Archive links in the site footer did not provide
  useful navigation in that location and added visual noise.
- Scope: Shared footer navigation configuration, normal-blog design and UX
  contracts, navigation/static-render assertions, and policy hashes. Profile
  and Archive routes, the home author-profile link, search/404 recovery links,
  content, and managed pages are unchanged.
- Result: The footer no longer renders a navigation landmark or links in Korean,
  English, Japanese, or base-path builds. It retains the site identity,
  localized description, optional analytics controls, and copyright.
- Validation: Focused `tests/contracts/site-baseline.test.ts`,
  `tests/contracts/pagination-navigation.test.ts`, and
  `tests/contracts/policy-governance.test.ts` passed 15 of 15 cases; `npm run
  typecheck` passed; `npm test` passed 87 of 87 cases across 20 files;
  `SITE_ORIGIN=https://blog.cloverhearts.com npm run build`,
  `SITE_ORIGIN=https://blog.cloverhearts.com npm run verify:pages`, and `git
  diff --check` passed. Browser review of `/posts/building-ai-skills/`
  confirmed zero footer links, zero footer navigation landmarks, and no
  horizontal overflow.
- Compatibility / follow-up: Navigation-only. The stable Profile and Archive
  routes remain available through intentional discovery and recovery surfaces;
  static HTML, no-JavaScript behavior, localization, SEO, and content contracts
  remain compatible. `CONTENT_RULES.md` remains accurate.

## 2026-08-22T13:32:20+09:00 — Post header metadata and tags refined

- Change type: Owner-directed post-header typography, category-link and tag
  presentation refinement, design contract, regression coverage, and governed
  policy coverage.
- Reason: The author, publication date, and reading-time row appeared larger
  and heavier than the adjacent tags; unboxed tags were difficult to distinguish
  individually, and the category underline added unnecessary emphasis.
- Scope: Normal-blog post-header metadata, category link and tag styles,
  `DESIGN.md`, focused CSS regression assertions, and policy hashes. Post
  content, metadata values, links, routes, and publication semantics are
  unchanged.
- Result: Header metadata now matches the tags at `0.75rem` with a lighter 500
  weight. Tags use separate low-contrast outlined boxes with 4px by 10px inset
  spacing, and the category link no longer has an underline.
- Validation: Focused `tests/contracts/site-baseline.test.ts` and
  `tests/contracts/policy-governance.test.ts` passed 12 of 12 cases; `npm run
  typecheck` passed; `npm test` passed 87 of 87 cases across 20 files;
  `SITE_ORIGIN=https://blog.cloverhearts.com npm run build`,
  `SITE_ORIGIN=https://blog.cloverhearts.com npm run verify:pages`, and `git
  diff --check` passed. Browser review of `/posts/building-ai-skills/` at
  1132×905 and 390×844 confirmed matching 12px text scales, 500-weight metadata,
  separately boxed tags, no category underline, no horizontal overflow, and a
  single tag row at the compact viewport.
- Compatibility / follow-up: Presentation-only. Static HTML readability,
  no-JavaScript behavior, localization, SEO, and content contracts remain
  compatible; `CONTENT_RULES.md` remains accurate.

## 2026-08-22T13:27:56+09:00 — Post navigation labels separated from titles

- Change type: Owner-directed post-navigation typography and spacing,
  accessible static markup refinement, design contract, regression coverage,
  and governed policy coverage.
- Reason: The localized Previous Post and Next Post labels appeared directly
  attached to their destination titles, weakening the distinction between the
  navigation direction and post name.
- Scope: Previous/next link markup whitespace, label/title display and spacing,
  `DESIGN.md`, CSS/static-markup regression assertions, and policy hashes.
  Navigation destinations, post ordering, localization messages, and content
  are unchanged.
- Result: Each navigation label and title now occupies its own line with a 6px
  visual gap. The source HTML also contains separating whitespace so accessible
  link text does not concatenate the label and title. Both previous and next
  links use the same structure on wide and compact layouts.
- Validation: Focused `tests/contracts/site-baseline.test.ts`,
  `tests/contracts/policy-governance.test.ts`, and
  `tests/contracts/pagination-navigation.test.ts` passed 15 of 15 cases; `npm
  run typecheck` passed; `npm test` passed 87 of 87 cases across 20 files;
  `SITE_ORIGIN=https://blog.cloverhearts.com npm run build`,
  `SITE_ORIGIN=https://blog.cloverhearts.com npm run verify:pages`, and `git
  diff --check` passed. Browser review of `/posts/building-ai-skills/` at the
  default desktop viewport and 390×844 confirmed newline-separated inner and
  text content, a 6px label/title gap, and no console warnings or errors.
- Compatibility / follow-up: Presentation-only. Static link behavior,
  no-JavaScript navigation, routes, localization, SEO, and content contracts
  remain compatible; `CONTENT_RULES.md` remains accurate.

## 2026-08-22T13:20:05+09:00 — Selected Work adopts the Recent Posts layout

- Change type: Owner-directed home layout refinement, responsive thumbnail
  sizing, renderer/CSS alignment, design contract, regression coverage, and
  governed policy coverage.
- Reason: The home Selected Work rows used compact fixed thumbnails and reduced
  row spacing while Recent Posts used a clearer full-height 35% media column.
  The Selected Work heading also repeated the same label as both eyebrow and
  heading.
- Scope: Home Selected Work section heading markup, post-list image candidate
  sizing, desktop and compact row styles, `DESIGN.md`, focused renderer/CSS
  assertions, and policy hashes. Collection pages, post content, routes,
  publication semantics, and managed pages are unchanged.
- Result: Selected Work now shares the Recent Posts section-heading pattern and
  row composition. Desktop rows use the same 35% right-aligned, full-height,
  `object-fit: cover` thumbnail; compact rows place a 16:9 image beneath the
  copy. The duplicate Selected Work eyebrow was removed, and all five curated
  preview items remain in their configured order.
- Validation: Focused `tests/contracts/site-baseline.test.ts` and
  `tests/contracts/curated-discovery.test.ts` passed 15 of 15 cases; `npm run
  typecheck` passed; `npm test` passed 87 of 87 cases across 20 files;
  `SITE_ORIGIN=https://blog.cloverhearts.com npm run build`,
  `SITE_ORIGIN=https://blog.cloverhearts.com npm run verify:pages`, and `git
  diff --check` passed. Browser review at 1132×905 measured identical
  1053×240px first rows and 368.5×240px thumbnails for Recent Posts and Selected
  Work. At 390×844 both used 287×161.4px 16:9 images beneath the copy, with zero
  horizontal overflow and no console warnings or errors.
- Compatibility / follow-up: Presentation-only. Static HTML readability,
  localization, content contracts, SEO, and build boundaries are unchanged;
  `CONTENT_RULES.md` remains accurate.

## 2026-08-21T01:12:22+09:00 — Post language and layout integrity pass

- Change type: Defect correction, localized related-post resolution, responsive
  post structure, spacing and thumbnail refinement, design contract, regression
  coverage, and governed policy coverage.
- Reason: A Korean post displayed four English related-post titles and `/en/`
  links even though Korean variants existed. Related/list thumbnails also used
  their source height instead of the declared 16:9 presentation, stretching a
  168px-wide image to 360px and making each related row about 400px tall.
  Mobile additionally placed author context after the entire related list.
- Scope: Normal-blog related-post selection and post DOM grouping, shared list
  thumbnail sizing, post header/rail/author/article/navigation/related spacing,
  responsive author order, `DESIGN.md`, renderer and CSS regressions, and policy
  hashes. Content sources, translation status, routes, schemas, publication
  semantics, and managed pages are unchanged.
- Result: Related candidates are now collapsed to one variant per translation
  group in active-language, English, then Korean priority before category
  filtering and limiting; the current group is excluded by translation key.
  The reviewed Korean post now shows four Korean titles and unprefixed Korean
  routes. General thumbnails render at 16:9 automatic height (168×94.5px in the
  desktop related list), reducing rows to about 175px. The post frame now uses
  explicit breadcrumb/header spacing, matching TOC/author inset padding, a
  flush leading article image, and distinct article, original-reference,
  author, previous/next, and related phases. Responsive DOM order is TOC,
  article, author, previous/next, then related posts.
- Validation: Focused `tests/contracts/pagination-navigation.test.ts` and
  `tests/contracts/site-baseline.test.ts` passed 14 of 14 cases, including
  “keeps related posts in the active language before configured fallbacks”;
  `npm run typecheck` passed; `npm test` passed 87 of 87 cases across 20 files;
  `SITE_ORIGIN=https://blog.cloverhearts.com npm run build` and
  `SITE_ORIGIN=https://blog.cloverhearts.com npm run verify:pages` passed.
  Browser checks at 1440×900 and 390×844 covered Home, Posts, Selected Work,
  Daily Notes, Explore, Search, 404, and the Korean Composable SDK post. All 16
  route/viewport combinations retained Korean document language, header/footer,
  and zero horizontal overflow, with no console warnings or errors. Desktop
  post transitions measured 48px from header to reading frame and 72px around
  navigation/related sections; compact author and following-section gaps were
  48–56px.
- Compatibility / follow-up: Intentional cross-language fallback remains
  available only when the active-language variant is absent. `I18N.md`,
  `UX_FLOW.md`, and `CONTENT_RULES.md` were reviewed and already describe the
  corrected behavior, so no content-contract revision was needed.

## 2026-08-21T01:03:23+09:00 — Five-item Selected Work preview

- Change type: Owner-requested curated-membership configuration, home-list
  rendering limit, regression coverage, and governed policy coverage.
- Reason: Populate the currently empty Selected Work area with five existing
  test posts so its layout and readability can be reviewed before real work
  evidence is published.
- Scope: The `work` selector in `config/curated-collections.yaml`, the home
  Selected Work display limit, curated-discovery fixtures/assertions, and the
  policy coverage manifest. No post source, route, taxonomy, representative
  image, or managed page was changed.
- Result: Selected Work now explicitly includes `building-ai-skills`,
  `composable-sdk`, `llms-txt-for-sdk-docs`, `measuring-ax`, and
  `trustworthy-ai-knowledge-base`. Preview compilation derives those existing
  draft groups into the collection and the home page renders all five rather
  than truncating after three. Production continues to exclude drafts under the
  existing publication policy.
- Validation: Focused `tests/contracts/curated-discovery.test.ts` passed 4 of 4
  cases, including a five-item home rendering assertion; `npm run typecheck`
  passed; `npm test` passed 86 of 86 cases across 20 files;
  `SITE_ORIGIN=https://blog.cloverhearts.com npm run build` and
  `SITE_ORIGIN=https://blog.cloverhearts.com npm run verify:pages` passed.
  Browser verification of `http://127.0.0.1:4321/` found exactly five Selected
  Work cards in the requested order, no horizontal overflow, and no invented
  project content.
- Compatibility / follow-up: This is preview-oriented membership using existing
  draft posts. `CONTENT_RULES.md` and `PUBLISHING.md` were reviewed and remain
  accurate because selector syntax and draft publication semantics did not
  change. Replace or remove the explicit keys when reviewed work-evidence posts
  become available.

## 2026-08-21T00:59:34+09:00 — Open Design home-reference alignment

- Change type: Owner-directed Open Design promotion, responsive featured-post
  layout refinement, design contract, regression coverage, and governed policy
  coverage.
- Reason: Apply the supplied `cloverhearts-blog-home.png` composition to the
  normal blog. The staging directory contained only its review README, so the
  owner-supplied image was used as the visual reference; it showed the featured
  post as an equal media/editorial split rather than the implemented 35:65
  split.
- Scope: Normal-blog featured-post desktop grid, compact stacking contract,
  `DESIGN.md`, the branded CSS contract assertion, and policy source hashes.
  Recent-post 35% full-height media, post pages, routes, content contracts, and
  managed pages remain unchanged.
- Result: The wide featured card now divides into two equal columns on one
  continuous pale-mint surface, with the approved/generated visual filling the
  left half and the summary occupying the right half. The existing compact
  breakpoint still stacks media before copy in one column.
- Validation: Focused `tests/contracts/site-baseline.test.ts` and
  `tests/contracts/post-summary.test.ts` passed 18 of 18 cases; `npm run
  typecheck` passed; the first full `npm test` run passed 85 of 86 cases but the
  existing pagination fixture exceeded its five-second limit; the focused
  pagination suite then passed 2 of 2 cases and the complete rerun passed 86 of
  86 cases across 20 files. `SITE_ORIGIN=https://blog.cloverhearts.com npm run
  build` and `SITE_ORIGIN=https://blog.cloverhearts.com npm run verify:pages`
  passed. Browser verification at 1440×900 measured equal 607px columns inside
  the 1216px card; the Recent Posts image remained 425.6px wide (35%) and 240px
  high. At 390×844 the featured grid resolved to one 333px column. Both widths
  had no horizontal overflow and the browser reported no warnings or errors.
- Compatibility / follow-up: Presentation-only. Open Design remains a staging
  authoring aid with no runtime or production dependency; the empty staging
  README was not promoted as executable code. Static HTML readability,
  localization behavior, SEO, publication semantics, and build boundaries are
  unchanged.

## 2026-08-21T00:50:18+09:00 — Recent-post image alignment refinement

- Change type: Owner-directed responsive layout refinement, image candidate
  sizing, design contract, regression expectations, and governed policy
  coverage.
- Reason: The Recent Posts rows appeared visually unbalanced because the copy
  consumed most of the line while the fixed-width thumbnail sat too narrowly
  at the far right.
- Scope: Home Recent Posts rendering options and responsive image `sizes`,
  normal-blog list CSS, `DESIGN.md`, focused renderer/CSS assertions, and policy
  hashes. Other post lists and managed pages retain their existing layouts.
- Result: At desktop widths each recent-post thumbnail is right-aligned at 35%
  of the complete row, reaches both vertical edges, and uses centered
  `object-fit: cover` cropping. The index and copy occupy the remaining columns
  with matching vertical padding. At mobile width the row returns to two
  columns and the image spans the full copy column beneath the text at 16:9.
- Validation: `npm run typecheck`; focused `tests/contracts/site-baseline.test.ts`
  and `tests/contracts/post-summary.test.ts` (18 of 18 cases); `npm test` (86 of
  86 cases across 20 files); `SITE_ORIGIN=https://blog.cloverhearts.com npm run
  build`; `SITE_ORIGIN=https://blog.cloverhearts.com npm run verify:pages`; and
  `git diff --check` passed. Browser verification at 1440×900 measured a
  426×240px image in a 1216×240px row (35%, zero right or height gap). At
  390×844 the image measured 287×161px at 16:9 in the copy column. Both widths
  had zero horizontal overflow and no console warnings or errors.
- Compatibility / follow-up: Presentation-only; content contracts, routes,
  publication behavior, SEO, static HTML readability, and approved image
  provenance remain unchanged.

## 2026-08-21T00:22:12+09:00 — Live Open Design preview workflow

- Change type: Local development behavior, watch-based build orchestration,
  preview-only live reload, development documentation, implementation status,
  automated regression coverage, and governed policy coverage.
- Reason: Allow the owner to run the real blog with `npm run dev`, edit its
  approved source from Open Design at the repository root, and see saved changes
  without restarting the preview server or manually reloading the browser.
- Scope: `scripts/dev.ts`, the local-preview and Open Design instructions in
  `DEVELOPMENT.md`, root-tooling status, focused preview tests, and the policy
  coverage manifest. Production build lanes and managed-page presentation are
  unchanged.
- Result: The preview server now watches normal-blog sources, debounces bursts,
  rebuilds web/search for presentation changes, rebuilds content/web/search for
  content or shared-contract changes, copies the refreshed search index, and
  sends a browser reload event only after success. Generated output, dependency
  directories, `.od/` state, and staged Open Design concepts are ignored to
  prevent loops. The live-reload client is injected only into served preview
  responses and is not written to artifacts or production output. Open Design
  remains an external authoring tool rather than a project dependency.
- Validation: Focused `tests/contracts/dev-preview.test.ts` passed 3 of 3 cases:
  “classifies blog design changes for the smallest safe preview rebuild”,
  “ignores generated and unrelated files so preview rebuilds cannot loop”, and
  “injects one development-only live reload client into served HTML”. `npm run
  typecheck`, `npm run validate:config`, `npm run validate:embeds`, `npm test`
  (86 of 86 cases across 20 files), `SITE_ORIGIN=https://blog.cloverhearts.com
  npm run build`, `SITE_ORIGIN=https://blog.cloverhearts.com npm run
  verify:pages`, and `git diff --check` passed. A live integration probe caused
  web rebuild revisions 1 and 2, delivered matching SSE reload events, and
  confirmed that preview artifacts contain no live-reload marker.
- Compatibility / follow-up: `npm run dev` retains the existing address and
  preview artifact contract. Open Design must promote an approved change into
  `DESIGN.md` or `apps/blog-web/`; editing only `design/open-design/` remains a
  staging action and intentionally does not change the live blog.

## 2026-08-19T00:17:07+09:00 — Open Design refined editorial implementation

- Change type: Owner-supplied Open Design application, responsive visual
  refinement, static renderer presentation, localized interface copy, social
  card typography, design contract, regression coverage, governed policy
  coverage, and implementation-status update.
- Reason: Apply the approved “Refined Current 01” handoff to the working blog
  while preserving the previously requested lighter title treatment and the
  static, no-JavaScript reading contract.
- Scope: Normal-blog home hero, author strip, featured/recent/work sections,
  collection and taxonomy lists, post header and three-region reading layout,
  search and recovery presentation, responsive and dark-mode states, generated
  social cards, localized all-posts call to action, `DESIGN.md`,
  `IMPLEMENTATION_STATUS.md`, CSS contract assertions, and policy hashes.
  Managed pages remain outside the root design system.
- Result: The normal blog now uses a 1216px white editorial frame, a pale
  overlapping workflow trace, a single text-style home action, thin ruled
  two-digit post rows, compact right-side thumbnails, a 132/704/132 desktop
  post grid, a white mobile hero, and 600-weight post/list titles. No Open
  Design runtime, remote asset, font, package, or production dependency was
  added. `CONTENT_RULES.md` was reviewed and remains accurate because content
  syntax, metadata, assets, and publication semantics did not change.
- Validation: `npm run typecheck`; `npm run validate:config`; `npm run
  validate:embeds`; `npm test` (83 of 83 cases across 19 files), including
  “ships the branded semantic CSS with resilient Pretendard fallbacks” and
  “provides the same non-empty UI message set for every language”;
  `SITE_ORIGIN=https://blog.cloverhearts.com npm run build`;
  `SITE_ORIGIN=https://blog.cloverhearts.com npm run verify:pages`; and `git
  diff --check` passed. Browser checks at 1440×900 and 390×844 confirmed zero
  horizontal overflow, a 704px desktop reading column, final title weight 600,
  mobile reflow, and no console warnings or errors.
- Compatibility / follow-up: Presentation-only. Routes, schemas, SEO,
  publication behavior, translated-post policy, managed-page isolation, and
  generated-HTML readability remain unchanged. Populated-corpus device testing
  may continue as posts move from development fixtures to reviewed publication.

## 2026-08-18T18:33:34+09:00 — Second display-title weight reduction

- Change type: Owner-directed typography refinement, design contract,
  regression expectation, and governed policy coverage.
- Reason: The owner requested one additional reduction after reviewing the
  first lighter title treatment.
- Scope: Normal-blog home hero and post-detail title weights, `DESIGN.md`, the
  branded CSS contract assertion, and policy hashes.
- Result: The home hero changed from 760 to 700 and post titles changed from
  680 to 600. Size, spacing, wrapping, responsive structure, and managed pages
  remain unchanged.
- Validation: `npm run typecheck`, `npm test` (83 of 83 cases across 19 files),
  governed policy validation, and `git diff --check` passed.
- Compatibility / follow-up: Presentation-only; content, routes, schemas, SEO,
  publication behavior, and static HTML guarantees are unchanged.

## 2026-08-18T18:28:58+09:00 — Lighter display-title weights

- Change type: Visual typography refinement, design contract, regression test,
  and governed policy coverage.
- Reason: The owner found the large title glyphs excessively heavy after the
  first branded-design pass.
- Scope: Home hero and post-detail title weights in the normal blog stylesheet,
  the corresponding typography rule in `DESIGN.md`, the branded CSS contract
  test, and policy source hashes.
- Result: The home hero weight changed from 850 to 760 and the post title now
  uses 680. Font size, line height, responsive wrapping, semantic hierarchy,
  and managed-page styles are unchanged.
- Validation: `npm run typecheck` passed. The first `npm test` run reached the
  existing 5-second timeout while building the pagination fixture without an
  assertion failure; an immediate full rerun passed all 83 cases across 19
  files, including the explicit 760/680 branded CSS assertions and governed
  policy validation. `git diff --check` passed. A new browser screenshot was
  not required because layout metrics, sizes, and wrapping rules were unchanged.
- Compatibility / follow-up: This is presentation-only and changes no content,
  route, schema, publication, SEO, or no-JavaScript behavior.

## 2026-08-18T17:50:06+09:00 — White and clear-green responsive blog design

- Change type: Owner-approved visual system, static blog presentation,
  localization, brand identity, social-card styling, tests, governed policy
  coverage, and implementation-status update.
- Reason: Implement the supplied desktop/mobile design brief as a complete,
  readable blog experience using the existing preview posts instead of leaving
  the branded direction deferred.
- Scope: Root `DESIGN.md`; `CloverHearts Labs` site identity and localized
  descriptions; shared header/footer and search dialog landmarks; localized
  home, collection, taxonomy, post, search, and 404 presentation; editorial
  hero, author introduction, featured/recent/selected-work hierarchy; responsive
  post TOC/article/author layout; light/dark/print/accessibility states;
  deterministic white/green generated social cards; design and renderer
  contract tests; policy hashes; `IMPLEMENTATION_STATUS.md`.
- Result: The normal blog now ships a white editorial surface with clear-green
  tokens, a two-column desktop and full-surface mobile terminal hero, ruled post
  lists, artifact-backed filters, a three-region desktop reading layout, native
  mobile TOC, responsive media/code/table handling, calm recovery/search
  surfaces, OS dark mode, reduced-motion handling, and print rules. All primary
  content remains static HTML and the managed-page design boundary is unchanged.
  `CONTENT_RULES.md` was reviewed and remains accurate because no authoring
  field, content syntax, asset rule, or publication semantic changed.
- Validation: `npm run typecheck`, `npm run validate:config`,
  `npm run validate:embeds`, `SITE_ORIGIN=https://blog.cloverhearts.com npm run
  build`, `SITE_ORIGIN=https://blog.cloverhearts.com npm run verify:pages`,
  `npm test`, `npm run test:i18n`, `npm run test:seo`, and
  `npm run test:quality` passed. Vitest passed 83 of 83 cases across 19 files,
  including the renamed `ships the branded semantic CSS with resilient
  Pretendard fallbacks`, updated pagination/navigation coverage, site identity,
  deterministic social-card palette, and governed policy validation. In-app
  browser checks at 1440×1000 and 390×844 covered Home and Post View: both had
  zero horizontal overflow; the desktop article column measured about 685px;
  the mobile terminal hero, navigation, TOC, and article reading order rendered
  without console errors.
- Compatibility / follow-up: Existing post/content contracts, stable routes,
  base-path portability, no-JavaScript behavior, and GitHub Pages deployment
  remain compatible. The three profile managed pages remain owner-unreviewed
  drafts and therefore are not present in production output; their configured
  public links require a later owner review/publication decision. No deployment,
  commit, or push was performed.

## 2026-08-17T21:26:55+09:00 — Public author identity and curated discovery

- Change type: Configuration, content contract, compiler, presentation,
  managed-page capability, tests, governed documents, and status update.
- Reason: Implement the approved public-author and curated-discovery target,
  including the generic container engine and per-content disclosure rule.
- Scope: Site owner identity; dynamic curated routes; `curated-collections.yaml`;
  marker tags; optional `workEvidence`; content artifact schema 8; generic
  collection/Explore renderer; author/profile access; in-place search dialog;
  draft Korean/English/Japanese profile packages; contract tests and policy
  coverage; `CONTENT_RULES.md`, `I18N.md`, `PUBLISHING.md`, `UX_FLOW.md`,
  `DESIGN.md`, `ARCHITECTURE.md`, implementation spec/status.
- Result: Primary navigation is All Posts, Selected Work, Daily Notes, Explore,
  and Search. Archive and Profile sit in the footer. `/work/`, `/daily/`, and
  `/explore/` are generic collection/discovery routes. Membership is
  compiler-derived and does not copy posts. BlogPosting author references a
  stable Person `@id`. Profile packages exist as drafts and are omitted from
  production. Search remains a real `/search/` route and opens a dialog when
  enhancement loads. Temporary posts were not auto-tagged as selected work.
  GitHub is the only configured public contact; email/LinkedIn/Instagram were
  not invented.
- Validation: `npm run typecheck` passed. `npm run validate:config` passed.
  Vitest passed 83 of 83 cases across 19 files, including
  `rejects unsafe or placeholder owner contact destinations`,
  `rejects include and exclude of the same translation key`,
  `derives curated membership, work chronology, and configuration-only extra
collections`, `adds a third curated container from configuration only`,
  updated primary-navigation assertions, and
  `validates every governed policy source and named test case`. Playwright
  rendered-browser visual and dialog-focus checks were not run. Production
  profile URLs remain unpublished until owner review.
- Compatibility / follow-up: Content schema is now 8. A later owner-approved
  biography and real additional contact destinations are required before the
  profile can be published and indexed. New selector/order/presentation
  vocabulary still needs a contract change. No Git commit or push was
  performed in this change.

## 2026-08-17T20:44:34+09:00 — Generic curated-container implementation workflow

- Change type: Approved implementation workflow, configuration/route
  extensibility contract, artifact ownership, developer handoff, status
  clarification, lifecycle plan, and regression-test requirements.
- Reason: Another implementation AI needs an exact process for building the
  first Selected Work and Daily Notes containers and for adding later curated
  post pages without duplicating Markdown, hard-coding template queries, or
  creating a new compiler branch per page.
- Scope: The curated-collection target in `IMPLEMENTATION_SPEC.md` and its
  specified-only gap in `IMPLEMENTATION_STATUS.md`. The workflow assigns
  validation to project config, membership/order to the content compiler,
  presentation-neutral records to the versioned content artifact, generic
  route rendering to the blog web lane, and canonical/discovery output to the
  existing downstream lanes. It covers dynamic curated routes, initial engine
  sequencing, routine later additions, non-routine extensions, retirement,
  navigation/Explore exposure, validation, and history.
- Result: Selected Work and Daily Notes are now explicitly acceptance fixtures
  for one reusable engine rather than bespoke pages. The first implementation
  must add the generic config-to-artifact-to-route pipeline. Once implemented,
  a normal new container can be added by declaring a stable ID/route, localized
  title and description, existing selector/order/presentation values, taxonomy
  markers and qualifying posts, plus optional intentional navigation. It must
  require no duplicated post, page template, hard-coded query, new artifact
  field, or compiler conditional. New behavior vocabulary remains a governed
  contract change with tests rather than an arbitrary configuration value.
- Validation: Reviewed the existing curated configuration example, selector
  precedence, translation-group fallback, work chronology, Explore/search
  boundaries, architecture ownership, route registry, content artifact, and
  cohesive implementation checklist before editing. Documentation whitespace,
  code-fence balance, section/timestamp order, referenced-file existence, and
  spec/status consistency checks were run afterward. No executable config,
  schema, artifact, compiler, renderer, route, content, test, policy hash, or
  generated output was changed.
- Compatibility / follow-up: The implementation AI must version any changed
  artifact/config contracts, update all producers and consumers together,
  preserve existing post canonical routes and category/tag/Archive behavior,
  and prove configuration-only addition with at least one extra synthetic
  container fixture. Removing a published container requires the existing
  route-retirement/redirect review and must never delete its source posts. No
  Git commit, push, deployment, or publication was performed.

## 2026-08-17T20:34:18+09:00 — Per-content disclosure replaces blanket profile restrictions

- Change type: Approved specification correction, disclosure ownership,
  developer handoff, implementation-status clarification, and compatibility
  note.
- Reason: Company names, tenure, public accounts, credentials, and personal
  information should not be suppressed by one blog-wide author/profile rule.
  Their publication context belongs to the individual post or managed profile
  that contains and reviews the information.
- Scope: The public-author portions of `IMPLEMENTATION_SPEC.md` and the related
  gap in `IMPLEMENTATION_STATUS.md`. This entry supersedes only the blanket
  restriction language in the 2026-08-17T19:15:46+09:00 target entry; its
  navigation, profile indexing, curated collections, search, localization,
  accessibility, and test plans remain approved.
- Result: The target no longer defines employer, tenure, account, credential,
  or personal-information fields as a globally prohibited set. A post or
  managed profile may publish any of those details when its reviewed source
  supports them. Shared configuration and renderers must preserve approved
  values rather than remove them. Structured data may represent such facts
  only when they match reviewed information visibly presented on the public
  page. URL safety validation still rejects embedded authentication
  credentials, signed/private destinations, unsafe schemes, and tracking
  parameters; that security rule is unrelated to professional credentials.
- Validation: Located every affected restriction in the approved target,
  status handoff, and earlier history entry; reviewed the surrounding identity,
  managed-profile, structured-data, contact-URL, and work-chronology clauses;
  then ran documentation whitespace, code-fence balance, heading/timestamp
  order, and target/status consistency checks. No executable configuration,
  schema, renderer, content, managed page, test, policy hash, or generated
  output was changed.
- Compatibility / follow-up: The implementation AI must treat disclosure as
  content-owned and must not add a global sanitizer, denylist, or renderer rule
  for these fact categories. Existing factual-integrity, source review,
  publication review, privacy/security, and safe-URL contracts continue to
  apply at their normal content boundaries. No Git commit, push, deployment,
  or publication was performed.

## 2026-08-17T19:15:46+09:00 — Public author and curated-discovery target specification

- Change type: Approved information architecture, public-author identity,
  managed-profile, curated-collection, search interaction, developer handoff,
  implementation-status update, privacy boundary, and regression-test plan.
- Reason: Readers arriving through public posts or external search need a
  visible, consistent path from an article to the author, public profile,
  contact points, and supporting work. The owner also wants all posts, selected
  work, and everyday writing to remain one canonical post corpus while being
  discoverable through purpose-specific curated views.
- Scope: `IMPLEMENTATION_SPEC.md` and `IMPLEMENTATION_STATUS.md`. The target
  specifies the exact localized navigation order All Posts, Selected Work,
  Daily Notes, Explore, and Search; a separate author-linked public Profile;
  localized site/author descriptions and LinkedIn/GitHub/Instagram/email-style
  contact points; three indexable managed profile variants; Person/ProfilePage
  and BlogPosting author identity; configuration-driven curated collections;
  `work-evidence`/`daily-record` marker tags; optional work chronology; common
  localized collection introductions; combined category/tag exploration; an
  accessible in-place search dialog with route fallback; architecture,
  privacy, localization, SEO, accessibility, migration, and test obligations.
- Result: The approved content menu is `전체 보기 · 주요 작업 · 일상 기록 ·
둘러보기 · 검색`, with equivalent English and Japanese labels. Selected Work
  uses the visible description `직접 만들거나 주도한 프로젝트, 연구, 문서,
기술적 결과와 업무 개선 사례를 소개합니다.` Daily Notes uses `아이들과
함께한 시간과 취미 생활 등 일상의 이야기를 기록합니다.` Each curated
  page shows its localized title, description, and logical-post count before a
  shared 10-item paginated list. Posts retain one canonical route and may
  appear in multiple collections. Profile is reached through visible author
  identity links, is externally indexable after owner review, and remains
  excluded from post search, taxonomy, Archive, recommendations, and RSS.
- Validation: Read `TESTING.md` and `ARCHITECTURE.md` completely; reviewed the
  current site/navigation/taxonomy/route schemas, managed-page contract,
  profile SEO provisions, publishing/list fallback rules, search boundary,
  UX/design navigation requirements, existing temporary taxonomy, and current
  implementation status before editing. Documentation whitespace, heading and
  timestamp order, code-fence balance, referenced-file existence, and target/
  status consistency checks were run after editing. No configuration, runtime
  schema, artifact, route, renderer, managed page, post, taxonomy, test, policy
  hash, or generated output was changed, so executable behavior remains the
  current Posts/Categories/Tags/Search navigation and route-based search.
- Compatibility / follow-up: The implementing AI must add and migrate the
  configuration/schema versions, route claims, generic collection engine,
  optional post chronology, curated membership artifacts, author/profile
  presentation, managed profile packages, SEO/discovery relationships,
  accessible search enhancement, governed documents, fixtures, browser and
  contract tests, and policy hashes as one reviewed change. It must keep real
  profile packages draft until the owner supplies and approves biography and
  public destinations and must not infer employers, tenure, accounts, or
  credentials. Final visual styling is intentionally deferred to a later
  owner-approved design task. No Git commit, push, deployment, or content
  publication was performed.

## 2026-08-17T14:18:01+09:00 — Ten-item pagination and secondary Archive navigation

- Change type: Configuration, presentation, UX/design/publishing contracts,
  tests, and implementation-status update.
- Reason: Apply the approved targets that reduce collection pages to 10
  logical post groups and move Archive out of the persistent primary header.
- Scope: `config/site.yaml` page size; `config/navigation.yaml` primary/footer
  membership; footer renderer and 404 recovery links; `UX_FLOW.md`,
  `DESIGN.md`, `PUBLISHING.md`, `CONTENT_RULES.md` examples; pagination and
  navigation contract tests; policy coverage.
- Result: Home and Posts/category/tag/Archive collections use the shared
  `listings.pageSize` of 10. Page 1 stays at the collection root; later pages
  remain `/page/<n>/`. Primary navigation is Posts, Categories, Tags, Search.
  Archive remains at `/archive/`, `/en/archive/`, and `/ja/archive/` and is
  linked once from the footer plus search/404 recovery. RSS, sitemap, post
  routes, and related-post limits are unchanged.
- Validation: `npm run typecheck` passed. Vitest passed 79 of 79 cases across
  18 files, including `defines primary exploration as localized static links`,
  `moves Archive to the footer while keeping localized archive routes`,
  `paginates home and collections by ten logical post groups`, the 21-group
  `10 / 10 / 1` Posts/Archive/category/tag boundary, `/page/1/` exclusion,
  self-canonical and previous/next links, Korean/English/Japanese Archive
  footer placement, English/Japanese fallback counting, `/blog` base-path
  footer links, and `validates every governed policy source and named test
case`. Playwright rendered-browser visual checks were not run.
- Compatibility / follow-up: Archive routes were moved in navigation, not
  deleted. Temporary preview groups will paginate to two pages per complete
  locale collection. No Git commit or push was performed in this change.

## 2026-08-17T13:53:28+09:00 — Ten-item pagination target specification

- Change type: Pagination target, developer handoff, implementation-status
  update, compatibility plan, and regression-test plan.
- Reason: A 20-item collection page is denser than desired for routine
  browsing. The approved target reduces each page to 10 logical post groups so
  lists are easier to scan while retaining the existing static pagination
  model.
- Scope: `IMPLEMENTATION_SPEC.md` and `IMPLEMENTATION_STATUS.md`. The target
  covers home recent posts and Posts, category, tag, and Archive collections in
  Korean, English, and Japanese; translation fallback and group counting; page
  roots and numbered routes; canonical and previous/next links; deterministic
  ordering; base-path portability; configuration ownership; fixtures, tests,
  policy traceability, and implementation reporting.
- Result: The approved shared `listings.pageSize` target is now 10 instead of 20. Page 1 remains the collection root and later pages remain under
  `/page/<n>/`; translation variants count as one logical group. With the
  current 20 temporary logical groups, complete Posts and Archive collections
  will form two 10-entry pages per locale after implementation. The target does
  not change post URLs, result totals, ordering rules, search, RSS, sitemap,
  related-post eligibility, or archive route ownership.
- Validation: Inspected the current `config/site.yaml` value, project-config
  schema, renderer consumers, `PUBLISHING.md` pagination ownership,
  `UX_FLOW.md` route/interaction rules, existing contract-test coverage, and
  `tests/policy-coverage.json` mappings before editing. Documentation
  whitespace, target/status consistency, referenced-file existence, and
  heading/timestamp order checks were run after editing. No runtime
  configuration, governed publishing/UX source, renderer, fixture, policy
  hash, or executable test was changed, so current output still uses 20.
- Compatibility / follow-up: The implementing AI must change
  `config/site.yaml`, authoritative publishing/UX documents, deterministic
  21-group boundary fixtures, collection and route assertions, and affected
  policy hashes together; then run the full relevant tests and preview build.
  This is a target-specification change only and is not complete after a local
  template slice. No Git commit, push, deployment, or post-content change was
  performed.

## 2026-08-17T13:25:35+09:00 — Archive removed from approved primary-navigation target

- Change type: Information-architecture target, navigation handoff,
  implementation-status update, and compatibility plan.
- Reason: Posts and Archive currently appear as similarly prominent menu
  choices even though Archive is a chronological retrieval index rather than a
  second general post feed. Reduce persistent header duplication while keeping
  chronological browsing available.
- Scope: `IMPLEMENTATION_SPEC.md` and `IMPLEMENTATION_STATUS.md`. The target
  defines the exact primary-header order, localized secondary footer placement,
  unchanged Korean/English/Japanese archive routes, search and 404 recovery
  links, no-JavaScript behavior, responsive/accessibility expectations,
  configuration migration, contract/browser tests, policy traceability, and
  implementation reporting.
- Result: The approved primary navigation becomes Posts, Categories, Tags, and
  Search. Archive/보관함/アーカイブ remains a complete static chronological
  index at `/archive/`, `/en/archive/`, and `/ja/archive/`, but moves to one
  localized secondary footer link. Search no-JavaScript and 404 recovery may
  retain contextual Archive links. The handoff explicitly forbids treating
  mobile-menu hiding as removal, deleting or redirecting archive routes, or
  changing their SEO/discovery behavior. It requires the implementing AI to
  update `config/navigation.yaml`, `UX_FLOW.md`, `DESIGN.md`, renderer output,
  the existing primary-exploration test, localized/base-path route assertions,
  policy hashes, status, and history together.
- Validation: Read `UX_FLOW.md` completely and inspected the current
  `config/navigation.yaml`, header rendering input, archive route emitters,
  localized archive messages, search no-JavaScript fallback, policy-coverage
  mapping, and `defines primary exploration as localized static links` test.
  Documentation whitespace, heading order, referenced-file existence, and
  target/status consistency checks were run after editing. No navigation
  configuration, renderer, route, governed UX/design source, policy hash, or
  executable test was changed, so current runtime behavior remains unchanged.
- Compatibility / follow-up: The implementing AI must move, not duplicate, the
  Archive item from primary navigation to the footer; preserve all archive
  routes and discovery; and prove the header/footer behavior in English,
  Korean, Japanese, root, and non-empty base-path output. This is a
  target-specification change only and remains incomplete until code,
  configuration, authoritative UX/design documents, tests, and policy coverage
  land together. No Git commit, push, deployment, or archive-content change was
  performed.

## 2026-08-17T12:10:00+09:00 — Localized description summaries and list thumbnails

- Change type: Content contract, artifact validation, presentation, tests, and
  status update.
- Reason: Implement the approved description-summary and automatic thumbnail
  targets so collection links show the authored localized description and a
  16:9 thumbnail without changing Open Graph or representative-image approval.
- Scope: Frontmatter and Zod validation; compatibility excerpt derivation;
  optional thumbnail asset records; list/home/related rendering; RSS and
  metadata consumers; `CONTENT_RULES.md`, `I18N.md`, `PUBLISHING.md`, `SEO.md`,
  `DESIGN.md`, `QUALITY_GATES.md`, implementation status/spec; policy coverage.
- Result: `description` is trimmed and capped at 150 Unicode characters and is
  the only collection/RSS/metadata summary. Compatibility `excerpt` skips
  leading non-prose blocks and falls back to `description`. Optional
  `thumbnail.src`/`alt` overrides list images; otherwise the representative
  16:9 derivative is used. Thumbnails do not mutate Open Graph or
  `BlogPosting.image`. Temporary posts needed no description-length migration.
- Validation: Strict TypeScript checking passed. Vitest contract tests passed
  77 of 77 cases across 17 files, including 150/151-character bounds,
  whitespace, invalid descriptions/thumbnails, leading-image excerpt fallback,
  localized collection/RSS/metadata output, explicit versus generated-card
  thumbnail sources, and Open Graph isolation. Playwright rendered-browser
  layout and assistive-technology checks were not run.
- Compatibility / follow-up: Content schema remains version 7; `excerpt` is
  retained only for compatibility. Removing it requires a later schema
  migration. No Git commit or push was performed in this change.

## 2026-08-17T11:21:13+09:00 — Automatic post-thumbnail target specification

- Change type: Approved frontmatter/image target, authoring-agent permission,
  presentation handoff, implementation-status update, and test plan.
- Reason: Allow an explicit thumbnail value in post attributes while ensuring
  every link/list summary receives a useful thumbnail even when the owner does
  not choose one individually. The owner granted standing permission for the
  authoring agent to select or generate a thumbnail by default, without
  conflating that permission with the existing owner-controlled Open Graph,
  cover, and social-image contract.
- Scope: `IMPLEMENTATION_SPEC.md` and `IMPLEMENTATION_STATUS.md`. The target
  covers an optional localized `thumbnail` object, managed-asset validation,
  explicit-owner precedence, agent selection/generation, representative-image
  fallback, canonical asset storage, translation sharing/localization,
  responsive 16:9 derivatives, collection and cross-language fallback
  rendering, accessibility, no-JavaScript behavior, crop safety, performance,
  SEO isolation, tests, policy updates, and implementation reporting.
- Result: The approved target accepts `thumbnail.src` and localized
  `thumbnail.alt` as an explicit list-presentation override. If absent, the
  authoring agent may select a suitable owned post asset or create and store a
  relevant thumbnail without another per-post confirmation. If a distinct
  source is unnecessary, the web build derives the thumbnail from the resolved
  social image, cover, or deterministic generated card, using its existing
  16:9 representative derivative. AI generation occurs only during authoring;
  production remains local and deterministic. A thumbnail never changes
  `representativeImage`, Open Graph, `BlogPosting.image`, cover, social image,
  or body media without a separate explicit decision. The sixty temporary
  groups can use their localized generated-card fallback and therefore need no
  immediate duplicate frontmatter migration.
- Validation: Read the complete root `DESIGN.md` and reviewed the existing
  frontmatter, content artifact, asset compiler, representative-image selector,
  Sharp derivative pipeline, collection renderer, SEO contract, and prior
  summary-target handoff. Confirmed that no current `thumbnail` source or
  artifact field exists and that the existing pipeline already produces a 16:9
  representative derivative suitable as the default source. Documentation
  whitespace, heading order, reference existence, and status/spec consistency
  checks were run after editing. No executable schema, renderer, asset source,
  governed content-policy document, policy hash, or test was changed, so the
  target remains explicitly unimplemented.
- Compatibility / follow-up: The implementing AI must deliver the optional
  field, resolved artifact, fallback precedence, responsive output, collection
  UI, documentation, positive/negative/boundary/deterministic/regression tests,
  rendered-browser checks, policy coverage, and history as one cohesive task.
  It must preserve current representative-image approval semantics, must not
  download unapproved third-party media, and must not perform AI generation in
  production or CI. No Git commit, push, deployment, image generation, or post
  migration was performed.

## 2026-08-17T11:17:29+09:00 — Localized description-summary implementation specification

- Change type: Approved implementation specification, developer handoff,
  implementation-status correction, and known-gap documentation.
- Reason: Make each post variant's existing `description` the single localized
  summary shown with post links and metadata, cap it at 150 characters, avoid a
  duplicate `summary` authoring field, and provide a complete instruction set
  for a separate implementation AI without falsely describing unimplemented
  behavior as current production behavior.
- Scope: `IMPLEMENTATION_SPEC.md` and `IMPLEMENTATION_STATUS.md`. The approved
  target covers English, Korean, and Japanese post authoring; frontmatter and
  artifact validation; home/post/category/tag/archive/pagination collections;
  related and cross-language fallback links; RSS, SEO, Open Graph, structured
  data, Pagefind query snippets, compatibility excerpts, migration, tests,
  policy traceability, and rendered-output checks. The status inventory also
  now records the twenty temporary three-language draft groups instead of the
  obsolete empty-content baseline.
- Result: The target keeps `description` as the only author-controlled summary.
  Every created, translated, or materially regenerated language variant must
  receive its own faithful description of at most 150 Unicode characters after
  trimming. Deterministic link/list/RSS/metadata surfaces will use that value;
  Pagefind retains query-dependent excerpts. The existing derived `excerpt`
  becomes collection-ineligible and, while retained for schema-version-7
  compatibility, must skip non-prose leading blocks and fall back to
  `description`. The handoff explicitly requires the implementing AI to update
  code, runtime schemas, `CONTENT_RULES.md`, `I18N.md`, `PUBLISHING.md`,
  `SEO.md`, policy hashes, tests, status, and history together. It includes
  positive, 150/151-character boundary, whitespace, leading-image regression,
  multilingual fallback, RSS/metadata, and Pagefind-separation acceptance
  cases. Existing inspection showed the sixty temporary descriptions already
  fit the new limit, with a maximum of 139 Unicode characters.
- Validation: Read `CONTENT_RULES.md`, `I18N.md`, `TESTING.md`,
  `PUBLISHING.md`, `SEO.md`, `IMPLEMENTATION_SPEC.md`, and
  `IMPLEMENTATION_STATUS.md` completely before editing. Reviewed current
  frontmatter, artifact, compiler, renderer, and search usages of
  `description` and `excerpt`, and measured all sixty preview artifact
  descriptions. Documentation whitespace, heading placement, and internal
  consistency checks were run after the edit. No implementation, runtime
  schema, governed content-policy source, policy hash, or executable test was
  changed, so no build or automated behavior is reported as newly passing.
- Compatibility / follow-up: This is deliberately a target-specification and
  handoff change rather than a partial runtime change. Current executable
  behavior and the governed contracts remain unchanged until the next AI
  implements the entire completion list. That task must not refresh a policy
  hash without reviewing and extending its mapped cases, must choose an
  explicit compatibility plan before removing `excerpt`, and must retain the
  existing descriptions' supported meaning during any migration. No Git
  commit, push, deployment, or post-body modification was performed.

## 2026-08-17T10:20:00+09:00 — Language-isolated static search

- Change type: Search implementation, presentation, tests, and status update.
- Reason: The search indexer existed, but the public search pages had no
  labeled query field, result list, or Pagefind client, so readers could not
  search.
- Scope: Localized search form and no-JavaScript fallback; progressive
  Pagefind client that loads only the active-language index; post HTML
  pagefind body/weight/ignore markers; indexer exclusion of chrome and
  boilerplate; preview eligibility for draft posts; preview server copies
  search files; contract tests.
- Result: `/search/`, `/en/search/`, and `/ja/search/` expose a labeled
  search form, live result count, keyboard-reachable links, and taxonomy
  fallbacks without JavaScript. Queries stay in the browser and do not go to
  a server or analytics. Production still omits drafts; preview may index
  preview-visible posts.
- Validation: Strict TypeScript checking passed. Vitest contract tests passed
  70 of 70 cases across 16 files, including empty-query behavior,
  language-isolated index paths, C++ published fixtures, production draft
  exclusion, search-page HTML contracts, and the empty-site Pages assembly.
  Playwright rendered-browser search interaction was not run.
- Compatibility / follow-up: `CONTENT_RULES.md` now records that production
  indexes omit drafts while preview may index preview-visible posts. First
  published posts will populate production indexes. Field ranking against a
  larger corpus remains a follow-up check.

## 2026-08-17T03:53:41+09:00 — Temporary post image and excerpt-output audit

- Change type: Content-output audit, known-issue documentation, and validation
  record.
- Reason: Reinspect the twenty temporary multilingual post groups after adding
  remote placeholder images, because successful schema, build, and test results
  did not by themselves prove that derived list summaries remained readable.
- Scope: All sixty draft sources across `docs/ko/`, `docs/en/`, and `docs/ja/`;
  the twenty shared `placehold.org` body-image URLs and localized alternative
  text; preview content artifacts; all sixty localized preview post routes; and
  the derived excerpts displayed by preview home, category, and archive lists.
  The supplied source directory was also searched case-insensitively for
  YouTube URLs, `youtu.be` URLs, YouTube directives, and raw iframe markup.
- Result: Every post variant contains one matching temporary body image, every
  shared image URL occurs in the corresponding Korean, English, and Japanese
  variants, and all sixty preview post pages emit an `<img>` element with
  localized non-empty alternative text. No YouTube URL or embed syntax exists
  in the twenty supplied source files, so no YouTube link was invented or
  added. The audit found one output defect not covered by the passing automated
  suite: because the image is the first Markdown block, `excerptFrom()` in
  `packages/content-compiler/src/markdown.ts` selects the image-only block and
  removes Markdown punctuation without removing its alternative text or URL.
  Consequently all sixty artifact excerpts, and the confirmed preview home,
  category, and archive list summaries that consume them, contain malformed
  text such as `!AI 재귀 오염 개념을 표현한 임시
이미지https://placehold.org/...` instead of the first prose paragraph. The
  post bodies and images themselves render successfully. This entry records the
  defect only; no post position, compiler behavior, schema, or test was changed
  as part of the audit.
- Validation: `npm run validate:config` passed. The preview content build wrote
  60 post artifacts, and the preview web build wrote 151 files including 60
  localized post pages with the expected remote image markup. Vitest passed all
  70 contract tests across 16 files, strict TypeScript checking passed, and the
  Git whitespace check passed. Manual artifact inspection confirmed malformed
  image-derived excerpts in 60 of 60 post artifacts and matching malformed list
  summaries in generated HTML. Source counts confirmed 20 Korean source
  variants, 40 English/Japanese `ai-draft` variants, 60 `draft: true` variants,
  and 60 image-bearing Markdown files. A representative placeholder request
  returned HTTP 200 with `image/png`. Rendered-browser/Playwright visual QA,
  deployed-site validation, and exhaustive live availability checks for all
  twenty external image URLs were not run.
- Compatibility / follow-up: The narrow content-only correction is to move each
  body image after the first prose paragraph in all three language variants so
  the current excerpt derivation selects readable text. A shared behavioral fix
  would instead make the content compiler skip image-only blocks when deriving
  excerpts; that option requires positive, negative, boundary, and regression
  coverage, a review of `CONTENT_RULES.md` and policy traceability, and a new
  history entry before completion. Until one option is explicitly implemented
  and the preview lists are rechecked, the malformed excerpts remain a known
  development-preview issue. All affected variants remain drafts. No Git
  commit, push, deployment, or source correction was performed.

## 2026-08-17T02:46:27+09:00 — English and Japanese preview-post translations

- Change type: Multilingual preview content and prior-entry correction.
- Reason: Correct the incomplete interpretation recorded in the
  `2026-08-17T02:32:56+09:00` entry. Partial publication permits a reviewed
  source to publish without every sibling, but the repository authoring
  workflow still requires new Korean source work to receive English and
  Japanese draft variants.
- Scope: Faithful English and Japanese translations for all twenty Korean test
  posts, preserving shared translation-group identity, categories, filenames,
  slugs, tags, timestamps, generated-card mode, headings, tables, lists, and
  source links.
- Result: `docs/en/` and `docs/ja/` each contain twenty sibling posts matching
  the twenty files under `docs/ko/`. Every new translation uses
  `translationStatus: ai-draft` and `draft: true`; Korean files remain source
  drafts. Preview compilation now produces sixty post artifacts and the web
  preview renders sixty post routes plus fifteen localized category pages.
- Validation: `validate:config` passed. The preview content build wrote 60
  artifacts and the preview web build wrote 151 files. All 65 Vitest contract
  tests across 15 files passed, strict TypeScript checking passed, locale path
  sets matched 20/20/20, English sources contained no Hangul body text, all 60
  sources passed heading/fence/local-path/placeholder checks, and the Git
  whitespace check passed.
- Compatibility / follow-up: The translations require owner review before
  either language can change to `translationStatus: reviewed` or enter a
  production build. No schema, taxonomy behavior, content rule, redirect, or
  test contract changed. Git commit, push, deployment, and visual browser QA
  were not performed.

## 2026-08-17T02:32:56+09:00 — Temporary categorized preview posts

- Change type: Preview content and taxonomy configuration.
- Reason: Populate the developing blog with twenty temporary, anonymized
  Markdown posts so post, category, tag, table, list, and link layouts can be
  tested before the fixtures are deleted.
- Scope: Twenty Korean draft posts under `docs/ko/`; five localized category
  IDs including `research-lab` with the Korean label `연구소`; eighteen
  localized tag IDs; deterministic generated-card selection for preview
  rendering.
- Result: The preview content compiler accepts all twenty posts and the web
  preview emits twenty post routes plus category pages for `research-lab`,
  `developer-life`, `life-notes`, `family-life`, and `everyday-lab`. The posts
  remain `draft: true` because they are substantially AI-edited development
  fixtures and must not enter production under the repository's
  proofreading-only original-work declaration. No English or Japanese sibling
  had been synthesized at this point; the later
  `2026-08-17T02:46:27+09:00` entry records the required correction.
- Validation: `validate:config` passed. The preview content build wrote 20
  artifacts, and the preview web build wrote 111 files including 20 post pages
  and 5 Korean category pages. All 65 Vitest contract tests across 15 files
  passed, strict TypeScript checking passed, the 20 post sources passed manual
  frontmatter/heading/fence/local-path/placeholder checks, and the Git
  whitespace check passed.
- Compatibility / follow-up: This adds only values allowed by the existing
  taxonomy schema and uses existing post syntax, so no new unit-test case or
  `CONTENT_RULES.md` change is required. Delete these temporary post groups and
  remove taxonomy values that are no longer used after layout testing. Git
  commit, push, deployment, translated-variant review, and visual browser QA
  were not performed.

## 2026-08-17T01:05:00+09:00 — Executable static-blog pipeline

- Change type: Architecture implementation, runtime contracts, build commands,
  tests, CI, and implementation-status update.
- Reason: Replace the specification-led scaffold with the documented Phase 1–8
  command surface so an empty production site can be validated and assembled.
- Scope: Zod artifact schemas; shared configuration loader; embed-core
  registry; content compiler; static blog renderer; Pagefind indexer;
  managed-page compiler; discovery builder; release assembler; root scripts;
  quality and Pages workflows; contract fixtures and tests; status and runbook
  wording.
- Result: `validate:config`, `validate:embeds`, `build:*`, `build`,
  `verify:pages`, and `dev` are executable. An empty production site emits
  localized home/list/search/404 routes, robots, llms.txt, sitemap, RSS, and
  `dist/index.html` plus `dist/404.html`. Preview and production artifacts stay
  separated. No production post, managed page, or real provider plugin was
  added.
- Validation: Strict TypeScript checking passed. Vitest contract tests passed
  65 of 65 cases across 15 files, including configuration load/rejection,
  synthetic embed execution, C++ translation-group compilation, production
  rejection of a draft original, omission of an unpublished English sibling,
  and empty-site Pages assembly. `validate:config` and `validate:embeds` were
  run after the suite. Playwright rendered-browser checks and live GitHub
  Pages/custom-domain verification were not run.
- Compatibility / follow-up: First reviewed posts, real embed providers, and
  custom-domain/Search Console operations remain follow-up. Generated
  `.artifacts/` and `dist/` stay uncommitted. `CONTENT_RULES.md` now documents
  the local embed registry entry shape; existing empty `config/embeds.yaml`
  remains valid.

## Entry format

```text
## <ISO 8601 timestamp> — <short title>

- Change type: <design, page, architecture, configuration, guide, build, etc.>
- Reason: <why the change was needed>
- Scope: <affected surfaces>
- Result: <observable outcome>
- Validation: <checks actually run, or explicitly not run>
- Compatibility / follow-up: <migration, known limits, or none>
```

## 2026-08-17T00:19:26+09:00 — Implementation-status audit and AI developer handoff

- Change type: Project description, implementation-status audit, specification
  clarification, package guides, agent workflow, and policy traceability.
- Reason: Preserve the existing scaffold while preventing the next development
  AI from mistaking package names, dependencies, provisional interfaces, or
  isolated helpers for a complete static-blog pipeline.
- Scope: English-first/Korean-companion project overview; actual versus target
  capability matrix; lane inputs and required outputs; implementation order and
  definition of done; content/web/search/managed/discovery/release package
  status; multilingual phase criteria; implementation/runbook/agent guidance;
  governed policy hashes.
- Result: `README.md` now identifies the repository as a specification-led,
  non-buildable scaffold and points to `IMPLEMENTATION_STATUS.md` as the exact
  developer handoff. The new status document records each lane as implemented,
  partial, scaffold-only, or specified-only, names the only commands that
  currently exist, and separates the approved target from verified capability.
  Related guides now use future-tense requirements where production pipelines
  do not exist. Existing executable source and tests were not changed.
- Validation: Strict TypeScript checking passed. All 52 Vitest contract tests
  across 9 files passed, and the dedicated policy-governance test passed 1 of 1
  case. Parsed 13 YAML and 13 JSON files, checked 46 Markdown files for local
  links and balanced fences, and passed the Git whitespace check.
- Compatibility / follow-up: This is a documentation-only clarification under
  the test-policy exemption; no runtime behavior, schema, route, artifact, or
  content source changed, so no new executable test case was required. The
  complete content, Astro, search, managed-page, discovery, release, and Pages
  deployment pipelines remain implementation work. Validation used the
  available local Node.js 25.2.1/npm 11.18.0; committed production pins remain
  Node.js 24.19.0/npm 11.17.0.

## 2026-08-17T00:07:35+09:00 — Multilingual publication and deterministic post-link fallback

- Change type: Localization/discovery policy, publication contract,
  configuration, provisional implementation, UX/SEO/architecture guides, ADR,
  tests, and policy traceability.
- Reason: Treat Korean, English, and Japanese variants as independently
  discoverable static publications instead of browser-language conveniences,
  preserve every intentionally requested URL, and provide deterministic post
  navigation when the active-language translation is unavailable.
- Scope: Manual-only language switching; partial translation publication;
  active-language, English, then Korean collection/related-link fallback;
  fallback-language labeling; source-before-translation and owner-review
  validation; localized UI copy; content, publishing, SEO, UX, design,
  architecture, development, deployment, agent, README, and compiler guides;
  ADR 0008; policy coverage; localization and site-baseline tests.
- Result: Removed the browser/stored-language navigation bootstrap and optional
  browser-preferred post context. Direct URLs now remain stable and language
  changes use published normal links only. The authored original may publish
  independently; each reviewed translation may follow without requiring all
  three languages at once. Post-group navigation resolves one target in active
  language, English, then Korean order, omits groups with no eligible target,
  and requires cross-language labels. `config/site.yaml` advances to schema
  version 6; the variable-length alternate artifact keeps content schema
  version 7. ADR 0008 supersedes ADR 0007's browser-selection and complete-group
  publication clauses while retaining Korean-default routes.
- Validation: All 52 Vitest contract tests across 9 files passed with zero
  failures, including active-language/English/Korean fallback, missing-target
  omission, independent reviewed-translation publication, original-first and
  owner-review rejection, manual selection configuration, route prefixes,
  original linking, and localized message parity. The dedicated policy test
  passed 1 of 1 case, strict TypeScript checking passed, 13 YAML and 13 JSON
  files parsed, 45 Markdown files passed local-link and balanced-fence checks,
  and the Git whitespace check passed.
- Compatibility / follow-up: No published post routes exist, so no redirect is
  required. Full compiler/list renderer, reciprocal partial-group `hreflang`,
  fallback-summary markup, Pagefind/RSS integration, Astro output, and deployed
  Pages checks remain implementation work. Validation ran with the available
  local Node.js 25.2.1/npm 11.18.0; the committed production pins remain Node.js
  24.19.0/npm 11.17.0 and CI must run the pinned versions.

## 2026-08-16T23:13:00+09:00 — Korean-default routing and Vitest handoff

- Change type: Localization decision, route policy, optional post UX metadata,
  test-runner migration, architecture/SEO/deployment guides, ADR, tests, and
  handoff documentation.
- Reason: Make Korean the blog's unprefixed default, publish English and
  Japanese under explicit language paths, preserve intentionally requested
  language routes, provide metadata for an optional browser-language post
  affordance, and remove ambiguity about the approved test runner.
- Scope: `config/site.yaml` and logical route guidance; project/browser language
  resolvers; post original/preferred-language context; Korean, English, and
  Japanese UI messages; content, I18N, UX, design, SEO, AI discovery, GitHub
  Pages, architecture, development, testing, agent, README, managed-page
  template, and quality contracts; ADR 0007; policy traceability; all executable
  contract tests and root test scripts.
- Result: Korean now owns `/` and every unprefixed blog route, English owns
  `/en/`, and Japanese retains `/ja/`. Unsupported/no-JavaScript fallback is
  Korean. Automatic browser selection can navigate once only from an
  unprefixed Korean route; explicit language routes remain stable. Existing
  `originalLanguage` and validated alternate data now produce an optional
  `PostLanguageContext` with an original route and available browser-preferred
  sibling, without exposing review state or requiring visible post chrome. The
  content artifact remains schema version 7. All unit/contract and policy tests
  now run exclusively with Vitest; the Open Design workflow and approved
  classless baseline remain otherwise unchanged.
- Validation: Vitest `4.1.10` passed all 55 tests across 9 files with zero
  failures, including Korean fallback/prefix routing, explicit-route stability,
  missing-alternate behavior, optional post-language context, locale message
  parity, the managed-page template default, and Vitest script enforcement. The
  dedicated policy-governance run passed 1 of 1 case. Strict TypeScript checking
  passed. Parsed 12 YAML and 13 JSON files, checked links and balanced fences
  across 44 Markdown files, and passed the Git whitespace check.
- Compatibility / follow-up: ADR 0007 supersedes ADR 0005 and the locale-default
  clause of ADR 0006. No published post routes exist, so no redirect migration
  is required; any externally published route from the former planned model
  would need an explicit compatibility entry. Full Astro route generation,
  rendered optional language-context UX, release assembly, and deployed Pages
  checks remain later implementation work and were not reported as passed.

## 2026-08-16T22:34:08+09:00 — Production domain and classless UX baseline

- Change type: Architecture decision, production configuration, UX, design,
  font dependency, navigation, capacity policy, provisional implementation,
  tests, and guides.
- Reason: Resolve the remaining launch-critical origin, initial presentation,
  primary UX review languages, and GitHub Pages/GitHub Pro performance and
  capacity decisions without delaying semantic user-flow implementation for a
  branded visual system.
- Scope: `blog.cloverhearts.com` production origin, Route 53/Pages subdomain
  contract, Korean/English UX priority with retained Japanese support,
  `UX_FLOW.md`, root classless design contract, semantic Astro shell, classless
  CSS, Pretendard package/provenance, localized primary navigation and skip
  label, performance-budget configuration/validator, author asset limits,
  implementation/development/deployment/SEO/agent guides, ADR 0006, policy
  traceability, and contract tests.
- Result: Fixed the canonical production origin at
  `https://blog.cloverhearts.com` with an empty base path and documented a Route
  53 `blog` CNAME to `cloverhearts.github.io` after Pages registration. Added a
  no-component-class semantic shell and CSS baseline using system colors,
  fluid reading widths, visible focus, print behavior, and locally bundled
  Pretendard Variable `1.3.9` dynamic subsets. Defined static home/discovery/
  reading/search/recovery/managed-page flows and real Posts, Categories, Tags,
  Archive, and Search links. Added conservative Pages/Pro failure budgets,
  including a 512 MiB release, 8-minute deployment, 10,000 routes, 1 MiB normal
  initial transfer, image/font limits, 75 GiB bandwidth warning, 2,400 Actions
  minutes warning, and 512 MiB Actions artifact storage.
- Validation: With Node.js `24.19.0` and npm `11.17.0`, strict TypeScript
  checking and all 52 contract/policy tests passed with zero failures, skips, or
  cancellations, including 11 new stack/site-baseline cases. The Astro compiler
  accepted `BlogShell.astro`; the installed Pretendard dynamic WOFF2 subset fit
  the 4 MiB font budget. npm installed/audited 321 packages with zero reported
  vulnerabilities and reported no unreviewed install scripts; the optional-free
  dependency tree was valid. Parsed eleven project YAML files plus the Actions
  workflow and four JSON files, checked all 43 Markdown files for balanced
  fences and local links, and passed the Git whitespace check. Reviewed current
  official GitHub Pages limits, GitHub Pro Actions allowances, custom-subdomain
  guidance, and Pretendard license/distribution guidance.
- Compatibility / follow-up: `config/site.yaml` advances from schema version 4
  to 5; the future runtime Zod schema must accept `production` and
  `primaryExperience`. Japanese content/routes remain required and no post
  frontmatter or content-artifact schema changes. GitHub Pages settings, Route
  53 DNS, certificate activation, complete Astro routes, full build, budget
  measurement, and deployed-environment checks were not performed and remain
  later implementation/operations work.

## 2026-08-16T21:49:38+09:00 — Approved npm implementation baseline

- Change type: Architecture, runtime, package management, localization,
  implementation specification, CI, tests, configuration, and guides.
- Reason: Finalize the previously deferred technology choices for the next
  implementation agent, standardize on the latest Node.js 24 LTS release and
  npm instead of pnpm, and reduce translated-post chrome to an original-work
  reference below the article.
- Scope: Root npm workspace and lockfile, Node/npm version pins, install-script
  approvals, strict TypeScript configuration, package dependency manifests,
  GitHub quality workflow, implementation handoff, two accepted ADRs, browser
  language selection, translated-post footer rendering, shared language
  messages/configuration, architecture/development/design/SEO/publishing/
  deployment/content guides, policy traceability, and contract tests.
- Result: Pinned Node.js `24.19.0` with its bundled npm `11.17.0`, added the
  approved Astro/Zod/unified/Pagefind/Sharp/Vitest/Playwright/axe-core stack as
  npm workspaces with one lockfile, and added an npm-based quality workflow.
  An unprefixed English static route can now navigate once to an existing
  browser-preferred Korean or Japanese static alternate; prefixed routes and
  explicit choices remain stable. Translated posts expose only the original
  language and original-post link in a semantic footer after the article body,
  while source-language posts add no such footer.
- Validation: Installed the locked dependency tree with `npm ci`; npm reported
  no unreviewed install scripts after the pinned `esbuild` approval and explicit
  `fsevents` denial. Using Node.js `24.19.0` and npm `11.17.0`, TypeScript strict
  checking passed and all 41 contract/policy tests passed with zero failures,
  skips, or cancellations. `npm audit --omit=dev` reported zero vulnerabilities,
  and `npm ls --all --omit=optional` found a valid dependency tree. Parsed ten
  shared YAML configurations plus the GitHub quality workflow and four JSON
  files; checked all 41 Markdown files for balanced fences and local links; and
  passed the Git whitespace check.
- Compatibility / follow-up: Content artifact schema version 7 is unchanged and
  there are no existing post sources to migrate. The executable Astro routes,
  runtime Zod schemas, full compilers, Pagefind integration, release assembly,
  and Pages deployment workflow remain implementation work, so no full site
  build or deployed-environment check was claimed. The committed quality
  workflow will run on GitHub after push; deployment remains deferred until a
  valid `dist/` pipeline exists.

## 2026-08-16T17:17:34+09:00 — Mandatory change-to-test traceability

- Change type: Test governance, agent policy, quality gate, development
  workflow, architecture, provisional automation, README, and guides.
- Reason: Require every future behavioral or machine-enforceable policy change
  to add or update its test cases in the same task, including the AI crawler,
  AI data-use, and post-authorship policies already introduced.
- Scope: Root testing policy, agent completion rules, command contract, quality
  gates, development plan, contract-test documentation, high-impact policy
  coverage manifest, source-hash/case-name governance test, and public README.
- Result: Added `TESTING.md` as the authoritative change-to-test contract.
  Behavioral/config/schema/security/SEO/AI/content/deployment changes now
  require applicable positive, negative, boundary, deterministic, and
  regression cases. Added `tests/policy-coverage.json`, mapping test governance,
  open AI discovery/data use, and metadata-only human authorship policies to
  reviewed source hashes and exact executable case names. Added a governance
  test that rejects stale hashes, missing/escaping paths, duplicate policy
  ownership, empty mappings, and nonexistent named tests. Non-semantic prose
  edits and routine posts have narrowly documented validation-based exemptions;
  new shared behavior or syntax does not.
- Validation: Passed the new policy-governance test directly, then passed all 35
  executable TypeScript tests. Parsed the policy coverage JSON and all ten YAML
  configuration files, checked 38 Markdown files for balanced fences and local
  links, and passed the Git whitespace check. The future root `test:policy`
  package script and CI integration were not run because the package manager,
  root scripts, and workflow remain deferred.
- Compatibility / follow-up: No content/frontmatter or artifact schema changed,
  so `CONTENT_RULES.md` remains accurate and generated artifacts need no
  migration. When a governed source changes, its mapped cases must be reviewed
  and its SHA-256 refreshed in the same task. New high-impact policies must be
  added to the coverage manifest when introduced; updating a hash alone is not
  adequate test review.

## 2026-08-16T16:49:51+09:00 — Metadata-only human authorship disclosure

- Change type: Content provenance, metadata, artifact schema, SEO safety,
  localization, agent rules, provisional implementation, tests, and guides.
- Reason: Add an English machine-readable declaration to every post stating
  that its original work is reliable and human-authored and that AI assistance
  on that original was limited to proofreading, without displaying the text in
  the reader-facing post.
- Scope: Shared content-provenance configuration, content artifact contract,
  project-config validation, static-head metadata rendering, multilingual
  provenance semantics, AI discovery guidance, SEO/search exclusions, content
  authoring rules, quality gates, README, and contract tests.
- Result: Added a required, build-derived `authorshipDisclosure` record to every
  post artifact and advanced the content schema to version 7. The renderer emits
  the exact English statement plus owner/original-work/human/proofreading values
  as escaped custom `<meta>` records. It emits no CSS-hidden body text and no
  JSON-LD/Schema.org trust claim. The declaration applies to the original work,
  so AI-assisted translation and owner review remain independently represented
  by `originalLanguage` and `translationStatus`. Authoring agents must keep
  substantially AI-drafted source material as draft rather than publishing it
  under the proofreading-only owner declaration.
- Validation: Passed all 34 executable TypeScript tests, including four new
  authorship-disclosure tests for exact semantics, metadata-only output,
  escaping, and misleading-scope rejection. Parsed and verified all ten shared
  YAML files, checked 37 Markdown files for balanced fences and local links,
  and passed the Git whitespace check. Reviewed current Google Search guidance
  on hidden-text abuse, structured-data visibility, and AI-creation context. A
  full site build was not run because the executable content/web pipeline and
  framework remain deferred.
- Compatibility / follow-up: Content artifacts advance from version 6 to 7 and
  earlier intermediates must be rebuilt. No frontmatter migration is required
  because the field is derived from `config/content-provenance.yaml`; there are
  no existing post source files to rewrite. The selected runtime schema and
  renderer must wire the provided validation and head-metadata functions. A
  substantially AI-authored future post requires an explicit provenance policy
  extension instead of reusing this declaration.

## 2026-08-16T16:32:52+09:00 — Open AI data-use policy

- Change type: AI discovery policy, configuration, guide, provisional
  implementation, and tests.
- Reason: Make public, indexable blog content intentionally friendly to AI
  search, answer generation, user-directed retrieval, public datasets, and
  model development rather than limiting training-oriented crawlers.
- Scope: AI crawler registry and schema, `llms.txt` machine-use declaration,
  discovery renderer types, Common Crawl support, SEO/architecture/build/quality
  guides, bilingual README, and contract tests.
- Result: Changed `GPTBot` and `ClaudeBot` from disallowed to allowed, retained
  open `Google-Extended`, and explicitly added Common Crawl's `CCBot`. Added a
  structured `dataUse` declaration allowing search/answering, user-directed
  retrieval, model development, and public dataset inclusion while requesting
  canonical attribution. Generated `llms.txt` now emits the same machine-use
  posture in a dedicated section. Crawler access remains separate from any
  copyright or license grant.
- Validation: Verified current `CCBot` identity and behavior against Common
  Crawl's official crawler documentation. Passed all 30 executable TypeScript
  tests, including open search/training/dataset/wildcard rules and generated
  `llms.txt` machine-use statements. Parsed all nine shared YAML files, checked
  37 Markdown files for balanced fences and local links, and passed the Git
  whitespace check. A full site build was not run because the executable
  discovery/release pipeline remains deferred.
- Compatibility / follow-up: `config/ai-crawlers.yaml` advances from schema
  version 1 to 2. Discovery artifact version 3 remains compatible because its
  crawler-policy hash already captures policy changes and its generated-file
  contract is unchanged. No post or managed-page authoring field changed, so
  `CONTENT_RULES.md` remains accurate. A separate content-license decision is
  still required if the owner wants to grant reuse rights beyond crawler and
  machine-use intent.

## 2026-08-16T16:28:24+09:00 — AI crawler policy and llms.txt discovery guide

- Change type: AI discovery, SEO, configuration, architecture, build contract,
  provisional implementation, tests, and guides.
- Reason: Keep the public blog discoverable to AI search and user-directed
  agents while separating provider-specific search, training, and mixed-use
  crawler policy and giving agents a concise canonical usage guide.
- Scope: AI crawler registry, route reservations, site-discovery and release
  artifacts, `robots.txt` generation, root `llms.txt` generation, GitHub Pages
  verification, artifact schema compatibility, project/agent documentation,
  and contract tests.
- Result: Added `config/ai-crawlers.yaml` as the single policy source. AI search
  and user-directed agents plus the open wildcard remain allowed; OpenAI and
  Anthropic training-only tokens default to disallowed, while
  `Google-Extended` is explicitly allowed because it currently combines Gemini
  grounding and model-improvement use. Added deterministic TypeScript renderers
  for policy-driven `robots.txt` and proposal-based `llms.txt`, with HTTPS,
  duplicate-token, newline-injection, and structural validation. The concise
  guide uses canonical language/discovery/intentional links rather than raw
  Markdown or a duplicate all-post index. Added the human policy and static-host
  enforcement boundary in `AI_DISCOVERY.md`.
- Validation: Passed all 30 executable TypeScript tests, including five new AI
  discovery tests. Parsed all nine shared YAML configuration files, checked the
  edited files with the Git whitespace validator, and reviewed the content
  authoring contract for impact. A full site build and deployed URL check were
  not run because the package manager, framework, runtime YAML schema, and
  executable discovery/release pipeline remain deferred.
- Compatibility / follow-up: `config/routes.yaml` advances from schema version
  3 to 4 and discovery artifacts advance from version 2 to 3; earlier
  intermediates must be rebuilt. No post or managed-page authoring field
  changed, so `CONTENT_RULES.md` remains accurate. Phase 1 must connect the YAML
  validator to the provided renderer input, and Phase 6 must supply resolved
  canonical links and write the generated files into the discovery artifact.

## 2026-08-16T14:24:12+09:00 — SEO hardening and owner-approved post imagery

- Change type: SEO, localization, content metadata, image workflow, routing,
  design, build/deployment plan, provisional contracts, tests, and guides.
- Reason: Complete the remaining launch SEO structure and ensure an authoring
  agent cannot silently choose or generate a post representative image while
  converting source material.
- Scope: Canonical pagination, non-redirecting browser-language suggestions,
  translation review status, owner-approved representative-image modes,
  responsive/Article image derivatives, site/author structured data, favicon,
  Core Web Vitals targets, Search Console operations, sitemap/robots rules,
  GitHub Pages output verification, shared route configuration, and agent
  workflows.
- Result: Added required `translationStatus` and `representativeImage` post
  fields, raised the content artifact schema to version 6, and made production
  reject unreviewed AI translations or inconsistent image modes. Post
  conversion now offers supplied asset, cover, deterministic-card, AI-image,
  or later-supply choices; generation requires explicit selection and a
  generated asset requires final owner approval. The renderer follows the
  stored mode without fallback and plans `1200 × 630`, `1:1`, `4:3`, and `16:9`
  derivatives. Browser detection now returns a dismissible alternate-language
  suggestion instead of a redirect. Added self-canonical `/page/<n>/` routing,
  `WebSite`/conditional `Person` guidance, managed-page schema mapping,
  responsive image and favicon rules, numeric Core Web Vitals goals, and Route
  53/Search Console launch checks.
- Validation: Passed all 25 executable TypeScript tests, including the revised
  language suggestion behavior, content schema version, and strict
  representative-image mode selection. Parsed all shared YAML configuration,
  checked balanced fences and local links across 36 Markdown files, and passed
  the Git whitespace check. A full site build, generated image crop inspection,
  Rich Results Test, Search Console verification, and field performance check
  were not run because the framework, executable build pipeline, production
  domain, and deployed pages remain deferred.
- Compatibility / follow-up: `config/routes.yaml` advances from schema version
  2 to 3 and content artifacts advance from version 5 to 6; earlier
  intermediates must be rebuilt. There are no existing post Markdown files to
  migrate. The selected implementation stack must add runtime schemas, image
  transformation/crop review, favicon assets, structured-data emitters,
  pagination output, performance budgets, and the documented deployment-time
  Search Console checks.

## 2026-08-16T13:20:57+09:00 — English-first bilingual README

- Change type: Repository guide, agent instruction, and documentation language
  policy.
- Reason: The public project overview needs English as its default language
  while remaining directly readable to Korean contributors and readers.
- Scope: Root `README.md`, the shared agent instructions, and modification
  history.
- Result: Reorganized the README into English-first sections with an adjacent
  Korean companion translation for every explanatory section. Added a durable
  instruction requiring future README changes to update both languages
  together while treating English as authoritative.
- Validation: Checked all Markdown files for balanced fences and resolvable
  local links, checked modified files for trailing whitespace, and ran the Git
  whitespace check. No executable code or content schema changed, so no build
  or application tests were required.
- Compatibility / follow-up: `CONTENT_RULES.md` remains accurate because post
  and managed-page authoring formats did not change. Future README edits must
  preserve English-first ordering and Korean parity.

## 2026-08-16T13:18:13+09:00 — Public comments deferred from initial release

- Change type: Architecture scope, implementation plan, decision record, and
  guide update.
- Reason: Anonymous or account-backed comments would add a writable runtime,
  moderation, abuse prevention, privacy, retention, and operational complexity
  that is not required for the initial static blog.
- Scope: Initial-release architecture boundary, resolved/deferred development
  decisions, repository overview, and ADR 0003.
- Result: Public comments are explicitly excluded. The current phases add no
  comment provider, write API, account flow, moderation queue, comment database,
  placeholder SDK, metadata contract, or comment-specific client code. Any
  future comment proposal requires a separate architecture and privacy review.
- Validation: Searched project Markdown and configuration for existing comment
  providers and comment-system contracts; found no implementation or provider
  dependency to remove. Checked the edited Markdown links, fences, and Git
  whitespace after the documentation update.
- Compatibility / follow-up: No post or managed-page authoring format changed,
  so `CONTENT_RULES.md` remains accurate and requires no update. Readers cannot
  post comments in the initial release; content, navigation, SEO, search,
  analytics, and managed pages remain independent of comments.

## 2026-08-16T05:07:06+09:00 — Per-post localized Open Graph contract

- Change type: SEO, content metadata, artifact/configuration schema, web
  presentation, design, tests, build/deployment contract, and guide update.
- Reason: Every localized post needs its own static Open Graph metadata and
  representative social preview without inheriting an unrelated global image.
- Scope: Optional post `socialImage`, paired cover/social-image artifacts,
  language-specific Open Graph locales, metadata generation and escaping,
  image-source precedence, deterministic fallback-card design, Pages output,
  authoring agents, quality gates, and implementation plan.
- Result: Each published post must emit a complete `article` Open Graph object
  with localized title/description/locale/category/tags, canonical self URL,
  publication dates, and a post-specific `1200 × 630` image. Image selection is
  explicit social image, then cover, then a locally generated deterministic
  post card. Added a framework-independent ordered metadata generator, safe
  HTML rendering, HTTPS validation, namespace constant, and source-selection
  helper. Production never calls a remote image service or reuses a misleading
  global fallback.
- Validation: Passed all 25 executable TypeScript tests, including core tag
  ordering, locale alternates, article metadata, attribute escaping, invalid
  URL/image rejection, and image-source precedence; parsed all eight YAML files
  and verified `en_US`/`ko_KR`/`ja_JP`; checked links and balanced fences across
  35 Markdown files; and passed the Git whitespace check. The full website and
  pixel-level card renderer were not built because the framework, fonts, final
  Open Design tokens, and executable root build pipeline remain deferred.
- Compatibility / follow-up: Content artifacts advance from schema version 4
  to version 5 and `config/site.yaml` advances from version 2 to version 3;
  earlier intermediates must be rebuilt. There are no existing posts to migrate.
  The selected framework must implement the documented local card renderer,
  place cards under `/_assets/social/`, inject the generated tags into initial
  HTML, and run visual/social-preview validation before launch.

## 2026-08-16T04:58:52+09:00 — Original-language provenance for translated posts

- Change type: Content metadata, artifact schema, localization UI, SEO,
  validation, agent workflow, and guide update.
- Reason: English and Japanese translations need to identify their Korean
  source clearly so readers can distinguish an authored original from a
  translation and consult the original when nuance matters.
- Scope: Post frontmatter, translation-group invariants, content/search
  artifacts, post-header messages and origin resolver, Schema.org relationships,
  Open Design requirements, publishing/quality gates, agent instructions,
  development plan, and contract tests.
- Result: Every post variant now requires the same `originalLanguage` value.
  Renderers can classify original versus translated variants, display localized
  origin metadata, warn translated-page readers that nuance may differ, and
  link to the validated original route. Structured data uses `inLanguage` and
  connects translations with `translationOfWork`; no translator identity is
  inferred. Korean-source authoring sets `originalLanguage: "ko"` on all three
  variants.
- Validation: Passed all 21 executable TypeScript tests, including original
  resolution and missing-original rejection; parsed all eight shared YAML
  files; checked local links and balanced fences across 35 Markdown files; and
  passed the Git whitespace check. A full site build was not run because the
  framework and executable root build pipeline remain deferred.
- Compatibility / follow-up: Content artifacts advance from schema version 3
  to version 4 and earlier intermediate output must be rebuilt. There are no
  existing post files to migrate; any future legacy group must add the field to
  all variants before production. The selected renderer still needs to wire the
  documented initial-HTML disclosure and JSON-LD emission.

## 2026-08-16T04:53:40+09:00 — English-default multilingual publishing contract

- Change type: Architecture, content schema, configuration, localization,
  design, SEO, search, discovery, managed-page metadata, tests, and guides.
- Reason: Korean source posts must be publishable as English and Japanese
  translations, with the whole blog selecting a browser-appropriate language
  while retaining complete static HTML and GitHub Pages compatibility.
- Scope: Locale-grouped `docs/`, shared language/route/taxonomy/navigation
  configuration, artifact contracts and provenance, browser preference and UI
  message scaffolding, normal-blog and managed-page rules, Open Design guidance,
  static search/RSS/404 behavior, deployment layout, quality gates, and agent
  post-conversion instructions.
- Result: English is now the unprefixed default and no-JavaScript fallback;
  Korean uses `/ko/` and Japanese `/ja/`. Published posts require a consistent
  three-file translation group. All normal blog surfaces, search indexes, and
  RSS feeds are language-scoped, with reciprocal SEO alternates and real
  language links. Managed pages remain independent and expose alternates only
  when separately authored packages share an optional `translationKey`.
  Provisional browser-language selection and complete typed UI message maps
  were added without introducing a framework or runtime translation service.
- Validation: Parsed all eight shared YAML files and asserted the configured
  `en`/`ko`/`ja`, English-default, Korean-source invariants; checked local links
  and balanced fences across 35 Markdown files; passed all 19 executable
  TypeScript tests; and passed the Git whitespace check. A full site build was
  not run because the framework, runtime schema implementation, package manager,
  and root build scripts remain deferred decision gates.
- Compatibility / follow-up: There are no existing post Markdown files or
  managed-page packages to migrate. Legacy `docs/<category>/...` posts must move
  under `docs/ko/`, add `translationKey` and stable taxonomy IDs, and gain
  matching `en`/`ja` variants before production. Content artifacts advance to
  schema version 3; web, search, managed-page, discovery, and release artifacts
  advance to version 2, so all earlier intermediate output is rebuild-only.
  The selected framework must wire the provided preference helper and render
  the documented static alternate metadata; no deployment was attempted.

## 2026-08-16T04:38:15+09:00 — History governance and final consistency audit

- Change type: Guide, project governance, validation, and analytics bug fix.
- Reason: Require durable history for every non-routine blog change and perform
  a final review for incorrect or inconsistent project behavior.
- Scope: `AGENTS.md`, `History.md`, root documentation, configuration, Markdown
  links/fences, artifact contracts, heading-anchor logic/tests, and the
  blog-owned GA4 adapter/tests.
- Result: Added the mandatory history workflow and README discovery link. The
  audit found and fixed one functional defect: after analytics consent was
  revoked and granted again, the already-loaded GA4 client did not receive the
  new `granted` consent update. Re-grant now updates GA4 without loading a
  second script. No other blocking contract or documentation inconsistency was
  found.
- Validation: Parsed all nine YAML files; verified local Markdown links and
  balanced fences across 34 Markdown files; scanned required paths, whitespace,
  and common secret/local-path patterns; ran all 11 executable TypeScript
  scaffold tests covering GA4 and heading anchors; and ran the Git whitespace
  check. Full build/deployment was not run because executable root build scripts
  and the deferred implementation stack do not yet exist.
- Compatibility / follow-up: No post or managed-page authoring format changed.
  The untracked root image `guro-vlog-thumbnail-upload-3840x2160.jpg` remains
  untouched because its intended ownership is unknown; classify/copy it through
  the content asset workflow if it is meant for a post. The repository scaffold
  and image are still uncommitted and therefore not yet preserved in Git
  history.

## 2026-08-16T04:34:40+09:00 — Modification-history policy introduced

- Change type: Project governance and guide update.
- Reason: Non-content blog changes need a durable record of their time, intent,
  and outcome across Codex, Claude Code, Gemini CLI, and other agents.
- Scope: Root `History.md`, shared `AGENTS.md`, and repository documentation.
- Result: All design, page, structure, contract, configuration, guide,
  build/deployment, security, analytics, and search changes must now update this
  log in the same task. Routine post authoring is the narrowly defined
  exception.
- Validation: Confirmed the Claude and Gemini adapter files import
  `AGENTS.md`; final repository audit is recorded in the next entry after its
  checks complete.
- Compatibility / follow-up: No post or managed-page source format changed.

## 2026-08-16T04:34:40+09:00 — Existing project foundation recorded as baseline

- Change type: Retrospective baseline recorded at history-introduction time.
- Reason: The history file was introduced after the initial architecture work,
  so the current repository state needs an explicit starting point without
  inventing earlier per-change timestamps.
- Scope: Static blog/content isolation, GitHub Pages release boundary, Open
  Design contracts, managed pages, embed-plugin boundary, asset handling,
  search/taxonomy/recommendation policies, optional consent-gated GA4, and
  Markdown-derived heading anchors/table-of-contents metadata.
- Result: The repository contains planning contracts and framework-neutral
  TypeScript scaffolding for the agreed architecture. Content artifact schema
  version `2` carries deterministic heading anchors and hierarchy metadata.
- Validation: Heading-anchor contract tests passed before this baseline was
  recorded. Full end-to-end build/deployment was not run because the framework,
  package manager, runtime schema library, Markdown stack, and root build
  scripts are still documented decision gates.
- Compatibility / follow-up: Existing Markdown posts require no TOC migration;
  version `1` intermediate content artifacts must be rebuilt. Select the
  deferred implementation stack before claiming an executable site release.
