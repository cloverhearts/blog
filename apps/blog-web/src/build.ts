import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
  parsePreviewContentManifest,
  parsePreviewPost,
  parsePublishedContentManifest,
  parsePublishedPost,
  sha256File,
  sha256Json,
  type BuildMode,
  type PreviewPostArtifact,
  type RouteClaimArtifact,
  type SupportedLanguage,
  type WebManifestArtifact,
} from "../../../packages/contracts/src/index.ts";
import {
  resolvePostNavigationLink,
  type ProjectConfig,
} from "../../../packages/project-config/src/index.ts";
import { blogMessages } from "./i18n/messages.ts";
import { renderOriginalPostFooter, resolveTranslationOrigin } from "./i18n/translation-origin.ts";
import { renderAuthorshipDisclosureMeta } from "./seo/authorship-disclosure.ts";
import {
  OPEN_GRAPH_PREFIX,
  createPostOpenGraphTags,
  renderOpenGraphMetaTags,
} from "./seo/open-graph.ts";
import { rewriteArtifactUrls, withBasePath } from "./lib/html.ts";
import { pageRoute, paginate } from "./lib/pagination.ts";
import { renderDocument, type DocumentLink } from "./lib/render-document.ts";
import { createSocialCardSet, type SocialCardSet } from "./lib/social-cards.ts";
import { createListThumbnail, resolveContentAssetFile, type ListThumbnail } from "./lib/thumbnails.ts";
import { blogPostingJsonLd, breadcrumbJsonLd, websiteJsonLd } from "./lib/structured-data.ts";

interface PostPresentation {
  readonly cards: SocialCardSet;
  readonly thumbnail: ListThumbnail;
}

const LANGUAGES = ["ko", "en", "ja"] as const satisfies readonly SupportedLanguage[];

export interface BuildWebOptions {
  readonly config: ProjectConfig;
  readonly mode: BuildMode;
  readonly contentDirectory?: string;
  readonly outputDirectory?: string;
}

