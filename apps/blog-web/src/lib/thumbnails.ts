import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import sharp from "sharp";

import type { AssetArtifact, PreviewPostArtifact } from "../../../../packages/contracts/src/index.ts";
import type { ProjectConfig } from "../../../../packages/project-config/src/index.ts";
import type { SocialCardSet } from "./social-cards.ts";

export interface ListThumbnail {
  readonly src: string;
  readonly srcset: string;
  readonly width: 640;
  readonly height: 360;
  readonly source: "thumbnail" | "representative";
}

export async function createListThumbnail(input: {
  readonly post: PreviewPostArtifact;
  readonly config: ProjectConfig;
  readonly cards: SocialCardSet;
  readonly outputDirectory: string;
  readonly explicitAssetPath: string | undefined;
  readonly representativeLocalPath: string;
}): Promise<ListThumbnail> {
  const prefix = `_assets/thumbnails/${input.post.id.replaceAll(":", "-")}`;
  const widePath = `${prefix}-16x9.png`;
  const compactPath = `${prefix}-16x9-320.png`;
  const sourcePath = input.explicitAssetPath ?? input.representativeLocalPath;
  const fit =
    input.post.thumbnail || input.post.representativeImage !== "generated-card"
      ? "cover"
      : "contain";
  const wide = await sharp(sourcePath)
    .resize(640, 360, { fit, position: "attention", background: "#111111" })
    .png()
    .toBuffer();
  const compact = await sharp(wide).resize(320, 180, { fit: "fill" }).png().toBuffer();
  writeBinary(resolve(input.outputDirectory, widePath), wide);
  writeBinary(resolve(input.outputDirectory, compactPath), compact);
  const wideUrl = `${input.config.resolved.basePath}/${widePath}`.replace(/\/{2,}/gu, "/");
  const compactUrl = `${input.config.resolved.basePath}/${compactPath}`.replace(/\/{2,}/gu, "/");
  void input.cards;
  return {
    src: wideUrl.startsWith("/") ? wideUrl : `/${wideUrl}`,
    srcset: `${compactUrl.startsWith("/") ? compactUrl : `/${compactUrl}`} 320w, ${wideUrl.startsWith("/") ? wideUrl : `/${wideUrl}`} 640w`,
    width: 640,
    height: 360,
    source: input.explicitAssetPath ? "thumbnail" : "representative",
  };
}

export function resolveContentAssetFile(
  contentDirectory: string,
  assets: readonly AssetArtifact[],
  assetId: string | undefined,
): string | undefined {
  if (!assetId) return undefined;
  const record = assets.find((asset) => asset.id === assetId);
  if (!record) return undefined;
  return resolve(contentDirectory, record.artifactPath);
}

function writeBinary(path: string, bytes: Buffer): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, bytes);
}
