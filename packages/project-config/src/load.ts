import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { ZodError } from "zod";
import { parse } from "yaml";

import {
  sha256File,
  sha256Hex,
  sha256Json,
  type BuildMode,
  type PostAuthorshipDisclosureArtifact,
  type SupportedLanguage,
} from "../../contracts/src/index.ts";
import { resolveGa4AnalyticsConfig, type ResolvedAnalyticsConfig } from "./analytics.ts";
import {
  aiCrawlersConfigSchema,
  analyticsConfigSchema,
  contentProvenanceConfigSchema,
  embedsConfigSchema,
  navigationConfigSchema,
  performanceBudgetsConfigSchema,
  redirectsConfigSchema,
  routesConfigSchema,
  securityConfigSchema,
  siteConfigSchema,
  taxonomyConfigSchema,
  type AiCrawlersConfig,
  type AnalyticsYamlConfig,
  type ContentProvenanceConfig,
  type EmbedsConfig,
  type NavigationConfig,
  type PerformanceBudgetsConfig,
  type RedirectsConfig,
  type RoutesConfig,
  type SecurityConfig,
  type SiteConfig,
  type TaxonomyConfig,
} from "./config-schemas.ts";
import { resolvePostAuthorshipDisclosure } from "./content-provenance.ts";
import { ConfigurationError, issue, issuesFromZod, throwIfIssues } from "./diagnostics.ts";
import {
  DEFAULT_LANGUAGE,
  POST_NAVIGATION_FALLBACK_LANGUAGES,
  SUPPORTED_LANGUAGES,
  resolveLocalizedRoute,
} from "./i18n.ts";
import { validatePerformanceBudgets, type PerformanceBudgets } from "./performance-budgets.ts";
import {
  joinPublicUrl,
  normalizeBasePath,
  normalizeLogicalRoute,
  normalizeOrigin,
} from "./urls.ts";

export interface LoadProjectConfigOptions {
  readonly repositoryRoot: string;
  readonly env?: Readonly<Record<string, string | undefined>>;
  readonly requireDeploymentInputs?: boolean;
  readonly expectedProductionOrigin?: boolean;
}

export interface RouteRegistry {
  readonly reservedRoutes: readonly string[];
  readonly reservedPrefixes: readonly string[];
  readonly redirectSources: readonly string[];
  readonly systemRoutes: readonly string[];
  assertAvailable(route: string, ownerId: string): void;
}

export interface ProjectConfig {
  readonly repositoryRoot: string;
  readonly site: SiteConfig;
  readonly routes: RoutesConfig;
  readonly taxonomy: TaxonomyConfig;
  readonly navigation: NavigationConfig;
  readonly redirects: RedirectsConfig;
  readonly security: SecurityConfig;
  readonly embeds: EmbedsConfig;
  readonly aiCrawlers: AiCrawlersConfig;
  readonly contentProvenance: ContentProvenanceConfig;
  readonly analytics: AnalyticsYamlConfig;
  readonly performanceBudgets: PerformanceBudgets;
  readonly performanceBudgetsSource: PerformanceBudgetsConfig;
  readonly authorshipDisclosure: PostAuthorshipDisclosureArtifact;
  readonly resolved: {
    readonly origin: string;
    readonly basePath: string;
    readonly ga4: ResolvedAnalyticsConfig;
  };
  readonly hashes: {
    readonly configHash: string;
    readonly contentRulesHash: string;
    readonly localizationRulesHash: string;
  };
  readonly routeRegistry: RouteRegistry;
  resolvePublicUrl(logicalRoute: string): string;
  localizeRoute(language: SupportedLanguage, logicalRoute: string): string;
  normalizeRoute(route: string): string;
}

function readYamlFile(path: string): unknown {
  return parse(readFileSync(path, "utf8"));
}

function parseFile<T>(
  path: string,
  schema: { parse: (value: unknown) => T },
  issues: string[],
): T | undefined {
  try {
    return schema.parse(readYamlFile(path));
  } catch (error) {
    if (error instanceof ZodError) {
      issues.push(...issuesFromZod(path, error));
      return undefined;
    }
    issues.push(issue(path, error instanceof Error ? error.message : String(error)));
    return undefined;
  }
}

function languageById(site: SiteConfig, id: SupportedLanguage) {
  return site.languages.supported.find((language) => language.id === id);
}

