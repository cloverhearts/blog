import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

interface RootPackage {
  readonly allowScripts: Readonly<Record<string, boolean>>;
  readonly packageManager: string;
  readonly engines: Readonly<Record<string, string>>;
  readonly workspaces: readonly string[];
}

interface LockPackage {
  readonly version?: string;
}

interface PackageLock {
  readonly lockfileVersion: number;
  readonly packages: Readonly<Record<string, LockPackage>>;
}

function read(path: string): string {
  return readFileSync(resolve(repositoryRoot, path), "utf8");
}

test("pins Node 24 LTS and bundled npm for every environment", () => {
  const packageJson = JSON.parse(read("package.json")) as RootPackage;
  assert.equal(read(".nvmrc").trim(), "24.19.0");
  assert.equal(read(".node-version").trim(), "24.19.0");
  assert.equal(packageJson.engines.node, "24.19.0");
  assert.equal(packageJson.engines.npm, "11.17.0");
  assert.equal(packageJson.packageManager, "npm@11.17.0");
});

test("uses npm workspaces with one committed lockfile", () => {
  const packageJson = JSON.parse(read("package.json")) as RootPackage;
  const packageLock = JSON.parse(read("package-lock.json")) as PackageLock;
  assert.deepEqual(packageJson.workspaces, [
    "apps/*",
    "packages/*",
    "plugins/embeds/*",
  ]);
  assert.equal(packageLock.lockfileVersion, 3);
  assert.equal(existsSync(resolve(repositoryRoot, "pnpm-lock.yaml")), false);
  assert.equal(existsSync(resolve(repositoryRoot, "yarn.lock")), false);
  assert.equal(existsSync(resolve(repositoryRoot, "bun.lock")), false);
  assert.deepEqual(packageJson.allowScripts, {
    "esbuild@0.28.2": true,
    fsevents: false,
  });
});

test("locks every approved implementation dependency", () => {
  const packageLock = JSON.parse(read("package-lock.json")) as PackageLock;
  for (const dependency of [
    "astro",
    "zod",
    "yaml",
    "unified",
    "remark-directive",
    "rehype-sanitize",
    "pagefind",
    "sharp",
    "vitest",
    "@playwright/test",
    "axe-core",
  ]) {
    const locked = packageLock.packages[`node_modules/${dependency}`];
    assert.ok(locked?.version, `Missing locked dependency: ${dependency}`);
  }
});

test("declares every architecture lane as an npm workspace package", () => {
  for (const path of [
    "apps/blog-web/package.json",
    "packages/contracts/package.json",
    "packages/project-config/package.json",
    "packages/embed-core/package.json",
    "packages/content-compiler/package.json",
    "packages/managed-page-compiler/package.json",
    "packages/search-indexer/package.json",
    "packages/site-discovery/package.json",
    "packages/release-assembler/package.json",
  ]) {
    assert.equal(existsSync(resolve(repositoryRoot, path)), true, path);
  }
});
