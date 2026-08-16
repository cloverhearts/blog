import type { z } from "zod";

import type {
  embedBuildModeSchema,
  embedClientModeSchema,
  embedCspDirectiveSchema,
  embedCspRequirementSchema,
  embedDirectiveSourceSchema,
  embedPluginContextSchema,
  embedPrivacyModeSchema,
  embedRenderResultSchema,
  embedSecurityRequirementsSchema,
  normalizedEmbedSchema,
} from "./schemas.ts";

export type EmbedBuildMode = z.infer<typeof embedBuildModeSchema>;
export type EmbedClientMode = z.infer<typeof embedClientModeSchema>;
export type EmbedPrivacyMode = z.infer<typeof embedPrivacyModeSchema>;
export type EmbedCspDirective = z.infer<typeof embedCspDirectiveSchema>;
export type MaybePromise<Value> = Value | Promise<Value>;
export type EmbedDirectiveSource = z.infer<typeof embedDirectiveSourceSchema>;
export type EmbedPluginContext = z.infer<typeof embedPluginContextSchema>;
export type EmbedCspRequirement = z.infer<typeof embedCspRequirementSchema>;
export type EmbedSecurityRequirements = z.infer<
  typeof embedSecurityRequirementsSchema
>;
export type NormalizedEmbed = z.infer<typeof normalizedEmbedSchema>;
export type EmbedRenderResult = z.infer<typeof embedRenderResultSchema>;

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
