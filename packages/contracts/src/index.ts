import type { z } from "zod";

import { parseWithContract } from "./errors.ts";
import {
  assetArtifactSchema,
  categoryArtifactSchema,
  discoveryManifestArtifactSchema,
  embedCspRequirementArtifactSchema,
  embedPluginReferenceArtifactSchema,
  embedSecurityArtifactSchema,
  externalEmbedArtifactSchema,
  headingArtifactSchema,
  languageAlternateArtifactSchema,
  managedPageSourceConfigSchema,
  postAuthorshipDisclosureArtifactSchema,
  postImageArtifactSchema,
  previewContentManifestArtifactSchema,
  previewDiscoveryManifestArtifactSchema,
  previewManagedPageArtifactSchema,
  previewManagedPageManifestArtifactSchema,
  previewPostArtifactSchema,
  previewPostSummaryArtifactSchema,
  previewSearchManifestArtifactSchema,
  previewWebManifestArtifactSchema,
  publishedContentManifestArtifactSchema,
  publishedDiscoveryManifestArtifactSchema,
  publishedManagedPageArtifactSchema,
  publishedManagedPageManifestArtifactSchema,
  publishedPostArtifactSchema,
  publishedPostSummaryArtifactSchema,
  publishedSearchManifestArtifactSchema,
  publishedWebManifestArtifactSchema,
  releaseManifestArtifactSchema,
  routeClaimArtifactSchema,
  searchDocumentMetadataArtifactSchema,
  searchManifestArtifactSchema,
  tagArtifactSchema,
  webManifestArtifactSchema,
} from "./schemas.ts";

export {
  CONTENT_ARTIFACT_SCHEMA_VERSION,
  DISCOVERY_ARTIFACT_SCHEMA_VERSION,
  MANAGED_PAGE_ARTIFACT_SCHEMA_VERSION,
  RELEASE_ARTIFACT_SCHEMA_VERSION,
  SEARCH_ARTIFACT_SCHEMA_VERSION,
  WEB_ARTIFACT_SCHEMA_VERSION,
} from "./versions.ts";
export {
  artifactProvenanceSchema,
  assetArtifactSchema,
  assetKindSchema,
  buildModeSchema,
  categoryArtifactSchema,
  contractJsonSchemaSources,
  embedClientModeSchema,
  embedCspDirectiveSchema,
  embedCspRequirementArtifactSchema,
  embedPluginReferenceArtifactSchema,
  embedPrivacyModeSchema,
  embedSecurityArtifactSchema,
  externalEmbedArtifactSchema,
  headingArtifactSchema,
  headingDepthSchema,
  languageAlternateArtifactSchema,
  managedPageEntryFormatSchema,
  managedPageEntrySourceConfigSchema,
  managedPageExternalOriginsSourceConfigSchema,
  managedPageKindSchema,
  managedPageSecuritySourceConfigSchema,
  managedPageSourceConfigSchema,
  postAuthorshipDisclosureArtifactSchema,
  postImageArtifactSchema,
  previewContentManifestArtifactSchema,
  previewDiscoveryManifestArtifactSchema,
  previewManagedPageArtifactSchema,
  previewManagedPageManifestArtifactSchema,
  previewPostArtifactSchema,
  previewPostSummaryArtifactSchema,
  previewSearchManifestArtifactSchema,
  previewWebManifestArtifactSchema,
  publicationStatusSchema,
  publishedContentManifestArtifactSchema,
  publishedDiscoveryManifestArtifactSchema,
  publishedManagedPageArtifactSchema,
  publishedManagedPageManifestArtifactSchema,
  publishedPostArtifactSchema,
  publishedPostSummaryArtifactSchema,
  publishedSearchManifestArtifactSchema,
  publishedWebManifestArtifactSchema,
  releaseManifestArtifactSchema,
  representativeImageModeSchema,
  robotsPolicySchema,
  routeClaimArtifactSchema,
  routeOwnerKindSchema,
  searchDocumentMetadataArtifactSchema,
  searchManifestArtifactSchema,
  supportedLanguageSchema,
  tagArtifactSchema,
  translationStatusSchema,
  webManifestArtifactSchema,
} from "./schemas.ts";
export {
  ContractValidationError,
  formatZodIssues,
  parseWithContract,
} from "./errors.ts";
export { sha256File, sha256Hex, sha256Json, stableSerialize } from "./hash.ts";

