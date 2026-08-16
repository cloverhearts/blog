import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { join, relative, resolve } from "node:path";

import {
  parsePublishedDiscoveryManifest,
  parsePublishedManagedPageManifest,
  parsePublishedSearchManifest,
  parsePublishedWebManifest,
  parseReleaseManifest,
  sha256Json,
  type ReleaseManifestArtifact,
  type RouteClaimArtifact,
} from "../../contracts/src/index.ts";
import type { ProjectConfig } from "../../project-config/src/index.ts";

export function assembleRelease(options: {
  readonly config: ProjectConfig;
  readonly webDirectory?: string;
  readonly searchDirectory?: string;
  readonly managedDirectory?: string;
  readonly discoveryDirectory?: string;
  readonly outputDirectory?: string;
}): ReleaseManifestArtifact {
  const webDirectory = options.webDirectory ?? resolve(options.config.repositoryRoot, ".artifacts/web/production");
  const searchDirectory =
    options.searchDirectory ?? resolve(options.config.repositoryRoot, ".artifacts/search/production");
  const managedDirectory =
    options.managedDirectory ?? resolve(options.config.repositoryRoot, ".artifacts/managed/production");
  const discoveryDirectory =
    options.discoveryDirectory ?? resolve(options.config.repositoryRoot, ".artifacts/discovery/production");
  const outputDirectory = options.outputDirectory ?? resolve(options.config.repositoryRoot, "dist");

  const web = parsePublishedWebManifest(JSON.parse(readFileSync(resolve(webDirectory, "manifest.json"), "utf8")));
  const search = parsePublishedSearchManifest(
    JSON.parse(readFileSync(resolve(searchDirectory, "manifest.json"), "utf8")),
  );
  const managed = parsePublishedManagedPageManifest(
    JSON.parse(readFileSync(resolve(managedDirectory, "manifest.json"), "utf8")),
  );
  const discovery = parsePublishedDiscoveryManifest(
    JSON.parse(readFileSync(resolve(discoveryDirectory, "manifest.json"), "utf8")),
  );

  if (web.provenance.buildMode !== "production" || search.provenance.buildMode !== "production") {
    throw new Error("Release assembly accepts production artifacts only");
  }
  if (search.webInputHash !== web.provenance.inputHash) {
    throw new Error("Search artifact does not match the web artifact");
  }
  if (discovery.webInputHash !== web.provenance.inputHash) {
    throw new Error("Discovery artifact does not match the web artifact");
  }
  if (discovery.contentInputHash !== web.contentInputHash) {
    throw new Error("Discovery artifact does not match the content artifact");
  }

  rmSync(outputDirectory, { recursive: true, force: true });
  mkdirSync(outputDirectory, { recursive: true });
  cpSync(resolve(webDirectory, "site"), outputDirectory, { recursive: true });
  if (existsSync(resolve(searchDirectory, "index"))) {
    cpSync(resolve(searchDirectory, "index"), resolve(outputDirectory, "_assets/search"), { recursive: true });
  }
  if (existsSync(resolve(discoveryDirectory, "site"))) {
    cpSync(resolve(discoveryDirectory, "site"), outputDirectory, { recursive: true });
  }
  for (const page of managed.pages) {
    const from = resolve(managedDirectory, page.entryArtifactPath);
    const to = resolve(outputDirectory, routeToPath(page.route));
    mkdirSync(resolve(to, ".."), { recursive: true });
    cpSync(from, to);
  }

  const files = listFiles(outputDirectory).map((path) => `/${relative(outputDirectory, path).split("\\").join("/")}`);
  assertNoSourceLeaks(outputDirectory, files);
  const routes: RouteClaimArtifact[] = [
    ...web.routes,
    ...discovery.routes,
    ...managed.routes,
  ];
  assertUniqueRoutes(routes);
  if (!files.includes("/index.html") || !files.includes("/404.html")) {
    throw new Error("Release is missing index.html or 404.html");
  }

  const manifest = parseReleaseManifest({
    provenance: {
      schemaVersion: 2,
      buildMode: "production",
      producer: "@cloverhearts/release-assembler",
      producerVersion: "0.0.0",
      inputHash: sha256Json({
        web: web.provenance.inputHash,
        search: search.provenance.inputHash,
        managed: managed.provenance.inputHash,
        discovery: discovery.provenance.inputHash,
      }),
      configHash: options.config.hashes.configHash,
      contentRulesHash: options.config.hashes.contentRulesHash,
      localizationRulesHash: options.config.hashes.localizationRulesHash,
    },
    webInputHash: web.provenance.inputHash,
    searchInputHash: search.provenance.inputHash,
    managedPageInputHash: managed.provenance.inputHash,
    discoveryInputHash: discovery.provenance.inputHash,
    routes,
    files,
  });
  mkdirSync(resolve(options.config.repositoryRoot, ".artifacts/release/production"), { recursive: true });
  writeFileSync(
    resolve(options.config.repositoryRoot, ".artifacts/release/production/manifest.json"),
    `${JSON.stringify(manifest, null, 2)}\n`,
  );
  writeFileSync(
    resolve(options.config.repositoryRoot, ".artifacts/release/production/diagnostic.md"),
    `# Release diagnostic\n\n- files: ${files.length}\n- routes: ${routes.length}\n`,
  );
  return manifest;
}

export function verifyPages(
  config: ProjectConfig,
  distDirectory = resolve(config.repositoryRoot, "dist"),
): void {
  const files = listFiles(distDirectory);
  const relativeFiles = files.map((path) => relative(distDirectory, path));
  if (!relativeFiles.includes("index.html") || !relativeFiles.includes("404.html")) {
    throw new Error("Pages verification failed: missing index.html or 404.html");
  }
  const totalBytes = files.reduce((sum, path) => sum + statSync(path).size, 0);
  if (totalBytes > config.performanceBudgets.publishedSiteMiB * 1024 * 1024) {
    throw new Error("Pages verification failed: published site exceeds the size budget");
  }
  for (const file of relativeFiles) {
    if (file.includes("docs/") || file.endsWith(".md") || file.includes(".artifacts")) {
      throw new Error(`Pages verification failed: source leak ${file}`);
    }
    if (file.includes("draft")) {
      throw new Error(`Pages verification failed: draft leak ${file}`);
    }
  }
}

function routeToPath(route: string): string {
  if (route === "/") return "index.html";
  return `${route.replace(/^\//u, "").replace(/\/$/u, "")}/index.html`;
}

function listFiles(directory: string): string[] {
  const found: string[] = [];
  for (const entry of readdirSync(directory)) {
    const path = join(directory, entry);
    if (statSync(path).isDirectory()) found.push(...listFiles(path));
    else found.push(path);
  }
  return found;
}

function assertNoSourceLeaks(outputDirectory: string, files: readonly string[]): void {
  for (const file of files) {
    if (file.includes("/docs/") || file.endsWith(".map")) {
      throw new Error(`Release contains a forbidden file: ${file}`);
    }
  }
  void outputDirectory;
}

function assertUniqueRoutes(routes: readonly RouteClaimArtifact[]): void {
  const seen = new Map<string, string>();
  for (const route of routes) {
    const existing = seen.get(route.route);
    if (existing && existing !== route.ownerId) {
      throw new Error(`Release route collision: ${route.route}`);
    }
    seen.set(route.route, route.ownerId);
  }
}
