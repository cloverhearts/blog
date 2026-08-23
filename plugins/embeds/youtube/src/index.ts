import type { EmbedPlugin } from "@cloverhearts/embed-core";

const VIDEO_ID = /^[A-Za-z0-9_-]{11}$/u;
const EMBED_ORIGIN = "https://www.youtube-nocookie.com";
const IFRAME_PERMISSIONS = [
  "accelerometer",
  "autoplay",
  "encrypted-media",
  "gyroscope",
  "picture-in-picture",
  "web-share",
] as const;

export const plugin: EmbedPlugin = {
  id: "youtube",
  version: "1.0.0",
  directiveNames: ["youtube"],
  normalize(source, context) {
    const unknown = Object.keys(source.attributes).filter(
      (attribute) => attribute !== "id" && attribute !== "title",
    );
    if (unknown.length > 0) {
      throw new Error(`youtube does not allow attributes: ${unknown.join(", ")}`);
    }
    const id = source.attributes.id?.trim() ?? "";
    const title = source.attributes.title?.trim() ?? "";
    if (!VIDEO_ID.test(id)) {
      throw new Error("youtube requires an 11-character video id");
    }
    if (!title) {
      throw new Error("youtube requires a non-empty title");
    }
    const configuredOrigin = context.configuration.embedOrigin;
    if (configuredOrigin !== EMBED_ORIGIN) {
      throw new Error("youtube embedOrigin must use the approved privacy-enhanced origin");
    }
    return {
      provider: "youtube",
      kind: "video",
      title,
      canonicalUrl: `https://www.youtube.com/watch?v=${id}`,
      fallbackText: title,
      data: { id, embedOrigin: EMBED_ORIGIN },
    };
  },
  renderStatic(embed) {
    const id = embed.data.id;
    const embedOrigin = embed.data.embedOrigin;
    if (!id || !embedOrigin) {
      throw new Error("youtube normalized data is incomplete");
    }
    const allow = IFRAME_PERMISSIONS.join("; ");
    return {
      staticHtml: `<iframe src="${embedOrigin}/embed/${id}" title="${escapeHtml(embed.title)}" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" sandbox="allow-scripts allow-same-origin allow-presentation allow-popups" allow="${allow}" allowfullscreen></iframe>`,
      clientMode: "none",
      privacyMode: "external-request",
      searchableText: embed.fallbackText,
      security: {
        csp: [{ directive: "frame-src", origins: [embedOrigin] }],
        iframePermissions: [...IFRAME_PERMISSIONS],
      },
    };
  },
};

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export default plugin;
