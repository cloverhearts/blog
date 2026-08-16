# ADR 0002: Open Design-compatible DESIGN.md contracts

- Status: accepted
- Date: 2026-08-16

## Context

The normal blog needs one persistent visual system that AI design/coding agents
can read. Managed pages must remain visually and technically independent and may
represent unrelated profiles, presentations, or applications.

## Decision

Use uppercase `DESIGN.md`, matching the Open Design package convention.

- The root `DESIGN.md` is authoritative only for the normal blog.
- Every `managed-pages/<page-id>/DESIGN.md` is authoritative only for that page.
- A local page design never implicitly inherits the root blog design.
- Open Design is used to author or refine source specifications and assets; it
  is not a production dependency.
- Generated exports remain staged until provenance, license, fonts, imagery,
  accessibility, and protected decisions are reviewed.

## Consequences

- Agents must read the correctly scoped `DESIGN.md` before visual work.
- File casing is significant on CI and is validated.
- Blog design changes affect the web build; one managed-page design change
  affects only that page build, discovery when applicable, and release assembly.
- The repository can use Open Design, Codex, Claude Code, Gemini CLI, or another
  agent without making production builds depend on any of them.
