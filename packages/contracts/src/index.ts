/**
 * Provisional compile-time model for the first artifact contract.
 *
 * These interfaces must be replaced by types inferred from runtime schemas
 * when the schema library is selected. See ARCHITECTURE.md and
 * DEVELOPMENT_PLAN.md; TypeScript interfaces alone are not runtime validation.
 */

export const CONTENT_ARTIFACT_SCHEMA_VERSION = 7 as const;
export const WEB_ARTIFACT_SCHEMA_VERSION = 2 as const;
export const SEARCH_ARTIFACT_SCHEMA_VERSION = 2 as const;
export const MANAGED_PAGE_ARTIFACT_SCHEMA_VERSION = 2 as const;
export const DISCOVERY_ARTIFACT_SCHEMA_VERSION = 3 as const;
export const RELEASE_ARTIFACT_SCHEMA_VERSION = 2 as const;

export type ContentArtifactSchemaVersion =
  typeof CONTENT_ARTIFACT_SCHEMA_VERSION;
export type WebArtifactSchemaVersion = typeof WEB_ARTIFACT_SCHEMA_VERSION;
export type SearchArtifactSchemaVersion = typeof SEARCH_ARTIFACT_SCHEMA_VERSION;
export type ManagedPageArtifactSchemaVersion =
  typeof MANAGED_PAGE_ARTIFACT_SCHEMA_VERSION;
export type DiscoveryArtifactSchemaVersion =
  typeof DISCOVERY_ARTIFACT_SCHEMA_VERSION;
export type ReleaseArtifactSchemaVersion =
  typeof RELEASE_ARTIFACT_SCHEMA_VERSION;

export type BuildMode = "preview" | "production";
export type ManagedPageKind = "document" | "presentation" | "application";
export type ManagedPageEntryFormat = "markdown" | "typescript";
export type PublicationStatus = "draft" | "published";
export type RobotsPolicy = "index" | "noindex";
export type SupportedLanguage = "en" | "ko" | "ja";
export type TranslationStatus = "source" | "ai-draft" | "reviewed";
export type RepresentativeImageMode =
  | "social-image"
  | "cover"
  | "generated-card";

export interface LanguageAlternateArtifact {
  readonly language: SupportedLanguage;
  readonly ownerId: string;
  readonly route: string;
}

export interface PostImageArtifact {
  readonly assetId: string;
  readonly alt: string;
}

export interface PostAuthorshipDisclosureArtifact {
  readonly statementLanguage: "en";
  readonly statement: string;
  readonly claimSource: "owner";
  readonly appliesTo: "original-work";
  readonly primaryCreation: "human";
  readonly aiAssistance: readonly ["proofreading"];
}

export interface ArtifactProvenance<
  SchemaVersion extends number,
  Mode extends BuildMode,
> {
  readonly schemaVersion: SchemaVersion;
  readonly buildMode: Mode;
  readonly producer: string;
  readonly producerVersion: string;
  readonly inputHash: string;
  readonly configHash: string;
  readonly contentRulesHash: string;
  readonly localizationRulesHash: string;
}

export interface AssetArtifact {
  readonly id: string;
  readonly logicalPath: string;
  /** POSIX path relative to the artifact root; never a public URL. */
  readonly artifactPath: string;
  readonly kind: "image" | "video" | "audio" | "font" | "download";
  readonly mediaType: string;
  readonly hash: string;
  readonly bytes: number;
  readonly width?: number;
  readonly height?: number;
}

export interface RouteClaimArtifact {
  readonly route: string;
  readonly ownerKind: "blog" | "post" | "managed-page" | "system";
  readonly ownerId: string;
  readonly artifactPath: string;
}

export interface HeadingArtifact {
  readonly depth: 2 | 3 | 4 | 5 | 6;
  readonly id: string;
  /** Same-document fragment link for the matching generated heading element. */
  readonly anchor: `#${string}`;
  readonly text: string;
  /** Nearest preceding heading with a lower depth; absent for root TOC items. */
  readonly parentId?: string;
}

export interface EmbedPluginReferenceArtifact {
  readonly id: string;
  readonly version: string;
  readonly configurationHash: string;
}

export type EmbedCspDirectiveArtifact =
  | "frame-src"
  | "script-src"
  | "connect-src"
  | "img-src"
  | "style-src"
  | "font-src"
  | "media-src"
  | "worker-src";

export interface EmbedCspRequirementArtifact {
  readonly directive: EmbedCspDirectiveArtifact;
  readonly origins: readonly string[];
}

