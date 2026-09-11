import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "vitest";

// Reviewed fixes for the eight Dependabot alerts open on 2026-09-11.
// These offline checks supplement, rather than replace, registry security audits.
const securityFloors = {
  astro: "7.2.8", // GHSA-26w7-cxv4-gfx2 and GHSA-376h-93r7-7g6f
  sharp: "0.35.4", // GHSA-rgj7-g3m4-5g8c
  "js-yaml": "4.3.2", // GHSA-2883-xcg3-v3hh
  svgo: "4.1.0", // GHSA-w27v-7q3p-w38r and GHSA-4vpr-x523-8j87
  vitest: "4.1.11", // GHSA-82fw-gwwq-j7x9
  "@vitest/mocker": "4.1.11", // GHSA-82fw-gwwq-j7x9
} as const;

type LockedPackages = Record<string, { version?: string }>;

function assertPatched(packages: LockedPackages): void {
  for (const [name, minimum] of Object.entries(securityFloors)) {
    const matches = Object.entries(packages).filter(([path]) =>
      path === `node_modules/${name}` || path.endsWith(`/node_modules/${name}`),
    );
    assert.ok(matches.length > 0, `Missing security-reviewed dependency: ${name}`);
    for (const [path, entry] of matches) {
      assert.match(entry.version ?? "", /^\d+\.\d+\.\d+$/u, `${path}: expected a stable version`);
      const actual = entry.version!.split(".").map(Number);
      const floor = minimum.split(".").map(Number);
      const difference = actual.findIndex((part, index) => part !== floor[index]);
      assert.ok(difference === -1 || actual[difference]! > floor[difference]!,
        `${path}: ${entry.version} is below patched version ${minimum}`);
    }
  }
}

function patchedFixture(): LockedPackages {
  return Object.fromEntries(Object.entries(securityFloors).map(([name, version]) =>
    [`node_modules/${name}`, { version }],
  ));
}

test("locks patched versions of all security-reviewed dependencies including nested copies", () => {
  const lock = JSON.parse(readFileSync(new URL("../../package-lock.json", import.meta.url), "utf8"));
  assertPatched(lock.packages);
});

test("accepts fixed release boundaries and later stable patch releases", () => {
  const packages = patchedFixture();
  assertPatched(packages);
  packages["node_modules/astro"] = { version: "7.2.9" };
  packages["node_modules/parent/node_modules/svgo"] = { version: "4.1.0" };
  assertPatched(packages);
});

test("rejects every previously vulnerable version even in a nested dependency", () => {
  for (const [name, version] of Object.entries({
    astro: "7.2.3", sharp: "0.35.3", "js-yaml": "4.3.1",
    svgo: "4.0.2", vitest: "4.1.10", "@vitest/mocker": "4.1.10",
  })) {
    const packages = patchedFixture();
    packages[`node_modules/parent/node_modules/${name}`] = { version };
    assert.throws(() => assertPatched(packages), /below patched version/u);
  }
});

test("rejects missing dependencies and unreviewed prerelease versions", () => {
  const packages = patchedFixture();
  packages["node_modules/astro"] = { version: "7.2.8-rc.1" };
  assert.throws(() => assertPatched(packages), /expected a stable version/u);
  delete packages["node_modules/astro"];
  assert.throws(() => assertPatched(packages), /Missing security-reviewed dependency/u);
});
