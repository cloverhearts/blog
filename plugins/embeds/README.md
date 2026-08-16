# Embed Provider Plugins

Each child directory will be one reviewed, local, build-time provider adapter implementing the API from `packages/embed-core/`.

```text
plugins/embeds/<plugin-id>/
├── package.json
├── README.md
├── src/
│   └── index.ts
└── tests/
```

A provider plugin may own provider-specific directive schemas, URL normalization, static markup generation, fallback links, privacy-mode and security-origin declarations, and optional progressive-enhancement assets.

A provider plugin must not:

- import `packages/content-compiler/`, `apps/blog-web/`, or managed-page code;
- accept raw iframe/script HTML from Markdown;
- place API keys, secrets, signed URLs, or private tokens in artifacts;
- perform undeclared network access during a reproducible build;
- remove the static fallback or make the surrounding post unreadable without JavaScript;
- expand CSP or iframe permissions beyond values approved by `config/embeds.yaml` and project validation;
- register itself by directory scanning or remote installation.

Adding a provider later requires its package, an explicit registry entry in `config/embeds.yaml`, provider fixtures, security review, and the matching `CONTENT_RULES.md` syntax update. This directory currently contains no provider implementation.
