import { resolve } from "node:path";

import { loadProjectConfig } from "../../project-config/src/index.ts";
import { buildSearch } from "./index.ts";

export async function buildSearchCommand(
  repositoryRoot = process.cwd(),
  mode: "preview" | "production" = "production",
  env: Readonly<Record<string, string | undefined>> = process.env,
): Promise<void> {
  const config = loadProjectConfig({ repositoryRoot: resolve(repositoryRoot), env });
  const manifest = await buildSearch({ config, mode });
  process.stdout.write(`Wrote search indexes with ${manifest.files.length} files\n`);
}

const executed = process.argv[1]?.includes("search-indexer/src/cli.ts") === true;
if (executed) {
  const mode = process.argv.includes("--preview") ? "preview" : "production";
  buildSearchCommand(process.cwd(), mode).catch((error: unknown) => {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  });
}
