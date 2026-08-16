import { existsSync, readFileSync, statSync } from "node:fs";
import { extname, relative, resolve, sep } from "node:path";

import type { AssetArtifact } from "../../contracts/src/index.ts";
import { sha256Hex } from "../../contracts/src/index.ts";
import type { ProjectConfig } from "../../project-config/src/index.ts";

const IMAGE_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg"]);
const VIDEO_EXTENSIONS = new Set([".mp4", ".webm"]);
const AUDIO_EXTENSIONS = new Set([".mp3", ".ogg", ".wav"]);

export interface ResolvedAsset {
  readonly artifact: AssetArtifact;
  readonly absolutePath: string;
  readonly bytes: Buffer;
}

export function parseAssetReference(value: string, sourcePath: string): string {
  if (!value.startsWith("asset:/")) {
    throw new Error(`${sourcePath}: expected an asset: reference, received ${value}`);
  }
  const logical = value.slice("asset:/".length);
  if (
    logical.length === 0 ||
    logical.includes("\\") ||
    logical.split("/").some((part) => part === "" || part === "." || part === "..")
  ) {
    throw new Error(`${sourcePath}: asset reference escapes the content asset root: ${value}`);
  }
  return logical;
}

export function resolveContentAsset(
  logicalPath: string,
  assetsRoot: string,
  config: ProjectConfig,
  cache: Map<string, ResolvedAsset>,
): ResolvedAsset {
  const existing = cache.get(logicalPath);
  if (existing) {
    return existing;
  }
  const absolutePath = resolve(assetsRoot, logicalPath);
  const relativePath = relative(assetsRoot, absolutePath);
  if (relativePath.startsWith("..") || relativePath.includes(`..${sep}`)) {
    throw new Error(`Asset path escapes assets/content/: ${logicalPath}`);
  }
  if (!existsSync(absolutePath)) {
    throw new Error(`Missing content asset: ${logicalPath}`);
  }
  const bytes = readFileSync(absolutePath);
  const stats = statSync(absolutePath);
  if (stats.size > config.performanceBudgets.largestPublishedFileMiB * 1024 * 1024) {
    throw new Error(`Asset exceeds the published file budget: ${logicalPath}`);
  }
  const extension = extname(logicalPath).toLowerCase();
  const kind = extensionKind(extension);
  if (kind === "image" && stats.size > config.performanceBudgets.images.sourceFileMiB * 1024 * 1024) {
    throw new Error(`Image exceeds the source size budget: ${logicalPath}`);
  }
  const hash = sha256Hex(bytes);
  const artifact: AssetArtifact = {
    id: `asset:${hash.slice(0, 16)}:${logicalPath}`,
    logicalPath: `asset:/${logicalPath}`,
    artifactPath: `assets/${hash}${extension}`,
    kind,
    mediaType: mediaTypeFor(extension),
    hash,
    bytes: stats.size,
  };
  const resolved = { artifact, absolutePath, bytes };
  cache.set(logicalPath, resolved);
  return resolved;
}

function extensionKind(extension: string): AssetArtifact["kind"] {
  if (IMAGE_EXTENSIONS.has(extension)) return "image";
  if (VIDEO_EXTENSIONS.has(extension)) return "video";
  if (AUDIO_EXTENSIONS.has(extension)) return "audio";
  return "download";
}

function mediaTypeFor(extension: string): string {
  switch (extension) {
    case ".png":
      return "image/png";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".webp":
      return "image/webp";
    case ".gif":
      return "image/gif";
    case ".svg":
      return "image/svg+xml";
    case ".mp4":
      return "video/mp4";
    case ".webm":
      return "video/webm";
    case ".mp3":
      return "audio/mpeg";
    case ".ogg":
      return "audio/ogg";
    case ".wav":
      return "audio/wav";
    default:
      return "application/octet-stream";
  }
}
