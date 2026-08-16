import { resolve } from "node:path";

import { loadProjectConfig } from "../../project-config/src/index.ts";
import { compileContent } from "./compile.ts";

export async function buildContentCommand(
  repositoryRoot = process.cwd(),
  mode: "preview" | "production" = "production",
  env: Readonly<Record<string, string | undefined>> = process.env,
): Promise<void> {
  const config = loadProjectConfig({ repositoryRoot: resolve(repositoryRoot), env });
  const result = await compileContent({ config, mode });
  process.stdout.write(
    `Wrote ${result.posts.length} post artifact${result.posts.length === 1 ? "" : "s"} to ${result.outputDirectory}\n`,
  );
}

const executed = process.argv[1]?.includes("content-compiler/src/cli.ts") === true;
if (executed) {
  const mode = process.argv.includes("--preview") ? "preview" : "production";
  buildContentCommand(process.cwd(), mode).catch((error: unknown) => {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  });
}
