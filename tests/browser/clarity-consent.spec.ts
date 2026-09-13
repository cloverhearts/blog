import { cpSync, mkdirSync, mkdtempSync, readFileSync, symlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { expect, test } from "@playwright/test";
import { buildWeb } from "../../apps/blog-web/src/build.ts";
import { compileContent } from "../../packages/content-compiler/src/compile.ts";
import { loadProjectConfig } from "../../packages/project-config/src/index.ts";

test.use({ launchOptions: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE
  ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE } : {} });
const repositoryRoot = resolve(import.meta.dirname, "../..");
const source = readFileSync(resolve(repositoryRoot, "apps/blog-web/src/analytics/clarity.js"), "utf8");
const css = readFileSync(resolve(repositoryRoot, "apps/blog-web/src/styles/blog.css"), "utf8").replace(/^@import[^;]+;/mu, "");
let html: string;
test.beforeAll(async () => {
  const root = mkdtempSync(resolve(tmpdir(), "blog-clarity-browser-"));
  for (const path of ["config", "CONTENT_RULES.md", "I18N.md", "DESIGN.md"]) cpSync(resolve(repositoryRoot, path), resolve(root, path), { recursive: true });
  for (const path of ["docs/ko", "docs/en", "docs/ja", "assets/content"]) mkdirSync(resolve(root, path), { recursive: true });
  symlinkSync(resolve(repositoryRoot, "node_modules"), resolve(root, "node_modules"));
  const config = loadProjectConfig({ repositoryRoot: root, env: { SITE_ORIGIN: "https://blog.cloverhearts.com", CLARITY_PROJECT_ID: "abc12345" } });
  await compileContent({ config, mode: "production" }); await buildWeb({ config, mode: "production" });
  html = readFileSync(resolve(root, ".artifacts/web/production/site/index.html"), "utf8");
});

for (const width of [1137, 390]) {
  test(`requires consent before SDK request and stops on withdrawal at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 905 });
    const trackerRequests: string[] = [];
    await page.route("**/*", async (route) => {
      const url = new URL(route.request().url());
      if (url.hostname.endsWith("clarity.ms")) {
        trackerRequests.push(url.href);
        // Stub only: never send fixture activity to Microsoft.
        return route.fulfill({ contentType: "application/javascript", body: "window.__clarityLoaded = true;" });
      }
      if (url.pathname === "/") return route.fulfill({ contentType: "text/html", body: html });
      if (url.pathname.endsWith("/clarity.js")) return route.fulfill({ contentType: "application/javascript", body: source });
      if (url.pathname.endsWith("/blog.css")) return route.fulfill({ contentType: "text/css", body: css });
      return route.abort();
    });
    await page.goto("https://blog.cloverhearts.com/");
    await page.waitForLoadState("networkidle");
    expect(trackerRequests).toHaveLength(0);
    const grant = page.locator("[data-analytics-grant]");
    const deny = page.locator("[data-analytics-deny]");
    await deny.click();
    await expect(deny).toHaveAttribute("aria-pressed", "true");
    expect(trackerRequests).toHaveLength(0);
    await grant.focus(); await page.keyboard.press("Enter");
    await expect(grant).toHaveAttribute("aria-pressed", "true");
    await expect.poll(() => trackerRequests.length).toBe(1);
    await expect(page.locator("body")).toHaveAttribute("data-clarity-mask", "true");
    await grant.click(); expect(trackerRequests).toHaveLength(1);
    await Promise.all([page.waitForEvent("load"), deny.click()]);
    await page.waitForLoadState("networkidle");
    await expect(deny).toHaveAttribute("aria-pressed", "true");
    expect(trackerRequests).toHaveLength(1);
    await expect(page.locator("#blog-clarity-script")).toHaveCount(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}