function validateSiteSemantics(site: SiteConfig, issues: string[]): void {
  if (site.languages.default !== DEFAULT_LANGUAGE) {
    issues.push(issue("config/site.yaml.languages.default", "must be ko"));
  }
  if (site.languages.source !== DEFAULT_LANGUAGE) {
    issues.push(issue("config/site.yaml.languages.source", "must be ko"));
  }
  if (site.languages.browserSelection !== "manual-only") {
    issues.push(
      issue("config/site.yaml.languages.browserSelection", "must be manual-only"),
    );
  }
  const supportedIds = site.languages.supported.map(({ id }) => id);
  if (
    supportedIds.length !== SUPPORTED_LANGUAGES.length ||
    SUPPORTED_LANGUAGES.some((language) => !supportedIds.includes(language))
  ) {
    issues.push(
      issue(
        "config/site.yaml.languages.supported",
        "must declare ko, en, and ja exactly once",
      ),
    );
  }
  const uniqueIds = new Set(supportedIds);
  if (uniqueIds.size !== supportedIds.length) {
    issues.push(issue("config/site.yaml.languages.supported", "language ids must be unique"));
  }
  for (const language of site.languages.supported) {
    if (language.id === "ko" && language.routePrefix !== "") {
      issues.push(issue("config/site.yaml.languages.supported.ko.routePrefix", "must be empty"));
    }
    if (language.id !== "ko" && language.routePrefix !== `/${language.id}`) {
      issues.push(
        issue(
          `config/site.yaml.languages.supported.${language.id}.routePrefix`,
          `must be /${language.id}`,
        ),
      );
    }
  }
  if (
    site.languages.postNavigationFallback.join(",") !==
    POST_NAVIGATION_FALLBACK_LANGUAGES.join(",")
  ) {
    issues.push(
      issue(
        "config/site.yaml.languages.postNavigationFallback",
        "must be en then ko",
      ),
    );
  }
}

function validateNavigation(
  navigation: NavigationConfig,
  routes: RoutesConfig,
  issues: string[],
): void {
  for (const [index, item] of [...navigation.primary, ...navigation.footer].entries()) {
    if (item.type === "internal") {
      try {
        normalizeLogicalRoute(item.href, routes.trailingSlash);
      } catch (error) {
        issues.push(
          issue(
            `config/navigation.yaml[${index}].href`,
            error instanceof Error ? error.message : String(error),
          ),
        );
      }
    } else if (!item.href.startsWith("https://")) {
      issues.push(
        issue(`config/navigation.yaml[${index}].href`, "external href must be HTTPS"),
      );
    }
  }
}

function validateTaxonomy(taxonomy: TaxonomyConfig, issues: string[]): void {
  const tagIds = new Set(Object.keys(taxonomy.tags));
  for (const [alias, target] of Object.entries(taxonomy.tagAliases)) {
    if (!tagIds.has(target)) {
      issues.push(
        issue(`config/taxonomy.yaml.tagAliases.${alias}`, `unknown tag id ${target}`),
      );
    }
  }
}

function validateEmbeds(embeds: EmbedsConfig, issues: string[]): void {
  if (embeds.policy.allowRemotePluginPackages) {
    issues.push(
      issue("config/embeds.yaml.policy.allowRemotePluginPackages", "remote plugins are forbidden"),
    );
  }
  const ids = new Set<string>();
  for (const plugin of embeds.plugins) {
    if (ids.has(plugin.id)) {
      issues.push(issue(`config/embeds.yaml.plugins.${plugin.id}`, "duplicate plugin id"));
    }
    ids.add(plugin.id);
    if (plugin.package.startsWith("http:") || plugin.package.startsWith("https:")) {
      issues.push(
        issue(`config/embeds.yaml.plugins.${plugin.id}.package`, "remote package references are forbidden"),
      );
    }
  }
}

function validateCrawlers(crawlers: AiCrawlersConfig, issues: string[]): void {
  const userAgents = new Set<string>();
  const ids = new Set<string>();
  for (const crawler of crawlers.crawlers) {
    if (ids.has(crawler.id)) {
      issues.push(issue(`config/ai-crawlers.yaml.crawlers.${crawler.id}`, "duplicate crawler id"));
    }
    ids.add(crawler.id);
    for (const userAgent of crawler.userAgents) {
      const identity = userAgent.toLowerCase();
      if (userAgents.has(identity)) {
        issues.push(
          issue(`config/ai-crawlers.yaml.crawlers.${crawler.id}`, `duplicate User-Agent ${userAgent}`),
        );
      }
      userAgents.add(identity);
      if (!/^[A-Za-z0-9][A-Za-z0-9._-]*$/u.test(userAgent)) {
        issues.push(
          issue(`config/ai-crawlers.yaml.crawlers.${crawler.id}`, `invalid User-Agent ${userAgent}`),
        );
      }
    }
  }
}