export type ContentArtifactSchemaVersion =
  typeof import("./versions.ts").CONTENT_ARTIFACT_SCHEMA_VERSION;
export type WebArtifactSchemaVersion =
  typeof import("./versions.ts").WEB_ARTIFACT_SCHEMA_VERSION;
export type SearchArtifactSchemaVersion =
  typeof import("./versions.ts").SEARCH_ARTIFACT_SCHEMA_VERSION;
export type ManagedPageArtifactSchemaVersion =
  typeof import("./versions.ts").MANAGED_PAGE_ARTIFACT_SCHEMA_VERSION;
export type DiscoveryArtifactSchemaVersion =
  typeof import("./versions.ts").DISCOVERY_ARTIFACT_SCHEMA_VERSION;
export type ReleaseArtifactSchemaVersion =
  typeof import("./versions.ts").RELEASE_ARTIFACT_SCHEMA_VERSION;

export type BuildMode = z.infer<
  typeof import("./schemas.ts").buildModeSchema
>;
export type ManagedPageKind = z.infer<
  typeof import("./schemas.ts").managedPageKindSchema
>;
export type ManagedPageEntryFormat = z.infer<
  typeof import("./schemas.ts").managedPageEntryFormatSchema
>;
export type PublicationStatus = z.infer<
  typeof import("./schemas.ts").publicationStatusSchema
>;
export type RobotsPolicy = z.infer<
  typeof import("./schemas.ts").robotsPolicySchema
>;
export type SupportedLanguage = z.infer<
  typeof import("./schemas.ts").supportedLanguageSchema
>;
export type TranslationStatus = z.infer<
  typeof import("./schemas.ts").translationStatusSchema
>;
export type RepresentativeImageMode = z.infer<
  typeof import("./schemas.ts").representativeImageModeSchema
>;
export type LanguageAlternateArtifact = z.infer<
  typeof languageAlternateArtifactSchema
>;
export type PostImageArtifact = z.infer<typeof postImageArtifactSchema>;
export type PostAuthorshipDisclosureArtifact = z.infer<
  typeof postAuthorshipDisclosureArtifactSchema
>;
export type ArtifactProvenance<
  SchemaVersion extends number,
  Mode extends BuildMode,
> = {
  readonly schemaVersion: SchemaVersion;
  readonly buildMode: Mode;
  readonly producer: string;
  readonly producerVersion: string;
  readonly inputHash: string;
  readonly configHash: string;
  readonly contentRulesHash: string;
  readonly localizationRulesHash: string;
};
export type AssetArtifact = z.infer<typeof assetArtifactSchema>;
export type RouteClaimArtifact = z.infer<typeof routeClaimArtifactSchema>;
export type HeadingArtifact = z.infer<typeof headingArtifactSchema>;
export type EmbedPluginReferenceArtifact = z.infer<
  typeof embedPluginReferenceArtifactSchema
>;
export type EmbedCspDirectiveArtifact = z.infer<
  typeof import("./schemas.ts").embedCspDirectiveSchema
>;
export type EmbedCspRequirementArtifact = z.infer<
  typeof embedCspRequirementArtifactSchema
>;
export type EmbedSecurityArtifact = z.infer<typeof embedSecurityArtifactSchema>;
export type ExternalEmbedArtifact = z.infer<typeof externalEmbedArtifactSchema>;
export type PreviewPostSummaryArtifact = z.infer<
  typeof previewPostSummaryArtifactSchema
>;
export type PublishedPostSummaryArtifact = z.infer<
  typeof publishedPostSummaryArtifactSchema
>;
export type PreviewPostArtifact = z.infer<typeof previewPostArtifactSchema>;
export type PublishedPostArtifact = z.infer<typeof publishedPostArtifactSchema>;
export type CategoryArtifact = z.infer<typeof categoryArtifactSchema>;
export type TagArtifact = z.infer<typeof tagArtifactSchema>;
export type SearchDocumentMetadataArtifact = z.infer<
  typeof searchDocumentMetadataArtifactSchema
>;
export type PreviewContentManifestArtifact = z.infer<
  typeof previewContentManifestArtifactSchema
>;
export type PublishedContentManifestArtifact = z.infer<
  typeof publishedContentManifestArtifactSchema
>;
export type WebManifestArtifact<Mode extends BuildMode> = z.infer<
  ReturnType<typeof webManifestArtifactSchema<Mode>>
>;
export type SearchManifestArtifact<Mode extends BuildMode> = z.infer<
  ReturnType<typeof searchManifestArtifactSchema<Mode>>
