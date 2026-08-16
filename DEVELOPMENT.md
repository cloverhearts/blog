# Development and Build Runbook

## Current status

The repository contains architecture, source contracts, and an approved npm
workspace implementation profile. Node.js 24.19.0 LTS with npm 11.17.0 is
pinned; Astro, Zod 4, unified/remark/rehype, Pagefind, Sharp, Vitest,
Playwright, and axe-core are selected in ADR 0004. Only the test scripts already
present in `package.json` are executable; the remaining commands below are the
required implementation surface, not a claim that every build exists.

## Required environment inputs

- `SITE_ORIGIN`: absolute HTTPS origin without path, query, fragment, or trailing
  slash; required for production.
- `SITE_BASE_PATH`: empty for the custom domain or a normalized path such as
  `/blog`; required explicitly so root-path assumptions are visible.
- `SOURCE_DATE_EPOCH`: optional explicit timestamp input for human diagnostic
  reports when a reproducible timestamp is required.
- `GA4_MEASUREMENT_ID`: optional public GA4 Measurement ID in `G-...` form.
  Blank or absent disables analytics; an invalid non-blank value fails the
  build. It is provided as a GitHub Actions repository/environment variable,
  not a secret and never as content metadata.

Secrets are not valid static build inputs. A feature that needs a secret must
use a separately authorized service.

## Command contract

```text
validate:config
typecheck
test:i18n
test:seo
test:analytics
validate:embeds
build:content
build:web
build:search
build:managed
build:discovery
build:release
verify:pages
test:contracts
test:policy
test:quality
build
dev
```

Root scripts orchestrate workspace packages in dependency order. Individual
packages keep their own bounded scripts and output only to their documented
artifact directory.

## Change-to-test workflow

`TESTING.md` defines the mandatory pairing between behavioral/policy changes
and tests. Before implementation, identify the affected contract and existing
case. In the same task, add or update the smallest positive, negative,
boundary/compatibility, determinism, or regression cases needed to prove the
new intent. High-impact policies also update `tests/policy-coverage.json`.

Run the changed test directly before the full relevant suite. `test:policy`
executes the policy coverage manifest check; `test:contracts` includes it as
part of the cross-boundary suite. A missing executable integration must be
reported as unavailable and kept in the named fixture/test plan rather than
being described as passed.

## Local preview

- Preview builds use `.artifacts/*/preview/` and may include drafts.
- Production builds use `.artifacts/*/production/` and cannot represent drafts.
- Local preview never writes generated files into `docs/`, `assets/content/`, or
  `managed-pages/`.
- A preview server serves an assembled preview directory that cannot be uploaded
  by the production Pages workflow.
- Representative pages are checked with and without JavaScript before a release.
- Preview checks cover English, Korean, and Japanese routes plus explicit,
  stored, browser-derived, unsupported, and no-storage language selection;
  automatic navigation is limited to one existing alternate from an unprefixed
  route and cannot loop.
- Local and preview builds do not collect analytics even when a developer has a
  Measurement ID in their shell; the production web build is the only eligible
  mode and still waits for explicit reader consent.

## Open Design workflow

For the normal blog:

1. read the root `DESIGN.md` and `AGENTS.md`;
2. use the repository root as the Open Design project;
3. stage generated exports under `design/open-design/`;
4. review visual direction, provenance, license, fonts, imagery, and protected
   decisions;
5. update the root `DESIGN.md` and promote approved implementation tokens/assets
   into `apps/blog-web/`;
6. run representative quality checks.

For a managed page:

1. copy `templates/managed-page/` to `managed-pages/<page-id>/`;
2. use that page directory and its local `DESIGN.md` as the Open Design project;
3. do not inherit the root blog design;
4. review and promote generated source inside that page package only;
5. validate entry, route, security, return control, no-JavaScript, print, and
   discovery policy.

Open Design is never installed or invoked by the production build.

## Pull requests and releases

- Pull requests run all production-equivalent builds and quality checks but do
  not deploy.
- The default branch builds custom-domain and `/blog` portability variants in
  isolated directories.
- Only the verified custom-domain `dist/` artifact is uploaded.
- After the first HTTPS custom-domain deployment, verify the Search Console
  Domain property through Route 53, submit `/sitemap.xml`, and inspect
  representative home/post/pagination/managed-page routes plus Core Web Vitals.
- Rollback redeploys a previously verified commit through the same workflow;
  generated output is not committed to a deployment branch.
