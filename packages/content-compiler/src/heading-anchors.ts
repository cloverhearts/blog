import type { HeadingArtifact } from "../../contracts/src/index.ts";

export interface ParsedHeadingInput {
  readonly depth: 2 | 3 | 4 | 5 | 6;
  /** Plain text extracted from the parsed heading node. */
  readonly text: string;
  /** Optional author-controlled `{#ascii-kebab-id}` value. */
  readonly explicitId?: string;
}

const EXPLICIT_ID_PATTERN = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/u;

export function createGeneratedHeadingId(text: string, ordinal: number): string {
  const normalized = text
    .normalize("NFKC")
    .toLocaleLowerCase("und")
    .replace(/[\u0027\u2019]/gu, "")
    .replace(/[^\p{Letter}\p{Number}]+/gu, "-")
    .replace(/^-+|-+$/gu, "");

  return normalized || `section-${ordinal}`;
}

/**
 * Builds the single ordered heading record used by both semantic post HTML and
 * the blog table-of-contents navigation.
 */
export function buildHeadingArtifacts(
  inputs: readonly ParsedHeadingInput[],
): readonly HeadingArtifact[] {
  const usedIds = new Set<string>();
  const hierarchy: HeadingArtifact[] = [];

  return inputs.map((input, index) => {
    const text = input.text.trim();
    if (text.length === 0) {
      throw new Error(`Heading ${index + 1} has no visible text.`);
    }

    const previous = index > 0 ? inputs[index - 1] : undefined;
    if (index === 0 && input.depth !== 2) {
      throw new Error("The first post heading must use level 2 (##).");
    }
    if (previous && input.depth > previous.depth + 1) {
      throw new Error(
        `Heading ${index + 1} skips from level ${previous.depth} to ${input.depth}.`,
      );
    }

    let id: string;
    if (input.explicitId !== undefined) {
      if (!EXPLICIT_ID_PATTERN.test(input.explicitId)) {
        throw new Error(
          `Heading ${index + 1} explicit ID must be lowercase ASCII kebab-case.`,
        );
      }
      if (usedIds.has(input.explicitId)) {
        throw new Error(`Duplicate explicit heading ID: ${input.explicitId}`);
      }
      id = input.explicitId;
    } else {
      const baseId = createGeneratedHeadingId(text, index + 1);
      id = baseId;
      let suffix = 2;
      while (usedIds.has(id)) {
        id = `${baseId}-${suffix}`;
        suffix += 1;
      }
    }

    let currentParent = hierarchy.at(-1);
    while (currentParent && currentParent.depth >= input.depth) {
      hierarchy.pop();
      currentParent = hierarchy.at(-1);
    }

    const parentId = currentParent?.id;
    const heading: HeadingArtifact = {
      depth: input.depth,
      id,
      anchor: `#${id}`,
      text,
      ...(parentId ? { parentId } : {}),
    };

    usedIds.add(id);
    hierarchy.push(heading);
    return heading;
  });
}
