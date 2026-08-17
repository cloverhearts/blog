import { toString } from "mdast-util-to-string";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";
import remarkDirective from "remark-directive";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";

import type { ExternalEmbedArtifact, HeadingArtifact } from "../../contracts/src/index.ts";
import { sha256Hex } from "../../contracts/src/index.ts";
import type { EmbedRegistry } from "../../embed-core/src/index.ts";
import { executeEmbedDirective } from "../../embed-core/src/index.ts";
import type { ProjectConfig } from "../../project-config/src/index.ts";
import { parseAssetReference, resolveContentAsset, type ResolvedAsset } from "./assets.ts";
import { buildHeadingArtifacts, type ParsedHeadingInput } from "./heading-anchors.ts";

interface MdNode {
  type: string;
  value?: string;
  lang?: string;
  depth?: number;
  url?: string;
  alt?: string | null;
  title?: string | null;
  name?: string;
  attributes?: Record<string, string | null | undefined>;
  children?: MdNode[];
  position?: { start: { line: number } };
  data?: { hName?: string; hProperties?: Record<string, unknown> };
}

export interface CompiledMarkdown {
  readonly bodyHtml: string;
  readonly headings: readonly HeadingArtifact[];
  readonly assets: readonly ResolvedAsset[];
  readonly embeds: readonly ExternalEmbedArtifact[];
  readonly excerpt: string;
  readonly readingMinutes: number;
}

const sanitizeSchema = {
  ...defaultSchema,
  clobber: [],
  clobberPrefix: "",
  tagNames: [
    ...(defaultSchema.tagNames ?? []),
    "video",
    "source",
    "figure",
    "figcaption",
  ],
  attributes: {
    ...defaultSchema.attributes,
    h1: [...(defaultSchema.attributes?.h1 ?? []), "id"],
    h2: [...(defaultSchema.attributes?.h2 ?? []), "id"],
    h3: [...(defaultSchema.attributes?.h3 ?? []), "id"],
    h4: [...(defaultSchema.attributes?.h4 ?? []), "id"],
    h5: [...(defaultSchema.attributes?.h5 ?? []), "id"],
    h6: [...(defaultSchema.attributes?.h6 ?? []), "id"],
    video: ["controls", "preload", "poster", "title"],
    source: ["src", "type"],
    img: [...(defaultSchema.attributes?.img ?? []), "width", "height", "loading", "decoding"],
    a: [...(defaultSchema.attributes?.a ?? []), "hreflang", "rel"],
    figure: ["dataEmbedId", "dataEmbedPlugin"],
  },
};

