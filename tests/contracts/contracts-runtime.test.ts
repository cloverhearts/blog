import assert from "node:assert/strict";
import { test } from "vitest";

import {
  CONTENT_ARTIFACT_SCHEMA_VERSION,
  parsePublishedContentManifest,
} from "../../packages/contracts/src/index.ts";

test("rejects an unsupported or malformed published content manifest", () => {
  assert.equal(CONTENT_ARTIFACT_SCHEMA_VERSION, 7);
  assert.throws(() => parsePublishedContentManifest({ provenance: { schemaVersion: 6 } }));
  assert.throws(() =>
    parsePublishedContentManifest({
      provenance: {
        schemaVersion: 7,
        buildMode: "preview",
        producer: "x",
        producerVersion: "0",
        inputHash: "a".repeat(64),
        configHash: "b".repeat(64),
        contentRulesHash: "c".repeat(64),
        localizationRulesHash: "d".repeat(64),
      },
    }),
  );
});