function createRouteRegistry(
  routes: RoutesConfig,
  redirects: RedirectsConfig,
): RouteRegistry {
  const reservedRoutes = [
    ...routes.reservedFiles,
    routes.paths.rss,
    routes.paths.sitemap,
    routes.paths.llms,
    "/robots.txt",
  ];
  const reservedPrefixes = [...routes.reservedPrefixes];
  const redirectSources = redirects.redirects.map((entry) => entry.from);
  const systemRoutes = [
    routes.paths.home,
    routes.paths.posts,
    routes.paths.categories,
    routes.paths.tags,
    routes.paths.archive,
    routes.paths.search,
    routes.paths.notFound,
  ];
  const claimed = new Map<string, string>();

  const assertAvailable = (route: string, ownerId: string): void => {
    const normalized = normalizeLogicalRoute(route, routes.trailingSlash);
    if (reservedRoutes.includes(normalized)) {
      throw new ConfigurationError([
        issue(normalized, `route is reserved and cannot be claimed by ${ownerId}`),
      ]);
    }
    if (reservedPrefixes.some((prefix) => normalized.startsWith(prefix) && !ownerId.startsWith("asset:"))) {
      if (
        !normalized.startsWith(routes.paths.contentAssets) &&
        !normalized.startsWith(routes.paths.managedAssets) &&
        !normalized.startsWith(routes.paths.assets)
      ) {
        throw new ConfigurationError([
          issue(normalized, `route uses a reserved prefix claimed by ${ownerId}`),
        ]);
      }
    }
    if (redirectSources.includes(normalized)) {
      throw new ConfigurationError([
        issue(normalized, `route collides with a redirect source for ${ownerId}`),
      ]);
    }
    const existing = claimed.get(normalized);
    if (existing && existing !== ownerId) {
      throw new ConfigurationError([
        issue(normalized, `route collision between ${existing} and ${ownerId}`),
      ]);
    }
    claimed.set(normalized, ownerId);
  };

  return {
    reservedRoutes,
    reservedPrefixes,
    redirectSources,
    systemRoutes,
    assertAvailable,
  };
}

