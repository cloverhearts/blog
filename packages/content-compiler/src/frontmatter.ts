import { z } from "zod";

import {
  representativeImageModeSchema,
  supportedLanguageSchema,
  translationStatusSchema,
} from "../../contracts/src/index.ts";

const kebabSchema = z
  .string()
  .regex(/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/u, "must be lowercase ASCII kebab-case");

const assetRefSchema = z
  .object({
    src: z.string().regex(/^asset:\/[A-Za-z0-9._/-]+$/u, "must be an asset: reference"),
    alt: z.string(),
  })
  .strict();

const THUMBNAIL_RASTER = /\.(png|jpe?g|webp)$/iu;

export function unicodeLength(value: string): number {
  return [...value].length;
}

export function normalizePostDescription(value: string, title: string, sourcePath: string): string {
  const description = value.trim();
  if (description.length === 0) {
    throw new Error(`${sourcePath}: description must be a non-empty summary`);
  }
  if (unicodeLength(description) > 150) {
    throw new Error(`${sourcePath}: description must be at most 150 Unicode characters`);
  }
  if (/https?:\/\//iu.test(description)) {
    throw new Error(`${sourcePath}: description must not contain a URL`);
  }
  if (/[\u005b\u005d`*#]/u.test(description) || description.includes("](")) {
    throw new Error(`${sourcePath}: description must not contain Markdown`);
  }
  if (/\b(TODO|TBD|FIXME|placeholder|lorem ipsum)\b/iu.test(description)) {
    throw new Error(`${sourcePath}: description must not contain placeholder text`);
  }
  if (description === title.trim()) {
    throw new Error(`${sourcePath}: description must not repeat the title`);
  }
  return description;
}

export function assertThumbnailSource(src: string, alt: string, sourcePath: string): void {
  if (alt.trim().length === 0) {
    throw new Error(`${sourcePath}: thumbnail.alt must be a non-empty localized description`);
  }
  if (!src.startsWith("asset:/")) {
    throw new Error(`${sourcePath}: thumbnail.src must be a managed asset: reference`);
  }
  if (/^https?:\/\//iu.test(src) || src.startsWith("file:")) {
    throw new Error(`${sourcePath}: thumbnail.src must not be a remote or machine path`);
  }
  if (!THUMBNAIL_RASTER.test(src) || /\.(svg|gif|mp4|webm|avif)$/iu.test(src)) {
    throw new Error(`${sourcePath}: thumbnail.src must be a static raster PNG, JPEG, or WebP file`);
  }
}

export const postFrontmatterSchema = z
  .object({
    title: z.string().min(1),
    description: z.string().min(1),
    translationKey: kebabSchema,
    originalLanguage: supportedLanguageSchema,
    translationStatus: translationStatusSchema,
    slug: kebabSchema,
    tags: z.array(kebabSchema).min(2).max(8),
    createdAt: z.string().min(1),
    updatedAt: z.string().min(1).optional(),
    representativeImage: representativeImageModeSchema,
    draft: z.boolean(),
    cover: assetRefSchema.optional(),
    socialImage: assetRefSchema.optional(),
    thumbnail: assetRefSchema.optional(),
    related: z.array(kebabSchema).optional(),
  })
  .strict();

export type PostFrontmatter = z.infer<typeof postFrontmatterSchema>;

export function parsePostFrontmatter(value: unknown, sourcePath: string): PostFrontmatter {
  const parsed = postFrontmatterSchema.safeParse(value);
  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => `${issue.path.join(".") || "(root)"}: ${issue.message}`)
      .join("; ");
    throw new Error(`${sourcePath}: ${details}`);
  }
  const data = parsed.data;
  if (data.representativeImage === "social-image" && !data.socialImage) {
    throw new Error(`${sourcePath}: representativeImage social-image requires socialImage`);
  }
  if (data.representativeImage === "cover" && !data.cover) {
    throw new Error(`${sourcePath}: representativeImage cover requires cover`);
  }
  if (data.translationStatus === "ai-draft" && data.draft !== true) {
    throw new Error(`${sourcePath}: ai-draft translations must set draft: true`);
  }
  if (data.updatedAt && Date.parse(data.updatedAt) < Date.parse(data.createdAt)) {
    throw new Error(`${sourcePath}: updatedAt must not precede createdAt`);
  }
  const description = normalizePostDescription(data.description, data.title, sourcePath);
  if (data.thumbnail) {
    assertThumbnailSource(data.thumbnail.src, data.thumbnail.alt, sourcePath);
  }
  return {
    ...data,
    description,
    ...(data.thumbnail
      ? { thumbnail: { src: data.thumbnail.src, alt: data.thumbnail.alt.trim() } }
      : {}),
  };
}
