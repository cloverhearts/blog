# GitHub Pages Deployment Contract

## Status

GitHub Pages is the selected production hosting target. Deployment uses a
custom GitHub Actions workflow and a single generated `dist/` artifact. GitHub's
branch-based `/docs` publishing mode must not be used because `docs/` contains
post source Markdown rather than deployable output.

This document defines the hosting boundary. It does not make the content
compiler, blog renderer, search indexer, or managed-page compiler depend on
GitHub APIs.

## Deployment shape

```text
Git repository
  ├─ docs/ + assets/content/ ──► content build ─┐
  ├─ apps/blog-web/ ───────────► web build ─────┤
  ├─ rendered blog HTML ───────► search build ──┤
  └─ managed-pages/ ───────────► managed build ─┤
                                                ▼
                                      release assembler
                                                │
                                                ▼
                                             dist/
                                                │
                                  upload-pages-artifact
                                                │
                                                ▼
                                           GitHub Pages
```

Only `dist/` is uploaded. Source Markdown, source assets, intermediate
artifacts, caches, and preview output are never published.

## Required `dist/` layout

```text
dist/
├── index.html
├── 404.html
├── robots.txt
├── llms.txt
├── sitemap.xml
├── rss.xml
├── posts/<slug>/index.html
├── posts/page/<n>/index.html
├── categories/<category>/index.html
├── categories/<category>/page/<n>/index.html
├── tags/<tag>/index.html
├── tags/<tag>/page/<n>/index.html
├── archive/index.html
├── archive/page/<n>/index.html
├── search/index.html
├── en/
│   ├── index.html
│   ├── posts/<slug>/index.html
│   ├── categories/<category>/index.html
│   ├── tags/<tag>/index.html
│   ├── archive/index.html
│   ├── search/index.html
│   ├── 404/index.html
│   └── rss.xml
├── ja/                          # Same complete route set as en/
├── <managed-page-route>/index.html
└── _assets/
    ├── app/
    ├── content/
    ├── managed/
    ├── search/
    └── social/                 # Content-addressed per-post OG images
```

Rules:

- `dist/index.html` is mandatory and its casing is exact.
- The unprefixed tree is complete Korean content. `/en/` and `/ja/` are
  complete English and Japanese trees; they are not client-rendered overlays.
- Every public content route is backed by a real HTML file. A post must not
  depend on a JavaScript router or a catch-all SPA fallback.
- A managed page is copied to the physical path represented by its normalized
  `page.yaml` route claim. For example, `/profile/` becomes
  `dist/profile/index.html`; its intermediate page-ID directory is never treated
  as a public path.
- Directory-style URLs use `index.html` and the configured trailing-slash
  policy.
- Pagination page one is represented only by its collection root. Page 2 and
  later use the configured `page/<n>/` directory segment and have their own
  static files and self canonicals.
- `404.html` is a complete Korean static document containing navigation back
  to the blog and must work without JavaScript. Localized `/en/404/` and
  `/ja/404/` documents are also emitted; optional local navigation may choose
  one based on the requested path or browser language.
- Files are regular files. Symbolic and hard links are forbidden.
- Asset filenames are content-addressed where practical. HTML and discovery
  files are not assumed to be immutable.
- GitHub Pages' published-site ceiling is 1 GB, its deployment timeout is ten
  minutes, and its soft bandwidth limit is 100 GB per month. GitHub Pro does
  not raise these Pages service ceilings. It permits Pages from a private
  repository and includes 3,000 Actions minutes plus 1 GB Actions artifact
  storage per month. The project budgets in `config/performance-budgets.yaml`
  deliberately leave operational headroom.
- Large videos, archives, and other binary results should use separately
  configured object storage rather than forcing the Pages artifact toward its
  limit.

## URL and base-path contract

Generated artifacts store normalized logical routes, not deployment URLs. The
web and managed-page renderers resolve public URLs using validated deployment
inputs:

- `SITE_ORIGIN`: the canonical HTTPS origin, with no trailing slash;
- `SITE_BASE_PATH`: empty for an apex or subdomain deployment, or a normalized
  path such as `/blog` for the default project URL.