export async function compileMarkdown(input: {
  readonly body: string;
  readonly description: string;
  readonly sourcePath: string;
  readonly postId: string;
  readonly language: string;
  readonly assetsRoot: string;
  readonly config: ProjectConfig;
  readonly registry: EmbedRegistry;
  readonly assetCache: Map<string, ResolvedAsset>;
  readonly buildMode: "preview" | "production";
}): Promise<CompiledMarkdown> {
  const tree = unified().use(remarkParse).use(remarkGfm).use(remarkDirective).parse(input.body) as MdNode;
  const headingInputs: ParsedHeadingInput[] = [];
  const assets: ResolvedAsset[] = [];
  const embeds: ExternalEmbedArtifact[] = [];
  const usedAssetIds = new Set<string>();
  const headingIds = new Set<string>();

  const rememberAsset = (logical: string): ResolvedAsset => {
    const resolved = resolveContentAsset(logical, input.assetsRoot, input.config, input.assetCache);
    if (!usedAssetIds.has(resolved.artifact.id)) {
      usedAssetIds.add(resolved.artifact.id);
      assets.push(resolved);
    }
    return resolved;
  };

  await walk(tree, async (node, parent) => {
    if (node.type === "heading" && node.depth && node.depth >= 2 && node.depth <= 6) {
      const raw = toString(node);
      const explicit = /\{#([a-z][a-z0-9]*(?:-[a-z0-9]+)*)\}\s*$/u.exec(raw);
      const text = raw.replace(/\s*\{#[a-z][a-z0-9]*(?:-[a-z0-9]+)*\}\s*$/u, "").trim();
      headingInputs.push({
        depth: node.depth as 2 | 3 | 4 | 5 | 6,
        text,
        ...(explicit?.[1] ? { explicitId: explicit[1] } : {}),
      });
      if (explicit && node.children) {
        const last = node.children.at(-1);
        if (last?.type === "text" && last.value) {
          last.value = last.value.replace(/\s*\{#[a-z][a-z0-9]*(?:-[a-z0-9]+)*\}\s*$/u, "");
        }
      }
    }

    if (node.type === "code" && (!node.lang || node.lang.trim().length === 0)) {
      throw new Error(`${input.sourcePath}: fenced code blocks must declare a language`);
    }

    if (node.type === "image" && node.url) {
      if (node.url.startsWith("asset:/")) {
        const resolved = rememberAsset(parseAssetReference(node.url, input.sourcePath));
        node.url = `artifact:${resolved.artifact.artifactPath}`;
        node.data = {
          hProperties: {
            src: `artifact:${resolved.artifact.artifactPath}`,
            alt: node.alt ?? "",
            ...(resolved.artifact.width ? { width: resolved.artifact.width } : {}),
            ...(resolved.artifact.height ? { height: resolved.artifact.height } : {}),
          },
        };
      } else if (node.url.startsWith("http://")) {
        throw new Error(`${input.sourcePath}: remote images must use HTTPS`);
      }
    }

    if (node.type === "link" && node.url?.startsWith("#")) {
      headingIds.add(node.url.slice(1));
    }

    if (
      (node.type === "leafDirective" || node.type === "textDirective" || node.type === "containerDirective") &&
      node.name
    ) {
      if (node.name === "video") {
        const src = node.attributes?.src;
        const title = node.attributes?.title;
        if (!src || !title) {
          throw new Error(`${input.sourcePath}: ::video requires src and title`);
        }
        const resolved = rememberAsset(parseAssetReference(src, input.sourcePath));
        let posterAttribute = "";
        if (node.attributes?.poster) {
          const poster = rememberAsset(parseAssetReference(node.attributes.poster, input.sourcePath));
          posterAttribute = ` poster="artifact:${poster.artifact.artifactPath}"`;
        }
        replaceWithHtml(
          parent,
          node,
          `<figure><video controls preload="metadata" title="${escapeHtml(title)}"${posterAttribute}><source src="artifact:${resolved.artifact.artifactPath}" type="${resolved.artifact.mediaType}"></video><figcaption>${escapeHtml(title)}</figcaption></figure>`,
        );
        return;
      }

      const executed = await executeEmbedDirective(
        input.registry,
        {
          name: node.name,
          attributes: Object.fromEntries(
            Object.entries(node.attributes ?? {}).flatMap(([key, value]) =>
              typeof value === "string" ? [[key, value]] : [],
            ),
          ),
          sourcePath: input.sourcePath,
          sourceLine: node.position?.start.line ?? 1,
        },
        {
          buildMode: input.buildMode,
          language: input.language,
          timezone: input.config.site.timezone,
          configuration: {},
        },
      );
      const embedId = `${input.postId}:${executed.pluginId}:${executed.outputHash.slice(0, 12)}`;
      embeds.push({
        id: embedId,
        postId: input.postId,
        pluginId: executed.pluginId,
        pluginVersion: executed.pluginVersion,
        directiveName: executed.directiveName,
        provider: executed.normalized.provider,
        kind: executed.normalized.kind,
        title: executed.normalized.title,
        canonicalUrl: executed.normalized.canonicalUrl,
        fallbackText: executed.normalized.fallbackText,
        searchableText: executed.rendered.searchableText,
        clientMode: executed.rendered.clientMode,
        privacyMode: executed.rendered.privacyMode,
        security: executed.rendered.security,
        outputHash: executed.outputHash,
      });
      replaceWithHtml(
        parent,
        node,
        `<figure data-embed-id="${escapeHtml(embedId)}" data-embed-plugin="${escapeHtml(executed.pluginId)}">${executed.rendered.staticHtml}<p><a href="${escapeHtml(executed.normalized.canonicalUrl)}">${escapeHtml(executed.normalized.title)}</a></p></figure>`,
      );
    }
  });

  const headings = buildHeadingArtifacts(headingInputs);
  let headingIndex = 0;
  await walk(tree, async (node) => {
    if (node.type === "heading" && node.depth && node.depth >= 2 && node.depth <= 6) {
      const heading = headings[headingIndex];
      headingIndex += 1;
      if (heading) {
        node.data = {
          ...node.data,
          hProperties: { ...node.data?.hProperties, id: heading.id },
        };
      }
    }
  });

  const authoredFragments = collectFragments(tree);
  for (const fragment of authoredFragments) {
    if (!headings.some((heading) => heading.id === fragment)) {
      throw new Error(`${input.sourcePath}: unresolved heading fragment #${fragment}`);
    }
  }

  const file = await unified()
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeSanitize, sanitizeSchema)
    .use(rehypeStringify)
    .run(tree as never);
  const bodyHtml = String(await unified().use(rehypeStringify).stringify(file as never));
  if (/<script\b|on[a-z]+\s*=/iu.test(bodyHtml)) {
    throw new Error(`${input.sourcePath}: sanitized HTML still contains executable markup`);
  }
  for (const heading of headings) {
    const matches = bodyHtml.match(new RegExp(`id="${escapeRegExp(heading.id)}"`, "gu")) ?? [];
    if (matches.length !== 1) {
      throw new Error(`${input.sourcePath}: heading ${heading.id} is missing or duplicated in HTML`);
    }
  }

  const excerpt = excerptFrom(input.body, input.description);
  const readingMinutes = Math.max(1, Math.round(toString(tree).length / 500));
  void sha256Hex;
  return { bodyHtml, headings, assets, embeds, excerpt, readingMinutes };
}

async function walk(
  node: MdNode,
  visitor: (node: MdNode, parent: MdNode | undefined) => Promise<void>,
  parent?: MdNode,
): Promise<void> {
  await visitor(node, parent);
  for (const child of node.children ?? []) {
    await walk(child, visitor, node);
  }
}

function replaceWithHtml(parent: MdNode | undefined, node: MdNode, html: string): void {
  if (!parent?.children) {
    throw new Error("Cannot replace a root markdown node");
  }
  const index = parent.children.indexOf(node);
  parent.children[index] = { type: "html", value: html };
}

function collectFragments(node: MdNode): readonly string[] {
  const fragments: string[] = [];
  const visit = (current: MdNode): void => {
    if (current.type === "link" && current.url?.startsWith("#")) {
      fragments.push(current.url.slice(1));
    }
    current.children?.forEach(visit);
  };
  visit(node);
  return fragments;
}

export function excerptFrom(body: string, description: string): string {
  for (const block of body.split(/\n{2,}/u)) {
    const trimmed = block.trim();
    if (trimmed.length === 0 || isNonProseBlock(trimmed)) {
      continue;
    }
    const text = trimmed
      .replace(/^#{1,6}\s+/gmu, "")
      .replace(/!\[[^\]]*\]\([^)]*\)/gu, "")
      .replace(/\[([^\]]+)\]\([^)]*\)/gu, "$1")
      .replace(/[`*_>]/gu, "")
      .trim();
    if (text.length === 0) {
      continue;
    }
    return text.length <= 180 ? text : `${text.slice(0, 177).trimEnd()}...`;
  }
  return description;
}

function isNonProseBlock(block: string): boolean {
  if (/^#{1,6}\s+\S[^\n]*$/u.test(block)) return true;
  if (/^!\[[^\]]*\]\([^)]+\)\s*$/u.test(block)) return true;
  if (/^::[a-z][\w-]*/u.test(block)) return true;
  if (/^<(img|video|figure|iframe)\b/iu.test(block)) return true;
  if (/^\[[^\]]+\]\([^)]+\)\s*$/u.test(block)) return true;
  return false;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
}
