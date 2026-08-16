import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

import {
  parsePublishedContentManifest,
  parsePublishedManagedPageManifest,
  parsePublishedWebManifest,
  sha256Json,
  type DiscoveryManifestArtifact,
} from "../../contracts/src/index.ts";
import type { ProjectConfig } from "../../project-config/src/index.ts";
import { renderLlmsTxt, renderRobotsTxt } from "./ai-discovery.ts";

export function buildDiscovery(options: {
  readonly config: ProjectConfig;
  readonly contentDirectory?: string;
  readonly webDirectory?: string;
  readonly managedDirectory?: string;
  readonly outputDirectory?: string;
}): DiscoveryManifestArtifact<"production"> {
  const contentDirectory =
    options.contentDirectory ?? resolve(options.config.repositoryRoot, ".artifacts/content/production");
  const webDirectory =
    options.webDirectory ?? resolve(options.config.repositoryRoot, ".artifacts/web/production");
  const managedDirectory =
    options.managedDirectory ?? resolve(options.config.repositoryRoot, ".artifacts/managed/production");
  const outputDirectory =
    options.outputDirectory ?? resolve(options.config.repositoryRoot, ".artifacts/discovery/production");

  const content = parsePublishedContentManifest(
    JSON.parse(readFileSync(resolve(contentDirectory, "manifest.json"), "utf8")),
  );
  const web = parsePublishedWebManifest(JSON.parse(readFileSync(resolve(webDirectory, "manifest.json"), "utf8")));
  const managed = parsePublishedManagedPageManifest(
    JSON.parse(readFileSync(resolve(managedDirectory, "manifest.json"), "utf8")),
  );
  if (web.contentInputHash !== content.provenance.inputHash) {
    throw new Error("Discovery refused a stale web artifact");
  }
  if (
    web.provenance.configHash !== options.config.hashes.configHash ||
    content.provenance.configHash !== options.config.hashes.configHash
  ) {
    throw new Error("Discovery refused mixed configuration hashes");
  }

  const includedRoutes = [
    ...web.routes
      .filter((route) => route.ownerKind !== "system" || !route.route.includes("search") && !route.route.includes("404"))
      .map((route) => route.route)
      .filter((route) => !route.includes("/search/") && route !== "/404.html" && !route.endsWith("/404/")),
    ...managed.pages.filter((page) => page.robots === "index" && page.sitemap).map((page) => page.route),
  ].filter((route, index, all) => all.indexOf(route) === index);

  const siteDirectory = resolve(outputDirectory, "site");
  rmSync(outputDirectory, { recursive: true, force: true });
  mkdirSync(siteDirectory, { recursive: true });
  mkdirSync(resolve(siteDirectory, "en"), { recursive: true });
  mkdirSync(resolve(siteDirectory, "ja"), { recursive: true });

  const sitemap = renderSitemap(options.config, content, includedRoutes);
  const robots = renderRobotsTxt({
    defaultAccess: options.config.aiCrawlers.defaultAccess,
    crawlers: options.config.aiCrawlers.crawlers,
    sitemapUrl: options.config.resolvePublicUrl(options.config.routes.paths.sitemap),
    llmsUrl: options.config.resolvePublicUrl(options.config.routes.paths.llms),
  });
  const llms = renderLlmsTxt({
    siteName: options.config.site.identity.name,
    summary: options.config.site.identity.descriptions.en,
    dataUse: options.config.aiCrawlers.dataUse,
    sections: [
      {
        heading: "Languages",
        links: [
          { label: "Korean home", url: options.config.resolvePublicUrl("/") },
          { label: "English home", url: options.config.resolvePublicUrl("/en/") },
          { label: "Japanese home", url: options.config.resolvePublicUrl("/ja/") },
        ],
      },
      {
        heading: "Discovery",
        links: [
          { label: "Sitemap", url: options.config.resolvePublicUrl(options.config.routes.paths.sitemap) },
          { label: "Korean feed", url: options.config.resolvePublicUrl(options.config.routes.paths.rss) },
          { label: "English feed", url: options.config.resolvePublicUrl(`/en${options.config.routes.paths.rss}`) },
          { label: "Japanese feed", url: options.config.resolvePublicUrl(`/ja${options.config.routes.paths.rss}`) },
        ],
      },
    ],
    guidance: options.config.aiCrawlers.llms.guidance,
  });

  writeFileSync(resolve(siteDirectory, "robots.txt"), robots);
  writeFileSync(resolve(siteDirectory, "llms.txt"), llms);
  writeFileSync(resolve(siteDirectory, "sitemap.xml"), sitemap);
  writeFileSync(resolve(siteDirectory, "rss.xml"), renderRss(options.config, content, "ko"));
  writeFileSync(resolve(siteDirectory, "en/rss.xml"), renderRss(options.config, content, "en"));
  writeFileSync(resolve(siteDirectory, "ja/rss.xml"), renderRss(options.config, content, "ja"));

  const files = [
    "site/robots.txt",
    "site/llms.txt",
    "site/sitemap.xml",
    "site/rss.xml",
    "site/en/rss.xml",
    "site/ja/rss.xml",
  ];
  const manifest = {
    provenance: {
      schemaVersion: 3 as const,
      buildMode: "production" as const,
      producer: "@cloverhearts/site-discovery",
      producerVersion: "0.0.0",
      inputHash: sha256Json({
        content: content.provenance.inputHash,
        web: web.provenance.inputHash,
        managed: managed.provenance.inputHash,
      }),
      configHash: options.config.hashes.configHash,
      contentRulesHash: options.config.hashes.contentRulesHash,
      localizationRulesHash: options.config.hashes.localizationRulesHash,
    },
    contentInputHash: content.provenance.inputHash,
    webInputHash: web.provenance.inputHash,
    managedPageInputHash: managed.provenance.inputHash,
    crawlerPolicyHash: sha256Json(options.config.aiCrawlers),
    includedRoutes,
    robotsRoute: "/robots.txt",
    llmsRoute: options.config.routes.paths.llms,
    sitemapRoute: options.config.routes.paths.sitemap,
    feedRoutesByLanguage: {
      ko: options.config.routes.paths.rss,
      en: `/en${options.config.routes.paths.rss}`,
      ja: `/ja${options.config.routes.paths.rss}`,
    },
    routes: [
      { route: "/robots.txt", ownerKind: "system" as const, ownerId: "robots", artifactPath: "site/robots.txt" },
      { route: options.config.routes.paths.llms, ownerKind: "system" as const, ownerId: "llms", artifactPath: "site/llms.txt" },
      { route: options.config.routes.paths.sitemap, ownerKind: "system" as const, ownerId: "sitemap", artifactPath: "site/sitemap.xml" },
      { route: options.config.routes.paths.rss, ownerKind: "system" as const, ownerId: "rss-ko", artifactPath: "site/rss.xml" },
      { route: `/en${options.config.routes.paths.rss}`, ownerKind: "system" as const, ownerId: "rss-en", artifactPath: "site/en/rss.xml" },
      { route: `/ja${options.config.routes.paths.rss}`, ownerKind: "system" as const, ownerId: "rss-ja", artifactPath: "site/ja/rss.xml" },
    ],
    files,
  };
  writeFileSync(resolve(outputDirectory, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
  return manifest;
}

function renderSitemap(
  config: ProjectConfig,
  content: ReturnType<typeof parsePublishedContentManifest>,
  routes: readonly string[],
): string {
  const urls = routes
    .filter((route) => !route.endsWith(".xml") && !route.endsWith(".txt") && !route.endsWith(".html"))
    .map((route) => {
      const post = content.posts.find((entry) => entry.route === route);
      const lastmod = post?.updatedAt ?? post?.createdAt;
      return `  <url><loc>${escapeXml(config.resolvePublicUrl(route))}</loc>${lastmod ? `<lastmod>${escapeXml(lastmod)}</lastmod>` : ""}</url>`;
    })
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

function renderRss(
  config: ProjectConfig,
  content: ReturnType<typeof parsePublishedContentManifest>,
  language: "en" | "ko" | "ja",
): string {
  const items = content.posts
    .filter((post) => post.language === language)
    .sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt))
    .map(
      (post) => `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${escapeXml(config.resolvePublicUrl(post.route))}</link>
      <guid>${escapeXml(config.resolvePublicUrl(post.route))}</guid>
      <pubDate>${new Date(post.createdAt).toUTCString()}</pubDate>
      <description>${escapeXml(post.description)}</description>
    </item>`,
    )
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(config.site.identity.name)}</title>
    <link>${escapeXml(config.resolvePublicUrl(language === "ko" ? "/" : `/${language}/`))}</link>
    <description>${escapeXml(config.site.identity.descriptions[language])}</description>
    <language>${language}</language>
${items}
  </channel>
</rss>
`;
}

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
