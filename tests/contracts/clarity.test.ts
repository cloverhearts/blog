import assert from "node:assert/strict";
import { cpSync, mkdirSync, mkdtempSync, readFileSync, symlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { runInNewContext } from "node:vm";
import { test } from "vitest";
import { resolveClarityAnalyticsConfig } from "../../packages/project-config/src/analytics.ts";
import { analyticsConfigSchema } from "../../packages/project-config/src/config-schemas.ts";
import { loadProjectConfig } from "../../packages/project-config/src/index.ts";
import { compileContent } from "../../packages/content-compiler/src/compile.ts";
import { buildWeb } from "../../apps/blog-web/src/build.ts";

const repositoryRoot = resolve(import.meta.dirname, "../..");
const source = readFileSync(resolve(repositoryRoot, "apps/blog-web/src/analytics/clarity.js"), "utf8");
function fixture(stored?: string, href = "https://example.test/posts/example/", referrer = "") {
  const storage = new Map<string, string>(stored ? [["blog.clarity-consent.v1", stored]] : []);
  const scripts: Record<string, unknown>[] = [];
  const attrs = new Map<string, string>();
  let reloads = 0;
  const browser = {
    location: { href, reload: () => { reloads++; } },
    localStorage: { getItem: (key: string) => storage.get(key), setItem: (key: string, value: string) => storage.set(key, value) },
    document: { referrer, body: { setAttribute: (key: string, value: string) => attrs.set(key, value) },
      querySelectorAll: () => [], createElement: () => ({}), head: { append: (script: Record<string, unknown>) => scripts.push(script) } },
  };
  const create = runInNewContext(`${source.replace("export function", "function")}\ncreateClarity;`, { URL });
  return { storage, scripts, attrs, browser, create: (id: string | null = "abc12345") => create({ projectId: id }, browser),
    commands: () => JSON.stringify((browser as unknown as { clarity?: { q: unknown[] } }).clarity?.q), reloads: () => reloads };
}

test("resolves absent normalized and invalid Clarity configuration without GA4 fallback", () => {
  assert.equal(resolveClarityAnalyticsConfig({ GA4_MEASUREMENT_ID: "G-ABC12345" }).enabled, false);
  assert.deepEqual(resolveClarityAnalyticsConfig({ CLARITY_PROJECT_ID: " abc12345 " }), {
    enabled: true, provider: "microsoft-clarity", projectId: "abc12345",
  });
  assert.equal(resolveClarityAnalyticsConfig({ CLARITY_PROJECT_ID: " " }).projectId, null);
  for (const id of ["https://clarity.ms/tag/x", "<script>", "G-ABC12345", "a".repeat(33), "UPPER"]) {
    assert.throws(() => resolveClarityAnalyticsConfig({ CLARITY_PROJECT_ID: id }));
    assert.throws(() => fixture().create(id));
  }
});

test("requires fresh consent and never loads Clarity when absent denied or legacy-granted", () => {
  for (const stored of [undefined, "denied", "unexpected"]) {
    const f = fixture(stored); f.storage.set("blog.analytics-consent.v1", "granted"); f.create();
    assert.equal(f.scripts.length, 0);
  }
  const disabled = fixture(); disabled.create(null).grantConsent();
  assert.equal(disabled.scripts.length, 0);
});

test("loads Clarity once after consent with text masking and advertising denied", () => {
  const f = fixture(); const client = f.create(); client.grantConsent(); client.grantConsent();
  assert.equal(f.scripts.length, 1);
  assert.equal(f.scripts[0]!.src, "https://www.clarity.ms/tag/abc12345");
  assert.equal(f.scripts[0]!.referrerPolicy, "no-referrer");
  assert.equal(f.attrs.get("data-clarity-mask"), "true");
  assert.match(f.commands()!, /"analytics_Storage":"granted","ad_Storage":"denied"/u);
  assert.equal(f.storage.get("blog.clarity-consent.v1"), "granted");
  const restored = fixture("granted"); restored.create(); assert.equal(restored.scripts.length, 1);
});

test("withdraws Clarity consent and reloads to stop even cookieless recording", () => {
  const f = fixture(); const client = f.create(); client.grantConsent(); client.denyConsent();
  assert.equal(f.reloads(), 1);
  assert.equal(client.getConsent(), "denied");
  assert.match(f.commands()!, /"analytics_Storage":"denied","ad_Storage":"denied"/u);
  const nextPage = fixture(f.storage.get("blog.clarity-consent.v1")); nextPage.create();
  assert.equal(nextPage.scripts.length, 0);
});

test("skips query fragment and sensitive-referrer entries without rewriting navigation", () => {
  for (const [href, referrer] of [["https://example.test/?q=private", ""], ["https://example.test/#private", ""],
    ["https://example.test/", "https://search.test/?q=private"], ["invalid", ""]]) {
    const f = fixture("granted", href, referrer); f.create();
    assert.equal(f.scripts.length, 0); assert.equal(f.browser.location.href, href);
  }
});

test("keeps consent functional when browser storage is blocked", () => {
  const f = fixture();
  f.browser.localStorage.getItem = () => { throw new Error("blocked"); };
  f.browser.localStorage.setItem = () => { throw new Error("blocked"); };
  const client = f.create(); client.grantConsent(); assert.equal(f.scripts.length, 1);
  client.denyConsent(); assert.equal(f.reloads(), 1);
});

test("rejects weaker Clarity privacy policies", () => {
  const config = loadProjectConfig({ repositoryRoot, env: {} }).analytics;
  for (const changed of [{ ...config, scope: { blog: true, managedPages: true } },
    { ...config, collection: { ...config.collection, maskText: false } },
    { ...config, consent: { ...config.consent, default: "granted" } }]) {
    assert.equal(analyticsConfigSchema.safeParse(changed).success, false);
  }
});

test("emits only eligible production Clarity controls and preserves deterministic base-path builds", async () => {
  const root = mkdtempSync(resolve(tmpdir(), "blog-clarity-"));
  for (const path of ["config", "CONTENT_RULES.md", "I18N.md", "DESIGN.md"]) cpSync(resolve(repositoryRoot, path), resolve(root, path), { recursive: true });
  for (const path of ["docs/ko", "docs/en", "docs/ja", "assets/content"]) mkdirSync(resolve(root, path), { recursive: true });
  symlinkSync(resolve(repositoryRoot, "node_modules"), resolve(root, "node_modules"));
  for (const base of ["", "/blog"]) {
    const config = loadProjectConfig({ repositoryRoot: root, env: { SITE_ORIGIN: "https://blog.cloverhearts.com", SITE_BASE_PATH: base, CLARITY_PROJECT_ID: "abc12345" } });
    await compileContent({ config, mode: "production" });
    const first = await buildWeb({ config, mode: "production" });
    for (const prefix of ["", "en/", "ja/"]) {
      const html = readFileSync(resolve(root, `.artifacts/web/production/site/${prefix}index.html`), "utf8");
      assert.ok(html.includes(`src="${base}/_assets/app/clarity.js"`));
      assert.match(html, /data-clarity-project="abc12345"/u);
      assert.match(html, /data-analytics-grant[\s\S]*data-analytics-deny/u);
      assert.match(html, /Content-Security-Policy/u);
      assert.doesNotMatch(html, /googletagmanager|google-analytics|unsafe-inline|c\.bing\.com/u);
      for (const route of ["search/", "404/"]) {
        const excluded = readFileSync(resolve(root, `.artifacts/web/production/site/${prefix}${route}index.html`), "utf8");
        assert.doesNotMatch(excluded, /data-clarity-project|src="[^"]*clarity\.js|https:\/\/\*\.clarity\.ms/u);
      }
    }
    assert.deepEqual((await buildWeb({ config, mode: "production" })).provenance, first.provenance);
    await compileContent({ config, mode: "preview" }); await buildWeb({ config, mode: "preview" });
    assert.doesNotMatch(readFileSync(resolve(root, ".artifacts/web/preview/site/index.html"), "utf8"), /data-clarity-project|clarity\.js/u);
    const off = loadProjectConfig({ repositoryRoot: root, env: { SITE_ORIGIN: "https://blog.cloverhearts.com", SITE_BASE_PATH: base } });
    const offManifest = await buildWeb({ config: off, mode: "production" });
    assert.notEqual(offManifest.provenance.inputHash, first.provenance.inputHash);
    assert.doesNotMatch(readFileSync(resolve(root, ".artifacts/web/production/site/index.html"), "utf8"), /data-clarity-project|clarity\.js|https:\/\/\*\.clarity\.ms/u);
  }
}, 30_000);
