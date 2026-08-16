import assert from "node:assert/strict";
import { test } from "vitest";

import { selectInitialLanguage } from "../../apps/blog-web/src/i18n/language-preference.ts";
import { BLOG_MESSAGES } from "../../apps/blog-web/src/i18n/messages.ts";
import {
  renderOriginalPostFooter,
  resolvePostLanguageContext,
  resolveTranslationOrigin,
} from "../../apps/blog-web/src/i18n/translation-origin.ts";
import {
  detectBrowserLanguage,
  resolveLanguagePreference,
  resolveLocalizedRoute,
} from "../../packages/project-config/src/i18n.ts";

const alternates = [
  { language: "en" as const, route: "/en/posts/example/" },
  { language: "ko" as const, route: "/posts/example/" },
  { language: "ja" as const, route: "/ja/posts/example/" },
];

test("uses Korean for unsupported browser languages", () => {
  assert.equal(detectBrowserLanguage(["fr-FR", "de"]), "ko");
});

test("matches Korean and Japanese regional browser languages", () => {
  assert.equal(detectBrowserLanguage(["ko-KR", "en-US"]), "ko");
  assert.equal(detectBrowserLanguage(["ja-JP", "en-US"]), "ja");
});

test("explicit and stored preferences override browser detection", () => {
  assert.equal(
    resolveLanguagePreference({
      explicitLanguage: "en",
      storedLanguage: "ko",
      browserLanguages: ["ja-JP"],
    }),
    "en",
  );
  assert.equal(
    resolveLanguagePreference({
      storedLanguage: "ko",
      browserLanguages: ["ja-JP"],
    }),
    "ko",
  );
});

test("resolves locale-prefixed routes while Korean remains unprefixed", () => {
  assert.equal(resolveLocalizedRoute("ko", "/posts/example/"), "/posts/example/");
  assert.equal(resolveLocalizedRoute("en", "/posts/example/"), "/en/posts/example/");
  assert.equal(resolveLocalizedRoute("ja", "/"), "/ja/");
  assert.throws(() => resolveLocalizedRoute("ko", "posts/example/"));
});

test("selects an existing browser-language route for one automatic navigation", () => {
  assert.deepEqual(
    selectInitialLanguage({
      currentLanguage: "ko",
      alternates,
      browserLanguages: ["en-US"],
    }),
    { selectedLanguage: "en", navigationRoute: "/en/posts/example/" },
  );
  assert.deepEqual(
    selectInitialLanguage({
      currentLanguage: "en",
      alternates,
      browserLanguages: ["ko-KR"],
    }),
    { selectedLanguage: "ko", navigationRoute: null },
  );
});

test("does not navigate when a browser-language translation is unavailable", () => {
  assert.deepEqual(
    selectInitialLanguage({
      currentLanguage: "ko",
      alternates: alternates.filter(({ language }) => language !== "en"),
      browserLanguages: ["en-US"],
    }),
    { selectedLanguage: "en", navigationRoute: null },
  );
});

test("stores an explicit language choice", () => {
  const values = new Map<string, string>();
  const storage = {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
  };

  assert.deepEqual(
    selectInitialLanguage({
      currentLanguage: "ko",
      alternates,
      explicitLanguage: "ja",
      browserLanguages: ["ko-KR"],
      storage,
    }),
    { selectedLanguage: "ja", navigationRoute: "/ja/posts/example/" },
  );
  assert.equal(values.get("blog.language.v1"), "ja");
});

test("provides the same non-empty UI message set for every language", () => {
  const englishKeys = Object.keys(BLOG_MESSAGES.en).sort();
  for (const language of ["ko", "ja"] as const) {
    assert.deepEqual(Object.keys(BLOG_MESSAGES[language]).sort(), englishKeys);
    assert.equal(
      Object.values(BLOG_MESSAGES[language]).every(
        (message) => message.trim().length > 0,
      ),
      true,
    );
  }
});

test("identifies translated variants and links them to the original", () => {
  assert.deepEqual(resolveTranslationOrigin("en", "ko", alternates), {
    isTranslation: true,
    originalLanguage: "ko",
    originalRoute: "/posts/example/",
  });
  assert.deepEqual(resolveTranslationOrigin("ko", "ko", alternates), {
    isTranslation: false,
    originalLanguage: "ko",
    originalRoute: "/posts/example/",
  });
});

test("derives optional browser-language post metadata without redirecting", () => {
  assert.deepEqual(
    resolvePostLanguageContext("en", "ko", "ko", alternates),
    {
      currentLanguage: "en",
      isTranslation: true,
      originalLanguage: "ko",
      originalRoute: "/posts/example/",
      preferredLanguage: "ko",
      preferredRoute: "/posts/example/",
    },
  );
  assert.deepEqual(
    resolvePostLanguageContext("ko", "ko", "en", alternates),
    {
      currentLanguage: "ko",
      isTranslation: false,
      originalLanguage: "ko",
      originalRoute: "/posts/example/",
      preferredLanguage: "en",
      preferredRoute: "/en/posts/example/",
    },
  );
  assert.deepEqual(
    resolvePostLanguageContext(
      "ko",
      "ko",
      "en",
      alternates.filter(({ language }) => language !== "en"),
    ).preferredRoute,
    null,
  );
});

test("rejects translation metadata when the declared original is absent", () => {
  assert.throws(() =>
    resolveTranslationOrigin(
      "en",
      "ko",
      alternates.filter(({ language }) => language !== "ko"),
    ),
  );
});

test("renders an optional original reference from validated metadata", () => {
  const origin = resolveTranslationOrigin("en", "ko", alternates);
  assert.equal(
    renderOriginalPostFooter("en", origin),
    '<aside data-post-original-reference><span>Original language: 한국어</span><a href="/posts/example/">Original post</a></aside>',
  );
  assert.doesNotMatch(renderOriginalPostFooter("en", origin), /review|nuance/iu);
});

test("omits the optional original reference from the source-language post", () => {
  const origin = resolveTranslationOrigin("ko", "ko", alternates);
  assert.equal(renderOriginalPostFooter("ko", origin), "");
});
