import assert from "node:assert/strict";
import { test } from "vitest";

import { BLOG_MESSAGES } from "../../apps/blog-web/src/i18n/messages.ts";
import {
  renderOriginalPostFooter,
  resolveTranslationOrigin,
} from "../../apps/blog-web/src/i18n/translation-origin.ts";
import { resolvePublishedTranslationLanguages } from "../../packages/content-compiler/src/translation-publication.ts";
import {
  resolveLocalizedRoute,
  resolvePostNavigationLink,
} from "../../packages/project-config/src/i18n.ts";

const alternates = [
  { language: "en" as const, route: "/en/posts/example/" },
  { language: "ko" as const, route: "/posts/example/" },
  { language: "ja" as const, route: "/ja/posts/example/" },
];

test("resolves locale-prefixed routes while Korean remains unprefixed", () => {
  assert.equal(resolveLocalizedRoute("ko", "/posts/example/"), "/posts/example/");
  assert.equal(resolveLocalizedRoute("en", "/posts/example/"), "/en/posts/example/");
  assert.equal(resolveLocalizedRoute("ja", "/"), "/ja/");
  assert.throws(() => resolveLocalizedRoute("ko", "posts/example/"));
});

test("resolves post navigation in the active language before fallbacks", () => {
  assert.deepEqual(
    resolvePostNavigationLink("ja", alternates),
    {
      language: "ja",
      route: "/ja/posts/example/",
      usedFallback: false,
    },
  );
  assert.deepEqual(
    resolvePostNavigationLink("ko", alternates),
    {
      language: "ko",
      route: "/posts/example/",
      usedFallback: false,
    },
  );
});

test("falls back to English, then Korean, and otherwise omits the post link", () => {
  assert.deepEqual(
    resolvePostNavigationLink(
      "ja",
      alternates.filter(({ language }) => language !== "ja"),
    ),
    {
      language: "en",
      route: "/en/posts/example/",
      usedFallback: true,
    },
  );
  assert.deepEqual(
    resolvePostNavigationLink("ja", [alternates[1]!]),
    {
      language: "ko",
      route: "/posts/example/",
      usedFallback: true,
    },
  );
  assert.equal(resolvePostNavigationLink("ja", []), null);
  assert.equal(
    resolvePostNavigationLink("ko", [alternates[2]!]),
    null,
  );
});

test("publishes reviewed translation variants independently", () => {
  assert.deepEqual(
    resolvePublishedTranslationLanguages([
      {
        language: "ko",
        originalLanguage: "ko",
        translationStatus: "source",
        draft: false,
      },
      {
        language: "en",
        originalLanguage: "ko",
        translationStatus: "reviewed",
        draft: false,
      },
      {
        language: "ja",
        originalLanguage: "ko",
        translationStatus: "ai-draft",
        draft: true,
      },
    ]),
    ["ko", "en"],
  );
  assert.deepEqual(
    resolvePublishedTranslationLanguages([
      {
        language: "ko",
        originalLanguage: "ko",
        translationStatus: "source",
        draft: false,
      },
    ]),
    ["ko"],
  );
});

test("rejects publication before the authored original or owner review", () => {
  assert.throws(() =>
    resolvePublishedTranslationLanguages([
      {
        language: "ko",
        originalLanguage: "ko",
        translationStatus: "source",
        draft: true,
      },
      {
        language: "en",
        originalLanguage: "ko",
        translationStatus: "reviewed",
        draft: false,
      },
    ]),
  );
  assert.throws(() =>
    resolvePublishedTranslationLanguages([
      {
        language: "ko",
        originalLanguage: "ko",
        translationStatus: "source",
        draft: false,
      },
      {
        language: "en",
        originalLanguage: "ko",
        translationStatus: "ai-draft",
        draft: false,
      },
    ]),
  );
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
