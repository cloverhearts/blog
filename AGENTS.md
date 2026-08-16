# Blog Repository Instructions

## Project intent

- This repository is a TypeScript-based, SEO-friendly static blog.
- Published post content must remain readable in the generated HTML when client-side JavaScript is unavailable.
- Source posts live under `docs/<language>/`. Source media lives under
  `assets/content/` and is shared by translation variants before being
  collected into static output by the content pipeline.
- Standalone managed pages live under `managed-pages/`. Each managed page owns its full-page design, content or application entrypoint, and page-local assets.
- Web presentation and content processing are separate responsibilities, but a release must assemble and validate both.
- Use the approved Node.js/npm/Astro/Zod/unified/Pagefind/Sharp test stack in
  `IMPLEMENTATION_SPEC.md` and ADR 0004. Replacing a selected tool requires an
  explicit user decision and a superseding ADR.
- Vitest is the sole focused unit and contract test runner. Do not add or retain
  a parallel `node:test`, Jest, Mocha, or other unit-test command.
- Keep the root `README.md` English-first. English is the authoritative text;
  place the Korean companion translation immediately after the corresponding
  English section and update both languages in the same change.

## Required change-to-test pairing

- `TESTING.md` is authoritative for test ownership, required behavioral and
  policy coverage, fixtures, regression cases, policy traceability, exemptions,
  and validation reporting. Read it before changing code, configuration,
  schemas, build behavior, routes, security/privacy/analytics, SEO/discovery,
  AI/data-use policy, content contracts, or managed-page behavior.
- A behavior or machine-enforceable policy change is incomplete unless its
  automated tests are added or updated in the same task. Include positive,
  negative, boundary/compatibility, deterministic, and regression cases as
  applicable; a compile-only check is not sufficient.
- When a high-impact governed policy or implementation source changes, review
  and update `tests/policy-coverage.json`. Do not refresh a source hash without
  reviewing the mapped cases for semantic adequacy.
- Never remove, skip, weaken, or rewrite a valid test solely to make changed
  behavior pass. Update an expectation only when the authoritative contract
  intentionally changed, and record that reason in `History.md`.
- A pure typo/comment/prose clarification with no behavior change may reuse the
  existing suite, but its completion report and history entry must identify the
  exemption and the documentation checks actually run.
- A routine post using existing syntax needs full content/translation/asset/link
  validation rather than a new unit-test file. New syntax, shared behavior, an
  uncovered edge case, or a regression requires a fixture and automated test.

## Required modification history

- The root `History.md` is the authoritative, human-readable modification log
  for this blog project. The filename and casing are exact.
- Before changing blog design, adding or removing a page, changing repository
  structure or dependencies, altering architecture/contracts/configuration,
  changing build/deployment/security/analytics/search behavior, or editing any
  project guide or agent instruction, read `History.md` and append an entry in
  the same task. A required change is incomplete until its history entry exists.
- The only routine exemption is creating or editing a normal post under
  `docs/` and its post-owned assets when that work does not change schemas,
  authoring rules, routes, plugins, shared behavior, or project guides. Managed
  pages, post deletion/route migration, and any content-system change are not
  exempt.
- Add entries newest first beneath the introductory section. Use an ISO 8601
  timestamp with the project timezone (`Asia/Seoul`) and include at least:
  change type, reason, affected scope, result, validation, and compatibility or
  follow-up notes.
- Record facts only. Do not guess an earlier modification time, silently rewrite
  past entries, or claim a build/test passed when it was not run. Correct a
  material historical error with a new dated entry that links to the corrected
  entry; minor spelling fixes may be made in place.
- One entry may summarize one cohesive task across several files. Keep the log
  focused on intent and observable outcome rather than a raw file-by-file diff,
  and never include secrets, tokens, private URLs, personal visitor data, or
  transient local-machine details.
- History validation records must name the relevant new/changed test cases or
  suite, report only checks actually run, and list unavailable integration or
  manual gates without presenting them as passed.

## Architecture boundaries

