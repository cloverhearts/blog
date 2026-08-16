import { resolve } from "node:path";

import { loadProjectConfig } from "../../../packages/project-config/src/index.ts";
import { buildWeb } from "./build.ts";

export async function buildWebCommand(
  repositoryRoot = process.cwd(),
  mode: "preview" | "production" = "production",
  env: Readonly<Record<string, string | undefined>> = process.env,
): Promise<void> {
  const config = loadProjectConfig({
    repositoryRoot: resolve(repositoryRoot),
    env,
    requireDeploymentInputs: mode === "production",
  });
  const manifest = await buildWeb({ config, mode });
  process.stdout.write(`Wrote ${manifest.files.length} web files for ${mode}\n`);
}

const executed = process.argv[1]?.includes("blog-web/src/cli.ts") === true;
if (executed) {
  const mode = process.argv.includes("--preview") ? "preview" : "production";
  buildWebCommand(process.cwd(), mode).catch((error: unknown) => {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  });
}
