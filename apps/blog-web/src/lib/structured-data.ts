import type { PreviewPostArtifact, SupportedLanguage } from "../../../../packages/contracts/src/index.ts";
import type { ProjectConfig } from "../../../../packages/project-config/src/index.ts";

export function websiteJsonLd(config: ProjectConfig): string {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${config.resolvePublicUrl("/") }#website`,
    url: config.resolvePublicUrl("/"),
    name: config.site.identity.name,
    inLanguage: ["ko", "en", "ja"],
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
      "@type": "Person",
      name: input.config.site.identity.authorName,
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
