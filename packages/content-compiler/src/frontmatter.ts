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
  return data;
}
