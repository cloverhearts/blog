import { parseWithContract, sha256Json } from "../../contracts/src/index.ts";
import type { EmbedRegistry } from "./registry.ts";
import {
  embedDirectiveSourceSchema,
  embedPluginContextSchema,
  embedRenderResultSchema,
  normalizedEmbedSchema,
} from "./schemas.ts";
import { assertDeclaredOrigins, assertHttpsUrl, assertSafeEmbedHtml } from "./sanitize.ts";
import type {
  EmbedDirectiveSource,
  EmbedPluginContext,
  EmbedRenderResult,
  NormalizedEmbed,
} from "./types.ts";

export interface ExecutedEmbed {
  readonly pluginId: string;
  readonly pluginVersion: string;
  readonly directiveName: string;
  readonly normalized: NormalizedEmbed;
  readonly rendered: EmbedRenderResult;
  readonly outputHash: string;
  readonly configurationHash: string;
}

export async function executeEmbedDirective(
  registry: EmbedRegistry,
  source: EmbedDirectiveSource,
  context: EmbedPluginContext,
): Promise<ExecutedEmbed> {
  const validSource = parseWithContract(
    `embed directive ${source.name}`,
    embedDirectiveSourceSchema,
    source,
  );
  const validContext = parseWithContract(
    `embed context for ${source.name}`,
    embedPluginContextSchema,
    context,
  );
  const loaded = registry.get(validSource.name);
  if (!loaded) {
    throw new Error(`Unknown or disabled embed directive: ${validSource.name}`);
  }

  if (registry.policy.allowNetworkDuringBuild) {
    throw new Error("Build-time network access is not enabled for embed plugins");
  }

  const normalized = parseWithContract(
    `${loaded.plugin.id} normalize()`,
    normalizedEmbedSchema,
    await loaded.plugin.normalize(validSource, {
      ...validContext,
      configuration: loaded.configuration,
    }),
  );
  if (registry.policy.requireAccessibleTitle && normalized.title.trim().length === 0) {
    throw new Error(`${loaded.plugin.id} must provide an accessible title`);
  }
  assertHttpsUrl(normalized.canonicalUrl, `${loaded.plugin.id} canonicalUrl`);
  if (registry.policy.requireStaticFallback && normalized.fallbackText.trim().length === 0) {
    throw new Error(`${loaded.plugin.id} must provide fallback text`);
  }

  const rendered = parseWithContract(
    `${loaded.plugin.id} renderStatic()`,
    embedRenderResultSchema,
    await loaded.plugin.renderStatic(normalized, {
      ...validContext,
      configuration: loaded.configuration,
    }),
  );
  if (registry.policy.requirePrivacyDeclaration && !rendered.privacyMode) {
    throw new Error(`${loaded.plugin.id} must declare a privacy mode`);
  }
  if (
    rendered.clientMode === "progressive" &&
    !registry.policy.allowProgressiveClientEnhancement
  ) {
    throw new Error(`${loaded.plugin.id} is not allowed to emit client enhancement`);
  }
  assertSafeEmbedHtml(rendered.staticHtml, loaded.plugin.id);
  if (registry.policy.requireExplicitSecurityOrigins) {
    const origins = rendered.security.csp.flatMap((entry) => entry.origins);
    assertDeclaredOrigins(rendered.staticHtml, origins, loaded.plugin.id);
  }

  return {
    pluginId: loaded.plugin.id,
    pluginVersion: loaded.plugin.version,
    directiveName: validSource.name,
    normalized,
    rendered,
    configurationHash: loaded.configurationHash,
    outputHash: sha256Json({
      pluginId: loaded.plugin.id,
      pluginVersion: loaded.plugin.version,
      normalized,
      rendered: {
        staticHtml: rendered.staticHtml,
        clientMode: rendered.clientMode,
        privacyMode: rendered.privacyMode,
        searchableText: rendered.searchableText,
        security: rendered.security,
      },
    }),
  };
}
