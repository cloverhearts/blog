import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "vitest";
import { parse } from "yaml";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

interface RootPackage {
  readonly allowScripts: Readonly<Record<string, boolean>>;
  readonly packageManager: string;
  readonly engines: Readonly<Record<string, string>>;
  readonly workspaces: readonly string[];
  readonly scripts: Readonly<Record<string, string>>;
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

test("passes the public Clarity variable only to production build and verification", () => {
  const pages = parse(read(".github/workflows/pages.yml"));
  const steps = pages.jobs.build.steps as Array<{ name?: string; env?: Record<string, string> }>;
  const configured = steps.filter((step) => step.env?.CLARITY_PROJECT_ID !== undefined);
  assert.deepEqual(configured.map((step) => step.name), ["Build production site", "Verify Pages release"]);
  for (const step of configured) assert.equal(step.env?.CLARITY_PROJECT_ID, "${{ vars.CLARITY_PROJECT_ID }}");
  assert.doesNotMatch(read(".github/workflows/pages.yml"), /GA4_MEASUREMENT_ID|clarity\.ms\/tag/u);
  assert.doesNotMatch(read(".github/workflows/quality.yml"), /CLARITY_PROJECT_ID/u);
});

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
    "pretendard",
    "sharp",
    "vitest",
    "@playwright/test",
    "axe-core",
  ]) {
    const locked = packageLock.packages[`node_modules/${dependency}`];
    assert.ok(locked?.version, `Missing locked dependency: ${dependency}`);
  }
});

test("exposes the documented root command surface", () => {
  const packageJson = JSON.parse(read("package.json")) as RootPackage;
  for (const command of [
    "validate:config",
    "validate:embeds",
    "test:i18n",
    "test:seo",
    "test:analytics",
    "test:quality",
    "build:content",
    "build:web",
    "build:search",
    "build:managed",
    "build:discovery",
    "build:release",
    "verify:pages",
    "build",
    "dev",
  ]) {
    assert.ok(packageJson.scripts[command], `Missing root command: ${command}`);
  }
});

test("runs contract and policy suites with Vitest", () => {
  const packageJson = JSON.parse(read("package.json")) as RootPackage;
  assert.equal(packageJson.scripts.test, "npm run test:contracts");
  assert.equal(packageJson.scripts["test:contracts"], "vitest run tests/contracts");
  assert.equal(
    packageJson.scripts["test:policy"],
    "vitest run tests/contracts/policy-governance.test.ts",
  );
  assert.doesNotMatch(packageJson.scripts["test:contracts"], /node --test/u);
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

test("records the approved production and classless UX baseline", () => {
  const specification = read("IMPLEMENTATION_SPEC.md");
  assert.match(specification, /https:\/\/blog\.cloverhearts\.com/u);
  assert.match(specification, /semantic classless CSS/u);
  assert.match(specification, /Pretendard Variable/u);
  assert.match(specification, /`UX_FLOW\.md`/u);
  assert.match(specification, /`config\/performance-budgets\.yaml`/u);
});

test("deploys only a verified custom-domain release and isolates portability builds", () => {
  const pages = parse(read(".github/workflows/pages.yml"));
  assert.deepEqual(pages.on.push.branches, ["main"]);
  assert.ok(Object.hasOwn(pages.on, "workflow_dispatch"));
  assert.equal(pages.on.pull_request, undefined);
  assert.equal(pages.env.SITE_ORIGIN, "https://blog.cloverhearts.com");
  assert.equal(pages.env.SITE_BASE_PATH, "");
  assert.equal(pages.jobs.deploy.needs, "build");
  assert.equal(pages.jobs.deploy.environment.name, "github-pages");
  assert.equal(pages.jobs.build.permissions.pages, "read");
  assert.equal(pages.jobs.deploy.permissions.pages, "write");
  const steps = pages.jobs.build.steps as Array<{ run?: string; uses?: string; with?: { path?: string } }>;
  const build = steps.findIndex((step) => step.run === "npm run build");
  const verify = steps.findIndex((step) => step.run === "npm run verify:pages");
  const upload = steps.findIndex((step) => step.uses?.startsWith("actions/upload-pages-artifact@"));
  assert.ok(build >= 0 && verify > build && upload > verify);
  assert.equal(steps[upload]?.with?.path, "dist");
  const quality = parse(read(".github/workflows/quality.yml"));
  assert.deepEqual(quality.jobs.contracts.strategy.matrix["base-path"], ["", "/blog"]);
  assert.equal(quality.jobs.contracts.env.SITE_BASE_PATH, "${{ matrix.base-path }}");
  const variant = quality.jobs.contracts.steps.find((step: { name: string }) => step.name === "Build and verify isolated variant");
  assert.equal(variant.run.trim(), "npm run build\nnpm run verify:pages");
  assert.doesNotMatch(read(".github/workflows/quality.yml"), /deploy-pages|pages: write/u);
});
