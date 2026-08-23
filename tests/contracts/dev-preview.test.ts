import assert from "node:assert/strict";
import { test } from "vitest";

import {
  classifyPreviewChange,
  injectPreviewLiveReload,
} from "../../scripts/dev.ts";

test("classifies blog design changes for the smallest safe preview rebuild", () => {
  assert.equal(classifyPreviewChange("DESIGN.md"), "web");
  assert.equal(
    classifyPreviewChange("apps/blog-web/src/styles/blog.css"),
    "web",
  );
  assert.equal(classifyPreviewChange("apps/blog-web/src/build.ts"), "web");
  assert.equal(classifyPreviewChange("docs/ko/lab/example.md"), "full");
  assert.equal(classifyPreviewChange("assets/content/example/cover.png"), "full");
  assert.equal(classifyPreviewChange("config/site.yaml"), "full");
  assert.equal(classifyPreviewChange("packages/contracts/src/schemas.ts"), "full");
  assert.equal(classifyPreviewChange("apps\\blog-web\\src\\build.ts"), "web");
});

test("ignores generated and unrelated files so preview rebuilds cannot loop", () => {
  for (const path of [
    ".artifacts/web/preview/site/index.html",
    "dist/index.html",
    "node_modules/example/index.js",
    ".git/index",
    ".od/app.sqlite",
    "design/open-design/concept.html",
    "History.md",
  ]) {
    assert.equal(classifyPreviewChange(path), null, path);
  }
});

test("injects one development-only live reload client into served HTML", () => {
  const source = "<!doctype html><html><body><main>Preview</main></body></html>";
  const injected = injectPreviewLiveReload(source);
  assert.match(injected, /data-preview-live-reload/u);
  assert.match(injected, /new EventSource\("\/__preview\/live-reload"\)/u);
  assert.ok(injected.indexOf("data-preview-live-reload") < injected.indexOf("</body>"));
  assert.equal(injectPreviewLiveReload(injected), injected);
});
