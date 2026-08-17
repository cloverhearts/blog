import { z } from "zod";

import {
  CONTENT_ARTIFACT_SCHEMA_VERSION,
  DISCOVERY_ARTIFACT_SCHEMA_VERSION,
  MANAGED_PAGE_ARTIFACT_SCHEMA_VERSION,
  RELEASE_ARTIFACT_SCHEMA_VERSION,
  SEARCH_ARTIFACT_SCHEMA_VERSION,
  WEB_ARTIFACT_SCHEMA_VERSION,
} from "./versions.ts";

export const buildModeSchema = z.enum(["preview", "production"]);
export const managedPageKindSchema = z.enum([
  "document",
  "presentation",
  "application",
]);
export const managedPageEntryFormatSchema = z.enum(["markdown", "typescript"]);
export const publicationStatusSchema = z.enum(["draft", "published"]);
export const robotsPolicySchema = z.enum(["index", "noindex"]);
export const supportedLanguageSchema = z.union([
  z.literal("en"),
  z.literal("ko"),
  z.literal("ja"),
]);
export const translationStatusSchema = z.enum([
  "source",
  "ai-draft",
  "reviewed",
]);
export const representativeImageModeSchema = z.enum([
  "social-image",
  "cover",
  "generated-card",
]);
export const assetKindSchema = z.enum([
  "image",
  "video",
  "audio",
  "font",
  "download",
]);
export const routeOwnerKindSchema = z.enum([
  "blog",
  "post",
  "managed-page",
  "system",
]);
export const headingDepthSchema = z.union([
  z.literal(2),
  z.literal(3),
  z.literal(4),
  z.literal(5),
  z.literal(6),
]);
export const embedClientModeSchema = z.enum(["none", "progressive"]);
export const embedPrivacyModeSchema = z.enum([
  "local-only",
  "external-request",
  "consent-required",
]);
export const embedCspDirectiveSchema = z.enum([
  "frame-src",
  "script-src",
  "connect-src",
  "img-src",
  "style-src",
  "font-src",
  "media-src",
  "worker-src",
]);

const iso8601DateTimeSchema = z
  .string()
  .refine(
    (value) =>
      /(?:Z|[+-]\d{2}:\d{2})$/u.test(value) && !Number.isNaN(Date.parse(value)),
    "must be an ISO 8601 timestamp with a timezone",
  );

const normalizedRouteSchema = z
  .string()
  .regex(/^\/(?:[A-Za-z0-9._~-]+\/)*$/u, "must be a normalized root-relative directory route");

