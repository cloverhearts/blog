import type {
  SupportedLanguage,
  TranslationStatus,
} from "../../contracts/src/index.ts";

export interface TranslationPublicationCandidate {
  readonly language: SupportedLanguage;
  readonly originalLanguage: SupportedLanguage;
  readonly translationStatus: TranslationStatus;
  readonly draft: boolean;
}

/**
 * Validate per-variant publication and return the languages eligible for a
 * production artifact. Missing translations are valid; the authored original
 * must be published before any translated variant.
 */
export function resolvePublishedTranslationLanguages(
  candidates: readonly TranslationPublicationCandidate[],
): readonly SupportedLanguage[] {
  if (candidates.length === 0) {
    throw new Error("A translation group must contain an authored original");
  }

  const originalLanguage = candidates[0]!.originalLanguage;
  const languages = new Set<SupportedLanguage>();

  for (const candidate of candidates) {
    if (candidate.originalLanguage !== originalLanguage) {
      throw new Error("Translation variants must agree on originalLanguage");
    }
    if (languages.has(candidate.language)) {
      throw new Error(`Duplicate ${candidate.language} translation variant`);
    }
    languages.add(candidate.language);

    const isOriginal = candidate.language === originalLanguage;
    if (isOriginal && candidate.translationStatus !== "source") {
      throw new Error("The authored original must use translationStatus source");
    }
    if (!isOriginal && candidate.translationStatus === "source") {
      throw new Error("A translated variant cannot use translationStatus source");
    }
    if (
      !candidate.draft &&
      !isOriginal &&
      candidate.translationStatus !== "reviewed"
    ) {
      throw new Error("A published translation must be owner-reviewed");
    }
  }

  const original = candidates.find(
    (candidate) => candidate.language === originalLanguage,
  );
  if (!original) {
    throw new Error(`Missing authored original variant: ${originalLanguage}`);
  }

  const published = candidates.filter((candidate) => !candidate.draft);
  if (published.length > 0 && original.draft) {
    throw new Error("The authored original must publish before translations");
  }

  return published.map(({ language }) => language);
}
