import type { EmbedPlugin } from "../../../../packages/embed-core/src/index.ts";

export const plugin: EmbedPlugin = {
  id: "test-embed",
  version: "1.0.0",
  directiveNames: ["test-embed"],
  normalize(source) {
    const id = source.attributes.id;
    const title = source.attributes.title;
    if (!id || !title) {
      throw new Error("test-embed requires id and title");
    }
    return {
      provider: "test",
      kind: "demo",
      title,
      canonicalUrl: `https://example.com/embed/${id}`,
      fallbackText: title,
      data: { id },
    };
  },
  renderStatic(embed) {
    return {
      staticHtml: `<p>${embed.fallbackText}</p>`,
      clientMode: "none",
      privacyMode: "local-only",
      searchableText: embed.fallbackText,
      security: { csp: [], iframePermissions: [] },
    };
  },
};

export default plugin;
