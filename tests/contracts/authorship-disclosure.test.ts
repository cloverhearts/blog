import assert from "node:assert/strict";
import test from "node:test";

import { renderAuthorshipDisclosureMeta } from "../../apps/blog-web/src/seo/authorship-disclosure.ts";
import { resolvePostAuthorshipDisclosure } from "../../packages/project-config/src/content-provenance.ts";

const source = {
  statementLanguage: "en",
  statement:
    "The original work for this article is a reliable document written by a human. AI was used only in a limited capacity for proofreading to reduce typographical errors, transcription mistakes, and awkward wording.",
  claimSource: "owner",
  appliesTo: "original-work",
  primaryCreation: "human",
  aiAssistance: ["proofreading"],
} as const;

test("creates one owner-declared disclosure for the original work", () => {
  assert.deepEqual(resolvePostAuthorshipDisclosure(source), {
    statementLanguage: "en",
    statement: source.statement,
    claimSource: "owner",
    appliesTo: "original-work",
    primaryCreation: "human",
    aiAssistance: ["proofreading"],
  });
});

test("renders metadata without hidden body text or structured-data claims", () => {
  const html = renderAuthorshipDisclosureMeta(
    resolvePostAuthorshipDisclosure(source),
  );
  assert.match(html, /name="content-authorship-disclosure"/u);
  assert.match(html, /lang="en"/u);
  assert.match(html, /AI was used only in a limited capacity/u);
  assert.match(html, /name="content-ai-assistance" content="proofreading"/u);
  assert.doesNotMatch(html, /display\s*:\s*none|opacity\s*:\s*0|hidden/iu);
  assert.doesNotMatch(html, /application\/ld\+json|creditText|<body|<p[ >]/iu);
});

test("escapes the declaration before placing it in the static head", () => {
  const disclosure = resolvePostAuthorshipDisclosure({
    ...source,
    statement: 'Human-authored "article" with <limited> AI & proofreading.',
  });
  const html = renderAuthorshipDisclosureMeta(disclosure);
  assert.match(
    html,
    /Human-authored &quot;article&quot; with &lt;limited&gt; AI &amp; proofreading\./u,
  );
});

test("rejects a misleading or expanded AI-assistance declaration", () => {
  assert.throws(() =>
    resolvePostAuthorshipDisclosure({
      ...source,
      appliesTo: "localized-variant",
    }),
  );
  assert.throws(() =>
    resolvePostAuthorshipDisclosure({
      ...source,
      aiAssistance: ["proofreading", "drafting"],
    }),
  );
  assert.throws(() =>
    resolvePostAuthorshipDisclosure({
      ...source,
      statementLanguage: "ko",
    }),
  );
});