A production build fails if `SITE_ORIGIN` is absent, is not HTTPS, or contains a
path, query, or fragment. `SITE_BASE_PATH` is either empty or starts with one
slash and has no trailing slash. It must not contain `.`/`..`, an encoded path
separator, query, or fragment.

The custom-domain production configuration uses an empty base path. The project
URL configuration remains supported so pull-request validation and emergency
fallback deployment can detect broken assumptions about root-relative paths.

URL resolution follows one rule:

```text
public URL = SITE_ORIGIN + SITE_BASE_PATH + logical route
```

Content Markdown never contains `SITE_ORIGIN`, a GitHub account name, a
repository name, or a generated base path. Internal links, canonical URLs,
feeds, sitemap entries, asset URLs, managed-page return links, and client-side
fetches must all pass through the same resolver.

## Custom domain and Route 53

- The canonical production origin is `https://blog.cloverhearts.com` with an
  empty base path.
- Configure `blog.cloverhearts.com` first in the repository's
  **Settings → Pages**, then create a Route 53 `CNAME` record named `blog` that
  targets `cloverhearts.github.io` (without the repository name).
- The domain is verified with GitHub before DNS cutover.
- HTTPS enforcement is enabled after GitHub provisions the certificate.
- A custom Actions workflow does not use a repository `CNAME` file. Domain
  configuration is an environment/repository setting, not generated site
  content.
- The production workflow supplies `SITE_ORIGIN=https://blog.cloverhearts.com`
  and `SITE_BASE_PATH=`. Configuration validation rejects a production value
  that differs from `config/site.yaml`; packages still consume the validated
  value rather than embedding the origin in components.
- After HTTPS is active, a Google Search Console Domain property is verified
  through a Route 53 DNS TXT record and the generated `/sitemap.xml` is
  submitted. Search Console ownership and reports are external operational
  state, not repository secrets or content metadata.

## GitHub Actions workflow contract

The executable workflow is added when the root package scripts exist. Adding a
workflow earlier would make every push fail against commands that have not yet
been implemented.

The workflow will:

1. run on pushes to the default branch and by manual dispatch;
2. check out one immutable commit;
3. install Node.js 24.19.0 and dependencies with `npm ci` from the committed
   `package-lock.json`;
4. run configuration, boundary, content, contract, and production build checks;
5. build and validate matching search and discovery artifacts;
6. run the Pages-specific release verifier against `dist/`;
7. call `actions/configure-pages`;
8. upload exactly `dist/` with `actions/upload-pages-artifact`;
9. deploy through `actions/deploy-pages` in the `github-pages` environment.

The production build receives the optional public repository/environment
variable as `GA4_MEASUREMENT_ID: ${{ vars.GA4_MEASUREMENT_ID }}`. It is a public
GA4 Measurement ID, not a secret. If the variable is absent or blank, the build
must succeed with analytics disabled and emit no Google loader or analytics CSP
origins. Pull-request and portability builds keep analytics disabled so they do
not pollute production measurements.

The deploy job receives only these permissions:

```yaml
permissions:
  contents: read
  pages: write
  id-token: write
```

Pull requests run the build and verifier but never receive production deploy
permissions and never deploy to Pages. Production deployments are serialized
with a workflow concurrency group. The custom workflow is not subject to GitHub
Pages' soft limit of ten Pages builds per hour, but redundant pushes should
still be cancelled through the workflow concurrency group.

## Enforced performance and capacity budgets

`config/performance-budgets.yaml` is the machine-readable source. All values are
failure thresholds, not warning-only goals:

- source repository and published `dist/`: 512 MiB each;
- deployment: 8 minutes, leaving two minutes below the Pages timeout;
- published routes: 10,000;
- largest published file: 25 MiB; larger video/archive artifacts move to
  separately approved object storage;
- monthly bandwidth operational warning: 75 GiB, below the 100 GB Pages soft
  limit;
- monthly Actions warning: 2,400 minutes, 80% of the GitHub Pro allowance;
- retained Actions artifacts: 512 MiB across this project, leaving half of the
  Pro storage allowance for overlap and other workflows;
- per normal route: HTML 256 KiB raw, CSS 32 KiB gzip, initial JavaScript 32 KiB
  gzip, initial font transfer 256 KiB, and total initial transfer 1 MiB,
  excluding lazy content media;
