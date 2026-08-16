import { resolve } from "node:path";

import { loadProjectConfig } from "../../project-config/src/index.ts";
import { buildManagedPages } from "./index.ts";

export async function buildManagedCommand(
  repositoryRoot = process.cwd(),
  mode: "preview" | "production" = "production",
  env: Readonly<Record<string, string | undefined>> = process.env,
): Promise<void> {
  const config = loadProjectConfig({ repositoryRoot: resolve(repositoryRoot), env });
  const manifest = await buildManagedPages({ config, mode });
  process.stdout.write(`Wrote ${manifest.pages.length} managed page${manifest.pages.length === 1 ? "" : "s"}\n`);
}

const executed = process.argv[1]?.includes("managed-page-compiler/src/cli.ts") === true;
if (executed) {
  const mode = process.argv.includes("--preview") ? "preview" : "production";
  buildManagedCommand(process.cwd(), mode).catch((error: unknown) => {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  });
}
