# ADR 0006: Production origin, classless UX, and capacity baseline

- Status: accepted
- Date: 2026-08-16

## Context

The implementation stack is selected, but the first web-renderer work still
needed an exact canonical origin, a presentation baseline that would not delay
UX work, a font/language review priority, and concrete static-host budgets.

GitHub documents a 1 GB published Pages site limit, a ten-minute deployment
timeout, and a 100 GB/month soft bandwidth limit. GitHub Pro permits Pages from
private repositories and includes 3,000 Actions minutes and 1 GB Actions
storage per month. Those service values are outer boundaries, not appropriate
project targets.

## Decision

1. The canonical production origin is `https://blog.cloverhearts.com` with an
   empty base path. Route 53 uses a `blog` `CNAME` to
   `cloverhearts.github.io`, after the custom subdomain is registered in GitHub
   Pages settings.
2. The first blog presentation is semantic classless CSS. It uses normal HTML
   landmarks and links, system colors, no decorative elevation/motion, and no
   component or utility CSS framework. `UX_FLOW.md` is authoritative for
   navigation and task order.
3. Pretendard Variable `1.3.9` is bundled from the pinned npm package with its
   dynamic subset stylesheet. No production font CDN request is allowed.
4. Korean and English are the primary human UX/copy/typography review pair.
   English remains the unprefixed fallback, Korean remains the usual authoring
   source, and Japanese remains a complete supported publication locale.
5. `config/performance-budgets.yaml` owns conservative failure thresholds:
   512 MiB repository/release, 8-minute deployment, 10,000 routes, 25 MiB
   largest file, 75 GiB bandwidth warning, 2,400 Actions-minute warning,
   512 MiB Actions artifact storage, 1 MiB normal-route initial transfer,
   20 MiB/24-megapixel source images, 512 KiB rendered images, and 4 MiB
   published fonts.

## Consequences

- Phase 1 and 2 remain independent of styling; Phase 3 can implement the UX
  shell without waiting for brand exploration.
- A future branded design may replace visual values only after owner approval,
  while preserving the semantic and no-JavaScript flows or explicitly
  superseding this ADR.
- Budget increases require evidence, tests, policy/history updates, and must
  remain below the host or account boundary. Large binary media moves to a
  separately approved object host.
- The release verifier must compare production environment values with the
  configured origin and fail mismatches before Pages upload.

## References

- [GitHub Pages limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits)
- [GitHub plan usage](https://docs.github.com/en/billing/reference/product-usage-included)
- [GitHub Pages custom domains](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site)
- [Pretendard](https://github.com/orioncactus/pretendard)
