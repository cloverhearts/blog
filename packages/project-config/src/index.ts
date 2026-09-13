export {
  resolvePostAuthorshipDisclosure,
  type PostAuthorshipDisclosureSource,
} from "./content-provenance.ts";
export {
  CLARITY_PROJECT_ID_PATTERN,
  resolveClarityAnalyticsConfig,
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
export {
  ConfigurationError,
  loadProjectConfig,
  loadProjectConfigOrThrow,
  type LoadProjectConfigOptions,
  type ProjectConfig,
  type RouteRegistry,
} from "./load.ts";
export {
  joinPublicUrl,
  normalizeBasePath,
  normalizeLogicalRoute,
  normalizeOrigin,
} from "./urls.ts";
export type {
  AiCrawlersConfig,
  AnalyticsYamlConfig,
  ContentProvenanceConfig,
  CuratedCollectionDefinition,
  CuratedCollectionsConfig,
  EmbedsConfig,
  NavigationConfig,
  OwnerContact,
  PerformanceBudgetsConfig,
  RedirectsConfig,
  RoutesConfig,
  SecurityConfig,
  SiteConfig,
  TaxonomyConfig,
} from "./config-schemas.ts";
export {
  aiCrawlersConfigSchema,
  analyticsConfigSchema,
  contentProvenanceConfigSchema,
  curatedCollectionsConfigSchema,
  embedsConfigSchema,
  navigationConfigSchema,
  performanceBudgetsConfigSchema,
  redirectsConfigSchema,
  routesConfigSchema,
  securityConfigSchema,
  siteConfigSchema,
  taxonomyConfigSchema,
} from "./config-schemas.ts";