- `ARCHITECTURE.md` is authoritative for dependency direction, ownership, intermediate artifacts, and release assembly. Read it before changing repository structure, build boundaries, artifact contracts, or cross-package imports.
- `GITHUB_PAGES.md` is authoritative for the production hosting boundary, `dist/` shape, base-path portability, Pages verification, and deployment workflow. Read it before changing release layout, public URL resolution, deployment automation, DNS assumptions, or static-host security behavior.
- The root `DESIGN.md` is the Open Design-compatible source of truth for the normal blog's visual system. Read it completely before changing blog layout, visual tokens, typography, components, responsive behavior, motion, or presentation assets.
- `UX_FLOW.md` is authoritative for the normal blog's semantic page frame,
  discovery, reading, search, recovery, localization, and managed-page
  transition flows. Read it before changing navigation or interaction order.
- A managed page never inherits the root `DESIGN.md`. Its local `managed-pages/<page-id>/DESIGN.md` is authoritative for that page.
- `SEO.md` owns canonical, robots, social metadata, structured data, sitemap, RSS, and discovery presentation rules. `AI_DISCOVERY.md` owns AI crawler categories, agent-facing discovery guidance, `llms.txt`, and the static-host observation/enforcement boundary. `PUBLISHING.md` owns publication state, ordering, pagination, related-post derivation, deletion, and search expectations. `QUALITY_GATES.md` owns release acceptance criteria. `DEVELOPMENT.md` owns the intended command and local/release workflow.
- `I18N.md` owns supported/default/source languages, locale routes, browser
  preference behavior, translation grouping, localized UI, and language-scoped
  search/feed behavior. Read it before changing any language-aware content,
  route, UI, search, discovery, or managed-page alternate behavior.
- ADR 0007 owns Korean-default browser-language navigation and optional
  post-language context metadata/UX. Do not redirect an explicitly requested
  `/en/` or `/ja/` route, require a post footer, or expose a translation banner,
  nuance warning, or visible review-status message without an explicit policy
  change and tests.
- `config/analytics.yaml` owns the optional GA4 activation, scope, consent, and data-minimization policy. Analytics belongs only to the blog web layer, is disabled when its public measurement-ID environment value is absent, and must never become a content-compiler input or recommendation signal.
- Post sources and the content compiler must not import or depend on the blog web application's components, layout, routing, framework, or CSS.
- The blog web application must not traverse `docs/`, parse source Markdown, or resolve source assets. It consumes only the versioned artifact contract from `packages/contracts/` and `.artifacts/content/<mode>/`.
- Post heading IDs and ordered TOC metadata are produced together by the content
  compiler using the canonical heading-anchor logic. The blog application must
  render emitted `HeadingArtifact` IDs/anchors verbatim and never re-slug
  heading text or maintain a duplicate TOC in content.
- Managed pages and their compiler must not import the blog web application or post taxonomies. Each managed page builds as a standalone output.
- The search indexer consumes rendered blog HTML and eligible-post metadata. It must not parse source Markdown or index managed pages by default.
- External-content directives pass through `packages/embed-core/`. The content compiler, managed-page compiler, and blog application must not import individual packages under `plugins/embeds/`.
- Provider plugins are reviewed local build-time code only. Do not add directory scanning, remote plugin loading, runtime marketplace installation, or unregistered directive execution.
- The release assembler may merge and validate production artifacts but may not render content, apply design, derive metadata, or accept preview artifacts.
- Generated intermediate output belongs only in `.artifacts/`; final static output belongs only in `dist/`. Neither is source of truth.
- GitHub Pages publishes only the verified `dist/` artifact through GitHub Actions. Never select branch-based `/docs` publishing; that directory contains post sources.
- A content change may trigger a blog rerender, and a design change may rerender post HTML, but neither may require source edits across the boundary.
- Do not introduce a cross-boundary dependency for convenience. Extend the versioned contract or add a presentation-neutral primitive instead.
- Open Design is a source authoring tool only. Do not add its daemon, CLI, MCP server, generated cache, or network service to production dependencies or CI builds.

## Shared configuration and executable contracts