>;
export type ManagedPageSourceConfig = z.infer<
  typeof managedPageSourceConfigSchema
>;
export type ManagedPageEntrySourceConfig = z.infer<
  typeof import("./schemas.ts").managedPageEntrySourceConfigSchema
>;
export type ManagedPageExternalOriginsSourceConfig = z.infer<
  typeof import("./schemas.ts").managedPageExternalOriginsSourceConfigSchema
>;
export type ManagedPageSecuritySourceConfig = z.infer<
  typeof import("./schemas.ts").managedPageSecuritySourceConfigSchema
>;
export type PreviewManagedPageArtifact = z.infer<
  typeof previewManagedPageArtifactSchema
>;
export type PublishedManagedPageArtifact = z.infer<
  typeof publishedManagedPageArtifactSchema
>;
export type PreviewManagedPageManifestArtifact = z.infer<
  typeof previewManagedPageManifestArtifactSchema
>;
export type PublishedManagedPageManifestArtifact = z.infer<
  typeof publishedManagedPageManifestArtifactSchema
>;
export type DiscoveryManifestArtifact<Mode extends BuildMode> = z.infer<
  ReturnType<typeof discoveryManifestArtifactSchema<Mode>>
>;
export type ReleaseManifestArtifact = z.infer<
  typeof releaseManifestArtifactSchema
>;

export function parsePreviewContentManifest(
  value: unknown,
): PreviewContentManifestArtifact {
  return parseWithContract(
    "preview content manifest",
    previewContentManifestArtifactSchema,
    value,
  );
}

export function parsePublishedContentManifest(
  value: unknown,
): PublishedContentManifestArtifact {
  return parseWithContract(
    "published content manifest",
    publishedContentManifestArtifactSchema,
    value,
  );
}

export function parsePreviewPost(value: unknown): PreviewPostArtifact {
  return parseWithContract("preview post artifact", previewPostArtifactSchema, value);
}

export function parsePublishedPost(value: unknown): PublishedPostArtifact {
  return parseWithContract(
    "published post artifact",
    publishedPostArtifactSchema,
    value,
  );
}

export function parsePreviewWebManifest(
  value: unknown,
): WebManifestArtifact<"preview"> {
  return parseWithContract(
    "preview web manifest",
    previewWebManifestArtifactSchema,
    value,
  );
}

export function parsePublishedWebManifest(
  value: unknown,
): WebManifestArtifact<"production"> {
  return parseWithContract(
    "published web manifest",
    publishedWebManifestArtifactSchema,
    value,
  );
}

export function parsePreviewSearchManifest(
  value: unknown,
): SearchManifestArtifact<"preview"> {
  return parseWithContract(
    "preview search manifest",
    previewSearchManifestArtifactSchema,
    value,
  );
}

export function parsePublishedSearchManifest(
  value: unknown,
): SearchManifestArtifact<"production"> {
  return parseWithContract(
    "published search manifest",
    publishedSearchManifestArtifactSchema,
    value,
  );
}

export function parseManagedPageSourceConfig(
  value: unknown,
): ManagedPageSourceConfig {
  return parseWithContract(
    "managed page source",
    managedPageSourceConfigSchema,
    value,
  );
}

export function parsePreviewManagedPageManifest(
  value: unknown,
): PreviewManagedPageManifestArtifact {
  return parseWithContract(
    "preview managed-page manifest",
    previewManagedPageManifestArtifactSchema,
    value,
  );
}

export function parsePublishedManagedPageManifest(
  value: unknown,
): PublishedManagedPageManifestArtifact {
  return parseWithContract(
    "published managed-page manifest",
    publishedManagedPageManifestArtifactSchema,
    value,
  );
}

export function parsePreviewDiscoveryManifest(
  value: unknown,
): DiscoveryManifestArtifact<"preview"> {
  return parseWithContract(
    "preview discovery manifest",
    previewDiscoveryManifestArtifactSchema,
    value,
  );
}

export function parsePublishedDiscoveryManifest(
  value: unknown,
): DiscoveryManifestArtifact<"production"> {
  return parseWithContract(
    "published discovery manifest",
    publishedDiscoveryManifestArtifactSchema,
    value,
  );
}

export function parseReleaseManifest(value: unknown): ReleaseManifestArtifact {
  return parseWithContract("release manifest", releaseManifestArtifactSchema, value);
}

export { generateContractJsonSchemas } from "./json-schema.ts";
