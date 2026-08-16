import { z } from "zod";

import { supportedLanguageSchema } from "../../contracts/src/index.ts";

const kebabIdSchema = z
  .string()
  .regex(/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/u, "must be lowercase ASCII kebab-case");

const localizedLabelsSchema = z
  .object({
    en: z.string().min(1),
    ko: z.string().min(1),
    ja: z.string().min(1),
  })
  .strict()
  .transform((labels) => labels as Readonly<Record<"en" | "ko" | "ja", string>>);

export const siteConfigSchema = z
  .object({
    schemaVersion: z.literal(6),
    originEnvironmentVariable: z.string().min(1),
    basePathEnvironmentVariable: z.string().min(1),
    production: z
      .object({
        origin: z.string().min(1),
        basePath: z.string(),
      })
      .strict(),
    identity: z
      .object({
        name: z.string().min(1),
        descriptions: localizedLabelsSchema,
        authorName: z.string().min(1),
      })
      .strict(),
    languages: z
      .object({
        default: supportedLanguageSchema,
        source: supportedLanguageSchema,
        primaryExperience: z.array(supportedLanguageSchema).min(1),
        browserSelection: z.literal("manual-only"),
        postNavigationFallback: z.array(supportedLanguageSchema).min(1),
        supported: z
          .array(
            z
              .object({
                id: supportedLanguageSchema,
                htmlLang: z.string().min(1),
                hreflang: z.string().min(1),
                ogLocale: z.string().regex(/^[a-z]{2}_[A-Z]{2}$/u),
                routePrefix: z.string(),
                nativeLabel: z.string().min(1),
              })
              .strict(),
          )
          .min(1),
      })
      .strict(),
    timezone: z.string().min(1),
    defaultManagedPageReturnTo: z.string().min(1),
    search: z
      .object({
        includePosts: z.boolean(),
        includeManagedPages: z.boolean(),
      })
      .strict(),
    listings: z
      .object({
        pageSize: z.number().int().positive(),
      })
      .strict(),
    relatedPosts: z
      .object({
        maxItems: z.number().int().positive(),
      })
      .strict(),
    feeds: z
      .object({
        rss: z.boolean(),
        sitemap: z.boolean(),
      })
      .strict(),
  })
  .strict();

export const routesConfigSchema = z
  .object({
    schemaVersion: z.literal(4),
    trailingSlash: z.enum(["always", "never"]),
    paginationSegment: z
      .string()
      .regex(/^[a-z][a-z0-9]*$/u, "pagination segment must be lowercase ASCII"),
    paths: z
      .object({
        home: z.string().min(1),
        posts: z.string().min(1),
        categories: z.string().min(1),
        tags: z.string().min(1),
        archive: z.string().min(1),
        search: z.string().min(1),
        notFound: z.string().min(1),
        assets: z.string().min(1),
        contentAssets: z.string().min(1),
        managedAssets: z.string().min(1),
        rss: z.string().min(1),
        sitemap: z.string().min(1),
        llms: z.string().min(1),
      })
      .strict(),
    reservedPrefixes: z.array(z.string().min(1)),
    reservedFiles: z.array(z.string().min(1)),
  })
  .strict();

const taxonomyEntrySchema = z
  .object({
    labels: localizedLabelsSchema,
  })
  .strict();

export const taxonomyConfigSchema = z
  .object({
    schemaVersion: z.literal(2),
    categories: z.record(kebabIdSchema, taxonomyEntrySchema),
    tags: z.record(kebabIdSchema, taxonomyEntrySchema),
    tagAliases: z.record(z.string().min(1), kebabIdSchema),
  })
  .strict();

const navigationItemSchema = z
  .object({
    labels: localizedLabelsSchema,
    type: z.enum(["internal", "external"]),
    href: z.string().min(1),
  })
  .strict();

export const navigationConfigSchema = z
  .object({
    schemaVersion: z.literal(2),
    primary: z.array(navigationItemSchema),
    footer: z.array(navigationItemSchema),
  })
  .strict();

