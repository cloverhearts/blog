import { mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { createIndex } from "pagefind";

import {
  parsePreviewContentManifest,
  parsePublishedContentManifest,
  parsePreviewWebManifest,
  parsePublishedWebManifest,
  sha256Json,
  type BuildMode,
  type SearchManifestArtifact,
  type SupportedLanguage,
} from "../../contracts/src/index.ts";
import type { ProjectConfig } from "../../project-config/src/index.ts";

export async function buildSearch(options: {
  readonly config: ProjectConfig;
  readonly mode: BuildMode;
  readonly webDirectory?: string;
  readonly contentDirectory?: string;
  readonly outputDirectory?: string;
}): Promise<SearchManifestArtifact<BuildMode>> {
  const contentDirectory =
    options.contentDirectory ?? resolve(options.config.repositoryRoot, `.artifacts/content/${options.mode}`);
  const webDirectory =
    options.webDirectory ?? resolve(options.config.repositoryRoot, `.artifacts/web/${options.mode}`);
  const outputDirectory =
    options.outputDirectory ?? resolve(options.config.repositoryRoot, `.artifacts/search/${options.mode}`);
  const content = options.mode === "preview"
    ? parsePreviewContentManifest(JSON.parse(readFileSync(resolve(contentDirectory, "manifest.json"), "utf8")))
    : parsePublishedContentManifest(JSON.parse(readFileSync(resolve(contentDirectory, "manifest.json"), "utf8")));
  const web = options.mode === "preview"
    ? parsePreviewWebManifest(JSON.parse(readFileSync(resolve(webDirectory, "manifest.json"), "utf8")))
    : parsePublishedWebManifest(JSON.parse(readFileSync(resolve(webDirectory, "manifest.json"), "utf8")));

  if (web.contentInputHash !== content.provenance.inputHash) {
    throw new Error("Search indexer refused a stale web artifact");
  }

  rmSync(outputDirectory, { recursive: true, force: true });
  mkdirSync(resolve(outputDirectory, "index"), { recursive: true });

  const indexedPostIdsByLanguage: Record<SupportedLanguage, string[]> = { en: [], ko: [], ja: [] };
  const eligible = content.searchDocuments.filter((document) => document.eligible);
  const siteDirectory = resolve(webDirectory, "site");

  for (const language of ["ko", "en", "ja"] as const) {
    const languageDocs = eligible.filter((document) => document.language === language);
    const created = await createIndex({
      forceLanguage: language,
      includeCharacters: "+#.",
      keepIndexUrl: false,
      writePlayground: false,
    });
    if (!created.index) {
      throw new Error(`Pagefind failed to create the ${language} index: ${created.errors.join("; ")}`);
    }
    for (const document of languageDocs) {
      const htmlPath = resolve(siteDirectory, routeToPath(document.route));
      const html = readFileSync(htmlPath, "utf8");
      await created.index.addHTMLFile({
        url: document.route,
        content: html,
      });
      indexedPostIdsByLanguage[language].push(document.postId);
    }
    const languageDirectory = resolve(outputDirectory, "index", language);
    mkdirSync(languageDirectory, { recursive: true });
    await created.index.writeFiles({ outputPath: languageDirectory });
  }

  const files = listFiles(resolve(outputDirectory, "index")).map((path) => relative(outputDirectory, path));
  const manifest = {
    provenance: {
      schemaVersion: 2 as const,
      buildMode: options.mode,
      producer: "@cloverhearts/search-indexer",
      producerVersion: "0.0.0",
      inputHash: sha256Json({ web: web.provenance.inputHash, files }),
      configHash: options.config.hashes.configHash,
      contentRulesHash: options.config.hashes.contentRulesHash,
      localizationRulesHash: options.config.hashes.localizationRulesHash,
    },
    webInputHash: web.provenance.inputHash,
    indexedPostIdsByLanguage,
    files,
  };
  writeFileSync(resolve(outputDirectory, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
  return manifest;
}

function routeToPath(route: string): string {
  if (route === "/") return "index.html";
  return `${route.replace(/^\//u, "").replace(/\/$/u, "")}/index.html`;
}

function listFiles(directory: string): string[] {
  const found: string[] = [];
  for (const entry of readdirSync(directory)) {
    const path = join(directory, entry);
    if (statSync(path).isDirectory()) {
      found.push(...listFiles(path));
    } else {
      found.push(path);
    }
  }
  return found;
}
