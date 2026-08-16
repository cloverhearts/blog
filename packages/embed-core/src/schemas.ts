import { z } from "zod";

export const embedBuildModeSchema = z.enum(["preview", "production"]);
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

export const embedDirectiveSourceSchema = z
  .object({
    name: z.string().min(1),
    attributes: z.record(z.string(), z.string()),
    sourcePath: z.string().min(1),
    sourceLine: z.number().int().positive(),
  })
  .strict();

export const embedPluginContextSchema = z
  .object({
    buildMode: embedBuildModeSchema,
    language: z.string().min(1),
    timezone: z.string().min(1),
    configuration: z.record(z.string(), z.unknown()),
  })
  .strict();

export const embedCspRequirementSchema = z
  .object({
    directive: embedCspDirectiveSchema,
    origins: z.array(z.string().min(1)),
  })
  .strict();

export const embedSecurityRequirementsSchema = z
  .object({
    csp: z.array(embedCspRequirementSchema),
    iframePermissions: z.array(z.string()),
  })
  .strict();

export const normalizedEmbedSchema = z
  .object({
    provider: z.string().min(1),
    kind: z.string().min(1),
    title: z.string().min(1),
    canonicalUrl: z.url(),
    fallbackText: z.string().min(1),
    data: z.record(z.string(), z.string()),
  })
  .strict();

export const embedRenderResultSchema = z
  .object({
    staticHtml: z.string().min(1),
    clientMode: embedClientModeSchema,
    privacyMode: embedPrivacyModeSchema,
    clientModuleArtifactPath: z.string().min(1).optional(),
    searchableText: z.string().min(1),
    security: embedSecurityRequirementsSchema,
  })
  .strict();