export const redirectsConfigSchema = z
  .object({
    schemaVersion: z.literal(1),
    redirects: z.array(
      z
        .object({
          from: z.string().min(1),
          to: z.string().min(1),
        })
        .strict(),
    ),
  })
  .strict();

export const securityConfigSchema = z
  .object({
    schemaVersion: z.literal(1),
    documents: z
      .object({
        referrerPolicy: z.string().min(1),
        allowInlineScripts: z.boolean(),
        allowInlineEventHandlers: z.boolean(),
      })
      .strict(),
    analytics: z
      .object({
        approvedExternalOrigins: z
          .object({
            script: z.array(z.string().min(1)),
            connect: z.array(z.string().min(1)),
            image: z.array(z.string().min(1)),
          })
          .strict(),
      })
      .strict(),
    managedPages: z
      .object({
        approvedExternalOrigins: z
          .object({
            frame: z.array(z.string()),
            script: z.array(z.string()),
            connect: z.array(z.string()),
            image: z.array(z.string()),
            style: z.array(z.string()),
            font: z.array(z.string()),
            media: z.array(z.string()),
          })
          .strict(),
        approvedIframePermissions: z.array(z.string()),
      })
      .strict(),
  })
  .strict();

export const embedsConfigSchema = z
  .object({
    schemaVersion: z.literal(1),
    plugins: z.array(
      z
        .object({
          id: kebabIdSchema,
          package: z.string().min(1),
          enabled: z.boolean(),
          configuration: z.record(z.string(), z.unknown()).optional(),
        })
        .strict(),
    ),
    policy: z
      .object({
        allowRemotePluginPackages: z.boolean(),
        allowNetworkDuringBuild: z.boolean(),
        allowRawHtml: z.boolean(),
        requireStaticFallback: z.boolean(),
        requireAccessibleTitle: z.boolean(),
        requireExplicitSecurityOrigins: z.boolean(),
        requirePrivacyDeclaration: z.boolean(),
        allowProgressiveClientEnhancement: z.boolean(),
      })
      .strict(),
  })
  .strict();

export const aiCrawlersConfigSchema = z
  .object({
    schemaVersion: z.literal(2),
    defaultAccess: z.enum(["allow", "disallow"]),
    dataUse: z
      .object({
        searchAndAnswering: z.enum(["allow", "disallow"]),
        userDirectedRetrieval: z.enum(["allow", "disallow"]),
        modelDevelopment: z.enum(["allow", "disallow"]),
        publicDatasetInclusion: z.enum(["allow", "disallow"]),
        attribution: z.enum(["requested", "required", "not-requested"]),
      })
      .strict(),
    crawlers: z.array(
      z
        .object({
          id: kebabIdSchema,
          provider: z.string().min(1),
          purpose: z.enum([
            "search",
            "training",
            "dataset",
            "user-directed",
            "mixed-search-training",
          ]),
          access: z.enum(["allow", "disallow"]),
          userAgents: z.array(z.string().min(1)).min(1),
          documentation: z.url(),
        })
        .strict(),
    ),
    llms: z
      .object({
        enabled: z.boolean(),
        path: z.string().min(1),
        language: z.literal("en"),
        include: z
          .object({
            languageHomes: z.boolean(),
            sitemap: z.boolean(),
            feeds: z.boolean(),
            intentionalNavigation: z.boolean(),
            allPosts: z.boolean(),
            indexableManagedPages: z.boolean(),
          })
          .strict(),
        guidance: z.array(z.string().min(1)).min(1),
      })
      .strict(),
  })
  .strict();

