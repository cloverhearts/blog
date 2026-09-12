import { existsSync, mkdirSync, readdirSync, readFileSync, realpathSync, rmSync, statSync, writeFileSync } from "node:fs";
import { isAbsolute, relative, resolve, sep } from "node:path";
import { parse } from "yaml";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";

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
  const availableRoutes = new Set<string>();
  if (existsSync(pagesRoot)) {
    for (const entry of readdirSync(pagesRoot)) {
      const yaml = resolve(pagesRoot, entry, "page.yaml");
      if (!existsSync(yaml)) continue;
      const source = parseManagedPageSourceConfig(parse(readFileSync(yaml, "utf8")));
      if (options.mode === "preview" || source.status === "published") availableRoutes.add(source.route);
    }
    for (const entry of readdirSync(pagesRoot)) {
      const pageDirectory = resolve(pagesRoot, entry);
      if (!statSync(pageDirectory).isDirectory()) continue;
      const page = compileManagedPage(pageDirectory, options.config, options.mode, outputDirectory, availableRoutes);
      if (options.mode === "production" && page.status !== "published") {
        rmSync(resolve(outputDirectory, "pages", page.id), { recursive: true, force: true });
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
  availableRoutes: ReadonlySet<string>,
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
  assertInside(realpathSync(pageDirectory), realpathSync(entryPath), `${id}: entry symlink escapes the page package`);
  const stylesheetPath = source.entry.stylesheet ? resolve(pageDirectory, source.entry.stylesheet) : undefined;
  let stylesheet = "";
  if (stylesheetPath) {
    assertInside(pageDirectory, stylesheetPath, `${id}: stylesheet path escapes the page package`);
    assertInside(realpathSync(pageDirectory), realpathSync(stylesheetPath), `${id}: stylesheet symlink escapes the page package`);
    stylesheet = readFileSync(stylesheetPath, "utf8");
    validateManagedStylesheet(stylesheet);
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

  const html = renderManagedHtml(source, readFileSync(entryPath, "utf8"), config, stylesheet, availableRoutes);
  const artifactDirectory = resolve(outputDirectory, "pages", source.id);
  mkdirSync(artifactDirectory, { recursive: true });
  writeFileSync(resolve(artifactDirectory, "index.html"), html);
  const sourceHash = sha256Hex(
    `${sha256File(yamlPath)}\n${sha256File(designPath)}\n${sha256File(entryPath)}${stylesheetPath ? `\n${sha256File(stylesheetPath)}` : ""}`,
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

function profileJsonLd(
  source: ReturnType<typeof parseManagedPageSourceConfig>,
  config: ProjectConfig,
): string {
  const owner = config.site.identity.owner;
  if (!Object.values(owner.profileRoutes).includes(source.route)) {
    return "";
  }
  const language = source.language;
  const profileUrl = config.resolvePublicUrl(owner.profileRoutes[language]);
  const sameAs = owner.contacts.filter((contact) => contact.kind !== "email").map((contact) => contact.href);
  return `<script type="application/ld+json">${JSON.stringify({
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    url: profileUrl,
    name: source.title,
    description: source.description,
    mainEntity: {
      "@type": "Person",
      "@id": `${profileUrl}#person`,
      name: owner.displayName,
      url: profileUrl,
      description: owner.shortBios[language],
      ...(sameAs.length > 0 ? { sameAs } : {}),
    },
  }).replaceAll("<", "\\u003c")}</script>`;
}

function profileAlternateLinks(
  source: ReturnType<typeof parseManagedPageSourceConfig>,
  config: ProjectConfig,
  availableRoutes: ReadonlySet<string>,
): string {
  const owner = config.site.identity.owner;
  if (!Object.values(owner.profileRoutes).includes(source.route)) {
    return `    <link rel="canonical" href="${escapeHtml(config.resolvePublicUrl(source.route))}">`;
  }
  const links = (["ko", "en", "ja"] as const)
    .filter((language) => availableRoutes.has(owner.profileRoutes[language]))
    .map(
      (language) =>
        `    <link rel="alternate" hreflang="${language}" href="${escapeHtml(config.resolvePublicUrl(owner.profileRoutes[language]))}">`,
    )
    .join("\n");
  return `    <link rel="canonical" href="${escapeHtml(config.resolvePublicUrl(source.route))}">\n${links}${availableRoutes.has(owner.profileRoutes.ko) ? `\n    <link rel="alternate" hreflang="x-default" href="${escapeHtml(config.resolvePublicUrl(owner.profileRoutes.ko))}">` : ""}`;
}

export function validateManagedStylesheet(css: string): void {
  // This adapter supports only local, network-free styles. Escaped identifiers
  // are deliberately unsupported so origin restrictions cannot be disguised.
  const normalized = css.replace(/\/\*[\s\S]*?\*\//gu, "");
  if (/[<\\]/u.test(css) || /@\s*(?:import|namespace)|url\s*\(|image-set\s*\(/iu.test(normalized)) {
    throw new Error("Managed stylesheet must not contain markup, escapes, imports or network/resource URLs");
  }
}

export function renderManagedMarkdown(markdown: string, basePath: string): string {
  const schema = { ...defaultSchema, tagNames: defaultSchema.tagNames?.filter((tag) => !["img", "input"].includes(tag)) };
  const html = String(unified().use(remarkParse).use(remarkGfm).use(remarkRehype)
    .use(rehypeSanitize, schema).use(rehypeStringify).processSync(markdown));
  return html.replace(/href="\/(?!\/)([^"]*)"/gu, (_match, path: string) => `href="${basePath}/${path}"`);
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
  stylesheet: string,
  availableRoutes: ReadonlySet<string>,
): string {
  const returnHref = `${config.resolved.basePath}${source.returnTo}`;
  const body =
    source.entry.format === "markdown"
      ? `<article>${renderManagedMarkdown(entrySource, config.resolved.basePath)}</article>`
      : `<p>${escapeHtml(source.description)}</p><p>This application requires JavaScript for its interactive features. The title, description, and return link remain available.</p>`;
  return `<!doctype html>
<html lang="${source.language}">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width">
    <meta name="description" content="${escapeHtml(source.description)}">
    <meta name="robots" content="${source.robots === "index" ? "index,follow" : "noindex,follow"}">
    <title>${escapeHtml(source.title)}</title>
${profileAlternateLinks(source, config, availableRoutes)}
    ${profileJsonLd(source, config)}
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
    ${stylesheet ? `<style data-managed-page-style>${stylesheet}</style>` : ""}
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
  if (relativePath === ".." || relativePath.startsWith(`..${sep}`) || isAbsolute(relativePath)) {
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
