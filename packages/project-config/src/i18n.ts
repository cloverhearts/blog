import type { SupportedLanguage } from "../../contracts/src/index.ts";

export type { SupportedLanguage } from "../../contracts/src/index.ts";

export const SUPPORTED_LANGUAGES = [
  "en",
  "ko",
  "ja",
] as const satisfies readonly SupportedLanguage[];

export const DEFAULT_LANGUAGE: SupportedLanguage = "ko";

const LANGUAGE_SET = new Set<string>(SUPPORTED_LANGUAGES);

function asSupportedLanguage(value: string | null | undefined) {
  if (!value) return null;
  const [primary] = value.trim().toLowerCase().split("-");
  return primary && LANGUAGE_SET.has(primary)
    ? (primary as SupportedLanguage)
    : null;
}

export function detectBrowserLanguage(
  browserLanguages: readonly string[],
): SupportedLanguage {
  for (const language of browserLanguages) {
    const supported = asSupportedLanguage(language);
    if (supported) return supported;
  }
  return DEFAULT_LANGUAGE;
}

export interface LanguagePreferenceInput {
  readonly explicitLanguage?: string | null;
  readonly storedLanguage?: string | null;
  readonly browserLanguages?: readonly string[];
}

/** Explicit choice wins, then stored choice, then browser language, then Korean. */
export function resolveLanguagePreference({
  explicitLanguage,
  storedLanguage,
  browserLanguages = [],
}: LanguagePreferenceInput): SupportedLanguage {
  return (
    asSupportedLanguage(explicitLanguage) ??
    asSupportedLanguage(storedLanguage) ??
    detectBrowserLanguage(browserLanguages)
  );
}

/** Resolve one locale-neutral logical route without knowing a deployment base path. */
export function resolveLocalizedRoute(
  language: SupportedLanguage,
  logicalRoute: string,
): string {
  if (!logicalRoute.startsWith("/")) {
    throw new Error(`A logical route must begin with '/': ${logicalRoute}`);
  }

  if (language === DEFAULT_LANGUAGE) return logicalRoute;
  if (logicalRoute === "/") return `/${language}/`;
  return `/${language}${logicalRoute}`;
}
