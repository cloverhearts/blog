import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "vitest";
import { parse } from "yaml";

import { BLOG_MESSAGES } from "../../apps/blog-web/src/i18n/messages.ts";
import { rootLanguageTarget, applyRootLanguageSelection } from "../../apps/blog-web/src/i18n/root-language.js";
import { siteConfigSchema } from "../../packages/project-config/src/config-schemas.ts";
import {
  renderOriginalPostFooter,
  resolveTranslationOrigin,
} from "../../apps/blog-web/src/i18n/translation-origin.ts";
import { resolvePublishedTranslationLanguages } from "../../packages/content-compiler/src/translation-publication.ts";
import {
  resolveLocalizedRoute,
  resolvePostNavigationLink,
} from "../../packages/project-config/src/i18n.ts";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

const homes = { ko: "/", en: "/en/", ja: "/ja/" };
const at = (pathname = "/", search = "", hash = "") => ({ pathname, search, hash });

test("selects the first supported browser language only at the root", () => {
  for (const [languages, expected] of [
    [["en-US", "ja-JP"], "/en/"], [["JA-jp", "en"], "/ja/"],
    [["fr-FR", "ja"], "/ja/"], [["ko-KR", "en-US"], null],
    [["de", "fr"], null], [[], null], [[null, "", "english"], null],
  ] as const) {
    assert.equal(rootLanguageTarget(at(), languages, homes, "ko"), expected);
    assert.equal(rootLanguageTarget(at(), languages, homes, "ko"), expected);
  }
  for (const path of ["/en/", "/ja/", "/posts/", "/posts/example/", "/search/", "/profile/", "/404.html", "/missing/", "/index.html", "//", "/page/2/"]) {
    assert.equal(rootLanguageTarget(at(path), ["en"], homes, "ko"), null, path);
  }
});

test("preserves explicit Korean choice query fragments and base-path boundaries", () => {
  assert.equal(rootLanguageTarget(at("/", "?lang=ko", "#main"), ["en"], homes, "ko"), null);
  assert.equal(rootLanguageTarget(at("/", "?q=test", "#main"), ["ja"], homes, "ko"), "/ja/?q=test#main");
  const prefixed = { ko: "/blog/", en: "/blog/en/", ja: "/blog/ja/" };
  assert.equal(rootLanguageTarget(at("/blog/"), ["en-GB"], prefixed, "ko"), "/blog/en/");
  assert.equal(rootLanguageTarget(at("/blog/", "?lang=ko"), ["ja"], prefixed, "ko"), null);
  for (const path of ["/", "/blog", "/blog/index.html", "/blog/posts/", "/blog/en/", "/blogs/"]) {
    assert.equal(rootLanguageTarget(at(path), ["ja"], prefixed, "ko"), null);
  }
  for (const target of ["//evil.test/", "https://evil.test/", "/../evil/", "/en/?redirect=1", "/\\evil.test/", "/en/#test"]) {
    assert.equal(rootLanguageTarget(at(), ["en"], { ...homes, en: target }, "ko"), null);
  }
});

test("redirects with replace and keeps static fallback when preferences are unavailable", () => {
  const redirects: string[] = [];
  const browser = {
    location: { ...at(), replace: (target: string) => redirects.push(target) },
    navigator: { languages: ["ja-JP"], language: "en-US" },
  };
  const document = { querySelector: () => ({ dataset: { languageHomes: JSON.stringify(homes), defaultLanguage: "ko" } }) };
  const run = () => applyRootLanguageSelection(browser as unknown as Window, document as unknown as Document);
  run();
  assert.deepEqual(redirects, ["/ja/"]);
  browser.navigator.languages = [];
  run();
  assert.deepEqual(redirects, ["/ja/", "/en/"]);
  browser.location.pathname = "/en/";
  let preferenceReads = 0;
  Object.defineProperty(browser, "navigator", { get() { preferenceReads += 1; throw new Error("Preferences unavailable"); } });
  run(); // No preference access or redirection on direct localized URLs.
  assert.equal(preferenceReads, 0);
  browser.location.pathname = "/";
  assert.doesNotThrow(run);
  assert.equal(redirects.length, 2);
});

test("requires site schema eight and the explicit root-only routing policy", () => {
  const site = parse(readFileSync(resolve(repositoryRoot, "config/site.yaml"), "utf8"));
  assert.ok(siteConfigSchema.safeParse(site).success);
  assert.equal(siteConfigSchema.safeParse({ ...site, schemaVersion: 7 }).success, false);
  for (const browserSelection of ["manual-only", "always", undefined]) {
    assert.equal(siteConfigSchema.safeParse({ ...site, languages: { ...site.languages, browserSelection } }).success, false);
  }
});

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

test("keeps Applied AI Engineer branding consistent across localized owner copy", () => {
  const design = readFileSync(resolve(repositoryRoot, "DESIGN.md"), "utf8");
  const site = parse(
    readFileSync(resolve(repositoryRoot, "config/site.yaml"), "utf8"),
  ) as {
    readonly identity: {
      readonly owner: {
        readonly shortBios: Readonly<Record<"en" | "ko" | "ja", string>>;
      };
    };
  };

  assert.deepEqual(
    Object.fromEntries(
      (["en", "ko", "ja"] as const).map((language) => [
        language,
        BLOG_MESSAGES[language].authorRole,
      ]),
    ),
    {
      en: "Applied AI Engineer",
      ko: "Applied AI Engineer",
      ja: "Applied AI Engineer",
    },
  );
  assert.match(BLOG_MESSAGES.en.heroEyebrow, /Applied AI Engineer/u);
  assert.match(BLOG_MESSAGES.ko.heroEyebrow, /Applied AI Engineer/u);
  assert.match(BLOG_MESSAGES.ja.heroEyebrow, /Applied AI Engineer/u);
  for (const bio of Object.values(site.identity.owner.shortBios)) {
    assert.match(bio, /Applied AI Engineer/u);
    assert.doesNotMatch(bio, /AI Workflow Engineer/iu);
  }
  assert.match(design, /CloverHearts, an\s+\*\*Applied AI Engineer\*\*/u);
  assert.doesNotMatch(design, /AI Workflow Engineer/iu);
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
    '<aside class="post-original-reference" data-post-original-reference><span>Original language: 한국어</span><a href="/posts/example/">Original post</a></aside>',
  );
  assert.doesNotMatch(renderOriginalPostFooter("en", origin), /review|nuance/iu);
});

test("omits the optional original reference from the source-language post", () => {
  const origin = resolveTranslationOrigin("ko", "ko", alternates);
  assert.equal(renderOriginalPostFooter("ko", origin), "");
});
