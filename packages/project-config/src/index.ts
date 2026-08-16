export {
  resolvePostAuthorshipDisclosure,
  type PostAuthorshipDisclosureSource,
} from "./content-provenance.ts";
export {
  GA4_MEASUREMENT_ID_PATTERN,
  resolveGa4AnalyticsConfig,
  type ResolvedAnalyticsConfig,
} from "./analytics.ts";
export {
  DEFAULT_LANGUAGE,
  POST_NAVIGATION_FALLBACK_LANGUAGES,
  SUPPORTED_LANGUAGES,
  resolveLocalizedRoute,
  resolvePostNavigationLink,
  type LocalizedPostLinkCandidate,
  type ResolvedPostNavigationLink,
  type SupportedLanguage,
} from "./i18n.ts";
export {
  GITHUB_PAGES_PRO_LIMITS,
  validatePerformanceBudgets,
  type PerformanceBudgets,
} from "./performance-budgets.ts";