export interface EmbedSecurityArtifact {
  readonly csp: readonly EmbedCspRequirementArtifact[];
  readonly iframePermissions: readonly string[];
}

export interface ExternalEmbedArtifact {
  readonly id: string;
  readonly postId: string;
  readonly pluginId: string;
  readonly pluginVersion: string;
  readonly directiveName: string;
  readonly provider: string;
  readonly kind: string;
  readonly title: string;
  readonly canonicalUrl: string;
  readonly fallbackText: string;
  readonly searchableText: string;
  readonly clientMode: "none" | "progressive";
  readonly privacyMode:
    | "local-only"
    | "external-request"
    | "consent-required";
  readonly clientModuleArtifactPath?: string;
  readonly security: EmbedSecurityArtifact;
  readonly outputHash: string;
}

interface PostSummaryFields {
  readonly id: string;
  readonly translationKey: string;
  readonly language: SupportedLanguage;
  readonly originalLanguage: SupportedLanguage;
  readonly translationStatus: TranslationStatus;
  readonly authorshipDisclosure: PostAuthorshipDisclosureArtifact;
  readonly slug: string;
  readonly route: string;
  readonly category: string;
  readonly title: string;
  readonly description: string;
  readonly tags: readonly string[];
  readonly createdAt: string;
  readonly updatedAt?: string;
  readonly excerpt: string;
  readonly readingMinutes: number;
  readonly representativeImage: RepresentativeImageMode;
  readonly cover?: PostImageArtifact;
  readonly socialImage?: PostImageArtifact;
  readonly alternates: readonly LanguageAlternateArtifact[];
}

export interface PreviewPostSummaryArtifact extends PostSummaryFields {
  readonly status: PublicationStatus;
}

export interface PublishedPostSummaryArtifact extends PostSummaryFields {
  readonly status: "published";
}

interface PostBodyFields {
  /** Sanitized, semantic, unstyled HTML. It must contain no executable code. */
  readonly bodyHtml: string;
  /** Ordered, presentation-neutral source for the post table of contents. */
  readonly headings: readonly HeadingArtifact[];
  readonly assetIds: readonly string[];
  readonly embedIds: readonly string[];
  readonly manualRelatedSlugs: readonly string[];
  readonly sourceHash: string;
}

export interface PreviewPostArtifact
  extends PreviewPostSummaryArtifact,
    PostBodyFields {}

export interface PublishedPostArtifact
  extends PublishedPostSummaryArtifact,
    PostBodyFields {}

export interface CategoryArtifact {
  readonly id: string;
  readonly language: SupportedLanguage;
  readonly label: string;
  readonly postIds: readonly string[];
}

export interface TagArtifact {
  readonly id: string;
  readonly language: SupportedLanguage;
  readonly label: string;
  readonly postIds: readonly string[];
}

export interface SearchDocumentMetadataArtifact {
  readonly postId: string;
  readonly language: SupportedLanguage;
  readonly originalLanguage: SupportedLanguage;
  readonly route: string;
  readonly title: string;
  readonly description: string;
  readonly category: string;
  readonly tags: readonly string[];
  readonly eligible: boolean;
}

interface ContentManifestFields<PostSummary> {
  readonly languages: readonly SupportedLanguage[];
  readonly posts: readonly PostSummary[];
  readonly categories: readonly CategoryArtifact[];
  readonly tags: readonly TagArtifact[];
  readonly relatedPostIds: Readonly<Record<string, readonly string[]>>;
  readonly searchDocuments: readonly SearchDocumentMetadataArtifact[];
  readonly assets: readonly AssetArtifact[];
  readonly embeds: readonly ExternalEmbedArtifact[];
  readonly usedEmbedPlugins: readonly EmbedPluginReferenceArtifact[];
  readonly embedPolicyHash: string;
  readonly routes: readonly RouteClaimArtifact[];
}

export interface PreviewContentManifestArtifact
  extends ContentManifestFields<PreviewPostSummaryArtifact> {
  readonly provenance: ArtifactProvenance<
    ContentArtifactSchemaVersion,
    "preview"
  >;
}

export interface PublishedContentManifestArtifact
  extends ContentManifestFields<PublishedPostSummaryArtifact> {
  readonly provenance: ArtifactProvenance<
    ContentArtifactSchemaVersion,
    "production"
  >;
}

