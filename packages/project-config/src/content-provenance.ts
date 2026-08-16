import type { PostAuthorshipDisclosureArtifact } from "../../contracts/src/index.ts";

export interface PostAuthorshipDisclosureSource {
  readonly statementLanguage: string;
  readonly statement: string;
  readonly claimSource: string;
  readonly appliesTo: string;
  readonly primaryCreation: string;
  readonly aiAssistance: readonly string[];
}

function requireSingleLine(value: string, name: string): string {
  const normalized = value.trim();
  if (normalized.length === 0 || /[\r\n]/u.test(normalized)) {
    throw new Error(`${name} must be a non-empty single line.`);
  }
  return normalized;
}

export function resolvePostAuthorshipDisclosure(
  source: PostAuthorshipDisclosureSource,
): PostAuthorshipDisclosureArtifact {
  const statement = requireSingleLine(source.statement, "statement");
  if (source.statementLanguage !== "en") {
    throw new Error("The post authorship disclosure must be written in English.");
  }
  if (source.claimSource !== "owner") {
    throw new Error("The post authorship disclosure must be an owner declaration.");
  }
  if (source.appliesTo !== "original-work") {
    throw new Error("The disclosure must apply to the original work.");
  }
  if (source.primaryCreation !== "human") {
    throw new Error("The configured primary creation mode must be human.");
  }
  if (
    source.aiAssistance.length !== 1 ||
    source.aiAssistance[0] !== "proofreading"
  ) {
    throw new Error("AI assistance must be limited to proofreading.");
  }

  return {
    statementLanguage: "en",
    statement,
    claimSource: "owner",
    appliesTo: "original-work",
    primaryCreation: "human",
    aiAssistance: ["proofreading"],
  };
}
