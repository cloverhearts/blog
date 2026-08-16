import type { SupportedLanguage } from "../../../../packages/contracts/src/index.ts";

export interface TranslationAlternate {
  readonly language: SupportedLanguage;
  readonly route: string;
}

export interface TranslationOrigin {
  readonly isTranslation: boolean;
  readonly originalLanguage: SupportedLanguage;
  readonly originalRoute: string;
}

export interface PostLanguageContext extends TranslationOrigin {
  readonly currentLanguage: SupportedLanguage;
  readonly preferredLanguage: SupportedLanguage;
  /** Existing sibling route for optional bottom-of-post UX, never an automatic redirect. */
  readonly preferredRoute: string | null;
}

const LANGUAGE_LABELS: Readonly<Record<SupportedLanguage, string>> = {
  en: "English",
  ko: "한국어",
  ja: "日本語",
};

const FOOTER_LABELS: Readonly<
  Record<SupportedLanguage, { originalLanguage: string; originalPost: string }>
> = {
  en: { originalLanguage: "Original language", originalPost: "Original post" },
  ko: { originalLanguage: "원문 언어", originalPost: "원문" },
  ja: { originalLanguage: "原文の言語", originalPost: "原文" },
};

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

/** Resolve disclosure data only from validated post metadata and alternates. */
export function resolveTranslationOrigin(
  currentLanguage: SupportedLanguage,
  originalLanguage: SupportedLanguage,
  alternates: readonly TranslationAlternate[],
): TranslationOrigin {
  const original = alternates.find(
    ({ language }) => language === originalLanguage,
  );

  if (!original) {
    throw new Error(
      `Missing ${originalLanguage} original in post translation alternates`,
    );
  }

  return {
    isTranslation: currentLanguage !== originalLanguage,
    originalLanguage,
    originalRoute: original.route,
  };
}

/**
 * Derive presentation-neutral language context from validated post metadata.
 * A renderer may use this for optional bottom-of-post guidance, but explicit
 * route visits are never redirected by this result.
 */
export function resolvePostLanguageContext(
  currentLanguage: SupportedLanguage,
  originalLanguage: SupportedLanguage,
  preferredLanguage: SupportedLanguage,
  alternates: readonly TranslationAlternate[],
): PostLanguageContext {
  const origin = resolveTranslationOrigin(
    currentLanguage,
    originalLanguage,
    alternates,
  );
  const preferred =
    preferredLanguage === currentLanguage
      ? undefined
      : alternates.find(({ language }) => language === preferredLanguage);

  return {
    ...origin,
    currentLanguage,
    preferredLanguage,
    preferredRoute: preferred?.route ?? null,
  };
}

/**
 * Render an optional original-work reference after a translated article.
 * The final post UX may instead consume PostLanguageContext directly.
 */
export function renderOriginalPostFooter(
  currentLanguage: SupportedLanguage,
  origin: TranslationOrigin,
): string {
  if (!origin.isTranslation) return "";

  const labels = FOOTER_LABELS[currentLanguage];
  const originalLanguage = LANGUAGE_LABELS[origin.originalLanguage];
  return [
    '<aside data-post-original-reference>',
    `<span>${escapeHtml(labels.originalLanguage)}: ${escapeHtml(originalLanguage)}</span>`,
    `<a href="${escapeHtml(origin.originalRoute)}">${escapeHtml(labels.originalPost)}</a>`,
    "</aside>",
  ].join("");
}
