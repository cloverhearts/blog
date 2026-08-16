import type { PostAuthorshipDisclosureArtifact } from "../../../../packages/contracts/src/index.ts";

export const AUTHORSHIP_DISCLOSURE_META_NAME =
  "content-authorship-disclosure" as const;

function escapeHtmlAttribute(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

export function renderAuthorshipDisclosureMeta(
  disclosure: PostAuthorshipDisclosureArtifact,
): string {
  const tags = [
    `<meta name="${AUTHORSHIP_DISCLOSURE_META_NAME}" lang="${escapeHtmlAttribute(disclosure.statementLanguage)}" content="${escapeHtmlAttribute(disclosure.statement)}">`,
    `<meta name="content-authorship-claim-source" content="${escapeHtmlAttribute(disclosure.claimSource)}">`,
    `<meta name="content-authorship-applies-to" content="${escapeHtmlAttribute(disclosure.appliesTo)}">`,
    `<meta name="content-primary-creation" content="${escapeHtmlAttribute(disclosure.primaryCreation)}">`,
    `<meta name="content-ai-assistance" content="${escapeHtmlAttribute(disclosure.aiAssistance.join(","))}">`,
  ];
  return tags.join("\n");
}
