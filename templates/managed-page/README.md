# Managed Page Template

Copy this directory to `managed-pages/<page-id>/`, replace every template value,
and keep only the entry source required by the selected kind. The build never
scans `templates/`, so placeholders here cannot create public routes.

Required files after copying:

- `page.yaml` with no `__PLACEHOLDER__` values;
- `DESIGN.md` completed for the page's own design;
- the entry file declared by `entry.path`;
- an `assets/` directory only when the page owns assets.

Use `content.md` for a normal document example. A presentation normally changes
the entry path to `slides.md`. An application normally changes `entry.format`
to `typescript` and the path to `src/main.ts`.

The template defaults to a standalone English page. For explicit translations,
create one package per language, give each package its own route and
`DESIGN.md`, and set the same optional `translationKey` in every `page.yaml`.
Managed pages are not machine-translated by the build.
