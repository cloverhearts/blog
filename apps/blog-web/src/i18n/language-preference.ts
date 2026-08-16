import {
  DEFAULT_LANGUAGE,
  resolveLanguagePreference,
  type SupportedLanguage,
} from "../../../../packages/project-config/src/i18n.ts";

export interface LanguageAlternate {
  readonly language: SupportedLanguage;
  readonly route: string;
}

export interface LanguageBootstrapOptions {
  readonly currentLanguage: SupportedLanguage;
  readonly alternates: readonly LanguageAlternate[];
  readonly explicitLanguage?: string | null;
  readonly storageKey?: string;
  readonly browserLanguages?: readonly string[];
  readonly storage?: Pick<Storage, "getItem" | "setItem"> | null;
}

export interface LanguageBootstrapResult {
  readonly selectedLanguage: SupportedLanguage;
  /** Existing same-site static route to navigate to once with location.replace. */
  readonly navigationRoute: string | null;
}

/**
 * Selects an existing preferred-language route without fetching or replacing
 * article content in place. The browser bootstrap may perform one same-site
 * location.replace navigation when navigationRoute is non-null.
 */
export function selectInitialLanguage({
  currentLanguage,
  alternates,
  explicitLanguage,
  storageKey = "blog.language.v1",
  browserLanguages = [],
  storage = null,
}: LanguageBootstrapOptions): LanguageBootstrapResult {
  const storedLanguage = storage?.getItem(storageKey) ?? null;
  const selectedLanguage = resolveLanguagePreference({
    explicitLanguage: explicitLanguage ?? null,
    storedLanguage,
    browserLanguages,
  });

  if (explicitLanguage) storage?.setItem(storageKey, selectedLanguage);

  if (
    currentLanguage !== DEFAULT_LANGUAGE ||
    selectedLanguage === currentLanguage
  ) {
    return { selectedLanguage, navigationRoute: null };
  }

  const alternate = alternates.find(
    ({ language }) => language === selectedLanguage,
  );
  return { selectedLanguage, navigationRoute: alternate?.route ?? null };
}

export function rememberLanguage(
  language: SupportedLanguage,
  storage: Pick<Storage, "setItem">,
  storageKey = "blog.language.v1",
): void {
  storage.setItem(storageKey, language);
}
