import assert from "node:assert/strict";
import { test } from "vitest";

import {
  buildHeadingArtifacts,
  createGeneratedHeadingId,
} from "../../packages/content-compiler/src/heading-anchors.ts";
import { CONTENT_ARTIFACT_SCHEMA_VERSION } from "../../packages/contracts/src/index.ts";

test("uses authorship-disclosure content artifact schema version 7", () => {
  assert.equal(CONTENT_ARTIFACT_SCHEMA_VERSION, 7);
});

test("builds deterministic Korean, C++, duplicate, and explicit anchors", () => {
  assert.deepEqual(
    buildHeadingArtifacts([
      { depth: 2, text: "시작하기" },
      { depth: 3, text: "C++ 기본" },
      { depth: 3, text: "C++ 기본" },
      {
        depth: 2,
        text: "API 호환성 유지하기",
        explicitId: "api-compatibility",
      },
    ]),
    [
      {
        depth: 2,
        id: "시작하기",
        anchor: "#시작하기",
        text: "시작하기",
      },
      {
        depth: 3,
        id: "c-기본",
        anchor: "#c-기본",
        text: "C++ 기본",
        parentId: "시작하기",
      },
      {
        depth: 3,
        id: "c-기본-2",
        anchor: "#c-기본-2",
        text: "C++ 기본",
        parentId: "시작하기",
      },
      {
        depth: 2,
        id: "api-compatibility",
        anchor: "#api-compatibility",
        text: "API 호환성 유지하기",
      },
    ],
  );
});

test("uses a deterministic fallback for punctuation-only headings", () => {
  assert.equal(createGeneratedHeadingId("!!!", 7), "section-7");
});

test("rejects a first heading deeper than level 2", () => {
  assert.throws(() => buildHeadingArtifacts([{ depth: 3, text: "잘못됨" }]));
});

test("rejects a skipped heading level", () => {
  assert.throws(() =>
    buildHeadingArtifacts([
      { depth: 2, text: "시작" },
      { depth: 4, text: "건너뜀" },
    ]),
  );
});

test("rejects invalid and duplicate explicit IDs", () => {
  assert.throws(() =>
    buildHeadingArtifacts([
      { depth: 2, text: "잘못된 ID", explicitId: "Not-Valid" },
    ]),
  );

  assert.throws(() =>
    buildHeadingArtifacts([
      { depth: 2, text: "첫 번째", explicitId: "same" },
      { depth: 2, text: "두 번째", explicitId: "same" },
    ]),
  );
});
