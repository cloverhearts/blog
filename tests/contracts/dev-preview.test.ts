import assert from "node:assert/strict";
import { test } from "vitest";
import { mkdtempSync, mkdirSync, writeFileSync, symlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";

import {
  classifyPreviewChange,
  injectPreviewLiveReload,
  previewPath,
  resolvePreviewFile,
} from "../../scripts/dev.ts";

test("confines preview files including encoded traversal and symlinks to the output root", () => {
  const directory = mkdtempSync(resolve(tmpdir(), "preview-boundary-"));
  const root = resolve(directory, "site");
  mkdirSync(resolve(root, "en"), { recursive: true });
  writeFileSync(resolve(root, "index.html"), "home");
  writeFileSync(resolve(root, "en/index.html"), "English");
  writeFileSync(resolve(directory, "outside.txt"), "not public");
  symlinkSync(resolve(directory, "outside.txt"), resolve(root, "linked.txt"));
  symlinkSync(directory, resolve(root, "linked-directory"));
  for (const path of ["/", "/en/", "/en/index.html"]) {
    assert.equal(resolvePreviewFile(root, previewPath(path)!).status, 200);
  }
  for (const path of ["/..%2foutside.txt", "/%2e%2e%2foutside.txt", "/linked.txt", "/linked-directory/outside.txt"]) {
    assert.equal(resolvePreviewFile(root, previewPath(path)!).status, 403, path);
  }
  assert.equal(resolvePreviewFile(root, "/missing/").status, 404);
  assert.equal(resolvePreviewFile(root, "/%2e%2e%2foutside.txt").status, 404, "Never decode paths twice");
});

test("rejects malformed preview requests without throwing or decoding query values", () => {
  for (const target of ["/%", "/%E0%A4", "/%00", "/%5coutside", "//other.test/", "https://other.test/"]) {
    assert.equal(previewPath(target), null, target);
  }
  assert.equal(previewPath("/en/?q=%invalid"), "/en/");
  assert.equal(previewPath("/hello%20world.txt"), "/hello world.txt");
});

test("classifies blog design changes for the smallest safe preview rebuild", () => {
  assert.equal(classifyPreviewChange("DESIGN.md"), "web");
  assert.equal(
    classifyPreviewChange("apps/blog-web/src/styles/blog.css"),
    "web",
  );
  assert.equal(classifyPreviewChange("apps/blog-web/src/build.ts"), "web");
  assert.equal(classifyPreviewChange("docs/ko/lab/example.md"), "full");
  assert.equal(classifyPreviewChange("managed-pages/profile/profile.css"), "full");
  assert.equal(classifyPreviewChange("packages/managed-page-compiler/src/index.ts"), "full");
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