export const contentProvenanceConfigSchema = z
  .object({
    schemaVersion: z.literal(1),
    postAuthorship: z
      .object({
        enabled: z.boolean(),
        visibility: z.literal("metadata-only"),
        statementLanguage: z.literal("en"),
        statement: z.string().min(1),
        claimSource: z.literal("owner"),
        appliesTo: z.literal("original-work"),
        primaryCreation: z.literal("human"),
        aiAssistance: z.tuple([z.literal("proofreading")]),
      })
      .strict(),
  })
  .strict();

export const analyticsConfigSchema = z
  .object({
    schemaVersion: z.literal(1),
    provider: z.literal("google-analytics-4"),
    measurementIdEnvironmentVariable: z.string().min(1),
    enabledWhenConfigured: z.boolean(),
    scope: z
      .object({
        blog: z.boolean(),
        managedPages: z.boolean(),
      })
      .strict(),
    consent: z
      .object({
        mode: z.literal("basic"),
        default: z.enum(["denied", "granted"]),
        storageKey: z.string().min(1),
      })
      .strict(),
    collection: z
      .object({
        googleSignals: z.boolean(),
        adPersonalization: z.boolean(),
        stripUrlQueryAndFragment: z.boolean(),
        collectRawSearchTerms: z.boolean(),
        preview: z.boolean(),
      })
      .strict(),
  })
  .strict();

export const performanceBudgetsConfigSchema = z
  .object({
    schemaVersion: z.literal(1),
    basis: z
      .object({
        hosting: z.literal("github-pages"),
        accountPlan: z.literal("github-pro"),
        officialLimits: z
          .object({
            publishedSiteMiB: z.number().int().positive(),
            deploymentMinutes: z.number().int().positive(),
            softBandwidthGiBPerMonth: z.number().int().positive(),
            actionsMinutesPerMonth: z.number().int().positive(),
            actionsStorageMiB: z.number().int().positive(),
          })
          .strict(),
      })
      .strict(),
    budgets: z
      .object({
        sourceRepositoryMiB: z.number().int().positive(),
        publishedSiteMiB: z.number().int().positive(),
        deploymentMinutes: z.number().int().positive(),
        routeCount: z.number().int().positive(),
        largestPublishedFileMiB: z.number().int().positive(),
        monthlyBandwidthWarningGiB: z.number().int().positive(),
        monthlyActionsMinutesWarning: z.number().int().positive(),
        actionsArtifactStorageMiB: z.number().int().positive(),
        page: z
          .object({
            htmlKiB: z.number().int().positive(),
            stylesheetGzipKiB: z.number().int().positive(),
            initialScriptGzipKiB: z.number().int().positive(),
            searchScriptGzipKiB: z.number().int().positive(),
            initialFontKiB: z.number().int().positive(),
            initialTransferKiB: z.number().int().positive(),
          })
          .strict(),
        images: z
          .object({
            sourceFileMiB: z.number().int().positive(),
            sourceMegapixels: z.number().int().positive(),
            renderedFileKiB: z.number().int().positive(),
          })
          .strict(),
        fonts: z
          .object({
            publishedAssetsMiB: z.number().int().positive(),
          })
          .strict(),
      })
      .strict(),
  })
  .strict();

export type SiteConfig = z.infer<typeof siteConfigSchema>;
export type RoutesConfig = z.infer<typeof routesConfigSchema>;
export type TaxonomyConfig = z.infer<typeof taxonomyConfigSchema>;
export type NavigationConfig = z.infer<typeof navigationConfigSchema>;
export type RedirectsConfig = z.infer<typeof redirectsConfigSchema>;
export type SecurityConfig = z.infer<typeof securityConfigSchema>;
export type EmbedsConfig = z.infer<typeof embedsConfigSchema>;
export type AiCrawlersConfig = z.infer<typeof aiCrawlersConfigSchema>;
export type ContentProvenanceConfig = z.infer<
  typeof contentProvenanceConfigSchema
>;
export type AnalyticsYamlConfig = z.infer<typeof analyticsConfigSchema>;
export type PerformanceBudgetsConfig = z.infer<
  typeof performanceBudgetsConfigSchema
>;
