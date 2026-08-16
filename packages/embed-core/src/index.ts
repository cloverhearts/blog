/**
 * Provisional build-time embed plugin API.
 * Runtime schemas will replace handwritten validation types in Phase 1.
 */

export type EmbedBuildMode = "preview" | "production";
export type EmbedClientMode = "none" | "progressive";
export type EmbedPrivacyMode =
  | "local-only"
  | "external-request"
  | "consent-required";
export type EmbedCspDirective =
  | "frame-src"
  | "script-src"
  | "connect-src"
  | "img-src"
  | "style-src"
  | "font-src"
  | "media-src"
  | "worker-src";

export type MaybePromise<Value> = Value | Promise<Value>;

export interface EmbedDirectiveSource {
  readonly name: string;
  readonly attributes: Readonly<Record<string, string>>;
  readonly sourcePath: string;
  readonly sourceLine: number;
}

export interface EmbedPluginContext {
  readonly buildMode: EmbedBuildMode;
  readonly language: string;
  readonly timezone: string;
  readonly configuration: Readonly<Record<string, unknown>>;
}

export interface EmbedCspRequirement {
  readonly directive: EmbedCspDirective;
  readonly origins: readonly string[];
}

export interface EmbedSecurityRequirements {
  readonly csp: readonly EmbedCspRequirement[];
  readonly iframePermissions: readonly string[];
}

export interface NormalizedEmbed {
  readonly provider: string;
  readonly kind: string;
  readonly title: string;
  readonly canonicalUrl: string;
  readonly fallbackText: string;
  readonly data: Readonly<Record<string, string>>;
}

export interface EmbedRenderResult {
  /** Provider-generated semantic markup; embed-core sanitizes it before output. */
  readonly staticHtml: string;
  readonly clientMode: EmbedClientMode;
  readonly privacyMode: EmbedPrivacyMode;
  /** Optional artifact-relative module copied by embed-core. */
  readonly clientModuleArtifactPath?: string;
  readonly searchableText: string;
  readonly security: EmbedSecurityRequirements;
}

export interface EmbedPlugin {
  readonly id: string;
  readonly version: string;
  readonly directiveNames: readonly string[];
  normalize(
    source: EmbedDirectiveSource,
    context: EmbedPluginContext,
  ): MaybePromise<NormalizedEmbed>;
  renderStatic(
    embed: NormalizedEmbed,
    context: EmbedPluginContext,
  ): MaybePromise<EmbedRenderResult>;
}
