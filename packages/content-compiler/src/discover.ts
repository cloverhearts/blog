import { readdirSync, readFileSync, statSync } from "node:fs";
import { relative, resolve } from "node:path";

import type { SupportedLanguage } from "../../contracts/src/index.ts";
import { parsePostFrontmatter, type PostFrontmatter } from "./frontmatter.ts";

const POST_FILENAME = /^(\d{4}-\d{2}-\d{2})-([a-z0-9]+(?:-[a-z0-9]+)*)\.md$/u;
const CATEGORY_ID = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/u;
const LANGUAGES = ["en", "ko", "ja"] as const satisfies readonly SupportedLanguage[];

export interface DiscoveredPost {
  readonly sourcePath: string;
  readonly relativePath: string;
  readonly language: SupportedLanguage;
  readonly category: string;
  readonly filename: string;
  readonly filenameDate: string;
  readonly filenameSlug: string;
  readonly frontmatter: PostFrontmatter;
  readonly body: string;
  readonly source: string;
}

export function discoverPosts(docsRoot: string): readonly DiscoveredPost[] {
  const posts: DiscoveredPost[] = [];
  for (const language of LANGUAGES) {
    const languageRoot = resolve(docsRoot, language);
    let categoryEntries: readonly string[] = [];
    try {
      categoryEntries = readdirSync(languageRoot);
    } catch {
      continue;
    }
    for (const category of categoryEntries) {
      const categoryPath = resolve(languageRoot, category);
      if (!statSync(categoryPath).isDirectory()) {
        continue;
      }
      if (!CATEGORY_ID.test(category)) {
        throw new Error(`Invalid category directory: ${relative(docsRoot, categoryPath)}`);
      }
      for (const filename of readdirSync(categoryPath)) {
        if (!filename.endsWith(".md")) {
          throw new Error(`Non-Markdown file in docs: ${language}/${category}/${filename}`);
        }
        const match = POST_FILENAME.exec(filename);
        if (!match) {
          throw new Error(`Invalid post filename: ${language}/${category}/${filename}`);
        }
        const sourcePath = resolve(categoryPath, filename);
        const source = readFileSync(sourcePath, "utf8");
        const split = splitFrontmatter(source, sourcePath);
        const frontmatter = parsePostFrontmatter(split.data, sourcePath);
        if (frontmatter.slug !== match[2]) {
          throw new Error(`${sourcePath}: slug must match filename`);
        }
        posts.push({
          sourcePath,
          relativePath: relative(docsRoot, sourcePath),
          language,
          category,
          filename,
          filenameDate: match[1] ?? "",
          filenameSlug: match[2] ?? "",
          frontmatter,
          body: split.body,
          source,
        });
      }
    }
  }
  return posts.sort((left, right) => left.relativePath.localeCompare(right.relativePath, "en"));
}

function splitFrontmatter(
  source: string,
  sourcePath: string,
): { data: unknown; body: string } {
  if (!source.startsWith("---\n") && !source.startsWith("---\r\n")) {
    throw new Error(`${sourcePath}: frontmatter must begin on the first line`);
  }
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/u.exec(source);
  if (!match) {
    throw new Error(`${sourcePath}: frontmatter delimiters are not balanced`);
  }
  const { parse } = requireYaml();
  return {
    data: parse(match[1] ?? ""),
    body: match[2] ?? "",
  };
}

function requireYaml(): { parse: (value: string) => unknown } {
  return { parse: parseYaml };
}

import { parse as parseYaml } from "yaml";