- search-route script allowance: 128 KiB gzip, excluding the query-dependent
  language index;
- source image: 20 MiB and 24 megapixels; rendered image: 512 KiB;
- all published font assets: 4 MiB.

The verifier reports actual and limit values for every failure. WOFF2 is already
compressed, so font budgets use transferred file bytes rather than applying a
second gzip estimate. Pagefind indexes, lazy images, downloads, and external
embed targets count toward release capacity but not an article's initial-route
transfer unless that route requests them immediately.

## GitHub Pages compatibility verification

`verify:pages` is a release-level command. It inspects `dist/` without changing
producer output and fails when any of the following is true:

- `index.html` or `404.html` is missing;
- a route claim has no matching file;
- an internal link or asset reference escapes the configured base path;
- a canonical, sitemap, RSS, Open Graph, or structured-data URL uses the wrong
  origin or base path;
- `robots.txt` differs from the configured AI crawler policy, fails to reference
  the emitted sitemap/agent guide, or `llms.txt` contains a noncanonical,
  non-HTTPS, private, preview, source, or wrong-base-path link;
- a source map, source Markdown file, preview artifact, draft, local filesystem
  path, secret, or build cache is present;
- a symbolic/hard link or case-conflicting filename exists;
- the release exceeds any configured route, file, transfer, image, font,
  deployment-time, or 512 MiB release budget;
- an HTML document requires JavaScript to expose its primary post content;
- a localized route is missing its initial-HTML language switcher, matching
  document language, self canonical, or reciprocal alternate links;
- a production post translation group lacks any English, Korean, or Japanese
  output, contains an `ai-draft` translation, or a language-scoped search/RSS
  artifact is missing;
- a post lacks a complete static Open Graph set, its `og:url` differs from the
  canonical, or its `og:image` does not resolve to an emitted post-specific
  image under the configured origin/base path;
- a post's approved representative source lacks crawlable `1:1`, `4:3`, and
  `16:9` Article derivatives, or a primary content image is incorrectly
  lazy-loaded;
- pagination uses fragments, emits `/page/1/`, lacks sequential normal links,
  or canonicalizes a later page to page one;
- the homepage lacks consistent `WebSite` structured data, a configured public
  author profile does not share its `Person` identity with post markup, or a
  favicon is missing/unresolvable;
- an iframe lacks the validated fallback link, `title`, sandbox/referrer policy,
  or allowlisted origin declared by its embed artifact.

CI builds the same source twice with isolated output directories: once for the
custom-domain root and once for the `/blog` repository base path. `verify:pages`
checks each matching build. Only the custom-domain build becomes `dist/` and is
uploaded; the second build is a portability check, not a second release.

## Static-host limitations

GitHub Pages cannot execute server code and does not provide application-owned
response-header configuration.

- Redirect declarations produce small static HTML compatibility pages with a
  canonical target, `noindex`, an immediate client redirect, and a normal link.
  They are not equivalent to HTTP 301 responses. Published routes should
  therefore remain stable.
- Blog and managed-page renderers emit a validated CSP `<meta>` policy for
  directives that browsers support in document metadata. Security-critical
  iframe restrictions also live on each iframe element.
- When GA4 is configured, the blog renderer may add only the reviewed
  `googletagmanager.com` script origin and the non-advertising Google Analytics
  collection origins allowed by `config/security.yaml`. The adapter is bundled
  locally, uses no inline bootstrap, and does not load the remote script before
  consent.
- Features requiring secrets, authenticated APIs, personalized responses, or
  server-side consent state must use a separate service. Secrets never enter
  the static build output.
- Search remains a static browser index. Its search page has a useful
  no-JavaScript explanation and normal category/tag navigation.

## Cache and rollback policy

- Generated asset URLs are content-addressed, so changed bytes receive a new
  URL instead of depending on cache invalidation.
- HTML, RSS, sitemap, robots, llms, and redirect pages keep stable URLs.
- Each deployment records the source commit and release manifest hash in the
  diagnostic report.
- Rollback means redeploying a previously verified commit through the same
  workflow. Generated `dist/` output is not committed to a deployment branch.
