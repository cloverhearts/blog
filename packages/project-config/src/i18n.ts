import type { SupportedLanguage } from "../../contracts/src/index.ts";

export type { SupportedLanguage } from "../../contracts/src/index.ts";

export const SUPPORTED_LANGUAGES = [
  "en",
  "ko",
  "ja",
] as const satisfies readonly SupportedLanguage[];

export const DEFAULT_LANGUAGE: SupportedLanguage = "ko";
export const POST_NAVIGATION_FALLBACK_LANGUAGES = [
  "en",
  "ko",
] as const satisfies readonly SupportedLanguage[];

export interface LocalizedPostLinkCandidate {
  readonly language: SupportedLanguage;
  readonly route: string;
}

export interface ResolvedPostNavigationLink
  extends LocalizedPostLinkCandidate {
  readonly usedFallback: boolean;
}

/**
 * Resolve a published post-group link without consulting browser state.
 * Prefer the active page language, then English, then Korean. Callers omit the
 * navigation item when no candidate matches this policy.
 */
export function resolvePostNavigationLink(
  currentLanguage: SupportedLanguage,
  candidates: readonly LocalizedPostLinkCandidate[],
): ResolvedPostNavigationLink | null {
  const priority = [
    currentLanguage,
    ...POST_NAVIGATION_FALLBACK_LANGUAGES.filter(
      (language) => language !== currentLanguage,
    ),
  ];

  for (const language of priority) {
    const candidate = candidates.find((entry) => entry.language === language);
    if (candidate) {
      return {
        ...candidate,
        usedFallback: language !== currentLanguage,
      };
    }
  }

  return null;
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