- `config/` is authoritative for shared locale, timezone, URL, route, taxonomy-alias, intentional navigation, redirect, discovery, AI-crawler, document-security, and embed-plugin policies. Do not duplicate these values in individual packages or content files.
- `config/ai-crawlers.yaml` is the only source for crawler-specific access and
  generated `llms.txt` inclusion/guidance policy. Never hand-edit generated
  `robots.txt` or `llms.txt`, and verify provider tokens against current
  official documentation before changing their purpose or access.
- `config/content-provenance.yaml` is the only source for the post-wide
  original-work authorship and limited AI-assistance declaration. Do not copy
  it into frontmatter or body Markdown, and do not publish substantially
  AI-drafted source material under the proofreading-only declaration.
- GA4 uses the public build value named by `config/analytics.yaml`. Never put a measurement ID, tracking snippet, event payload, or consent state in post frontmatter, managed-page metadata, or generated content artifacts. Managed pages are not tracked unless a later explicit architecture and privacy decision changes that default.
- `packages/project-config/` owns runtime configuration validation and route registration. Blog presentation settings and managed-page design do not belong there.
- Cross-boundary data must be validated at runtime by `packages/contracts/` both when produced and when consumed. TypeScript interfaces alone are not sufficient.
- Once runtime schemas are implemented, infer exported TypeScript types from them; do not maintain a second handwritten type definition that can drift.
- Every artifact must declare schema/build compatibility and reproducible provenance as specified by `ARCHITECTURE.md`.
- Preview and production artifacts use different paths and manifest types. Never copy, merge, or release a preview artifact into `dist/`.
- Integrity-bearing manifests must not include an uncontrolled wall-clock timestamp. Use the documented diagnostic report or explicit reproducible timestamp input.
- `config/embeds.yaml` is the only plugin registry and provider-capability policy. `config/security.yaml` is the maximum static-document and direct managed-page external-origin policy. Adding a provider or external capability requires an explicit local implementation, policy entry, content-rule update, fixtures, and security review.
- `config/performance-budgets.yaml` owns repository, release, route, page,
  script, font, image, deployment-time, and bandwidth-warning budgets. Budget
  violations fail CI; do not weaken them silently to make a build pass.

## Authoritative content contract

- `CONTENT_RULES.md` is the single source of truth for blog posts, managed pages, metadata, assets, embeds, paths, and content validation.
- Before creating, converting, editing, moving, or reviewing any post under `docs/`, read `CONTENT_RULES.md` completely.
- For every post task, also read `I18N.md` completely. A Korean source post is
  not production-complete until faithful English and Japanese variants exist
  in the same translation group, unless the user explicitly requests a draft.
- Before adding, copying, renaming, or referencing any post asset under `assets/content/`, read `CONTENT_RULES.md` completely.
- Before creating, converting, editing, moving, or reviewing anything under `managed-pages/`, read `CONTENT_RULES.md` completely and then read that page package's `page.yaml` and `DESIGN.md` completely.
- Apply the current user request first, then this file, then `CONTENT_RULES.md`. If they conflict in a way that changes publishing semantics or could lose content, stop and explain the conflict.
- Do not duplicate the full content contract in agent-specific instruction files. They must point back to this file.

## Content contract change control

- A change is incomplete if it changes a post or managed-page format, or the information authors must provide, without updating `CONTENT_RULES.md` in the same task.
- Update `CONTENT_RULES.md` whenever code, configuration, templates, schemas, parsers, renderers, or build steps add, remove, rename, reinterpret, default, validate, or derive any of the following:
  - frontmatter fields or allowed values;
  - supported languages, translation grouping, source locale, localized
    metadata, original-language provenance, translation-review status,
    translated-content disclosure, or browser-language selection;
  - filename, category, slug, tag, date, or URL rules;
  - Markdown body structure or supported syntax;
  - image, video, audio, map, download, or embed syntax;
  - cover/social preview metadata, Open Graph fields, social-card selection,
    generated-card behavior, or preview-image validation;
  - asset locations, logical references, transformations, or output behavior;
  - draft, publishing, recommendation, search, archive, RSS, sitemap, or SEO behavior;
  - managed-page kinds, routes, package structure, `DESIGN.md` contracts, entrypoints, security declarations, return navigation, discovery, printing, or application behavior;
  - cross-boundary artifact schemas, content HTML guarantees, asset records, or build ownership;
  - shared configuration, route ownership, preview/production separation, provenance, or final-HTML search behavior;
  - embed-core contracts, plugin registration, provider directives, external origins, iframe permissions, build-time network access, client enhancement, or fallback behavior;
  - content warnings, errors, validation checks, or required author actions.
