import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

import {
  parsePreviewContentManifest,
  parsePublishedContentManifest,
  sha256Hex,
  sha256Json,
  type BuildMode,
  type CategoryArtifact,
  type PreviewContentManifestArtifact,
  type PreviewPostArtifact,
  type PreviewPostSummaryArtifact,
  type PublishedContentManifestArtifact,
  type RouteClaimArtifact,
  type SearchDocumentMetadataArtifact,
  type TagArtifact,
} from "../../contracts/src/index.ts";
import { loadEmbedRegistry } from "../../embed-core/src/index.ts";
import type { ProjectConfig } from "../../project-config/src/index.ts";
import { resolveContentAsset, type ResolvedAsset } from "./assets.ts";
import { discoverPosts, type DiscoveredPost } from "./discover.ts";
import { compileMarkdown } from "./markdown.ts";
import { deriveRelatedPostIds } from "./related.ts";
import { resolvePublishedTranslationLanguages } from "./translation-publication.ts";

export interface CompileContentOptions {
  readonly config: ProjectConfig;
  readonly mode: BuildMode;
  readonly outputRoot?: string;
}

export interface CompiledContent {
  readonly manifest: PreviewContentManifestArtifact | PublishedContentManifestArtifact;
  readonly posts: readonly PreviewPostArtifact[];
  readonly outputDirectory: string;
}

