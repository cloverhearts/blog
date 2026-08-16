import { resolve } from "node:path";

import { buildWeb } from "../apps/blog-web/src/build.ts";
import { compileContent } from "../packages/content-compiler/src/compile.ts";
import { buildManagedPages } from "../packages/managed-page-compiler/src/index.ts";
import { loadProjectConfig } from "../packages/project-config/src/index.ts";
import { assembleRelease, verifyPages } from "../packages/release-assembler/src/index.ts";
import { buildSearch } from "../packages/search-indexer/src/index.ts";
import { buildDiscovery } from "../packages/site-discovery/src/build.ts";

export async function buildProduction(
  repositoryRoot = process.cwd(),
  env: Readonly<Record<string, string | undefined>> = process.env,
): Promise<void> {
  const config = loadProjectConfig({
    repositoryRoot: resolve(repositoryRoot),
    env,
    requireDeploymentInputs: true,
  });
  await compileContent({ config, mode: "production" });
  await buildWeb({ config, mode: "production" });
  await buildSearch({ config, mode: "production" });
  await buildManagedPages({ config, mode: "production" });
  buildDiscovery({ config });
  assembleRelease({ config });
  verifyPages(config);
}

const executed = process.argv[1]?.includes("scripts/build.ts") === true;
if (executed) {
  buildProduction().catch((error: unknown) => {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  });
}
