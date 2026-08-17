import { createServer } from "node:http";
import { cpSync, existsSync, readFileSync, statSync } from "node:fs";
import { extname, resolve } from "node:path";

import { buildWeb } from "../apps/blog-web/src/build.ts";
import { compileContent } from "../packages/content-compiler/src/compile.ts";
import { loadProjectConfig } from "../packages/project-config/src/index.ts";
import { buildSearch } from "../packages/search-indexer/src/index.ts";

const types: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".wasm": "application/wasm",
  ".pagefind": "application/octet-stream",
};

export async function startPreview(repositoryRoot = process.cwd()): Promise<void> {
  const config = loadProjectConfig({
    repositoryRoot: resolve(repositoryRoot),
    env: process.env,
  });
  await compileContent({ config, mode: "preview" });
  await buildWeb({ config, mode: "preview" });
  await buildSearch({ config, mode: "preview" });
  const root = resolve(repositoryRoot, ".artifacts/web/preview/site");
  const searchIndex = resolve(repositoryRoot, ".artifacts/search/preview/index");
  if (existsSync(searchIndex)) {
    cpSync(searchIndex, resolve(root, "_assets/search"), { recursive: true });
  }
  const server = createServer((request, response) => {
    const url = new URL(request.url ?? "/", "http://127.0.0.1");
    const pathname = decodeURIComponent(url.pathname);
    const candidates = [
      resolve(root, pathname.slice(1), "index.html"),
      resolve(root, pathname.slice(1)),
    ];
    const file = candidates.find((candidate) => {
      try {
        return statSync(candidate).isFile();
      } catch {
        return false;
      }
    });
    if (!file) {
      try {
        const fallback = readFileSync(resolve(root, "404.html"));
        response.writeHead(404, { "content-type": "text/html; charset=utf-8" });
        response.end(fallback);
      } catch {
        response.writeHead(404);
        response.end("Not found");
      }
      return;
    }
    response.writeHead(200, { "content-type": types[extname(file)] ?? "application/octet-stream" });
    response.end(readFileSync(file));
  });
  const port = Number(process.env.PORT ?? 4321);
  server.listen(port, () => {
    process.stdout.write(`Preview server listening on http://127.0.0.1:${port}\n`);
  });
}

const executed = process.argv[1]?.includes("scripts/dev.ts") === true;
if (executed) {
  startPreview().catch((error: unknown) => {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  });
}
