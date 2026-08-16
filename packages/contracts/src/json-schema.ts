import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";

import { contractJsonSchemaSources } from "./schemas.ts";

export function generateContractJsonSchemas(
  outputDirectory = defaultJsonSchemaDirectory(),
): readonly string[] {
  mkdirSync(outputDirectory, { recursive: true });
  return Object.entries(contractJsonSchemaSources).map(([name, schema]) => {
    const outputPath = resolve(outputDirectory, `${name}.schema.json`);
    writeFileSync(outputPath, `${JSON.stringify(z.toJSONSchema(schema), null, 2)}\n`);
    return outputPath;
  });
}

function defaultJsonSchemaDirectory(): string {
  return resolve(dirname(fileURLToPath(import.meta.url)), "../json-schema");
}
