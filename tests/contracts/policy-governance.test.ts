import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { dirname, relative, resolve, sep } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

interface GovernedSource {
  readonly path: string;
  readonly sha256: string;
}

interface GovernedTest {
  readonly path: string;
  readonly cases: readonly string[];
}

interface PolicyCoverageEntry {
  readonly id: string;
  readonly sources: readonly GovernedSource[];
  readonly tests: readonly GovernedTest[];
}

interface PolicyCoverageManifest {
  readonly schemaVersion: 1;
  readonly policies: readonly PolicyCoverageEntry[];
}

const repositoryRoot = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../..",
);

function repositoryPath(path: string): string {
  assert.ok(path.length > 0, "Policy paths must not be empty.");
  const absolute = resolve(repositoryRoot, path);
  const local = relative(repositoryRoot, absolute);
  assert.ok(
    local.length > 0 && local !== ".." && !local.startsWith(`..${sep}`),
    `Policy path escapes the repository: ${path}`,
  );
  return absolute;
}

function sha256(text: string): string {
  return createHash("sha256").update(text).digest("hex");
}

test("validates every governed policy source and named test case", () => {
  const manifest = JSON.parse(
    readFileSync(repositoryPath("tests/policy-coverage.json"), "utf8"),
  ) as PolicyCoverageManifest;

  assert.equal(manifest.schemaVersion, 1);
  assert.ok(manifest.policies.length > 0);

  const policyIds = new Set<string>();
  const governedSources = new Set<string>();
  const mappedCases = new Set<string>();

  for (const policy of manifest.policies) {
    assert.match(policy.id, /^[a-z][a-z0-9-]*$/u);
    assert.equal(policyIds.has(policy.id), false, `Duplicate policy: ${policy.id}`);
    policyIds.add(policy.id);
    assert.ok(policy.sources.length > 0, `${policy.id} has no governed sources.`);
    assert.ok(policy.tests.length > 0, `${policy.id} has no mapped tests.`);

    for (const source of policy.sources) {
      assert.equal(
        governedSources.has(source.path),
        false,
        `Source belongs to multiple policies: ${source.path}`,
      );
      governedSources.add(source.path);
      const contents = readFileSync(repositoryPath(source.path), "utf8");
      assert.match(source.sha256, /^[a-f0-9]{64}$/u);
      assert.equal(
        sha256(contents),
        source.sha256,
        `${source.path} changed; review its test cases and refresh the policy manifest.`,
      );
    }

    for (const testMapping of policy.tests) {
      assert.ok(testMapping.cases.length > 0, `${testMapping.path} has no cases.`);
      const testSource = readFileSync(repositoryPath(testMapping.path), "utf8");
      const caseNames = new Set<string>();
      for (const caseName of testMapping.cases) {
        assert.ok(caseName.length > 0, "Test case names must not be empty.");
        assert.equal(
          caseNames.has(caseName),
          false,
          `Duplicate mapped case: ${caseName}`,
        );
        caseNames.add(caseName);
        const mappedCase = `${testMapping.path}\u0000${caseName}`;
        assert.equal(
          mappedCases.has(mappedCase),
          false,
          `Test case is mapped more than once: ${testMapping.path} — ${caseName}`,
        );
        mappedCases.add(mappedCase);
        assert.ok(
          testSource.includes(`test(${JSON.stringify(caseName)}`),
          `Mapped test case not found in ${testMapping.path}: ${caseName}`,
        );
      }
    }
  }
});
