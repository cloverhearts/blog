# Site Discovery Builder Boundary

This package will generate final discovery documents after both the normal blog
and managed-page outputs are known.

Inputs:

- validated production content metadata;
- `.artifacts/web/<mode>/` manifest and final blog routes;
- `.artifacts/managed/<mode>/` manifest and standalone-page discovery policy;
- validated site, route, and deployment URL configuration.
- validated `config/ai-crawlers.yaml` policy and intentional public navigation.

Outputs:

```text
.artifacts/discovery/<mode>/
├── manifest.json
└── site/
    ├── robots.txt
    ├── llms.txt
    ├── sitemap.xml
    ├── rss.xml
    ├── en/rss.xml
    └── ja/rss.xml
```

Responsibilities:

- include canonical published blog routes in the sitemap;
- include only managed pages with `robots: index` and `sitemap: true`;
- exclude drafts, `noindex` pages, redirects, search results, assets, previews,
  and noncanonical aliases;
- emit sitemap `lastmod` only from authored `updatedAt`/`createdAt` values,
  never from incidental build time, and omit empty taxonomy or alternate-sort
  URLs;
- generate post-only Korean, English, and Japanese RSS feeds from matching
  validated post metadata and canonical web routes;
- include every eligible localized canonical in the sitemap while leaving
  alternate annotations authoritative in HTML;
- generate `robots.txt` from the explicit AI crawler registry with search,
  user-directed, model-development, and public-dataset access open, the final
  absolute sitemap URL, and an informational `llms.txt` link;
- generate a concise English-first `llms.txt` with language homes, sitemap,
  feeds, intentional public navigation, eligible managed pages, and validated
  usage guidance; use the sitemap rather than duplicating every post;
- keep CSS, JavaScript, fonts, content images, and social images required to
  understand indexable documents crawlable through the robots policy;
- resolve every public URL through the shared origin/base-path resolver;
- emit a runtime-validated manifest tied to the exact content, web, managed,
  configuration, crawler-policy, and content-rule hashes it consumed, with
  explicit robots, llms, sitemap, and feed routes.

`robots.txt` and `llms.txt` are generated artifacts and are never edited by
hand. The latter is a proposal-based aid, not access control or a replacement
for canonical HTML, robots rules, or page metadata.

It must not render blog or managed-page HTML, parse Markdown, infer page
publication policy, style output, modify producer artifacts, or add managed
pages to post RSS. The release assembler copies its validated files but does not
derive or merge discovery metadata.
