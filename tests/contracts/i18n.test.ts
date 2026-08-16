import assert from "node:assert/strict";
import test from "node:test";

import { selectInitialLanguage } from "../../apps/blog-web/src/i18n/language-preference.ts";
import { BLOG_MESSAGES } from "../../apps/blog-web/src/i18n/messages.ts";
import {
  renderOriginalPostFooter,
  resolveTranslationOrigin,
} from "../../apps/blog-web/src/i18n/translation-origin.ts";
import {
  detectBrowserLanguage,
  resolveLanguagePreference,
  resolveLocalizedRoute,
} from "../../packages/project-config/src/i18n.ts";

const alternates = [
  { language: "en" as const, route: "/posts/example/" },
  { language: "ko" as const, route: "/ko/posts/example/" },
  { language: "ja" as const, route: "/ja/posts/example/" },
];

test("uses English for unsupported browser languages", () => {
  assert.equal(detectBrowserLanguage(["fr-FR", "de"]), "en");
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

test("resolves locale-prefixed routes while English remains unprefixed", () => {
  assert.equal(resolveLocalizedRoute("en", "/posts/example/"), "/posts/example/");
  assert.equal(resolveLocalizedRoute("ko", "/posts/example/"), "/ko/posts/example/");
  assert.equal(resolveLocalizedRoute("ja", "/"), "/ja/");
  assert.throws(() => resolveLocalizedRoute("ko", "posts/example/"));
});

test("selects an existing browser-language route for one automatic navigation", () => {
  assert.deepEqual(
    selectInitialLanguage({
      currentLanguage: "en",
      alternates,
      browserLanguages: ["ko-KR"],
    }),
    { selectedLanguage: "ko", navigationRoute: "/ko/posts/example/" },
  );
  assert.deepEqual(
    selectInitialLanguage({
      currentLanguage: "ja",
      alternates,
      browserLanguages: ["ko-KR"],
    }),
    { selectedLanguage: "ko", navigationRoute: null },
  );
});

test("does not navigate when a browser-language translation is unavailable", () => {
  assert.deepEqual(
    selectInitialLanguage({
      currentLanguage: "en",
      alternates: alternates.filter(({ language }) => language !== "ko"),
      browserLanguages: ["ko-KR"],
    }),
    { selectedLanguage: "ko", navigationRoute: null },
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
      currentLanguage: "en",
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
    originalRoute: "/ko/posts/example/",
  });
  assert.deepEqual(resolveTranslationOrigin("ko", "ko", alternates), {
    isTranslation: false,
    originalLanguage: "ko",
    originalRoute: "/ko/posts/example/",
  });
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

test("renders only an original reference after a translated post", () => {
  const origin = resolveTranslationOrigin("en", "ko", alternates);
  assert.equal(
    renderOriginalPostFooter("en", origin),
    '<aside data-post-original-reference><span>Original language: 한국어</span><a href="/ko/posts/example/">Original post</a></aside>',
  );
  assert.doesNotMatch(renderOriginalPostFooter("en", origin), /review|nuance/iu);
});

test("omits the original reference from the source-language post", () => {
  const origin = resolveTranslationOrigin("ko", "ko", alternates);
  assert.equal(renderOriginalPostFooter("ko", origin), "");
});
