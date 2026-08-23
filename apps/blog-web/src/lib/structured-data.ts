import type { PreviewPostArtifact, SupportedLanguage } from "../../../../packages/contracts/src/index.ts";
import type { ProjectConfig } from "../../../../packages/project-config/src/index.ts";

export function personId(config: ProjectConfig, language: SupportedLanguage): string {
  return `${config.resolvePublicUrl(config.site.identity.owner.profileRoutes[language])}#person`;
}

export function sameAsLinks(config: ProjectConfig): readonly string[] {
  return config.site.identity.owner.contacts
    .filter((contact) => contact.kind !== "email")
    .map((contact) => contact.href);
}

export function personJsonLd(config: ProjectConfig, language: SupportedLanguage): Record<string, unknown> {
  const profileUrl = config.resolvePublicUrl(config.site.identity.owner.profileRoutes[language]);
  const sameAs = sameAsLinks(config);
  return {
    "@type": "Person",
    "@id": personId(config, language),
    name: config.site.identity.owner.displayName,
    url: profileUrl,
    description: config.site.identity.owner.shortBios[language],
    ...(sameAs.length > 0 ? { sameAs } : {}),
  };
}

export function websiteJsonLd(config: ProjectConfig, language: SupportedLanguage = "ko"): string {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${config.resolvePublicUrl("/")}#website`,
    url: config.resolvePublicUrl("/"),
    name: config.site.identity.name,
    inLanguage: ["ko", "en", "ja"],
    author: { "@id": personId(config, language) },
  });
}

export function collectionPageJsonLd(input: {
  readonly config: ProjectConfig;
  readonly language: SupportedLanguage;
  readonly name: string;
  readonly description: string;
  readonly route: string;
  readonly itemRoutes: readonly string[];
}): string {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: input.name,
    description: input.description,
    url: input.config.resolvePublicUrl(input.route),
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: input.itemRoutes.length,
      itemListElement: input.itemRoutes.map((route, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: input.config.resolvePublicUrl(route),
      })),
    },
  });
}

export function blogPostingJsonLd(input: {
  readonly config: ProjectConfig;
  readonly post: PreviewPostArtifact;
  readonly language: SupportedLanguage;
  readonly imageUrls: readonly string[];
  readonly categoryLabel: string;
}): string {
  const original = input.post.alternates.find(
    (alternate: { readonly language: SupportedLanguage }) =>
      alternate.language === input.post.originalLanguage,
  );
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: input.post.title,
    description: input.post.description,
    datePublished: input.post.createdAt,
    ...(input.post.updatedAt ? { dateModified: input.post.updatedAt } : {}),
    inLanguage: input.language,
    url: input.config.resolvePublicUrl(input.post.route),
    image: input.imageUrls,
    articleSection: input.categoryLabel,
    keywords: input.post.tags,
    author: {
      ...personJsonLd(input.config, input.language),
    },
    ...(original && input.language !== input.post.originalLanguage
      ? {
          translationOfWork: {
            "@type": "BlogPosting",
            url: input.config.resolvePublicUrl(original.route),
            inLanguage: input.post.originalLanguage,
          },
        }
      : {}),
  });
}

export function breadcrumbJsonLd(
  config: ProjectConfig,
  crumbs: readonly { readonly name: string; readonly route: string }[],
): string {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: config.resolvePublicUrl(crumb.route),
    })),
  });
}