export interface WebManifestArtifact<Mode extends BuildMode> {
  readonly provenance: ArtifactProvenance<WebArtifactSchemaVersion, Mode>;
  readonly contentInputHash: string;
  readonly routes: readonly RouteClaimArtifact[];
  readonly files: readonly string[];
  readonly routesByLanguage: Readonly<
    Record<SupportedLanguage, readonly string[]>
  >;
}

export interface SearchManifestArtifact<Mode extends BuildMode> {
  readonly provenance: ArtifactProvenance<SearchArtifactSchemaVersion, Mode>;
  readonly webInputHash: string;
  readonly indexedPostIdsByLanguage: Readonly<
    Record<SupportedLanguage, readonly string[]>
  >;
  readonly files: readonly string[];
}

export interface ManagedPageSourceConfig {
  readonly schemaVersion: 1;
  readonly id: string;
  readonly route: string;
  readonly kind: ManagedPageKind;
  readonly entry: ManagedPageEntrySourceConfig;
  readonly status: PublicationStatus;
  readonly language: SupportedLanguage;
  readonly translationKey?: string;
  readonly title: string;
  readonly description: string;
  readonly returnTo: string;
  readonly robots: RobotsPolicy;
  readonly sitemap: boolean;
  readonly security: ManagedPageSecuritySourceConfig;
}

export interface ManagedPageEntrySourceConfig {
  readonly format: ManagedPageEntryFormat;
  readonly path: string;
}

export interface ManagedPageExternalOriginsSourceConfig {
  readonly frame: readonly string[];
  readonly script: readonly string[];
  readonly connect: readonly string[];
  readonly image: readonly string[];
  readonly style: readonly string[];
  readonly font: readonly string[];
  readonly media: readonly string[];
}

export interface ManagedPageSecuritySourceConfig {
  readonly externalOrigins: ManagedPageExternalOriginsSourceConfig;
  readonly iframePermissions: readonly string[];
}

interface ManagedPageArtifactFields {
  readonly id: string;
  readonly route: string;
  readonly kind: ManagedPageKind;
  readonly language: SupportedLanguage;
  readonly translationKey?: string;
  readonly title: string;
  readonly description: string;
  readonly returnTo: string;
  readonly robots: RobotsPolicy;
  readonly sitemap: boolean;
  readonly entryArtifactPath: string;
  readonly security: EmbedSecurityArtifact;
  readonly assets: readonly AssetArtifact[];
  readonly sourceHash: string;
  readonly alternates: readonly LanguageAlternateArtifact[];
}

export interface PreviewManagedPageArtifact
  extends ManagedPageArtifactFields {
  readonly status: PublicationStatus;
}

export interface PublishedManagedPageArtifact
  extends ManagedPageArtifactFields {
  readonly status: "published";
}

export interface PreviewManagedPageManifestArtifact {
  readonly provenance: ArtifactProvenance<
    ManagedPageArtifactSchemaVersion,
    "preview"
  >;
  readonly pages: readonly PreviewManagedPageArtifact[];
  readonly routes: readonly RouteClaimArtifact[];
}

export interface PublishedManagedPageManifestArtifact {
  readonly provenance: ArtifactProvenance<
    ManagedPageArtifactSchemaVersion,
    "production"
  >;
  readonly pages: readonly PublishedManagedPageArtifact[];
  readonly routes: readonly RouteClaimArtifact[];
}

export interface DiscoveryManifestArtifact<Mode extends BuildMode> {
  readonly provenance: ArtifactProvenance<
    DiscoveryArtifactSchemaVersion,
    Mode
  >;
  readonly contentInputHash: string;
  readonly webInputHash: string;
  readonly managedPageInputHash: string;
  readonly crawlerPolicyHash: string;
  readonly includedRoutes: readonly string[];
  readonly robotsRoute: string;
  readonly llmsRoute: string;
  readonly sitemapRoute: string;
  readonly feedRoutesByLanguage: Readonly<
    Record<SupportedLanguage, string>
  >;
  readonly routes: readonly RouteClaimArtifact[];
  readonly files: readonly string[];
}

export interface ReleaseManifestArtifact {
  readonly provenance: ArtifactProvenance<
    ReleaseArtifactSchemaVersion,
    "production"
  >;
  readonly webInputHash: string;
  readonly searchInputHash: string;
  readonly managedPageInputHash: string;
  readonly discoveryInputHash: string;
  readonly routes: readonly RouteClaimArtifact[];
  readonly files: readonly string[];
}