export async function compileContent(options: CompileContentOptions): Promise<CompiledContent> {
  const { config, mode } = options;
  const docsRoot = resolve(config.repositoryRoot, "docs");
  const assetsRoot = resolve(config.repositoryRoot, "assets/content");
  const outputDirectory = options.outputRoot ?? resolve(config.repositoryRoot, `.artifacts/content/${mode}`);
  const discovered = discoverPosts(docsRoot);
  const registry = await loadEmbedRegistry(config.embeds, config.repositoryRoot);
  const assetCache = new Map<string, ResolvedAsset>();
  const compiledPosts: PreviewPostArtifact[] = [];
  const sourceHashes: string[] = [];
  const assetBag = new Map<string, ResolvedAsset>();
  const embedBag: import("../../contracts/src/index.ts").ExternalEmbedArtifact[] = [];

  const groups = new Map<string, DiscoveredPost[]>();
  for (const post of discovered) {
    const current = groups.get(post.frontmatter.translationKey) ?? [];
    current.push(post);
    groups.set(post.frontmatter.translationKey, current);
  }

  for (const [translationKey, variants] of groups) {
    const invariantErrors = validateGroupInvariants(variants);
    if (invariantErrors.length > 0) {
      throw new Error(invariantErrors.join("\n"));
    }
    resolvePublishedTranslationLanguages(
      variants.map((variant) => ({
        language: variant.language,
        originalLanguage: variant.frontmatter.originalLanguage,
        translationStatus: variant.frontmatter.translationStatus,
        draft: variant.frontmatter.draft,
      })),
    );
    if (mode === "production") {
      for (const variant of variants) {
        if (!variant.frontmatter.draft && variant.frontmatter.translationStatus === "ai-draft") {
          throw new Error(`${variant.sourcePath}: production rejects ai-draft translations`);
        }
      }
    }
    void translationKey;
  }

  for (const post of discovered) {
    if (mode === "production" && post.frontmatter.draft) {
      continue;
    }
    const unknownTags = post.frontmatter.tags.filter((tag) => !(tag in config.taxonomy.tags));
    if (unknownTags.length > 0 && Object.keys(config.taxonomy.tags).length > 0) {
      throw new Error(`${post.sourcePath}: unknown tags ${unknownTags.join(", ")}`);
    }
    if (!(post.category in config.taxonomy.categories) && Object.keys(config.taxonomy.categories).length > 0) {
      throw new Error(`${post.sourcePath}: unknown category ${post.category}`);
    }
    if (post.frontmatter.translationStatus === "source" && post.language !== post.frontmatter.originalLanguage) {
      throw new Error(`${post.sourcePath}: source translationStatus must match originalLanguage`);
    }
    if (post.frontmatter.translationStatus !== "source" && post.language === post.frontmatter.originalLanguage) {
      throw new Error(`${post.sourcePath}: original language variant must use translationStatus source`);
    }

    const postId = `${post.language}:${post.frontmatter.translationKey}`;
    const compiled = await compileMarkdown({
      body: post.body,
      description: post.frontmatter.description,
      sourcePath: post.sourcePath,
      postId,
      language: post.language,
      assetsRoot,
      config,
      registry,
      assetCache,
      buildMode: mode,
    });
    const cover = post.frontmatter.cover
      ? rememberImage(post.frontmatter.cover.src, post.frontmatter.cover.alt, assetsRoot, config, assetCache, assetBag)
      : undefined;
    const socialImage = post.frontmatter.socialImage
      ? rememberImage(
          post.frontmatter.socialImage.src,
          post.frontmatter.socialImage.alt,
          assetsRoot,
          config,
          assetCache,
          assetBag,
        )
      : undefined;
    const thumbnail = post.frontmatter.thumbnail
      ? rememberImage(
          post.frontmatter.thumbnail.src,
          post.frontmatter.thumbnail.alt,
          assetsRoot,
          config,
          assetCache,
          assetBag,
        )
      : undefined;

    const route = config.localizeRoute(post.language, `${config.routes.paths.posts}${post.frontmatter.slug}/`);
    const sourceHash = sha256Hex(post.source);
    sourceHashes.push(sourceHash);
    compiledPosts.push({
      id: postId,
      translationKey: post.frontmatter.translationKey,
      language: post.language,
      originalLanguage: post.frontmatter.originalLanguage,
      translationStatus: post.frontmatter.translationStatus,
      authorshipDisclosure: config.authorshipDisclosure,
      slug: post.frontmatter.slug,
      route,
      category: post.category,
      title: post.frontmatter.title,
      description: post.frontmatter.description,
      tags: post.frontmatter.tags,
      createdAt: post.frontmatter.createdAt,
      ...(post.frontmatter.updatedAt ? { updatedAt: post.frontmatter.updatedAt } : {}),
      excerpt: compiled.excerpt,
      readingMinutes: compiled.readingMinutes,
      representativeImage: post.frontmatter.representativeImage,
      ...(cover ? { cover } : {}),
      ...(socialImage ? { socialImage } : {}),
      ...(thumbnail ? { thumbnail } : {}),
      alternates: [],
      status: post.frontmatter.draft ? "draft" : "published",
      bodyHtml: compiled.bodyHtml,
      headings: [...compiled.headings],
      assetIds: compiled.assets.map((asset) => asset.artifact.id),
      embedIds: compiled.embeds.map((embed) => embed.id),
      manualRelatedSlugs: post.frontmatter.related ?? [],
      sourceHash,
    });
    for (const embed of compiled.embeds) {
      embedBag.push(embed);
    }
    for (const asset of compiled.assets) {
      if (!assetBag.has(asset.artifact.id)) {
        assetBag.set(asset.artifact.id, asset);
      }
    }
  }

  const publishedByGroup = new Map<string, PreviewPostArtifact[]>();
  for (const post of compiledPosts) {
    const include = mode === "preview" || post.status === "published";
    if (!include) continue;
    const current = publishedByGroup.get(post.translationKey) ?? [];
    current.push(post);
    publishedByGroup.set(post.translationKey, current);
  }
  for (const post of compiledPosts) {
    const siblings = (publishedByGroup.get(post.translationKey) ?? []).filter(
      (variant) => mode === "preview" || variant.status === "published",
    );
    post.alternates.splice(
      0,
      post.alternates.length,
      ...siblings.map((variant) => ({
        language: variant.language,
        ownerId: variant.id,
        route: variant.route,
      })),
    );
  }

  const summaries: PreviewPostSummaryArtifact[] = compiledPosts.map(toSummary);
  const relatedPostIds = deriveRelatedPostIds(
    summaries,
    Object.fromEntries(compiledPosts.map((post) => [post.id, post.manualRelatedSlugs])),
    config.site.relatedPosts.maxItems,
  );
  const categories = buildTaxonomy(summaries, config, "category");
  const tags = buildTaxonomy(summaries, config, "tag");
  const searchDocuments: SearchDocumentMetadataArtifact[] = summaries.map((post) => ({
    postId: post.id,
    language: post.language,
    originalLanguage: post.originalLanguage,
    route: post.route,
    title: post.title,
    description: post.description,
    category: post.category,
    tags: post.tags,
    eligible:
      config.site.search.includePosts &&
      (mode === "preview" || post.status === "published"),
  }));
  const routes: RouteClaimArtifact[] = summaries.map((post) => ({
    route: post.route,
    ownerKind: "post" as const,
    ownerId: post.id,
    artifactPath: `posts/${post.id.replaceAll(":", "/")}.json`,
  }));

  const inputHash = sha256Json({
    sources: sourceHashes,
    assets: [...assetBag.values()].map((asset) => asset.artifact.hash).sort(),
    embeds: embedBag.map((embed) => embed.outputHash).sort(),
    mode,
  });
  const manifestBase = {
    languages: ["ko", "en", "ja"] as const,
    posts: summaries,
    categories,
    tags,
    relatedPostIds,
    searchDocuments,
    assets: [...assetBag.values()].map((asset) => asset.artifact),
    embeds: embedBag,
    usedEmbedPlugins: registry.plugins.map((plugin) => ({
      id: plugin.plugin.id,
      version: plugin.plugin.version,
      configurationHash: plugin.configurationHash,
    })),
    embedPolicyHash: registry.policyHash,
    routes,
  };

  const provenance = {
    schemaVersion: 7 as const,
    buildMode: mode,
    producer: "@cloverhearts/content-compiler",
    producerVersion: "0.0.0",
    inputHash,
    configHash: config.hashes.configHash,
    contentRulesHash: config.hashes.contentRulesHash,
    localizationRulesHash: config.hashes.localizationRulesHash,
  };

  mkdirSync(resolve(outputDirectory, "posts"), { recursive: true });
  mkdirSync(resolve(outputDirectory, "assets"), { recursive: true });
  for (const asset of assetBag.values()) {
    writeFileSync(resolve(outputDirectory, asset.artifact.artifactPath), asset.bytes);
  }
  for (const post of compiledPosts) {
    const postPath = resolve(outputDirectory, `posts/${post.id.replaceAll(":", "/")}.json`);
    mkdirSync(dirname(postPath), { recursive: true });
    writeFileSync(postPath, `${JSON.stringify(post, null, 2)}\n`);
  }

  let manifest: PreviewContentManifestArtifact | PublishedContentManifestArtifact;
  if (mode === "preview") {
    manifest = parsePreviewContentManifest({ provenance, ...manifestBase });
  } else {
    if (summaries.some((post) => post.status !== "published")) {
      throw new Error("Production content artifacts cannot contain draft posts");
    }
    manifest = parsePublishedContentManifest({ provenance, ...manifestBase });
  }
  writeFileSync(resolve(outputDirectory, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
  return { manifest, posts: compiledPosts, outputDirectory };
}

function toSummary(post: PreviewPostArtifact): PreviewPostSummaryArtifact {
  const {
    bodyHtml: _bodyHtml,
    headings: _headings,
    assetIds: _assetIds,
    embedIds: _embedIds,
    manualRelatedSlugs: _manualRelatedSlugs,
    sourceHash: _sourceHash,
    ...summary
  } = post;
  return summary;
}

function rememberImage(
  src: string,
  alt: string,
  assetsRoot: string,
  config: ProjectConfig,
  cache: Map<string, ResolvedAsset>,
  assetBag: Map<string, ResolvedAsset>,
) {
  const logical = src.startsWith("asset:/") ? src.slice("asset:/".length) : src;
  const resolved = resolveContentAsset(logical, assetsRoot, config, cache);
  if (!assetBag.has(resolved.artifact.id)) {
    assetBag.set(resolved.artifact.id, resolved);
  }
  return { assetId: resolved.artifact.id, alt };
}

function validateGroupInvariants(variants: readonly DiscoveredPost[]): readonly string[] {
  const first = variants[0];
  if (!first) return ["A translation group must contain an authored original"];
  const issues: string[] = [];
  for (const variant of variants) {
    if (variant.frontmatter.translationKey !== first.frontmatter.translationKey) {
      issues.push(`${variant.sourcePath}: translationKey mismatch`);
    }
    if (variant.frontmatter.originalLanguage !== first.frontmatter.originalLanguage) {
      issues.push(`${variant.sourcePath}: originalLanguage mismatch`);
    }
    if (variant.frontmatter.slug !== first.frontmatter.slug) {
      issues.push(`${variant.sourcePath}: slug mismatch`);
    }
    if (variant.category !== first.category) {
      issues.push(`${variant.sourcePath}: category mismatch`);
    }
    if (variant.filename !== first.filename) {
      issues.push(`${variant.sourcePath}: filename mismatch`);
    }
    if (variant.frontmatter.createdAt !== first.frontmatter.createdAt) {
      issues.push(`${variant.sourcePath}: createdAt mismatch`);
    }
    if (variant.frontmatter.updatedAt !== first.frontmatter.updatedAt) {
      issues.push(`${variant.sourcePath}: updatedAt mismatch`);
    }
    if (variant.frontmatter.representativeImage !== first.frontmatter.representativeImage) {
      issues.push(`${variant.sourcePath}: representativeImage mismatch`);
    }
    if ((variant.frontmatter.related ?? []).join(",") !== (first.frontmatter.related ?? []).join(",")) {
      issues.push(`${variant.sourcePath}: related mismatch`);
    }
    if (variant.frontmatter.tags.join(",") !== first.frontmatter.tags.join(",")) {
      issues.push(`${variant.sourcePath}: tags mismatch`);
    }
  }
  return issues;
}

function buildTaxonomy(
  posts: readonly PreviewPostSummaryArtifact[],
  config: ProjectConfig,
  kind: "category" | "tag",
): readonly CategoryArtifact[] | readonly TagArtifact[] {
  const records: Array<CategoryArtifact | TagArtifact> = [];
  for (const language of ["ko", "en", "ja"] as const) {
    const buckets = new Map<string, string[]>();
    for (const post of posts) {
      if (post.language !== language) continue;
      const ids = kind === "category" ? [post.category] : post.tags;
      for (const id of ids) {
        const current = buckets.get(id) ?? [];
        current.push(post.id);
        buckets.set(id, current);
      }
    }
    for (const [id, postIds] of [...buckets.entries()].sort(([left], [right]) => left.localeCompare(right, "en"))) {
      const labels =
        kind === "category" ? config.taxonomy.categories[id]?.labels : config.taxonomy.tags[id]?.labels;
      records.push({
        id,
        language,
        label: labels?.[language] ?? id,
        postIds,
      });
    }
  }
  return records;
}
