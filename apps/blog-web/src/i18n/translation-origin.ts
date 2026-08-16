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
 * Render the only reader-facing translation provenance: a semantic reference
 * after a translated article to its validated original static route.
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
