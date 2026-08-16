import { resolve } from "node:path";

import { generateContractJsonSchemas } from "../../contracts/src/json-schema.ts";
import { loadProjectConfig } from "./load.ts";

export function validateConfigCommand(
  repositoryRoot = process.cwd(),
  env: Readonly<Record<string, string | undefined>> = process.env,
): void {
  const config = loadProjectConfig({ repositoryRoot: resolve(repositoryRoot), env });
  generateContractJsonSchemas(resolve(repositoryRoot, "packages/contracts/json-schema"));
  process.stdout.write(
    `Validated configuration for ${config.site.identity.name} (${config.resolved.origin}${config.resolved.basePath || ""})\n`,
  );
}

const executed = process.argv[1]?.includes("project-config/src/cli.ts") === true;
if (executed) {
  try {
    validateConfigCommand();
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  }
}
