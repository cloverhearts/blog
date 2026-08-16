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
  SUPPORTED_LANGUAGES,
  detectBrowserLanguage,
  resolveLanguagePreference,
  resolveLocalizedRoute,
  type LanguagePreferenceInput,
  type SupportedLanguage,
} from "./i18n.ts";
