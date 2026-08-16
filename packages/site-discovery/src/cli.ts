import { resolve } from "node:path";

import { loadProjectConfig } from "../../project-config/src/index.ts";
import { buildDiscovery } from "./build.ts";

export function buildDiscoveryCommand(
  repositoryRoot = process.cwd(),
  env: Readonly<Record<string, string | undefined>> = process.env,
): void {
  const config = loadProjectConfig({
    repositoryRoot: resolve(repositoryRoot),
    env,
    requireDeploymentInputs: true,
  });
  const manifest = buildDiscovery({ config });
  process.stdout.write(`Wrote discovery files for ${manifest.includedRoutes.length} routes\n`);
}

const executed = process.argv[1]?.includes("site-discovery/src/cli.ts") === true;
if (executed) {
  try {
    buildDiscoveryCommand();
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  }
}
