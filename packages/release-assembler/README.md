# Release Assembler Boundary

This package will merge `.artifacts/web/production/`, `.artifacts/search/production/`, `.artifacts/managed/production/`, and `.artifacts/discovery/production/` into `dist/`.

Current implementation is package scaffold only. There is no artifact reader,
compatibility/collision/reference validator, `dist/` assembler, release
manifest, diagnostic report, or `verify:pages` implementation. See
`IMPLEMENTATION_STATUS.md` for the complete handoff.

It owns runtime input validation, build-mode/schema/provenance compatibility checks, route and emitted-file collision detection, declared external-origin and browser-permission policy checks, route-claim-to-file mapping, static copying, internal reference checks, and the deterministic release manifest. Human timestamps belong in a separate diagnostic report.

For GitHub Pages, it also exposes a read-only `verify:pages` check over `dist/`.
That check enforces the required root files, directory-style routes, custom
origin/base-path URL resolution, absence of source or preview data, regular-file
artifact rules, and the Pages host ceiling described in `GITHUB_PAGES.md`. The
current project guard is the stricter 512 MiB value plus
the route, file, transfer, image, font, and deployment budgets in
`config/performance-budgets.yaml`. It reports producer errors but never repairs
output.

It must not accept preview artifacts, parse Markdown, derive or merge discovery metadata, render blog layouts, change managed-page design, or compensate for invalid producer artifacts.