const fragmentAnchorSchema = z
  .string()
  .regex(/^#[^\s#]+$/u, "must be a same-document fragment");

export const languageAlternateArtifactSchema = z
  .object({
    language: supportedLanguageSchema,
    ownerId: z.string().min(1),
    route: z.string().min(1),
  })
  .strict();

export const postImageArtifactSchema = z
  .object({
    assetId: z.string().min(1),
    alt: z.string(),
  })
  .strict();

export const postAuthorshipDisclosureArtifactSchema = z
  .object({
    statementLanguage: z.literal("en"),
    statement: z.string().min(1),
    claimSource: z.literal("owner"),
    appliesTo: z.literal("original-work"),
    primaryCreation: z.literal("human"),
    aiAssistance: z.tuple([z.literal("proofreading")]),
  })
  .strict();

export function artifactProvenanceSchema<
  SchemaVersion extends number,
  Mode extends z.infer<typeof buildModeSchema>,
>(schemaVersion: SchemaVersion, mode: Mode) {
  return z
    .object({
      schemaVersion: z.literal(schemaVersion),
      buildMode: z.literal(mode),
      producer: z.string().min(1),
      producerVersion: z.string().min(1),
      inputHash: z.string().regex(/^[a-f0-9]{64}$/u),
      configHash: z.string().regex(/^[a-f0-9]{64}$/u),
      contentRulesHash: z.string().regex(/^[a-f0-9]{64}$/u),
      localizationRulesHash: z.string().regex(/^[a-f0-9]{64}$/u),
    })
    .strict();
}

export const assetArtifactSchema = z
  .object({
    id: z.string().min(1),
    logicalPath: z.string().min(1),
    artifactPath: z.string().min(1),
    kind: assetKindSchema,
    mediaType: z.string().min(1),
    hash: z.string().regex(/^[a-f0-9]{64}$/u),
    bytes: z.number().int().nonnegative(),
    width: z.number().int().positive().optional(),
    height: z.number().int().positive().optional(),
  })
  .strict();

export const routeClaimArtifactSchema = z
  .object({
    route: z.string().min(1),
    ownerKind: routeOwnerKindSchema,
    ownerId: z.string().min(1),
    artifactPath: z.string().min(1),
  })
  .strict();

export const headingArtifactSchema = z
  .object({
    depth: headingDepthSchema,
    id: z.string().min(1),
    anchor: fragmentAnchorSchema,
    text: z.string().min(1),
    parentId: z.string().min(1).optional(),
  })
  .strict();

export const embedPluginReferenceArtifactSchema = z
  .object({
    id: z.string().min(1),
    version: z.string().min(1),
    configurationHash: z.string().regex(/^[a-f0-9]{64}$/u),
  })
  .strict();

export const embedCspRequirementArtifactSchema = z
  .object({
    directive: embedCspDirectiveSchema,
    origins: z.array(z.string().min(1)),
  })
  .strict();

export const embedSecurityArtifactSchema = z
  .object({
    csp: z.array(embedCspRequirementArtifactSchema),
    iframePermissions: z.array(z.string().min(1)),
  })
  .strict();

export const externalEmbedArtifactSchema = z
  .object({
    id: z.string().min(1),
    postId: z.string().min(1),
    pluginId: z.string().min(1),
    pluginVersion: z.string().min(1),
    directiveName: z.string().min(1),
    provider: z.string().min(1),
    kind: z.string().min(1),
    title: z.string().min(1),
    canonicalUrl: z.url(),
    fallbackText: z.string().min(1),
    searchableText: z.string().min(1),
    clientMode: embedClientModeSchema,
    privacyMode: embedPrivacyModeSchema,
    clientModuleArtifactPath: z.string().min(1).optional(),
    security: embedSecurityArtifactSchema,
    outputHash: z.string().regex(/^[a-f0-9]{64}$/u),
  })
  .strict();

const postSummaryFields = {
  id: z.string().min(1),
  translationKey: z.string().min(1),
  language: supportedLanguageSchema,
  originalLanguage: supportedLanguageSchema,
  translationStatus: translationStatusSchema,
  authorshipDisclosure: postAuthorshipDisclosureArtifactSchema,
  slug: z.string().min(1),
  route: z.string().min(1),
  category: z.string().min(1),
  title: z.string().min(1),
  description: z
    .string()
    .min(1)
    .refine((value) => [...value].length <= 150, "description must be at most 150 Unicode characters"),
  tags: z.array(z.string().min(1)),
  createdAt: iso8601DateTimeSchema,
  updatedAt: iso8601DateTimeSchema.optional(),
  excerpt: z.string().min(1),
  readingMinutes: z.number().int().positive(),
  representativeImage: representativeImageModeSchema,
  cover: postImageArtifactSchema.optional(),
  socialImage: postImageArtifactSchema.optional(),
  thumbnail: postImageArtifactSchema.optional(),
  alternates: z.array(languageAlternateArtifactSchema),
};

export const previewPostSummaryArtifactSchema = z
  .object({
    ...postSummaryFields,
    status: publicationStatusSchema,
  })
  .strict();

export const publishedPostSummaryArtifactSchema = z
  .object({
    ...postSummaryFields,
    status: z.literal("published"),
  })
  .strict();

const postBodyFields = {
  bodyHtml: z.string().min(1),
  headings: z.array(headingArtifactSchema),
  assetIds: z.array(z.string().min(1)),
  embedIds: z.array(z.string().min(1)),
  manualRelatedSlugs: z.array(z.string().min(1)),
  sourceHash: z.string().regex(/^[a-f0-9]{64}$/u),
};

export const previewPostArtifactSchema = previewPostSummaryArtifactSchema
  .extend(postBodyFields)
  .strict();

export const publishedPostArtifactSchema = publishedPostSummaryArtifactSchema
  .extend(postBodyFields)
  .strict();

export const categoryArtifactSchema = z
  .object({
    id: z.string().min(1),
    language: supportedLanguageSchema,
    label: z.string().min(1),
    postIds: z.array(z.string().min(1)),
  })
  .strict();

export const tagArtifactSchema = z
  .object({
    id: z.string().min(1),
    language: supportedLanguageSchema,
    label: z.string().min(1),
    postIds: z.array(z.string().min(1)),
  })
  .strict();

export const searchDocumentMetadataArtifactSchema = z
  .object({
    postId: z.string().min(1),
    language: supportedLanguageSchema,
    originalLanguage: supportedLanguageSchema,
    route: z.string().min(1),
    title: z.string().min(1),
    description: z.string().min(1),
    category: z.string().min(1),
    tags: z.array(z.string().min(1)),
    eligible: z.boolean(),
  })
  .strict();

function contentManifestFields<PostSummary extends z.ZodType>(
  postSummary: PostSummary,
) {
  return {
    languages: z.array(supportedLanguageSchema),
    posts: z.array(postSummary),
    categories: z.array(categoryArtifactSchema),
    tags: z.array(tagArtifactSchema),
    relatedPostIds: z.record(z.string(), z.array(z.string().min(1))),
    searchDocuments: z.array(searchDocumentMetadataArtifactSchema),
    assets: z.array(assetArtifactSchema),
    embeds: z.array(externalEmbedArtifactSchema),
    usedEmbedPlugins: z.array(embedPluginReferenceArtifactSchema),
    embedPolicyHash: z.string().regex(/^[a-f0-9]{64}$/u),
    routes: z.array(routeClaimArtifactSchema),
  };
}

export const previewContentManifestArtifactSchema = z
  .object({
    provenance: artifactProvenanceSchema(
      CONTENT_ARTIFACT_SCHEMA_VERSION,
      "preview",
    ),
    ...contentManifestFields(previewPostSummaryArtifactSchema),
  })
  .strict();

export const publishedContentManifestArtifactSchema = z
  .object({
    provenance: artifactProvenanceSchema(
      CONTENT_ARTIFACT_SCHEMA_VERSION,
      "production",
    ),
    ...contentManifestFields(publishedPostSummaryArtifactSchema),
  })
  .strict();

export const webManifestArtifactSchema = <
  Mode extends z.infer<typeof buildModeSchema>,
>(
  mode: Mode,
) =>
  z
    .object({
      provenance: artifactProvenanceSchema(WEB_ARTIFACT_SCHEMA_VERSION, mode),
      contentInputHash: z.string().regex(/^[a-f0-9]{64}$/u),
      routes: z.array(routeClaimArtifactSchema),
      files: z.array(z.string().min(1)),
      routesByLanguage: z.object({
        en: z.array(z.string().min(1)),
        ko: z.array(z.string().min(1)),
        ja: z.array(z.string().min(1)),
      }),
    })
    .strict();

export const previewWebManifestArtifactSchema =
  webManifestArtifactSchema("preview");
export const publishedWebManifestArtifactSchema =
  webManifestArtifactSchema("production");

export const searchManifestArtifactSchema = <
  Mode extends z.infer<typeof buildModeSchema>,
>(
  mode: Mode,
) =>
  z
    .object({
      provenance: artifactProvenanceSchema(SEARCH_ARTIFACT_SCHEMA_VERSION, mode),
      webInputHash: z.string().regex(/^[a-f0-9]{64}$/u),
      indexedPostIdsByLanguage: z.object({
        en: z.array(z.string().min(1)),
        ko: z.array(z.string().min(1)),
        ja: z.array(z.string().min(1)),
      }),
      files: z.array(z.string().min(1)),
    })
    .strict();

export const previewSearchManifestArtifactSchema =
  searchManifestArtifactSchema("preview");
export const publishedSearchManifestArtifactSchema =
  searchManifestArtifactSchema("production");

export const managedPageExternalOriginsSourceConfigSchema = z
  .object({
    frame: z.array(z.string()),
    script: z.array(z.string()),
    connect: z.array(z.string()),
    image: z.array(z.string()),
    style: z.array(z.string()),
    font: z.array(z.string()),
    media: z.array(z.string()),
  })
  .strict();

export const managedPageSecuritySourceConfigSchema = z
  .object({
    externalOrigins: managedPageExternalOriginsSourceConfigSchema,
    iframePermissions: z.array(z.string()),
  })
  .strict();

export const managedPageEntrySourceConfigSchema = z
  .object({
    format: managedPageEntryFormatSchema,
    path: z.string().min(1),
  })
  .strict();

export const managedPageSourceConfigSchema = z
  .object({
    schemaVersion: z.literal(1),
    id: z.string().min(1),
    route: z.string().min(1),
    kind: managedPageKindSchema,
    entry: managedPageEntrySourceConfigSchema,
    status: publicationStatusSchema,
    language: supportedLanguageSchema,
    translationKey: z.string().min(1).optional(),
    title: z.string().min(1),
    description: z.string().min(1),
    returnTo: z.string().min(1),
    robots: robotsPolicySchema,
    sitemap: z.boolean(),
    security: managedPageSecuritySourceConfigSchema,
  })
  .strict();

const managedPageArtifactFields = {
  id: z.string().min(1),
  route: z.string().min(1),
  kind: managedPageKindSchema,
  language: supportedLanguageSchema,
  translationKey: z.string().min(1).optional(),
  title: z.string().min(1),
  description: z.string().min(1),
  returnTo: z.string().min(1),
  robots: robotsPolicySchema,
  sitemap: z.boolean(),
  entryArtifactPath: z.string().min(1),
  security: embedSecurityArtifactSchema,
  assets: z.array(assetArtifactSchema),
  sourceHash: z.string().regex(/^[a-f0-9]{64}$/u),
  alternates: z.array(languageAlternateArtifactSchema),
};

export const previewManagedPageArtifactSchema = z
  .object({
    ...managedPageArtifactFields,
    status: publicationStatusSchema,
  })
  .strict();

export const publishedManagedPageArtifactSchema = z
  .object({
    ...managedPageArtifactFields,
    status: z.literal("published"),
  })
  .strict();

export const previewManagedPageManifestArtifactSchema = z
  .object({
    provenance: artifactProvenanceSchema(
      MANAGED_PAGE_ARTIFACT_SCHEMA_VERSION,
      "preview",
    ),
    pages: z.array(previewManagedPageArtifactSchema),
    routes: z.array(routeClaimArtifactSchema),
  })
  .strict();

export const publishedManagedPageManifestArtifactSchema = z
  .object({
    provenance: artifactProvenanceSchema(
      MANAGED_PAGE_ARTIFACT_SCHEMA_VERSION,
      "production",
    ),
    pages: z.array(publishedManagedPageArtifactSchema),
    routes: z.array(routeClaimArtifactSchema),
  })
  .strict();

export const discoveryManifestArtifactSchema = <
  Mode extends z.infer<typeof buildModeSchema>,
>(
  mode: Mode,
) =>
  z
    .object({
      provenance: artifactProvenanceSchema(
        DISCOVERY_ARTIFACT_SCHEMA_VERSION,
        mode,
      ),
      contentInputHash: z.string().regex(/^[a-f0-9]{64}$/u),
      webInputHash: z.string().regex(/^[a-f0-9]{64}$/u),
      managedPageInputHash: z.string().regex(/^[a-f0-9]{64}$/u),
      crawlerPolicyHash: z.string().regex(/^[a-f0-9]{64}$/u),
      includedRoutes: z.array(z.string().min(1)),
      robotsRoute: z.string().min(1),
      llmsRoute: z.string().min(1),
      sitemapRoute: z.string().min(1),
      feedRoutesByLanguage: z.object({
        en: z.string().min(1),
        ko: z.string().min(1),
        ja: z.string().min(1),
      }),
      routes: z.array(routeClaimArtifactSchema),
      files: z.array(z.string().min(1)),
    })
    .strict();

export const previewDiscoveryManifestArtifactSchema =
  discoveryManifestArtifactSchema("preview");
export const publishedDiscoveryManifestArtifactSchema =
  discoveryManifestArtifactSchema("production");

export const releaseManifestArtifactSchema = z
  .object({
    provenance: artifactProvenanceSchema(
      RELEASE_ARTIFACT_SCHEMA_VERSION,
      "production",
    ),
    webInputHash: z.string().regex(/^[a-f0-9]{64}$/u),
    searchInputHash: z.string().regex(/^[a-f0-9]{64}$/u),
    managedPageInputHash: z.string().regex(/^[a-f0-9]{64}$/u),
    discoveryInputHash: z.string().regex(/^[a-f0-9]{64}$/u),
    routes: z.array(routeClaimArtifactSchema),
    files: z.array(z.string().min(1)),
  })
  .strict();

export const contractJsonSchemaSources = {
  previewContentManifest: previewContentManifestArtifactSchema,
  publishedContentManifest: publishedContentManifestArtifactSchema,
  previewPost: previewPostArtifactSchema,
  publishedPost: publishedPostArtifactSchema,
  previewWebManifest: previewWebManifestArtifactSchema,
  publishedWebManifest: publishedWebManifestArtifactSchema,
  previewSearchManifest: previewSearchManifestArtifactSchema,
  publishedSearchManifest: publishedSearchManifestArtifactSchema,
  managedPageSource: managedPageSourceConfigSchema,
  previewManagedPageManifest: previewManagedPageManifestArtifactSchema,
  publishedManagedPageManifest: publishedManagedPageManifestArtifactSchema,
  previewDiscoveryManifest: previewDiscoveryManifestArtifactSchema,
  publishedDiscoveryManifest: publishedDiscoveryManifestArtifactSchema,
  releaseManifest: releaseManifestArtifactSchema,
} as const;

void normalizedRouteSchema;
