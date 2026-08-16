# ADR 0001: GitHub Pages hosting

- Status: accepted
- Date: 2026-08-16

## Context

The site is a GitHub-managed static blog, portfolio, and public artifact surface
with a Route 53-managed custom domain. Primary content must be readable without
client-side JavaScript and operating cost should remain minimal.

## Decision

Publish a verified `dist/` artifact to GitHub Pages through a custom GitHub
Actions workflow. Do not use branch-based `/docs` publishing because `docs/`
contains post source Markdown.

Keep origin and base path as validated build inputs and verify both the custom
domain and `/blog` project-path variants. Large media may move to separately
authorized object storage without changing content source contracts.

## Consequences

- No application server, server secrets, application-defined response headers,
  or real HTTP redirect rules are available.
- Every public route requires a physical static file.
- The final artifact must remain within GitHub Pages limits.
- Framework and content tooling remain replaceable because GitHub-specific work
  begins after release assembly.