export async function buildWeb(options: BuildWebOptions): Promise<WebManifestArtifact<BuildMode>> {
  const contentDirectory =
    options.contentDirectory ?? resolve(options.config.repositoryRoot, `.artifacts/content/${options.mode}`);
  const outputDirectory =
    options.outputDirectory ?? resolve(options.config.repositoryRoot, `.artifacts/web/${options.mode}`);
  const siteDirectory = resolve(outputDirectory, "site");
  try {
    rmSync(siteDirectory, { recursive: true, force: true, maxRetries: 5, retryDelay: 20 });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      throw error;
    }
  }
  mkdirSync(siteDirectory, { recursive: true });

  const rawManifest = JSON.parse(readFileSync(resolve(contentDirectory, "manifest.json"), "utf8")) as unknown;
  const content =
    options.mode === "preview"
      ? parsePreviewContentManifest(rawManifest)
      : parsePublishedContentManifest(rawManifest);
  const posts: PreviewPostArtifact[] = content.posts.map((summary: { readonly id: string }) => {
    const raw = JSON.parse(
      readFileSync(resolve(contentDirectory, `posts/${summary.id.replaceAll(":", "/")}.json`), "utf8"),
    ) as unknown;
    return options.mode === "preview" ? parsePreviewPost(raw) : parsePublishedPost(raw);
  });

  copyAppAssets(options.config, siteDirectory);
  copyContentAssets(contentDirectory, siteDirectory, options.config);
  writeFavicon(siteDirectory);
  writeWebManifest(options.config, siteDirectory);

  const presentation = new Map<string, PostPresentation>();
  for (const post of posts) {
    const representativePath = resolveContentAssetFile(
      contentDirectory,
      content.assets,
      post.representativeImage === "cover" ? post.cover?.assetId : post.socialImage?.assetId,
    );
    const cards = await createSocialCardSet({
      post,
      config: options.config,
      contentAssetPath: representativePath,
      outputDirectory: siteDirectory,
      categoryLabel:
        options.config.taxonomy.categories[post.category]?.labels
          ? localizedText(options.config.taxonomy.categories[post.category]!.labels, post.language)
          : post.category,
    });
    const thumbnail = await createListThumbnail({
      post,
      config: options.config,
      cards,
      outputDirectory: siteDirectory,
      explicitAssetPath: resolveContentAssetFile(contentDirectory, content.assets, post.thumbnail?.assetId),
      representativeLocalPath: cards.localSixteenByNine,
    });
    presentation.set(post.id, { cards, thumbnail });
  }

  const files = new Set<string>();
  const routes: RouteClaimArtifact[] = [];
  const routesByLanguage: Record<SupportedLanguage, string[]> = { en: [], ko: [], ja: [] };
  const remember = (route: string, ownerKind: RouteClaimArtifact["ownerKind"], ownerId: string, artifactPath: string) => {
    writeSiteFile(siteDirectory, artifactPath, "");
    files.add(artifactPath);
    routes.push({ route, ownerKind, ownerId, artifactPath });
    for (const language of LANGUAGES) {
      if (route === options.config.localizeRoute(language, route.replace(/^\/(en|ja)(?=\/)/u, "") || "/") || route.startsWith(language === "ko" ? "/" : `/${language}/`)) {
        const languageRoutes = routesByLanguage[language];
        if (languageRoutes && !languageRoutes.includes(route) && languageOwnsRoute(language, route)) {
          languageRoutes.push(route);
        }
      }
    }
  };

  const emit = (route: string, html: string, ownerKind: RouteClaimArtifact["ownerKind"], ownerId: string) => {
    const artifactPath = routeToArtifactPath(route);
    writeSiteFile(siteDirectory, artifactPath, html);
    files.add(artifactPath);
    routes.push({ route, ownerKind, ownerId, artifactPath });
    const language = languageOfRoute(route);
    routesByLanguage[language]?.push(route);
  };

  for (const language of LANGUAGES) {
    const home = options.config.localizeRoute(language, options.config.routes.paths.home);
    emit(
      home,
      renderHome(options.config, language, posts, presentation),
      "blog",
      `home:${language}`,
    );
    emit(
      options.config.localizeRoute(language, options.config.routes.paths.search),
      renderSearch(options.config, language),
      "system",
      `search:${language}`,
    );
    emit(
      options.config.localizeRoute(language, options.config.routes.paths.notFound),
      renderNotFound(options.config, language),
      "system",
      `not-found:${language}`,
    );
    emitCollection(options, language, posts, "posts", emit, presentation);
    emitTaxonomy(options, language, posts, "categories", (post) => [post.category], emit, presentation);
    emitTaxonomy(options, language, posts, "tags", (post) => [...post.tags], emit, presentation);
    emitCollection(options, language, posts, "archive", emit, presentation);
  }

  for (const post of posts) {
    const prepared = presentation.get(post.id);
    if (!prepared) {
      throw new Error(`Missing presentation for ${post.id}`);
    }
    const html = renderPostPage({
      config: options.config,
      post,
      posts,
      cards: prepared.cards,
      presentation,
    });
    emit(post.route, html, "post", post.id);
  }

  writeSiteFile(siteDirectory, "404.html", renderNotFound(options.config, "ko"));
  files.add("404.html");
  routes.push({
    route: "/404.html",
    ownerKind: "system",
    ownerId: "not-found-file",
    artifactPath: "404.html",
  });

  void remember;
  const provenance = {
    schemaVersion: 2 as const,
    buildMode: options.mode,
    producer: "@cloverhearts/blog-web",
    producerVersion: "0.0.0",
    inputHash: sha256Json({
      content: content.provenance.inputHash,
      design: sha256File(resolve(options.config.repositoryRoot, "DESIGN.md")),
    }),
    configHash: options.config.hashes.configHash,
    contentRulesHash: options.config.hashes.contentRulesHash,
    localizationRulesHash: options.config.hashes.localizationRulesHash,
  };
  const manifest = {
    provenance,
    contentInputHash: content.provenance.inputHash,
    routes,
    files: [...files].sort((left, right) => left.localeCompare(right, "en")),
    routesByLanguage: {
      en: [...new Set(routesByLanguage.en)].sort(),
      ko: [...new Set(routesByLanguage.ko)].sort(),
      ja: [...new Set(routesByLanguage.ja)].sort(),
    },
  };
  writeFileSync(resolve(outputDirectory, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
  return manifest;
}

function emitCollection(
  options: BuildWebOptions,
  language: SupportedLanguage,
  posts: readonly PreviewPostArtifact[],
  kind: "posts" | "archive",
  emit: (route: string, html: string, ownerKind: RouteClaimArtifact["ownerKind"], ownerId: string) => void,
  presentation: ReadonlyMap<string, PostPresentation>,
): void {
  const listed = listPostsForLanguage(language, posts);
  const pages = paginate(listed, options.config.site.listings.pageSize);
  const base = options.config.localizeRoute(
    language,
    kind === "posts" ? options.config.routes.paths.posts : options.config.routes.paths.archive,
  );
  pages.forEach((pageItems, index) => {
    const pageNumber = index + 1;
    const route = pageRoute(base, pageNumber, options.config.routes.paginationSegment);
    emit(
      route,
      renderListPage(options.config, language, kind, pageItems, pageNumber, pages.length, base, presentation),
      "blog",
      `${kind}:${language}:${pageNumber}`,
    );
  });
}

function emitTaxonomy(
  options: BuildWebOptions,
  language: SupportedLanguage,
  posts: readonly PreviewPostArtifact[],
  kind: "categories" | "tags",
  selectIds: (post: PreviewPostArtifact) => readonly string[],
  emit: (route: string, html: string, ownerKind: RouteClaimArtifact["ownerKind"], ownerId: string) => void,
  presentation: ReadonlyMap<string, PostPresentation>,
): void {
  const indexRoute = options.config.localizeRoute(
    language,
    kind === "categories" ? options.config.routes.paths.categories : options.config.routes.paths.tags,
  );
  const groups = new Map<string, PreviewPostArtifact[]>();
  for (const post of listPostsForLanguage(language, posts)) {
    for (const id of selectIds(post)) {
      const current = groups.get(id) ?? [];
      current.push(post);
      groups.set(id, current);
    }
  }
  emit(
    indexRoute,
    renderTaxonomyIndex(options.config, language, kind, groups),
    "blog",
    `${kind}:${language}`,
  );
  for (const [id, grouped] of groups) {
    const base = `${indexRoute}${id}/`;
    const pages = paginate(grouped, options.config.site.listings.pageSize);
    pages.forEach((pageItems, index) => {
      const pageNumber = index + 1;
      emit(
        pageRoute(base, pageNumber, options.config.routes.paginationSegment),
        renderListPage(options.config, language, kind, pageItems, pageNumber, pages.length, base, presentation, id),
        "blog",
        `${kind}:${language}:${id}:${pageNumber}`,
      );
    });
  }
}

function listPostsForLanguage(
  language: SupportedLanguage,
  posts: readonly PreviewPostArtifact[],
): PreviewPostArtifact[] {
  const groups = new Map<string, PreviewPostArtifact[]>();
  for (const post of posts) {
    const current = groups.get(post.translationKey) ?? [];
    current.push(post);
    groups.set(post.translationKey, current);
  }
  return [...groups.values()]
    .map((variants) => {
      const resolved = resolvePostNavigationLink(
        language,
        variants.map((variant) => ({ language: variant.language, route: variant.route })),
      );
      return variants.find((variant) => variant.route === resolved?.route) ?? null;
    })
    .filter((post): post is PreviewPostArtifact => post !== null)
    .sort((left, right) => {
      const created = Date.parse(right.createdAt) - Date.parse(left.createdAt);
      if (created !== 0) return created;
      return left.slug.localeCompare(right.slug, "en");
    });
}

function renderHome(
  config: ProjectConfig,
  language: SupportedLanguage,
  posts: readonly PreviewPostArtifact[],
  presentation: ReadonlyMap<string, PostPresentation>,
): string {
  const messages = blogMessages(language);
  const listed = listPostsForLanguage(language, posts).slice(0, config.site.listings.pageSize);
  return renderShell(config, language, {
    title: `${config.site.identity.name}`,
    description: localizedText(config.site.identity.descriptions, language),
    robots: "index,follow",
    canonical: config.localizeRoute(language, "/"),
    jsonLd: [websiteJsonLd(config)],
    body: `<h1>${escape(config.site.identity.name)}</h1><p>${escape(localizedText(config.site.identity.descriptions, language))}</p>${renderPostList(config, language, listed, presentation, true)}<p><a href="${withBasePath(config.resolved.basePath, config.localizeRoute(language, config.routes.paths.posts))}">${escape(messages.posts)}</a></p>`,
  });
}

function renderSearch(config: ProjectConfig, language: SupportedLanguage): string {
  const messages = blogMessages(language);
  const searchRoute = withBasePath(
    config.resolved.basePath,
    config.localizeRoute(language, config.routes.paths.search),
  );
  const browseLinks = `<p><a href="${withBasePath(config.resolved.basePath, config.localizeRoute(language, config.routes.paths.categories))}">${escape(messages.categories)}</a> · <a href="${withBasePath(config.resolved.basePath, config.localizeRoute(language, config.routes.paths.tags))}">${escape(messages.tags)}</a> · <a href="${withBasePath(config.resolved.basePath, config.localizeRoute(language, config.routes.paths.archive))}">${escape(messages.archive)}</a></p>`;
  const indexBase = `${config.resolved.basePath.replace(/\/$/u, "")}/_assets/search/${language}/`;
  const scriptSrc = withBasePath(config.resolved.basePath, "/_assets/app/search.js");
  return renderShell(config, language, {
    title: `${messages.search} · ${config.site.identity.name}`,
    description: messages.noJavaScriptSearch,
    robots: "noindex,follow",
    canonical: config.localizeRoute(language, config.routes.paths.search),
    body: `<section data-site-search data-search-index="${escape(indexBase)}" data-search-base="${escape(config.resolved.basePath)}" data-search-count="${escape(messages.searchResultCount)}" data-search-language="${language}">
  <h1>${escape(messages.search)}</h1>
  <noscript>
    <p>${escape(messages.noJavaScriptSearch)}</p>
    ${browseLinks}
  </noscript>
  <form role="search" method="get" action="${escape(searchRoute)}">
    <label for="site-search-query">${escape(messages.search)}</label>
    <input id="site-search-query" name="q" type="search" autocomplete="off" enterkeyhint="search" inputmode="search">
    <button type="submit">${escape(messages.search)}</button>
  </form>
  <p data-search-status aria-live="polite"></p>
  <ol data-search-results></ol>
  <p data-search-empty hidden>${escape(messages.searchEmpty)}</p>
  ${browseLinks}
</section>
<script type="module" src="${escape(scriptSrc)}"></script>`,
  });
}

function renderNotFound(config: ProjectConfig, language: SupportedLanguage): string {
  const messages = blogMessages(language);
  const recovery = (
    [
      ["/", messages.home],
      [config.routes.paths.posts, messages.posts],
      [config.routes.paths.categories, messages.categories],
      [config.routes.paths.tags, messages.tags],
      [config.routes.paths.archive, messages.archive],
      [config.routes.paths.search, messages.search],
    ] as const
  )
    .map(
      ([route, label]) =>
        `<a href="${withBasePath(config.resolved.basePath, config.localizeRoute(language, route))}">${escape(label)}</a>`,
    )
    .join(" · ");
  return renderShell(config, language, {
    title: `${messages.notFoundTitle} · ${config.site.identity.name}`,
    description: messages.notFoundDescription,
    robots: "noindex,follow",
    canonical: config.localizeRoute(language, config.routes.paths.notFound),
    body: `<h1>${escape(messages.notFoundTitle)}</h1><p>${escape(messages.notFoundDescription)}</p><p>${recovery}</p>`,
  });
}

function renderListPage(
  config: ProjectConfig,
  language: SupportedLanguage,
  kind: string,
  posts: readonly PreviewPostArtifact[],
  pageNumber: number,
  pageCount: number,
  collectionRoute: string,
  presentation: ReadonlyMap<string, PostPresentation>,
  id?: string,
): string {
  const messages = blogMessages(language);
  const heading =
    kind === "categories"
      ? `${messages.categories}${id ? `: ${id}` : ""}`
      : kind === "tags"
        ? `${messages.tags}${id ? `: ${id}` : ""}`
        : kind === "archive"
          ? messages.archive
          : messages.posts;
  const pager = renderPager(config, language, collectionRoute, pageNumber, pageCount);
  return renderShell(config, language, {
    title: `${heading} · ${config.site.identity.name}`,
    description: heading,
    robots: "index,follow",
    canonical: pageRoute(collectionRoute, pageNumber, config.routes.paginationSegment),
    body: `<h1>${escape(heading)}</h1>${renderPostList(config, language, posts, presentation, pageNumber === 1)}${pager}`,
  });
}

function renderTaxonomyIndex(
  config: ProjectConfig,
  language: SupportedLanguage,
  kind: "categories" | "tags",
  groups: Map<string, PreviewPostArtifact[]>,
): string {
  const messages = blogMessages(language);
  const heading = kind === "categories" ? messages.categories : messages.tags;
  const base = config.localizeRoute(
    language,
    kind === "categories" ? config.routes.paths.categories : config.routes.paths.tags,
  );
  const items = [...groups.entries()]
    .sort(([left], [right]) => left.localeCompare(right, "en"))
    .map(
      ([id, grouped]) =>
        `<li><a href="${withBasePath(config.resolved.basePath, `${base}${id}/`)}">${escape(id)}</a> (${grouped.length})</li>`,
    )
    .join("");
  return renderShell(config, language, {
    title: `${heading} · ${config.site.identity.name}`,
    description: heading,
    robots: "index,follow",
    canonical: base,
    body: `<h1>${escape(heading)}</h1><ul>${items}</ul>`,
  });
}

function renderPostList(
  config: ProjectConfig,
  language: SupportedLanguage,
  posts: readonly PreviewPostArtifact[],
  presentation: ReadonlyMap<string, PostPresentation>,
  eagerFirst: boolean,
): string {
  const messages = blogMessages(language);
  if (posts.length === 0) {
    return `<p>${escape(messages.searchEmpty)}</p>`;
  }
  return `<ul data-post-list>${posts
    .map((post, index) => {
      const fallback = post.language !== language;
      const label = fallback ? ` <small>${escape(messages.fallbackLanguage)}: ${post.language}</small>` : "";
      const href = withBasePath(config.resolved.basePath, post.route);
      const thumbnail = presentation.get(post.id)?.thumbnail;
      const loading = eagerFirst && index === 0 ? "eager" : "lazy";
      const image = thumbnail
        ? `<img src="${escape(thumbnail.src)}" srcset="${escape(thumbnail.srcset)}" sizes="(max-width: 40rem) 100vw, 20rem" width="${thumbnail.width}" height="${thumbnail.height}" alt="" loading="${loading}" decoding="async" data-post-thumbnail="${thumbnail.source}">`
        : "";
      return `<li><a href="${href}"${fallback ? ` hreflang="${post.language}"` : ""}>${image}<span>${escape(post.title)}</span></a>${label}<p>${escape(post.description)}</p></li>`;
    })
    .join("")}</ul>`;
}

function renderPager(
  config: ProjectConfig,
  language: SupportedLanguage,
  collectionRoute: string,
  pageNumber: number,
  pageCount: number,
): string {
  if (pageCount <= 1) return "";
  const messages = blogMessages(language);
  const previous =
    pageNumber > 1
      ? `<a href="${withBasePath(config.resolved.basePath, pageRoute(collectionRoute, pageNumber - 1, config.routes.paginationSegment))}">${escape(messages.previousPage)}</a>`
      : "";
  const next =
    pageNumber < pageCount
      ? `<a href="${withBasePath(config.resolved.basePath, pageRoute(collectionRoute, pageNumber + 1, config.routes.paginationSegment))}">${escape(messages.nextPage)}</a>`
      : "";
  return `<nav aria-label="${escape(messages.posts)}"><p>${previous} ${pageNumber} / ${pageCount} ${next}</p></nav>`;
}

function renderPostPage(input: {
  readonly config: ProjectConfig;
  readonly post: PreviewPostArtifact;
  readonly posts: readonly PreviewPostArtifact[];
  readonly cards: SocialCardSet;
  readonly presentation: ReadonlyMap<string, PostPresentation>;
}): string {
  const { config, post, cards } = input;
  const messages = blogMessages(post.language);
  const categoryLabels = config.taxonomy.categories[post.category]?.labels;
  const categoryLabel = categoryLabels ? localizedText(categoryLabels, post.language) : post.category;
  const origin = resolveTranslationOrigin(post.language, post.originalLanguage, post.alternates);
  const related = renderRelated(config, post, input.posts, input.presentation);
  const toc = renderToc(post, messages.tableOfContents);
  const bodyHtml = rewriteArtifactUrls(
    post.bodyHtml,
    config.resolved.basePath,
    config.routes.paths.contentAssets,
  );
  const og = renderOpenGraphMetaTags(
    createPostOpenGraphTags({
      title: post.title,
      description: post.description,
      canonicalUrl: config.resolvePublicUrl(post.route),
      siteName: config.site.identity.name,
      locale: languageMeta(config, post.language).ogLocale,
      alternateLocales: post.alternates
        .filter((alternate: { readonly language: SupportedLanguage }) => alternate.language !== post.language)
        .map((alternate: { readonly language: SupportedLanguage }) => languageMeta(config, alternate.language).ogLocale),
      publishedTime: post.createdAt,
      ...(post.updatedAt ? { modifiedTime: post.updatedAt } : {}),
      section: categoryLabel,
      tags: post.tags,
      image: cards.og,
    }),
  );
  return renderShell(config, post.language, {
    title: `${post.title} · ${config.site.identity.name}`,
    description: post.description,
    robots: "index,follow",
    canonical: post.route,
    pagefindBody: false,
    ogPrefix: OPEN_GRAPH_PREFIX,
    head: `${og}\n${renderAuthorshipDisclosureMeta(post.authorshipDisclosure)}`,
    jsonLd: [
      blogPostingJsonLd({
        config,
        post,
        language: post.language,
        imageUrls: [cards.og.url, cards.article.square, cards.article.fourByThree, cards.article.sixteenByNine],
        categoryLabel,
      }),
      breadcrumbJsonLd(config, [
        { name: messages.home, route: config.localizeRoute(post.language, "/") },
        { name: messages.posts, route: config.localizeRoute(post.language, config.routes.paths.posts) },
        { name: post.title, route: post.route },
      ]),
    ],
    languageOverrides: post.alternates.map((alternate: { readonly language: SupportedLanguage; readonly route: string }) => ({
      href: withBasePath(config.resolved.basePath, alternate.route),
      label: languageMeta(config, alternate.language).nativeLabel,
      hreflang: alternate.language,
      current: alternate.language === post.language,
    })),
    body: `<article data-pagefind-body>
  <header>
    <h1 data-pagefind-meta="title" data-pagefind-weight="10">${escape(post.title)}</h1>
    <p>${escape(post.description)}</p>
    <p><a href="${withBasePath(config.resolved.basePath, config.localizeRoute(post.language, `${config.routes.paths.categories}${post.category}/`))}" data-pagefind-filter="category" data-pagefind-weight="8">${escape(categoryLabel)}</a></p>
    <ul>${post.tags.map((tag) => `<li data-pagefind-filter="tag" data-pagefind-weight="8">${escape(tag)}</li>`).join("")}</ul>
    <time datetime="${escape(post.createdAt)}">${escape(post.createdAt)}</time>
  </header>
  ${toc}
  <div>${bodyHtml}</div>
  ${renderOriginalPostFooter(post.language, origin)}
  ${related}
</article>`,
  });
}

function renderRelated(
  config: ProjectConfig,
  post: PreviewPostArtifact,
  posts: readonly PreviewPostArtifact[],
  presentation: ReadonlyMap<string, PostPresentation>,
): string {
  const messages = blogMessages(post.language);
  const related = posts
    .filter((candidate) => candidate.category === post.category && candidate.id !== post.id)
    .slice(0, config.site.relatedPosts.maxItems);
  if (related.length === 0) return "";
  return `<aside data-search-ignore><h2>${escape(messages.relatedPosts)}</h2>${renderPostList(config, post.language, related, presentation, false)}</aside>`;
}

function renderToc(post: PreviewPostArtifact, label: string): string {
  if (post.headings.length === 0) return "";
  return `<nav data-post-toc data-pagefind-ignore aria-label="${escape(label)}"><ol>${post.headings
    .map((heading: { readonly anchor: string; readonly text: string }) => `<li><a href="${heading.anchor}">${escape(heading.text)}</a></li>`)
    .join("")}</ol></nav>`;
}

function renderShell(
  config: ProjectConfig,
  language: SupportedLanguage,
  input: {
    readonly title: string;
    readonly description: string;
    readonly robots: string;
    readonly canonical: string;
    readonly body: string;
    readonly head?: string;
    readonly jsonLd?: readonly string[];
    readonly ogPrefix?: string;
    readonly pagefindBody?: boolean;
    readonly languageOverrides?: readonly DocumentLink[];
  },
): string {
  const messages = blogMessages(language);
  const consent =
    config.resolved.ga4.enabled && config.analytics.scope.blog && input.robots.includes("index")
      ? `<p><button type="button" data-analytics-grant>${escape(messages.allowAnalytics)}</button> <button type="button" data-analytics-deny>${escape(messages.denyAnalytics)}</button></p>`
      : "";
  return renderDocument({
    language,
    title: input.title,
    description: input.description,
    siteName: config.site.identity.name,
    canonicalUrl: config.resolvePublicUrl(input.canonical),
    robots: input.robots,
    homeHref: withBasePath(config.resolved.basePath, config.localizeRoute(language, "/")),
    basePath: config.resolved.basePath,
    primaryNavigation: config.navigation.primary.map((item) => ({
      href: withBasePath(
        config.resolved.basePath,
        item.type === "internal" ? config.localizeRoute(language, item.href) : item.href,
      ),
      label: localizedText(item.labels, language),
    })),
    languageNavigation:
      input.languageOverrides ??
      LANGUAGES.map((item) => ({
        href: withBasePath(config.resolved.basePath, config.localizeRoute(item, logicalFromLocalized(language, input.canonical))),
        label: languageMeta(config, item).nativeLabel,
        hreflang: item,
        current: item === language,
      })),
    head: input.head ?? "",
    body: input.body,
    footer: `${renderFooterNavigation(config, language)}${consent}<p>${escape(config.site.identity.name)}</p>`,
    ...(input.ogPrefix ? { ogPrefix: input.ogPrefix } : {}),
    ...(input.jsonLd ? { jsonLd: input.jsonLd } : {}),
    ...(input.pagefindBody ? { pagefindBody: true } : {}),
  });
}

function renderFooterNavigation(
  config: ProjectConfig,
  language: SupportedLanguage,
): string {
  if (config.navigation.footer.length === 0) {
    return "";
  }
  const items = config.navigation.footer
    .map((item) => {
      const href = withBasePath(
        config.resolved.basePath,
        item.type === "internal" ? config.localizeRoute(language, item.href) : item.href,
      );
      return `<li><a href="${href}">${escape(localizedText(item.labels, language))}</a></li>`;
    })
    .join("");
  return `<nav aria-label="${escape(blogMessages(language).archive)}"><ul>${items}</ul></nav>`;
}

function languageMeta(config: ProjectConfig, language: SupportedLanguage) {
  const found = config.site.languages.supported.find((item) => item.id === language);
  if (!found) throw new Error(`Unsupported language ${language}`);
  return found;
}

function localizedText(
  labels: Readonly<Record<"en" | "ko" | "ja", string>>,
  language: SupportedLanguage,
): string {
  switch (language) {
    case "en":
      return labels.en;
    case "ko":
      return labels.ko;
    case "ja":
      return labels.ja;
  }
}

function languageOfRoute(route: string): SupportedLanguage {
  if (route === "/en/" || route.startsWith("/en/")) return "en";
  if (route === "/ja/" || route.startsWith("/ja/")) return "ja";
  return "ko";
}

function languageOwnsRoute(language: SupportedLanguage, route: string): boolean {
  return languageOfRoute(route) === language;
}

function logicalFromLocalized(language: SupportedLanguage, route: string): string {
  if (language === "ko") return route;
  return route.replace(new RegExp(`^/${language}(?=/|$)`, "u"), "") || "/";
}

function routeToArtifactPath(route: string): string {
  if (route.endsWith(".html")) return route.slice(1);
  if (route === "/") return "index.html";
  return `${route.replace(/^\//u, "").replace(/\/$/u, "")}/index.html`;
}

function writeSiteFile(siteDirectory: string, artifactPath: string, html: string): void {
  const path = resolve(siteDirectory, artifactPath);
  mkdirSync(dirname(path), { recursive: true });
  if (html.length > 0) {
    writeFileSync(path, html);
  }
}

function copyAppAssets(config: ProjectConfig, siteDirectory: string): void {
  const here = dirname(fileURLToPath(import.meta.url));
  const cssSource = resolve(here, "styles/classless.css");
  const cssDestination = resolve(siteDirectory, "_assets/app/classless.css");
  mkdirSync(dirname(cssDestination), { recursive: true });
  const css = readFileSync(cssSource, "utf8").replace(
    '@import "pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css";',
    '@import "./fonts/pretendardvariable-dynamic-subset.css";',
  );
  writeFileSync(cssDestination, css);
  const fontSource = resolve(
    config.repositoryRoot,
    "node_modules/pretendard/dist/web/variable",
  );
  cpSync(fontSource, resolve(siteDirectory, "_assets/app/fonts"), { recursive: true });
  writeFileSync(
    resolve(siteDirectory, "_assets/app/search.js"),
    readFileSync(resolve(here, "search/client.js")),
  );
}

function copyContentAssets(
  contentDirectory: string,
  siteDirectory: string,
  config: ProjectConfig,
): void {
  const from = resolve(contentDirectory, "assets");
  const to = resolve(siteDirectory, config.routes.paths.contentAssets.replace(/^\//u, ""));
  try {
    cpSync(from, to, { recursive: true });
  } catch {
    mkdirSync(to, { recursive: true });
  }
}

function writeFavicon(siteDirectory: string): void {
  writeFileSync(
    resolve(siteDirectory, "favicon.svg"),
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="#111"/><text x="12" y="42" fill="#fff" font-size="28">C</text></svg>\n`,
  );
}

function writeWebManifest(config: ProjectConfig, siteDirectory: string): void {
  writeFileSync(
    resolve(siteDirectory, "site.webmanifest"),
    `${JSON.stringify(
      {
        name: config.site.identity.name,
        short_name: config.site.identity.name,
        start_url: `${config.resolved.basePath}/`,
        display: "standalone",
        lang: "ko",
        icons: [{ src: `${config.resolved.basePath}/favicon.svg`, type: "image/svg+xml", sizes: "any" }],
      },
      null,
      2,
    )}\n`,
  );
}

function escape(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
