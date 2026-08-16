export interface OpenGraphImageInput {
  readonly url: string;
  readonly mediaType: string;
  readonly width: number;
  readonly height: number;
  readonly alt: string;
}

export const OPEN_GRAPH_PREFIX =
  "og: https://ogp.me/ns# article: https://ogp.me/ns/article#";

export interface PostOpenGraphInput {
  readonly title: string;
  readonly description: string;
  readonly canonicalUrl: string;
  readonly siteName: string;
  readonly locale: string;
  readonly alternateLocales: readonly string[];
  readonly publishedTime: string;
  readonly modifiedTime?: string;
  readonly section: string;
  readonly tags: readonly string[];
  readonly image: OpenGraphImageInput;
}

export interface OpenGraphMetaTag {
  readonly property: string;
  readonly content: string;
}

export type OpenGraphImageSourceKind = "social-image" | "cover" | "generated-card";

export interface ResolvedOpenGraphImage {
  readonly kind: OpenGraphImageSourceKind;
  readonly image: OpenGraphImageInput;
}

export function selectPostOpenGraphImage(input: {
  readonly representativeImage: OpenGraphImageSourceKind;
  readonly socialImage?: OpenGraphImageInput;
  readonly cover?: OpenGraphImageInput;
  readonly generatedCard: OpenGraphImageInput;
}): ResolvedOpenGraphImage {
  if (input.representativeImage === "social-image") {
    if (!input.socialImage) {
      throw new Error("representativeImage social-image requires socialImage");
    }
    return { kind: "social-image", image: input.socialImage };
  }
  if (input.representativeImage === "cover") {
    if (!input.cover) {
      throw new Error("representativeImage cover requires cover");
    }
    return { kind: "cover", image: input.cover };
  }
  if (input.representativeImage === "generated-card") {
    return { kind: "generated-card", image: input.generatedCard };
  }
  throw new Error("representativeImage must be social-image, cover, or generated-card");
}

function requireText(name: string, value: string): string {
  const normalized = value.trim();
  if (!normalized) throw new Error(`${name} must not be empty`);
  return normalized;
}

function requireHttpsUrl(name: string, value: string): string {
  const url = new URL(value);
  if (url.protocol !== "https:") {
    throw new Error(`${name} must use HTTPS`);
  }
  if (url.username || url.password || url.search || url.hash) {
    throw new Error(`${name} must not contain credentials, a query, or a fragment`);
  }
  return url.toString();
}

function requireLocale(name: string, value: string): string {
  const locale = requireText(name, value);
  if (!/^[a-z]{2}_[A-Z]{2}$/u.test(locale)) {
    throw new Error(`${name} must use language_TERRITORY format`);
  }
  return locale;
}

function requireDateTime(name: string, value: string): string {
  const dateTime = requireText(name, value);
  if (
    !/(?:Z|[+-]\d{2}:\d{2})$/u.test(dateTime) ||
    Number.isNaN(Date.parse(dateTime))
  ) {
    throw new Error(`${name} must be an ISO 8601 timestamp with a timezone`);
  }
  return dateTime;
}

function requirePositiveInteger(name: string, value: number): string {
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${name} must be a positive integer`);
  }
  return String(value);
}

/** Creates ordered, presentation-neutral Open Graph records for one post. */
export function createPostOpenGraphTags(
  input: PostOpenGraphInput,
): readonly OpenGraphMetaTag[] {
  const canonicalUrl = requireHttpsUrl("canonicalUrl", input.canonicalUrl);
  const imageUrl = requireHttpsUrl("image.url", input.image.url);
  const imageType = requireText("image.mediaType", input.image.mediaType);
  if (!imageType.startsWith("image/")) {
    throw new Error("image.mediaType must be an image MIME type");
  }

  const tags: OpenGraphMetaTag[] = [
    { property: "og:title", content: requireText("title", input.title) },
    { property: "og:type", content: "article" },
    { property: "og:image", content: imageUrl },
    { property: "og:image:secure_url", content: imageUrl },
    { property: "og:image:type", content: imageType },
    {
      property: "og:image:width",
      content: requirePositiveInteger("image.width", input.image.width),
    },
    {
      property: "og:image:height",
      content: requirePositiveInteger("image.height", input.image.height),
    },
    { property: "og:image:alt", content: requireText("image.alt", input.image.alt) },
    { property: "og:url", content: canonicalUrl },
    {
      property: "og:description",
      content: requireText("description", input.description),
    },
    { property: "og:locale", content: requireLocale("locale", input.locale) },
  ];

  for (const locale of [...new Set(input.alternateLocales)]) {
    if (locale !== input.locale) {
      tags.push({
        property: "og:locale:alternate",
        content: requireLocale("alternateLocale", locale),
      });
    }
  }

  tags.push(
    { property: "og:site_name", content: requireText("siteName", input.siteName) },
    {
      property: "article:published_time",
      content: requireDateTime("publishedTime", input.publishedTime),
    },
  );

  if (input.modifiedTime) {
    tags.push({
      property: "article:modified_time",
      content: requireDateTime("modifiedTime", input.modifiedTime),
    });
  }

  tags.push({
    property: "article:section",
    content: requireText("section", input.section),
  });

  for (const tag of [...new Set(input.tags)]) {
    tags.push({ property: "article:tag", content: requireText("tag", tag) });
  }

  return tags;
}

function escapeHtmlAttribute(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

export function renderOpenGraphMetaTags(
  tags: readonly OpenGraphMetaTag[],
): string {
  return tags
    .map(
      ({ property, content }) =>
        `<meta property="${escapeHtmlAttribute(property)}" content="${escapeHtmlAttribute(content)}">`,
    )
    .join("\n");
}
