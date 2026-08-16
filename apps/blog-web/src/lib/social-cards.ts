import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import sharp from "sharp";

import type { PreviewPostArtifact } from "../../../../packages/contracts/src/index.ts";
import type { ProjectConfig } from "../../../../packages/project-config/src/index.ts";
import { selectPostOpenGraphImage, type OpenGraphImageInput } from "../seo/open-graph.ts";

export interface SocialCardSet {
  readonly og: OpenGraphImageInput;
  readonly article: {
    readonly square: string;
    readonly fourByThree: string;
    readonly sixteenByNine: string;
  };
}

export async function createSocialCardSet(input: {
  readonly post: PreviewPostArtifact;
  readonly config: ProjectConfig;
  readonly contentAssetPath: string | undefined;
  readonly outputDirectory: string;
  readonly categoryLabel: string;
}): Promise<SocialCardSet> {
  const generated = await renderGeneratedCard(input);
  const source = input.contentAssetPath
    ? await sharp(input.contentAssetPath).png().toBuffer()
    : generated;
  const ogBuffer = await sharp(source).resize(1200, 630, { fit: "cover", position: "attention" }).png().toBuffer();
  const square = await sharp(source).resize(1200, 1200, { fit: "cover" }).png().toBuffer();
  const fourByThree = await sharp(source).resize(1200, 900, { fit: "cover" }).png().toBuffer();
  const sixteenByNine = await sharp(source).resize(1200, 675, { fit: "cover" }).png().toBuffer();

  const prefix = `_assets/social/${input.post.id.replaceAll(":", "-")}`;
  const files = {
    og: `${prefix}-og.png`,
    square: `${prefix}-1x1.png`,
    fourByThree: `${prefix}-4x3.png`,
    sixteenByNine: `${prefix}-16x9.png`,
  };
  writeBinary(resolve(input.outputDirectory, files.og), ogBuffer);
  writeBinary(resolve(input.outputDirectory, files.square), square);
  writeBinary(resolve(input.outputDirectory, files.fourByThree), fourByThree);
  writeBinary(resolve(input.outputDirectory, files.sixteenByNine), sixteenByNine);

  const selected = selectPostOpenGraphImage({
    representativeImage: input.post.representativeImage,
    generatedCard: {
      url: input.config.resolvePublicUrl(`/${files.og}`),
      mediaType: "image/png",
      width: 1200,
      height: 630,
      alt: input.post.title,
    },
    ...(input.post.socialImage
      ? {
          socialImage: {
            url: input.config.resolvePublicUrl(`/${files.og}`),
            mediaType: "image/png",
            width: 1200,
            height: 630,
            alt: input.post.socialImage.alt,
          },
        }
      : {}),
    ...(input.post.cover
      ? {
          cover: {
            url: input.config.resolvePublicUrl(`/${files.og}`),
            mediaType: "image/png",
            width: 1200,
            height: 630,
            alt: input.post.cover.alt,
          },
        }
      : {}),
  });

  return {
    og: selected.image,
    article: {
      square: input.config.resolvePublicUrl(`/${files.square}`),
      fourByThree: input.config.resolvePublicUrl(`/${files.fourByThree}`),
      sixteenByNine: input.config.resolvePublicUrl(`/${files.sixteenByNine}`),
    },
  };
}

async function renderGeneratedCard(input: {
  readonly post: PreviewPostArtifact;
  readonly config: ProjectConfig;
  readonly categoryLabel: string;
}): Promise<Buffer> {
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#111111"/>
  <rect x="48" y="48" width="1104" height="534" fill="none" stroke="#f4f4f4" stroke-width="2"/>
  <text x="80" y="160" fill="#f4f4f4" font-size="28" font-family="system-ui, sans-serif">${escapeSvg(input.categoryLabel)}</text>
  <text x="80" y="280" fill="#ffffff" font-size="56" font-family="system-ui, sans-serif">${escapeSvg(truncate(input.post.title, 42))}</text>
  <text x="80" y="540" fill="#d0d0d0" font-size="24" font-family="system-ui, sans-serif">${escapeSvg(input.config.site.identity.name)}</text>
</svg>`;
  return sharp(Buffer.from(svg)).png().toBuffer();
}

function writeBinary(path: string, bytes: Buffer): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, bytes);
}

function escapeSvg(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function truncate(value: string, max: number): string {
  return value.length <= max ? value : `${value.slice(0, max - 1).trimEnd()}…`;
}
