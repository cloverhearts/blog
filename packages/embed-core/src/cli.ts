import { resolve } from "node:path";

import { loadProjectConfig } from "../../project-config/src/index.ts";
import { loadEmbedRegistry } from "./registry.ts";

export async function validateEmbedsCommand(
  repositoryRoot = process.cwd(),
  env: Readonly<Record<string, string | undefined>> = process.env,
): Promise<void> {
  const config = loadProjectConfig({ repositoryRoot: resolve(repositoryRoot), env });
  const registry = await loadEmbedRegistry(config.embeds, config.repositoryRoot);
  process.stdout.write(
    `Validated embed registry (${registry.plugins.length} enabled plugin${registry.plugins.length === 1 ? "" : "s"})\n`,
  );
}

const executed = process.argv[1]?.includes("embed-core/src/cli.ts") === true;
if (executed) {
  validateEmbedsCommand().catch((error: unknown) => {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  });
}