export function loadProjectConfig(options: LoadProjectConfigOptions): ProjectConfig {
  const root = options.repositoryRoot;
  const env = options.env ?? process.env;
  const issues: string[] = [];
  const configDirectory = resolve(root, "config");

  const site = parseFile(resolve(configDirectory, "site.yaml"), siteConfigSchema, issues);
  const routes = parseFile(resolve(configDirectory, "routes.yaml"), routesConfigSchema, issues);
  const taxonomy = parseFile(
    resolve(configDirectory, "taxonomy.yaml"),
    taxonomyConfigSchema,
    issues,
  );
  const navigation = parseFile(
    resolve(configDirectory, "navigation.yaml"),
    navigationConfigSchema,
    issues,
  );
  const redirects = parseFile(
    resolve(configDirectory, "redirects.yaml"),
    redirectsConfigSchema,
    issues,
  );
  const security = parseFile(
    resolve(configDirectory, "security.yaml"),
    securityConfigSchema,
    issues,
  );
  const embeds = parseFile(resolve(configDirectory, "embeds.yaml"), embedsConfigSchema, issues);
  const aiCrawlers = parseFile(
    resolve(configDirectory, "ai-crawlers.yaml"),
    aiCrawlersConfigSchema,
    issues,
  );
  const contentProvenance = parseFile(
    resolve(configDirectory, "content-provenance.yaml"),
    contentProvenanceConfigSchema,
    issues,
  );
  const analytics = parseFile(
    resolve(configDirectory, "analytics.yaml"),
    analyticsConfigSchema,
    issues,
  );
  const performanceBudgetsSource = parseFile(
    resolve(configDirectory, "performance-budgets.yaml"),
    performanceBudgetsConfigSchema,
    issues,
  );

  if (site) validateSiteSemantics(site, issues);
  if (navigation && routes) validateNavigation(navigation, routes, issues);
  if (taxonomy) validateTaxonomy(taxonomy, issues);
  if (embeds) validateEmbeds(embeds, issues);
  if (aiCrawlers) validateCrawlers(aiCrawlers, issues);

  let performanceBudgets: PerformanceBudgets | undefined;
  if (performanceBudgetsSource) {
    try {
      performanceBudgets = validatePerformanceBudgets(performanceBudgetsSource.budgets);
    } catch (error) {
      issues.push(
        issue(
          "config/performance-budgets.yaml",
          error instanceof Error ? error.message : String(error),
        ),
      );
    }
  }

  let authorshipDisclosure: PostAuthorshipDisclosureArtifact | undefined;
  if (contentProvenance) {
    try {
      authorshipDisclosure = resolvePostAuthorshipDisclosure(
        contentProvenance.postAuthorship,
      );
    } catch (error) {
      issues.push(
        issue(
          "config/content-provenance.yaml",
          error instanceof Error ? error.message : String(error),
        ),
      );
    }
  }

  let origin = "";
  let basePath = "";
  let ga4: ResolvedAnalyticsConfig | undefined;
  if (site && analytics) {
    const originRaw = env[site.originEnvironmentVariable];
    const basePathRaw = env[site.basePathEnvironmentVariable];
    try {
      if (options.requireDeploymentInputs && (originRaw === undefined || originRaw.trim() === "")) {
        throw new Error(`${site.originEnvironmentVariable} is required for this build`);
      }
      origin = normalizeOrigin(
        originRaw && originRaw.trim().length > 0 ? originRaw : site.production.origin,
        site.originEnvironmentVariable,
      );
      if (origin !== site.production.origin && options.expectedProductionOrigin !== false) {
        if (options.requireDeploymentInputs) {
          throw new Error(
            `${site.originEnvironmentVariable} must match config/site.yaml production.origin`,
          );
        }
      }
    } catch (error) {
      issues.push(issue("SITE_ORIGIN", error instanceof Error ? error.message : String(error)));
    }
    try {
      basePath = normalizeBasePath(
        basePathRaw ?? site.production.basePath,
        site.basePathEnvironmentVariable,
      );
    } catch (error) {
      issues.push(issue("SITE_BASE_PATH", error instanceof Error ? error.message : String(error)));
    }
    try {
      ga4 = resolveGa4AnalyticsConfig(env, analytics.measurementIdEnvironmentVariable);
    } catch (error) {
      issues.push(
        issue(
          analytics.measurementIdEnvironmentVariable,
          error instanceof Error ? error.message : String(error),
        ),
      );
    }
  }

  throwIfIssues(issues);

  if (
    !site ||
    !routes ||
    !taxonomy ||
    !navigation ||
    !redirects ||
    !security ||
    !embeds ||
    !aiCrawlers ||
    !contentProvenance ||
    !analytics ||
    !performanceBudgetsSource ||
    !performanceBudgets ||
    !authorshipDisclosure ||
    !ga4
  ) {
    throw new ConfigurationError(["Configuration failed to load a required file."]);
  }

  const configHash = sha256Json({
    site,
    routes,
    taxonomy,
    navigation,
    redirects,
    security,
    embeds,
    aiCrawlers,
    contentProvenance,
    analytics,
    performanceBudgetsSource,
    origin,
    basePath,
  });

  const routeRegistry = createRouteRegistry(routes, redirects);
  const config: ProjectConfig = {
    repositoryRoot: root,
    site,
    routes,
    taxonomy,
    navigation,
    redirects,
    security,
    embeds,
    aiCrawlers,
    contentProvenance,
    analytics,
    performanceBudgets,
    performanceBudgetsSource,
    authorshipDisclosure,
    resolved: {
      origin,
      basePath,
      ga4,
    },
    hashes: {
      configHash,
      contentRulesHash: sha256File(resolve(root, "CONTENT_RULES.md")),
      localizationRulesHash: sha256File(resolve(root, "I18N.md")),
    },
    routeRegistry,
    resolvePublicUrl(logicalRoute: string): string {
      return joinPublicUrl(
        origin,
        basePath,
        normalizeLogicalRoute(logicalRoute, routes.trailingSlash),
      );
    },
    localizeRoute(language: SupportedLanguage, logicalRoute: string): string {
      return resolveLocalizedRoute(
        language,
        normalizeLogicalRoute(logicalRoute, routes.trailingSlash),
      );
    },
    normalizeRoute(route: string): string {
      return normalizeLogicalRoute(route, routes.trailingSlash);
    },
  };

  void languageById;
  void sha256Hex;
  return Object.freeze(config);
}

export function loadProjectConfigOrThrow(
  repositoryRoot: string,
  env?: Readonly<Record<string, string | undefined>>,
): ProjectConfig {
  return env === undefined
    ? loadProjectConfig({ repositoryRoot })
    : loadProjectConfig({ repositoryRoot, env });
}

export { ConfigurationError };