- Document whether each metadata field is required, optional, derived, or deprecated. Include a valid example and validation constraints for every author-controlled field.
- For a breaking content change, update affected posts or provide an explicit migration and compatibility plan. Do not leave existing content silently incompatible with the new rules.
- If a related implementation change genuinely requires no documentation change, verify that `CONTENT_RULES.md` still describes the behavior accurately and state that result in the completion report.
- Before completing any content-system change, review the implementation, examples, automated validation, and `CONTENT_RULES.md` together for consistency.

## Post conversion workflow

When the user supplies prose, notes, an article, links, images, video, maps, or an existing document and asks for a blog post:

1. Treat the supplied material as source content, not as publication-ready Markdown.
2. Read `CONTENT_RULES.md` and `I18N.md`, then inspect existing
   `docs/<language>/` categories, translation groups, taxonomy IDs, and relevant
   `assets/content/` paths.
3. Preserve the author's meaning, factual claims, code, quotations, and source links. Do not invent missing facts, experiences, measurements, citations, dates, or media rights.
   Confirm that the original work fits `config/content-provenance.yaml`: the
   substantive authorship is human and AI assistance on the original was
   limited to proofreading. Formatting/Markdown normalization and separately
   disclosed translation do not change that origin, but substantial AI
   drafting or rewriting does; keep a conflicting group as draft and report it.
4. Derive only metadata supported by the source. Ask the user only when a missing decision is material; otherwise create a draft and report the unresolved item.
5. Convert the Korean source to the canonical `ko` variant, then create faithful
   `en` and `ja` variants with matching group metadata as required by
   `CONTENT_RULES.md` and `I18N.md`. Set `originalLanguage: "ko"` on all three
   when the supplied Korean document is the original work. Mark the Korean
   variant `translationStatus: "source"` and new unreviewed translations
   `translationStatus: "ai-draft"`; never infer a different original language
   from translation quality or modification time.
6. Copy supplied local assets into the canonical asset directory. Never move or delete the originals unless explicitly requested.
7. Before finalizing a representative image, present the user with a short
   choice based on the completed post: suitable supplied/owned asset candidates,
   cover reuse when appropriate, a deterministic typographic post card, and an
   AI-generated visual concept only when it would add value. For each option,
   state the intended subject, crop/localization behavior, and any known rights
   or provenance constraint. Do not silently choose a representative image.
8. Generate or download nothing until the user explicitly selects that option.
   If the user selects AI generation, show the generated candidate for final
   approval before promoting it into `assets/content/` or setting
   `socialImage`. If no choice is received, keep the translation group as draft
   and report the image decision as unresolved.
9. After approval, set the same required `representativeImage` mode on all
   variants. Add localized `socialImage.src`/`alt` for `social-image`, require
   the approved cover for `cover`, or select `generated-card` without inventing
   an asset. The build, not the authoring agent, creates the required social and
   Article image aspect-ratio derivatives.
10. Replace local absolute paths and temporary attachment paths with canonical `asset:/...` references.
11. Use built-in local-media syntax only where documented, and use an external-provider directive only when its local plugin is enabled. If a provider plugin is unavailable, use a descriptive normal link or keep the post as a draft. Do not paste arbitrary scripts, raw iframes, tracking snippets, or secrets into a post.
12. Check for an existing post or asset collision before writing. Do not overwrite published content without explicit authorization.
13. Ask the owner to review the translated variants. Change translated
    variants to `translationStatus: "reviewed"` and publish the three-language
    group only after that explicit approval; otherwise retain `draft: true`.
14. Run the repository's content, translation-group, localized-link, and
   contract-fixture commands when they exist. Until then, perform the manual
   checklists in `CONTENT_RULES.md` and `I18N.md`.
