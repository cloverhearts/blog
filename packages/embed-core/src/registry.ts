import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { pathToFileURL } from "node:url";

import { sha256Json } from "../../contracts/src/index.ts";
import type { EmbedsConfig } from "../../project-config/src/index.ts";
import type { EmbedPlugin } from "./types.ts";

export interface LoadedEmbedPlugin {
  readonly plugin: EmbedPlugin;
  readonly packageName: string;
  readonly configuration: Readonly<Record<string, unknown>>;
  readonly configurationHash: string;
}

export interface EmbedRegistry {
  readonly policy: EmbedsConfig["policy"];
  readonly policyHash: string;
  readonly plugins: readonly LoadedEmbedPlugin[];
  get(directiveName: string): LoadedEmbedPlugin | undefined;
}

export async function loadEmbedRegistry(
  embeds: EmbedsConfig,
  repositoryRoot: string,
): Promise<EmbedRegistry> {
  if (embeds.policy.allowRemotePluginPackages) {
    throw new Error("Remote embed plugin packages are forbidden");
  }

  const plugins: LoadedEmbedPlugin[] = [];
  const directiveOwners = new Map<string, string>();

  for (const entry of embeds.plugins) {
    if (!entry.enabled) {
      continue;
    }
    const plugin = await importPlugin(entry.package, repositoryRoot);
    if (plugin.id !== entry.id) {
      throw new Error(`Embed plugin ${entry.package} id ${plugin.id} does not match registry id ${entry.id}`);
    }
    if (plugin.directiveNames.length === 0) {
      throw new Error(`Embed plugin ${plugin.id} must declare at least one directive`);
    }
    for (const directiveName of plugin.directiveNames) {
      const existing = directiveOwners.get(directiveName);
      if (existing) {
        throw new Error(`Directive ${directiveName} is registered by both ${existing} and ${plugin.id}`);
      }
      directiveOwners.set(directiveName, plugin.id);
    }
    const configuration = entry.configuration ?? {};
    plugins.push({
      plugin,
      packageName: entry.package,
      configuration,
      configurationHash: sha256Json(configuration),
    });
  }

  const registry: EmbedRegistry = {
    policy: embeds.policy,
    policyHash: sha256Json(embeds),
    plugins,
    get(directiveName: string): LoadedEmbedPlugin | undefined {
      return plugins.find((loaded) => loaded.plugin.directiveNames.includes(directiveName));
    },
  };
  return registry;
}

async function importPlugin(packageName: string, repositoryRoot: string): Promise<EmbedPlugin> {
  if (
    packageName.startsWith("http:") ||
    packageName.startsWith("https:") ||
    packageName.startsWith("git+")
  ) {
    throw new Error(`Remote plugin package is forbidden: ${packageName}`);
  }

  let moduleUrl: string;
  if (packageName.startsWith(".") || packageName.startsWith("/")) {
    moduleUrl = pathToFileURL(resolve(repositoryRoot, packageName)).href;
  } else {
    const require = createRequire(resolve(repositoryRoot, "package.json"));
    moduleUrl = pathToFileURL(require.resolve(packageName)).href;
  }

  const imported = (await import(moduleUrl)) as { default?: EmbedPlugin; plugin?: EmbedPlugin };
  const plugin = imported.plugin ?? imported.default;
  if (!plugin || typeof plugin.normalize !== "function" || typeof plugin.renderStatic !== "function") {
    throw new Error(`Module ${packageName} does not export an embed plugin`);
  }
  return plugin;
}

void dirname;
