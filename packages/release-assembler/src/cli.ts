import { resolve } from "node:path";

import { loadProjectConfig } from "../../project-config/src/index.ts";
import { assembleRelease, verifyPages } from "./index.ts";

export function buildReleaseCommand(
  repositoryRoot = process.cwd(),
  env: Readonly<Record<string, string | undefined>> = process.env,
): void {
  const config = loadProjectConfig({
    repositoryRoot: resolve(repositoryRoot),
    env,
    requireDeploymentInputs: true,
  });
  const manifest = assembleRelease({ config });
  process.stdout.write(`Assembled ${manifest.files.length} release files\n`);
}

export function verifyPagesCommand(
  repositoryRoot = process.cwd(),
  env: Readonly<Record<string, string | undefined>> = process.env,
): void {
  const config = loadProjectConfig({
    repositoryRoot: resolve(repositoryRoot),
    env,
    requireDeploymentInputs: true,
  });
  verifyPages(config);
  process.stdout.write("GitHub Pages verification passed\n");
}

const executed = process.argv[1]?.includes("release-assembler/src/cli.ts") === true;
if (executed) {
  try {
    if (process.argv.includes("--verify")) {
      verifyPagesCommand();
    } else {
      buildReleaseCommand();
    }
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  }
}
