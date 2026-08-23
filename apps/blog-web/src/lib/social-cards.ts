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
  readonly localSixteenByNine: string;
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
    localSixteenByNine: resolve(input.outputDirectory, files.sixteenByNine),
  };
}

async function renderGeneratedCard(input: {
  readonly post: PreviewPostArtifact;
  readonly config: ProjectConfig;
  readonly categoryLabel: string;
}): Promise<Buffer> {
  const titleLines = wrapTitle(input.post.title, 24, 3);
  const titleSvg = titleLines
    .map((line, index) => `<tspan x="96" y="${260 + index * 76}">${escapeSvg(line)}</tspan>`)
    .join("");
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#ffffff"/>
  <rect x="48" y="48" width="1104" height="534" fill="#f6fbf8" stroke="#dde7e1" stroke-width="2"/>
  <rect x="48" y="48" width="14" height="534" fill="#12b76a"/>
  <circle cx="1056" cy="150" r="62" fill="#ecfdf3" stroke="#12b76a" stroke-width="2"/>
  <circle cx="1056" cy="150" r="18" fill="#12b76a"/>
  <text x="96" y="142" fill="#087a4f" font-size="28" font-weight="700" letter-spacing="2" font-family="Pretendard, system-ui, sans-serif">${escapeSvg(input.categoryLabel)}</text>
  <text fill="#17211c" font-size="58" font-weight="600" font-family="Pretendard, system-ui, sans-serif">${titleSvg}</text>
  <line x1="96" y1="505" x2="1104" y2="505" stroke="#c7d5cd" stroke-width="2"/>
  <text x="96" y="552" fill="#66736c" font-size="25" font-weight="650" font-family="Pretendard, system-ui, sans-serif">${escapeSvg(input.config.site.identity.name)}</text>
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

function wrapTitle(value: string, maxCharacters: number, maxLines: number): string[] {
  const units = Array.from(value.trim());
  const lines: string[] = [];
  let cursor = 0;
  while (cursor < units.length && lines.length < maxLines) {
    const remaining = units.slice(cursor);
    if (remaining.length <= maxCharacters) {
      lines.push(remaining.join(""));
      cursor = units.length;
      break;
    }
    const window = remaining.slice(0, maxCharacters + 1);
    let breakAt = window.map((character, index) => (character === " " ? index : -1)).filter((index) => index > 0).at(-1) ?? maxCharacters;
    if (breakAt < Math.floor(maxCharacters * 0.55)) breakAt = maxCharacters;
    lines.push(remaining.slice(0, breakAt).join("").trimEnd());
    cursor += breakAt;
    while (units[cursor] === " ") cursor += 1;
  }
  if (cursor < units.length && lines.length > 0) {
    lines[lines.length - 1] = `${lines[lines.length - 1]?.replace(/…?$/u, "").trimEnd()}…`;
  }
  return lines;
}
