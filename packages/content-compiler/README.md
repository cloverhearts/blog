# Content Compiler Boundary

This package will transform locale-grouped `docs/` and shared
`assets/content/` into `.artifacts/content/<mode>/` according to
`CONTENT_RULES.md`, `I18N.md`, and `packages/contracts/`.

It owns Markdown parsing, runtime validation, sanitization, logical asset resolution, semantic HTML fragments, taxonomy, recommendation data, search eligibility metadata, deterministic provenance, and separate preview/production content manifests. External-content directives are delegated through `packages/embed-core/`.

It also owns complete `en`/`ko`/`ja` translation-group validation,
locale-qualified post IDs, alternate-route records, and language-scoped
taxonomy/recommendation/search eligibility. It does not perform translation;
agents author the three source variants before compilation.

Every group declares one required `originalLanguage`. The compiler validates
that all variants agree, that the declared original exists, and emits the value
for presentation and structured-data consumers. Original public URLs are
derived from alternates rather than authored in frontmatter.

Every variant also declares `translationStatus`. The original must be `source`;
translations are `ai-draft` or `reviewed`. Production rejects an `ai-draft`
translation and therefore cannot present an unreviewed AI translation as
owner-approved content.

Every post artifact receives the same project-config-validated owner declaration from
`config/content-provenance.yaml`: the original work is human-authored and AI
assistance was limited to proofreading. This is derived build metadata, not a
frontmatter field. It applies to the original work so it does not erase or
contradict a translated variant's separate `translationStatus`.

Optional cover and `socialImage` frontmatter become paired asset-ID/alt records.
Required `representativeImage` records the owner-approved mode and validation
rejects a selected `social-image`/`cover` mode without its required asset.
The compiler verifies source assets but does not crop cards, generate images,
resolve absolute URLs, or emit Open Graph tags; those are blog presentation
responsibilities. The authoring workflow obtains owner approval for the
representative-image mode before a production group is finalized.

The compiler parses post headings once. From the same parsed nodes it assigns
deterministic IDs, writes those IDs onto the generated `h2`–`h6` elements, and
emits the ordered `HeadingArtifact[]` consumed by the blog's table of contents.
`src/heading-anchors.ts` provides the framework-neutral ID and hierarchy logic;
the future Markdown adapter supplies plain heading text and an optional
validated `{#explicit-id}` value.

The compiler must reject missing heading text, skipped levels, duplicate or
invalid explicit IDs, duplicate final IDs, and same-document Markdown links
whose fragments do not resolve. Generated duplicate IDs receive deterministic
numeric suffixes.

It must not import individual provider plugins, create the final search index, or import the blog application, blog components, blog CSS, framework routes, or managed-page source. Its output must be presentation-neutral.
