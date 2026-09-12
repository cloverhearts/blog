# CloverHearts Blog

<!-- language-switcher:start -->
**Languages**

**English** · [한국어](./README.ko.md) · [日本語](./README.ja.md)
<!-- language-switcher:end -->

A TypeScript-based static blog with independently developed content, blog
presentation, and standalone managed pages.

The approved implementation uses Node.js 24.19.0 LTS, npm 11.17.0 workspaces,
Astro static output, Zod 4, unified/remark/rehype, Pagefind, Sharp, Vitest,
Playwright, and axe-core. See `IMPLEMENTATION_SPEC.md` and ADR 0004.

English is the authoritative README language. Each translation lives in its own
`README.<language-code>.md` file (for example, `README.ko.md` or `README.ja.md`).
Update existing translations in the same change and add new languages to the
language selector in every README only after the translated file exists.
These documentation languages are independent of the blog's publishing locales.

## Overview

The repository is designed around runtime-validated, versioned build artifacts
so source content never imports the blog UI, and the blog UI never parses source
Markdown directly. Preview and production outputs are structurally separate, a
dedicated final-HTML stage builds serverless search data, and external embeds
can be added later through isolated build-time provider plugins.

## Current status

The documented build command surface is executable. An empty production site
assembles to `dist/` with localized system routes and discovery files. First
reviewed posts remain follow-up work. A reviewed YouTube embed provider is
implemented, and the site is deployed at [blog.cloverhearts.com](https://blog.cloverhearts.com/)
with domain verification and HTTPS enabled. See [IMPLEMENTATION_STATUS.md](./IMPLEMENTATION_STATUS.md).

The target specification is in
[IMPLEMENTATION_SPEC.md](./IMPLEMENTATION_SPEC.md), and phase exit criteria
are in [DEVELOPMENT_PLAN.md](./DEVELOPMENT_PLAN.md).

The commands available now are:

```text
npm ci
npm run typecheck
npm run validate:config
npm run validate:embeds
npm run test:contracts
npm run test:policy
npm test
npm run build
npm run dev
```

Production `build` requires `SITE_ORIGIN=https://blog.cloverhearts.com`.

The production target is GitHub Pages through a custom GitHub Actions workflow.
The Pages workflow publishes only a verified `dist/` release; `docs/` remains
an unpublished build input rather than a Pages source directory. The canonical
production origin is `https://blog.cloverhearts.com`. `.github/workflows/pages.yml`
deploys pushes to `main` and supports manual dispatch. Quality checks build the
root and `/blog` variants in separate jobs.

Before the first deployment, open [repository Pages settings](https://github.com/cloverhearts/blog/settings/pages),
select **GitHub Actions**, and save **blog.cloverhearts.com** as the custom
domain. If GitHub reports that the domain is already taken, release its existing
Pages association or complete GitHub domain ownership verification first.
Then configure a DNS CNAME record `blog` pointing to `cloverhearts.github.io`
and enable **Enforce HTTPS** once the certificate is available. Actions-based
publishing does not require a repository `CNAME` file. See
[GitHub's custom-domain guide](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site).
Draft posts and draft profiles remain excluded from production even when visible
in the local preview.

Korean is the blog's unprefixed default and no-JavaScript fallback. English is
published under `/en/` and Japanese under `/ja/`. Only root visits select the
first supported browser language; all other URLs keep their language. Readers
can switch through normal links; the Korean home choice uses `/?lang=ko` to
prevent automatic switching, without cookies or storage. Post navigation
prefers the active language, then English, then Korean.

Public comments are intentionally excluded from the initial release. The site
does not require a comment provider, write API, account system, moderation
queue, or comment database; adding comments later requires a separate privacy,
security, operating-cost, and architecture decision.

Every localized post is designed to emit a complete static Open Graph article
record and a post-specific social image. Source images remain optional because
the blog web build can create a deterministic localized card from validated
post metadata and the approved design system.

The root [DESIGN.md](./DESIGN.md) is the Open Design-compatible visual contract
for the normal blog. The current implementation uses a white-and-green editorial
layout, locally bundled Pretendard Variable, and the flow in
[UX_FLOW.md](./UX_FLOW.md). Korean and English are the primary UX review languages;
Japanese remains fully supported. Every standalone managed page owns a separate
uppercase `DESIGN.md` and does not inherit the blog design.

## Project documentation

See [ARCHITECTURE.md](./ARCHITECTURE.md) for dependency boundaries,
[GITHUB_PAGES.md](./GITHUB_PAGES.md) for the deployment contract,
[IMPLEMENTATION_SPEC.md](./IMPLEMENTATION_SPEC.md) for the approved coding
stack and target profile,
[IMPLEMENTATION_STATUS.md](./IMPLEMENTATION_STATUS.md) for the actual baseline
and developer handoff, [DEVELOPMENT_PLAN.md](./DEVELOPMENT_PLAN.md) for
implementation phases, [UX_FLOW.md](./UX_FLOW.md) for interaction and
information flow, [CONTENT_RULES.md](./CONTENT_RULES.md) for authoring rules,
and [I18N.md](./I18N.md) for English/Korean/Japanese publishing, discovery,
language switching, and post-link fallback.
Operational details are in [DEVELOPMENT.md](./DEVELOPMENT.md), discovery rules in
[SEO.md](./SEO.md), AI crawler and agent guidance in
[AI_DISCOVERY.md](./AI_DISCOVERY.md), publication behavior in
[PUBLISHING.md](./PUBLISHING.md), and release acceptance criteria in
[QUALITY_GATES.md](./QUALITY_GATES.md). Non-content project changes are recorded
in [History.md](./History.md).

## AI discovery

The discovery build generates an AI-aware `robots.txt` and a concise root
`llms.txt`. AI search, user-directed retrieval, model-development, and
public dataset crawlers are explicitly allowed for public, indexable content.
Configuration and artifact ingestion, deterministic `robots.txt` and `llms.txt`,
sitemap, localized RSS feeds, manifests, and output writing are implemented.

Crawler access and guide inclusion are configured only in
`config/ai-crawlers.yaml`; generated files must not be edited by hand.
`llms.txt` is an optional discovery proposal, not authentication, access
control, or a substitute for canonical HTML and page-level metadata.

The post artifact contract requires one English, owner-declared provenance
statement for the original work. The final static renderer must emit it only as
custom document-head metadata: the original work is human-authored, and AI
assistance on that work was limited to proofreading. Configuration, artifact
production, and final page-head metadata rendering are implemented.

Behavior and policy changes must include their tests in the same task.
[TESTING.md](./TESTING.md) defines positive/negative/boundary/regression
coverage, policy-to-test traceability, fixtures, exemptions, and validation
reporting. High-impact policies are mapped to exact test cases in
`tests/policy-coverage.json`.

## Optional GA4 analytics

The normal blog has a consent-gated GA4 adapter. Add one public build value to
enable it:

```text
GA4_MEASUREMENT_ID=G-XXXXXXXXXX
```

Leaving the value blank disables analytics completely. A configured value is
validated during the build, Google is not contacted before reader consent, URL
queries and raw search terms are not collected, and managed pages remain
untracked by default. On GitHub Pages, store the value as the
`GA4_MEASUREMENT_ID` repository or `github-pages` environment variable.
