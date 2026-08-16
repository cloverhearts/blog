# Embed Core Boundary

This package provides the provider-neutral build-time extension point for external content such as maps, video, audio, diagrams, and other allowlisted embeds.

Runtime validation, explicit registry loading, sanitization, and deterministic
execution are implemented. No real provider plugin is approved yet; tests use a
synthetic plugin under `tests/fixtures/plugins/test-embed/`. See
`IMPLEMENTATION_STATUS.md`.

It owns:

- the plugin API and registry loader;
- directive dispatch and attribute validation orchestration;
- stable embed IDs and deterministic plugin execution;
- static/no-JavaScript fallback enforcement;
- sanitization of plugin output;
- aggregation of content-security-policy and browser-permission requirements;
- copying and describing optional progressive-enhancement assets;
- plugin identity/version records used by artifact provenance.

It must not contain provider-specific URLs, credentials, iframe templates, API calls, or presentation styling. It must not import the blog application or managed-page compiler.

The registry is explicit. `config/embeds.yaml` may reference reviewed local workspace plugin packages only. Directory scanning, remote package loading, and runtime marketplace installation are forbidden. A provider may emit an approved progressive-enhancement asset, but plugin discovery and registration never happen in the reader's browser.

A future registration will follow this conceptual shape; it is not an installed provider:

```yaml
plugins:
  - id: "example-provider"
    package: "@blog/embed-example-provider"
    enabled: true
    configuration: {}
    approvedSecurity:
      csp: []
      iframePermissions: []
    buildNetwork:
      enabled: false
      origins: []
```

The plugin declares what it needs, while the registry grants the maximum approved policy. Embed-core rejects requirements outside that intersection.

Zod 4 runtime schemas and the explicit registry loader are the implementation
source of truth.