15. Report all three post paths, copied/shared asset paths, the user-approved
    representative-image choice and generated derivatives policy, translation
    review statuses, important original-language assumptions, unresolved draft
    items, and validation result.

## Embed provider workflow

When the user explicitly asks to add or change an external-content provider:

1. Read `ARCHITECTURE.md`, `CONTENT_RULES.md`, `config/embeds.yaml`, and the embed-core contract completely.
2. Keep provider-neutral orchestration in `packages/embed-core/` and provider behavior in one package under `plugins/embeds/<plugin-id>/`.
3. Do not change the content compiler or blog application merely to register a provider; extend the stable contract only when the provider exposes a genuinely new provider-neutral capability.
4. Register the reviewed local package explicitly. Never scan directories, download plugin code, or accept a remote package reference.
5. Define runtime directive validation, canonical URL/ID normalization, an accessible title, searchable fallback text, and a durable normal-link fallback.
6. Declare the minimum external origins and iframe permissions. Build-time network access remains disabled unless the user explicitly authorizes a documented reproducible exception.
7. Treat client code as optional progressive enhancement. The post and fallback link must remain usable without it.
8. Add provider fixtures for valid input, invalid input, sanitization, security-policy rejection, no-JavaScript fallback, and deterministic output.
9. Update `CONTENT_RULES.md` with the exact authoring syntax only when the plugin and validator support it.

## Managed page workflow

When the user asks for a standalone profile, resume, presentation, microsite, interactive experience, or single-page application:

1. Treat it as a managed page, not as a blog post, unless the user explicitly asks for post taxonomy and blog layout.
2. Read the managed-page sections of `CONTENT_RULES.md`, shared route configuration, and existing managed-page IDs and routes for collisions.
3. Create or update one self-contained package under `managed-pages/<page-id>/`.
4. Keep `page.yaml` limited to schema version, routing, page kind, declared entrypoint, publication, language, optional translation grouping, indexing, standalone-page SEO, and security requests. Do not add post categories, tags, dates, related posts, reading time, or archive metadata.
5. Create and maintain the page's own Open Design-compatible `DESIGN.md`. Read it completely before changing the page UI, layout, typography, motion, print behavior, or responsive behavior.
6. Declare exactly one entrypoint and the minimum external-origin/iframe permissions in `page.yaml`; undeclared external capability is forbidden.
7. Keep page-owned assets inside the package's `assets/` directory and use the managed-page logical asset path defined by `CONTENT_RULES.md`.
8. Do not apply the normal blog header, footer, sidebar, post typography, or global page chrome. The shared renderer may inject only the required return control and technical document metadata.
9. Ensure the return control is a real link that works without JavaScript and leads to the configured blog route.
10. Do not add the page to post lists, categories, tags, archives, recommendations, RSS, or the default search index. Discovery occurs only through its direct URL or intentional links.
11. Apply the document, presentation, or application fallback and accessibility rules for the selected page kind.
12. Validate the standalone route, entrypoint, design contract, security policy, assets, return navigation, indexing choice, build mode, and build output before reporting completion.

## Repository safety

- Keep generated site output and caches out of source content directories.
- Do not store API keys, access tokens, signed URLs, private attachment URLs, or local machine paths in committed content.
- Do not download or vendor remote media unless the user has requested it and its use is authorized.
- Do not silently rewrite an existing post's stable slug, publication date, or canonical asset identifiers.
- Do not silently rewrite a managed page's stable ID or route.
- Keep changes scoped to the requested post or managed page and its assets unless the user asks for broader maintenance.

## Agent compatibility

- Codex and Grok Build use this `AGENTS.md` directly.
- Claude Code loads this file through the root `CLAUDE.md` import.
- Gemini CLI loads this file through the root `GEMINI.md` import.
- If another coding agent does not support `AGENTS.md`, add only a small adapter file that imports or explicitly tells the agent to read `AGENTS.md`; keep `CONTENT_RULES.md` authoritative.
- Because Claude Code and Gemini CLI import this file, the `History.md`
  requirement applies to them without duplicating the policy in `CLAUDE.md` or
  `GEMINI.md`.
