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
const css = readFileSync(resolve(repositoryRoot, "apps/blog-web/src/styles/blog.css"), "utf8")
  .replace(/^@import[^;]+;/mu, "");
let root: string;

test.beforeAll(async () => {
  root = mkdtempSync(resolve(tmpdir(), "blog-recovery-browser-"));
  for (const path of ["config", "CONTENT_RULES.md", "I18N.md", "DESIGN.md"]) {
    cpSync(resolve(repositoryRoot, path), resolve(root, path), { recursive: true });
  }
  for (const path of ["docs/ko", "docs/en", "docs/ja", "assets/content"]) {
    mkdirSync(resolve(root, path), { recursive: true });
  }
  symlinkSync(resolve(repositoryRoot, "node_modules"), resolve(root, "node_modules"));
  const config = loadProjectConfig({ repositoryRoot: root, env: { SITE_ORIGIN: "https://blog.cloverhearts.com" } });
  await compileContent({ config, mode: "production" });
  await buildWeb({ config, mode: "production" });
});

for (const language of ["ko", "en", "ja"]) {
  for (const viewport of [{ width: 1137, height: 905 }, { width: 1920, height: 1080 },
    { width: 390, height: 844 }, { width: 320, height: 320 }]) {
    test(`centers recovery content without clipping: ${language} ${viewport.width}x${viewport.height}`, async ({ page }, testInfo) => {
      await page.setViewportSize(viewport);
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.route("**/*", (route) => route.abort());
      const prefix = language === "ko" ? "" : `${language}/`;
      const html = readFileSync(resolve(root, `.artifacts/web/production/site/${prefix}404/index.html`), "utf8");
      await page.setContent(html);
      await page.addStyleTag({ content: css });
      const section = page.locator(".not-found");
      const box = (await section.boundingBox())!;
      const header = (await page.locator(".site-header").boundingBox())!;
      const code = (await page.locator(".not-found__code").boundingBox())!;
      const nav = (await section.locator("nav").boundingBox())!;
      const target = (viewport.height - header.height) * .8;
      expect(box.height).toBeGreaterThanOrEqual(target - 1);
      const padding = await section.evaluate((element) => {
        const style = getComputedStyle(element);
        return parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
      });
      // Wrapped translations may exceed the minimum even on a tall phone.
      const requiredHeight = nav.y + nav.height - code.y + padding;
      expect(Math.abs(box.height - Math.max(target, requiredHeight))).toBeLessThan(2);
      const topSpace = code.y - box.y;
      const bottomSpace = box.y + box.height - nav.y - nav.height;
      expect(Math.abs(topSpace - bottomSpace)).toBeLessThan(2);
      expect(topSpace).toBeGreaterThanOrEqual(32);
      const elements = await section.locator(":scope > *").all();
      let previousBottom = box.y;
      for (const element of elements) {
        const bounds = (await element.boundingBox())!;
        expect(bounds.y).toBeGreaterThanOrEqual(previousBottom);
        expect(bounds.y + bounds.height).toBeLessThanOrEqual(box.y + box.height);
        previousBottom = bounds.y + bounds.height;
      }
      const links = section.locator("nav a");
      await expect(links).toHaveCount(9);
      for (const link of await links.all()) {
        const bounds = (await link.boundingBox())!;
        expect(bounds.height).toBeGreaterThanOrEqual(44);
        expect(bounds.x).toBeGreaterThanOrEqual(0);
        expect(bounds.x + bounds.width).toBeLessThanOrEqual(viewport.width);
      }
      expect(await section.innerText()).not.toContain("→");
      const footer = (await page.locator(".site-footer").boundingBox())!;
      expect(footer.y).toBeGreaterThanOrEqual(box.y + box.height);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      if (viewport.height === 320) expect(box.height).toBeGreaterThan(target);
      await page.screenshot({ path: testInfo.outputPath("recovery.png"), fullPage: true });
    });
  }
}
