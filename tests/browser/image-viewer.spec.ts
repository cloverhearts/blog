import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { expect, test } from "@playwright/test";
import { renderDocument } from "../../apps/blog-web/src/lib/render-document.ts";

// Optional offline browser runtime; otherwise use Playwright's installed browser.
test.use({ launchOptions: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE
  ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE } : {} });
const repositoryRoot = resolve(import.meta.dirname, "../..");
const css = readFileSync(resolve(repositoryRoot, "apps/blog-web/src/styles/blog.css"), "utf8")
  .replace(/^@import[^;]+;/mu, "");
const enhancement = readFileSync(resolve(repositoryRoot, "apps/blog-web/src/post/image-viewer.js"), "utf8");
const cases = [
  { name: "desktop landscape", viewport: { width: 1137, height: 905 }, image: [1600, 900], caption: "사진의 전체 설명이 잘리지 않고 표시됩니다." },
  { name: "large portrait", viewport: { width: 1920, height: 1080 }, image: [900, 2400], caption: "세로 사진 설명" },
  { name: "mobile portrait", viewport: { width: 390, height: 844 }, image: [900, 2400], caption: "작은 화면에서도 사진과 설명이 함께 보입니다. ".repeat(6) },
  { name: "mobile landscape long caption", viewport: { width: 844, height: 390 }, image: [2400, 300], caption: "긴 설명과 日本語の説明을 끝까지 읽을 수 있습니다. ".repeat(80) },
  { name: "compact unbroken caption", viewport: { width: 320, height: 240 }, image: [1600, 900], caption: "LongUnbrokenCaption".repeat(80) },
  { name: "empty caption", viewport: { width: 390, height: 844 }, image: [400, 400], caption: "" },
];

for (const sample of cases) {
  test(`keeps image viewer content inside the viewport: ${sample.name}`, async ({ page }, testInfo) => {
    await page.setViewportSize(sample.viewport);
    await page.route("**/*", (route) => route.abort());
    const image = `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${sample.image[0]}" height="${sample.image[1]}"><rect width="100%" height="100%" fill="#29493c"/></svg>`)}`;
    await page.setContent(renderDocument({
      language: "ko", title: "Viewer fixture", description: "Isolated layout regression",
      siteName: "Test", canonicalUrl: "https://example.test/posts/viewer/", robots: "noindex,follow",
      homeHref: "/", profileHref: "/profile/", authorName: "Test", searchIndex: "/search/", basePath: "",
      primaryNavigation: [], languageNavigation: [], head: "", footer: "", pageKind: "post",
      body: `<article><div data-article-body><img src="${image}" alt="${sample.caption}"></div></article>`,
    }));
    await page.addStyleTag({ content: css });
    await page.addScriptTag({ content: enhancement });
    const trigger = page.locator("[data-article-body] img");
    await trigger.press("Enter");
    await page.locator("[data-image-viewer-image]").evaluate((element: HTMLImageElement) => element.decode());
    const dialog = page.locator("[data-image-viewer]");
    const caption = page.locator("[data-image-viewer-caption]");
    const imageBox = (await page.locator("[data-image-viewer-image]").boundingBox())!;
    const dialogBox = (await dialog.boundingBox())!;
    const closeBox = (await page.locator("[data-image-viewer-close]").boundingBox())!;
    expect(imageBox.height).toBeGreaterThan(0);
    expect(imageBox.y).toBeGreaterThanOrEqual(closeBox.y + closeBox.height);
    for (const box of [imageBox, dialogBox, closeBox]) {
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.y).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(sample.viewport.width + 1);
      expect(box.y + box.height).toBeLessThanOrEqual(sample.viewport.height + 1);
    }
    if (sample.caption) {
      await expect(caption).toHaveText(sample.caption.trim());
      const box = (await caption.boundingBox())!;
      expect(box.y).toBeGreaterThanOrEqual(imageBox.y + imageBox.height);
      expect(box.y + box.height).toBeLessThanOrEqual(dialogBox.y + dialogBox.height);
      expect(box.x).toBeGreaterThanOrEqual(dialogBox.x);
      expect(box.x + box.width).toBeLessThanOrEqual(dialogBox.x + dialogBox.width);
      const metrics = await caption.evaluate((element) => ({
        overflow: element.scrollHeight > element.clientHeight,
        horizontalOverflow: element.scrollWidth > element.clientWidth,
        padding: getComputedStyle(element).paddingTop,
      }));
      expect(metrics.padding).toBe("6px");
      expect(metrics.horizontalOverflow).toBe(false);
      if (sample.caption.length > 1000) {
        expect(metrics.overflow).toBe(true);
        await caption.focus();
        await page.keyboard.press("End");
        await expect.poll(() => caption.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
      }
    } else {
      await expect(caption).toBeHidden();
    }
    await page.screenshot({ path: testInfo.outputPath("viewer.png") });
    await page.keyboard.press("Escape");
    await expect(dialog).not.toBeVisible();
    await expect(trigger).toBeFocused();
  });
}
