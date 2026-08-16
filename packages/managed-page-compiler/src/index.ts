import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, relative, resolve, sep } from "node:path";
import { parse } from "yaml";

import {
  parseManagedPageSourceConfig,
  parsePreviewManagedPageManifest,
  parsePublishedManagedPageManifest,
  sha256File,
  sha256Hex,
  sha256Json,
  type BuildMode,
  type PreviewManagedPageArtifact,
  type PreviewManagedPageManifestArtifact,
  type PublishedManagedPageManifestArtifact,
  type RouteClaimArtifact,
} from "../../contracts/src/index.ts";
import type { ProjectConfig } from "../../project-config/src/index.ts";

const RETURN_LABELS = {
  en: "← Back",
  ko: "← 돌아가기",
  ja: "← 戻る",
} as const;

export async function buildManagedPages(options: {
  readonly config: ProjectConfig;
  readonly mode: BuildMode;
  readonly outputDirectory?: string;
}): Promise<PreviewManagedPageManifestArtifact | PublishedManagedPageManifestArtifact> {
  const pagesRoot = resolve(options.config.repositoryRoot, "managed-pages");
  const outputDirectory =
    options.outputDirectory ?? resolve(options.config.repositoryRoot, `.artifacts/managed/${options.mode}`);
  rmSync(outputDirectory, { recursive: true, force: true });
  mkdirSync(outputDirectory, { recursive: true });

  const pages: PreviewManagedPageArtifact[] = [];
  const routes: RouteClaimArtifact[] = [];
  if (existsSync(pagesRoot)) {
    for (const entry of readdirSync(pagesRoot)) {
      const pageDirectory = resolve(pagesRoot, entry);
      if (!statSync(pageDirectory).isDirectory()) continue;
      const page = compileManagedPage(pageDirectory, options.config, options.mode, outputDirectory);
      if (options.mode === "production" && page.status !== "published") {
        continue;
      }
      pages.push(page);
      routes.push({
        route: page.route,
        ownerKind: "managed-page",
        ownerId: page.id,
        artifactPath: `pages/${page.id}/index.html`,
      });
    }
  }

  const provenance = {
    schemaVersion: 2 as const,
    buildMode: options.mode,
    producer: "@cloverhearts/managed-page-compiler",
    producerVersion: "0.0.0",
    inputHash: sha256Json(pages.map((page) => page.sourceHash)),
    configHash: options.config.hashes.configHash,
    contentRulesHash: options.config.hashes.contentRulesHash,
    localizationRulesHash: options.config.hashes.localizationRulesHash,
  };
  const manifest =
    options.mode === "preview"
      ? parsePreviewManagedPageManifest({ provenance, pages, routes })
      : parsePublishedManagedPageManifest({
          provenance,
          pages: pages.filter((page) => page.status === "published"),
          routes,
        });
  writeFileSync(resolve(outputDirectory, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
  return manifest;
}

function compileManagedPage(
  pageDirectory: string,
  config: ProjectConfig,
  mode: BuildMode,
  outputDirectory: string,
): PreviewManagedPageArtifact {
  const id = pageDirectory.split(sep).at(-1) ?? "";
  const yamlPath = resolve(pageDirectory, "page.yaml");
  const designPath = resolve(pageDirectory, "DESIGN.md");
  if (!existsSync(designPath) || designPath.split(sep).at(-1) !== "DESIGN.md") {
    throw new Error(`${id}: missing required DESIGN.md`);
  }
  const source = parseManagedPageSourceConfig(parse(readFileSync(yamlPath, "utf8")));
  if (source.id !== id) {
    throw new Error(`${id}: page.yaml id must match the directory name`);
  }
  validateEntryCompatibility(source);
  const entryPath = resolve(pageDirectory, source.entry.path);
  assertInside(pageDirectory, entryPath, `${id}: entry path escapes the page package`);
  if (!existsSync(entryPath)) {
    throw new Error(`${id}: missing entry ${source.entry.path}`);
  }
  const requested = source.security.externalOrigins;
  const allowed = config.security.managedPages.approvedExternalOrigins;
  for (const key of Object.keys(requested) as Array<keyof typeof requested>) {
    for (const origin of requested[key]) {
      if (!allowed[key].includes(origin)) {
        throw new Error(`${id}: undeclared origin ${origin} for ${key}`);
      }
    }
  }
  for (const permission of source.security.iframePermissions) {
    if (!config.security.managedPages.approvedIframePermissions.includes(permission)) {
      throw new Error(`${id}: undeclared iframe permission ${permission}`);
    }
  }

  const html = renderManagedHtml(source, readFileSync(entryPath, "utf8"), config);
  const artifactDirectory = resolve(outputDirectory, "pages", source.id);
  mkdirSync(artifactDirectory, { recursive: true });
  writeFileSync(resolve(artifactDirectory, "index.html"), html);
  const sourceHash = sha256Hex(
    `${sha256File(yamlPath)}\n${sha256File(designPath)}\n${sha256File(entryPath)}`,
  );
  return {
    id: source.id,
    route: config.normalizeRoute(source.route),
    kind: source.kind,
    language: source.language,
    ...(source.translationKey ? { translationKey: source.translationKey } : {}),
    title: source.title,
    description: source.description,
    returnTo: source.returnTo,
    robots: source.robots,
    sitemap: source.sitemap,
    entryArtifactPath: `pages/${source.id}/index.html`,
    security: {
      csp: [],
      iframePermissions: source.security.iframePermissions,
    },
    assets: [],
    sourceHash,
    alternates: [],
    status: source.status,
  };
}

function validateEntryCompatibility(source: ReturnType<typeof parseManagedPageSourceConfig>): void {
  if (source.kind === "application" && source.entry.format !== "typescript") {
    throw new Error(`${source.id}: application pages must use a typescript entry`);
  }
  if (source.kind !== "application" && source.entry.format === "markdown") {
    return;
  }
  if (source.entry.format === "typescript") {
    return;
  }
  throw new Error(`${source.id}: unsupported entry format ${source.entry.format} for ${source.kind}`);
}

function renderManagedHtml(
  source: ReturnType<typeof parseManagedPageSourceConfig>,
  entrySource: string,
  config: ProjectConfig,
): string {
  const returnHref = `${config.resolved.basePath}${source.returnTo}`;
  const body =
    source.entry.format === "markdown"
      ? `<article>${escapeHtml(entrySource).replaceAll("\n\n", "</p><p>").replace(/^/, "<p>").replace(/$/, "</p>")}</article>`
      : `<p>${escapeHtml(source.description)}</p><p>This application requires JavaScript for its interactive features. The title, description, and return link remain available.</p>`;
  return `<!doctype html>
<html lang="${source.language}">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width">
    <meta name="description" content="${escapeHtml(source.description)}">
    <meta name="robots" content="${source.robots === "index" ? "index,follow" : "noindex,follow"}">
    <title>${escapeHtml(source.title)}</title>
    <style>
      :root {
        --managed-return-background: Canvas;
        --managed-return-color: CanvasText;
        --managed-return-border: currentColor;
        --managed-return-offset-inline: max(1rem, env(safe-area-inset-left));
        --managed-return-offset-block: max(1rem, env(safe-area-inset-top));
        --managed-return-radius: 999px;
      }
      [data-managed-page-return] {
        position: fixed;
        inset-inline-start: var(--managed-return-offset-inline);
        inset-block-start: var(--managed-return-offset-block);
        z-index: 1000;
        background: var(--managed-return-background);
        color: var(--managed-return-color);
        border: 1px solid var(--managed-return-border);
        border-radius: var(--managed-return-radius);
        padding: 0.4rem 0.8rem;
      }
      @media print {
        [data-managed-page-return] { display: none; }
      }
    </style>
  </head>
  <body>
    <a data-managed-page-return href="${escapeHtml(returnHref)}">${RETURN_LABELS[source.language]}</a>
    <main>
      <h1>${escapeHtml(source.title)}</h1>
      ${body}
    </main>
  </body>
</html>
`;
}

function assertInside(root: string, candidate: string, message: string): void {
  const relativePath = relative(root, candidate);
  if (relativePath.startsWith("..") || relativePath.includes(`..${sep}`)) {
    throw new Error(message);
  }
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

void dirname;