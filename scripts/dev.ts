import { createServer, type ServerResponse } from "node:http";
import {
  cpSync,
  existsSync,
  readFileSync,
  rmSync,
  statSync,
  watch,
  type FSWatcher,
} from "node:fs";
import { extname, resolve } from "node:path";

import { buildWeb } from "../apps/blog-web/src/build.ts";
import { compileContent } from "../packages/content-compiler/src/compile.ts";
import { loadProjectConfig } from "../packages/project-config/src/index.ts";
import { buildSearch } from "../packages/search-indexer/src/index.ts";

const LIVE_RELOAD_ENDPOINT = "/__preview/live-reload";
const LIVE_RELOAD_MARKER = "data-preview-live-reload";
const REBUILD_DEBOUNCE_MS = 120;

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

export type PreviewRebuildScope = "web" | "full";

export function classifyPreviewChange(path: string): PreviewRebuildScope | null {
  const normalized = path.replaceAll("\\", "/").replace(/^\.\//u, "");
  if (
    normalized.length === 0 ||
    [".artifacts/", ".git/", ".od/", "dist/", "node_modules/", "outputs/"].some(
      (prefix) => normalized.startsWith(prefix),
    )
  ) {
    return null;
  }

  if (
    normalized === "DESIGN.md" ||
    normalized.startsWith("apps/blog-web/") ||
    normalized.startsWith("packages/search-indexer/")
  ) {
    return "web";
  }

  if (
    [
      "assets/content/",
      "config/",
      "docs/",
      "packages/content-compiler/",
      "packages/contracts/",
      "packages/embed-core/",
      "packages/project-config/",
      "plugins/embeds/",
    ].some((prefix) => normalized.startsWith(prefix))
  ) {
    return "full";
  }

  return null;
}

export function injectPreviewLiveReload(html: string): string {
  if (html.includes(LIVE_RELOAD_MARKER)) {
    return html;
  }
  const script = `<script ${LIVE_RELOAD_MARKER}>
(() => {
  const events = new EventSource(${JSON.stringify(LIVE_RELOAD_ENDPOINT)});
  events.addEventListener("reload", () => window.location.reload());
})();
</script>`;
  return html.includes("</body>")
    ? html.replace("</body>", `${script}</body>`)
    : `${html}${script}`;
}

function copyPreviewSearchIndex(repositoryRoot: string): void {
  const root = resolve(repositoryRoot, ".artifacts/web/preview/site");
  const searchIndex = resolve(repositoryRoot, ".artifacts/search/preview/index");
  const destination = resolve(root, "_assets/search");
  rmSync(destination, { force: true, recursive: true });
  if (existsSync(searchIndex)) {
    cpSync(searchIndex, destination, { recursive: true });
  }
}

async function rebuildPreview(
  repositoryRoot: string,
  scope: PreviewRebuildScope,
): Promise<void> {
  const config = loadProjectConfig({
    repositoryRoot: resolve(repositoryRoot),
    env: process.env,
  });
  if (scope === "full") {
    await compileContent({ config, mode: "preview" });
  }
  await buildWeb({ config, mode: "preview" });
  await buildSearch({ config, mode: "preview" });
  copyPreviewSearchIndex(repositoryRoot);
}

function sendReload(clients: Set<ServerResponse>, revision: number): void {
  for (const client of clients) {
    try {
      client.write(`event: reload\ndata: ${revision}\n\n`);
    } catch {
      clients.delete(client);
    }
  }
}

export async function startPreview(repositoryRoot = process.cwd()): Promise<void> {
  await rebuildPreview(repositoryRoot, "full");
  const root = resolve(repositoryRoot, ".artifacts/web/preview/site");
  const clients = new Set<ServerResponse>();
  let revision = 0;
  let watcher: FSWatcher | undefined;
  let debounceTimer: NodeJS.Timeout | undefined;
  let rebuilding = false;
  let pendingScope: PreviewRebuildScope | null = null;
  let pendingPath = "";

  const server = createServer((request, response) => {
    const url = new URL(request.url ?? "/", "http://127.0.0.1");
    const pathname = decodeURIComponent(url.pathname);
    if (pathname === LIVE_RELOAD_ENDPOINT) {
      response.writeHead(200, {
        "cache-control": "no-cache, no-transform",
        connection: "keep-alive",
        "content-type": "text/event-stream; charset=utf-8",
      });
      response.write(": connected\n\n");
      clients.add(response);
      request.on("close", () => clients.delete(response));
      return;
    }

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
        const fallback = injectPreviewLiveReload(
          readFileSync(resolve(root, "404.html"), "utf8"),
        );
        response.writeHead(404, {
          "cache-control": "no-store",
          "content-type": "text/html; charset=utf-8",
        });
        response.end(fallback);
      } catch {
        response.writeHead(404);
        response.end("Not found");
      }
      return;
    }

    const contentType = types[extname(file)] ?? "application/octet-stream";
    response.writeHead(200, {
      "cache-control": "no-store",
      "content-type": contentType,
    });
    if (extname(file) === ".html") {
      response.end(injectPreviewLiveReload(readFileSync(file, "utf8")));
      return;
    }
    response.end(readFileSync(file));
  });

  const flushRebuild = async (): Promise<void> => {
    if (rebuilding || pendingScope === null) {
      return;
    }
    const scope = pendingScope;
    const changedPath = pendingPath;
    pendingScope = null;
    pendingPath = "";
    rebuilding = true;
    process.stdout.write(`[preview] Rebuilding ${scope} after ${changedPath}\n`);
    try {
      await rebuildPreview(repositoryRoot, scope);
      revision += 1;
      sendReload(clients, revision);
      process.stdout.write(`[preview] Updated revision ${revision}\n`);
    } catch (error: unknown) {
      process.stderr.write(
        `[preview] Rebuild failed: ${error instanceof Error ? error.message : String(error)}\n`,
      );
    } finally {
      rebuilding = false;
      if (pendingScope !== null) {
        debounceTimer = setTimeout(() => void flushRebuild(), REBUILD_DEBOUNCE_MS);
      }
    }
  };

  const scheduleRebuild = (scope: PreviewRebuildScope, changedPath: string): void => {
    pendingScope = pendingScope === "full" || scope === "full" ? "full" : "web";
    pendingPath = changedPath;
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    debounceTimer = setTimeout(() => void flushRebuild(), REBUILD_DEBOUNCE_MS);
  };

  watcher = watch(repositoryRoot, { recursive: true }, (_event, filename) => {
    if (!filename) {
      return;
    }
    const changedPath = filename.toString().replaceAll("\\", "/");
    const scope = classifyPreviewChange(changedPath);
    if (scope) {
      scheduleRebuild(scope, changedPath);
    }
  });
  watcher.on("error", (error) => {
    process.stderr.write(`[preview] File watcher failed: ${error.message}\n`);
  });

  const port = Number(process.env.PORT ?? 4321);
  await new Promise<void>((resolveListening, rejectListening) => {
    server.once("error", rejectListening);
    server.listen(port, "127.0.0.1", () => {
      server.off("error", rejectListening);
      resolveListening();
    });
  });
  process.stdout.write(`Preview server listening on http://127.0.0.1:${port}\n`);

  const close = (): void => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    watcher?.close();
    for (const client of clients) {
      client.end();
    }
    server.close();
  };
  process.once("SIGINT", close);
  process.once("SIGTERM", close);
}

const executed = process.argv[1]?.includes("scripts/dev.ts") === true;
if (executed) {
  startPreview().catch((error: unknown) => {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  });
}
