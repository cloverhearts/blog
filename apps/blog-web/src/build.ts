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
  type CuratedCollectionArtifact,
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
import { blogPostingJsonLd, breadcrumbJsonLd, collectionPageJsonLd, websiteJsonLd } from "./lib/structured-data.ts";

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
      renderHome(options.config, language, posts, content.curatedCollections, presentation),
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
    emit(
      options.config.localizeRoute(language, options.config.routes.paths.explore),
      renderExplore(options.config, language, posts, content.curatedCollections),
      "blog",
      `explore:${language}`,
    );
    emitCuratedCollections(options, language, posts, content.curatedCollections, emit, presentation);
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

function emitCuratedCollections(
  options: BuildWebOptions,
  language: SupportedLanguage,
  posts: readonly PreviewPostArtifact[],
  collections: readonly CuratedCollectionArtifact[],
  emit: (route: string, html: string, ownerKind: RouteClaimArtifact["ownerKind"], ownerId: string) => void,
  presentation: ReadonlyMap<string, PostPresentation>,
): void {
  for (const collection of collections) {
    const listed = postsForCollection(language, posts, collection);
    const pages = paginate(listed, options.config.site.listings.pageSize);
    const base = options.config.localizeRoute(language, collection.route);
    pages.forEach((pageItems, index) => {
      const pageNumber = index + 1;
      emit(
        pageRoute(base, pageNumber, options.config.routes.paginationSegment),
        renderCuratedPage(options.config, language, collection, pageItems, pageNumber, pages.length, base, presentation),
        "blog",
        `curated:${collection.id}:${language}:${pageNumber}`,
      );
    });
  }
}

function postsForCollection(
  language: SupportedLanguage,
  posts: readonly PreviewPostArtifact[],
  collection: CuratedCollectionArtifact,
): PreviewPostArtifact[] {
  const listed = listPostsForLanguage(language, posts);
  const byKey = new Map(listed.map((post) => [post.translationKey, post]));
  return collection.items
    .map((item) => byKey.get(item.translationKey))
    .filter((post): post is PreviewPostArtifact => post !== undefined);
}

function renderCuratedPage(
  config: ProjectConfig,
  language: SupportedLanguage,
  collection: CuratedCollectionArtifact,
  posts: readonly PreviewPostArtifact[],
  pageNumber: number,
  pageCount: number,
  collectionRoute: string,
  presentation: ReadonlyMap<string, PostPresentation>,
): string {
  const messages = blogMessages(language);
  const title = localizedText(collection.labels, language);
  const description = localizedText(collection.descriptions, language);
  const count = messages.logicalPostCount.replaceAll("{n}", String(collection.count));
  const pageNote =
    pageNumber > 1 ? `<p>${escape(messages.pageContext.replaceAll("{n}", String(pageNumber)))}</p>` : "";
  const chronology = new Map(collection.items.map((item) => [item.translationKey, item]));
  const pager = renderPager(config, language, collectionRoute, pageNumber, pageCount);
  const robots = collection.robots === "index" ? "index,follow" : "noindex,follow";
  return renderShell(config, language, {
    title: `${title} · ${config.site.identity.name}`,
    description,
    robots,
    canonical: pageRoute(collectionRoute, pageNumber, config.routes.paginationSegment),
    pageKind: "collection",
    jsonLd: [
      collectionPageJsonLd({
        config,
        language,
        name: title,
        description,
        route: pageRoute(collectionRoute, pageNumber, config.routes.paginationSegment),
        itemRoutes: posts.map((post) => post.route),
      }),
    ],
    body: `<header class="collection-intro" data-collection-intro data-collection-presentation="${escape(collection.presentation)}"><p class="eyebrow" data-eyebrow>${escape(count)}</p><h1>${escape(title)}</h1><p>${escape(description)}</p>${pageNote}</header>${renderPostList(config, language, posts, presentation, pageNumber === 1, chronology)}${pager}`,
  });
}

function renderExplore(
  config: ProjectConfig,
  language: SupportedLanguage,
  posts: readonly PreviewPostArtifact[],
  collections: readonly CuratedCollectionArtifact[],
): string {
  const messages = blogMessages(language);
  const listed = listPostsForLanguage(language, posts);
  const collectionCards = collections
    .map((collection) => {
      const href = withBasePath(config.resolved.basePath, config.localizeRoute(language, collection.route));
      const count = messages.logicalPostCount.replaceAll("{n}", String(collection.count));
      return `<li class="explore-collection-card"><a href="${href}"><small>${escape(count)}</small><strong>${escape(localizedText(collection.labels, language))}</strong><span>${escape(localizedText(collection.descriptions, language))}</span><b aria-hidden="true">→</b></a></li>`;
    })
    .join("");
  const categories = Object.entries(config.taxonomy.categories)
    .sort(([left], [right]) => left.localeCompare(right, "en"))
    .map(([id, entry]) => {
      const count = listed.filter((post) => post.category === id).length;
      if (count === 0) return "";
      const href = withBasePath(
        config.resolved.basePath,
        `${config.localizeRoute(language, config.routes.paths.categories)}${id}/`,
      );
      return `<li><a href="${href}"><span>${escape(localizedText(entry.labels, language))}</span><small>${escape(messages.logicalPostCount.replaceAll("{n}", String(count)))}</small></a></li>`;
    })
    .join("");
  const tags = Object.entries(config.taxonomy.tags)
    .sort(([left], [right]) => left.localeCompare(right, "en"))
    .map(([id, entry]) => {
      const count = listed.filter((post) => post.tags.includes(id)).length;
      if (count === 0) return "";
      const href = withBasePath(
        config.resolved.basePath,
        `${config.localizeRoute(language, config.routes.paths.tags)}${id}/`,
      );
      return `<li><a href="${href}"><span>${escape(localizedText(entry.labels, language))}</span><small>${escape(messages.logicalPostCount.replaceAll("{n}", String(count)))}</small></a></li>`;
    })
    .join("");
  return renderShell(config, language, {
    title: `${messages.explore} · ${config.site.identity.name}`,
    description: messages.exploreDescription,
    robots: "index,follow",
    canonical: config.localizeRoute(language, config.routes.paths.explore),
    pageKind: "explore",
    body: `<header class="page-intro explore-intro" data-page-intro><p class="eyebrow" data-eyebrow>${escape(config.site.identity.name)}</p><h1>${escape(messages.explore)}</h1><p>${escape(messages.exploreDescription)}</p></header><section class="explore-section explore-collections" data-explore-section><div class="explore-section__heading"><h2>${escape(messages.selectedWork)}</h2></div><ul class="explore-collection-list" data-explore-collections>${collectionCards}</ul></section><div class="explore-grid" data-explore-grid><section class="explore-taxonomy-section"><h2>${escape(messages.categories)}</h2><ul class="explore-taxonomy-list" data-taxonomy-cloud>${categories}</ul></section><section class="explore-taxonomy-section"><h2>${escape(messages.tags)}</h2><ul class="explore-taxonomy-list" data-taxonomy-cloud>${tags}</ul></section></div>`,
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
  collections: readonly CuratedCollectionArtifact[],
  presentation: ReadonlyMap<string, PostPresentation>,
): string {
  const messages = blogMessages(language);
  const listed = listPostsForLanguage(language, posts).slice(0, config.site.listings.pageSize);
  const featured = listed[0];
  const recent = listed;
  const work = collections.find((collection) => collection.id === "work");
  const selected = work ? postsForCollection(language, posts, work).slice(0, 5) : [];
  const heroVisualPost = selected[0] ?? featured;
  const heroThumbnail = heroVisualPost ? presentation.get(heroVisualPost.id)?.thumbnail : undefined;
  const profileHref = withBasePath(config.resolved.basePath, config.site.identity.owner.profileRoutes[language]);
  const postsHref = withBasePath(config.resolved.basePath, config.localizeRoute(language, config.routes.paths.posts));
  const workHref = withBasePath(config.resolved.basePath, config.localizeRoute(language, config.routes.curated.work ?? "/work/"));
  const heroVisual = heroThumbnail
    ? `<div class="home-hero__visual" data-home-hero-visual aria-hidden="true"><img class="home-hero__image" src="${escape(heroThumbnail.src)}" srcset="${escape(heroThumbnail.srcset)}" sizes="(max-width: 38.75rem) calc(100vw - 2.5rem), 40rem" width="${heroThumbnail.width}" height="${heroThumbnail.height}" alt="" loading="eager" decoding="async" data-hero-thumbnail="${heroThumbnail.source}"></div>`
    : "";
  const hero = `<section class="home-hero" data-home-hero>
    <div class="home-hero__copy" data-home-hero-copy>
      <p class="eyebrow" data-eyebrow>${escape(messages.heroEyebrow)}</p>
      <h1>${escape(messages.heroTitle)}</h1>
      <p>${escape(messages.heroDescription)}</p>
      <p class="hero-actions" data-hero-actions><a class="primary-action" data-primary-action href="${postsHref}">${escape(messages.allPostsCta)} <span aria-hidden="true">→</span></a></p>
    </div>
    ${heroVisual}
  </section>`;
  const author = `<section class="author-intro" data-author-intro>
    <div class="author-monogram" data-author-monogram aria-hidden="true">CH</div>
    <div><p class="eyebrow" data-eyebrow>${escape(messages.authorRole)}</p><h2>${escape(config.site.identity.owner.displayName)}</h2><p>${escape(config.site.identity.owner.shortBios[language])}</p></div>
    <a href="${profileHref}" rel="author">${escape(messages.profile)} <span aria-hidden="true">→</span></a>
  </section>`;
  const featuredHtml = featured
    ? `<section class="home-section home-featured" data-home-featured><div class="section-heading" data-section-heading><h2>${escape(messages.featuredPost)}</h2><a href="${postsHref}">${escape(messages.viewAll)} <span aria-hidden="true">→</span></a></div>${renderFeaturedPost(config, language, featured, presentation)}</section>`
    : `<section class="home-section home-featured" data-home-featured><h2>${escape(messages.featuredPost)}</h2><p class="empty-state" data-empty-state>${escape(messages.emptyCollection)}</p></section>`;
  const recentHtml = `<section class="home-section home-recent" data-home-recent><div class="section-heading" data-section-heading><h2>${escape(messages.recentPosts)}</h2><a href="${postsHref}">${escape(messages.viewAll)} <span aria-hidden="true">→</span></a></div>${renderPostList(config, language, recent, presentation, false, undefined, { headingLevel: 3, wideThumbnail: true })}</section>`;
  const workHtml = `<section class="home-section home-work" data-home-work><div class="section-heading" data-section-heading><h2>${escape(work ? localizedText(work.labels, language) : messages.selectedWork)}</h2><a href="${workHref}">${escape(messages.viewAll)} <span aria-hidden="true">→</span></a></div>${renderPostList(config, language, selected, presentation, false, undefined, { headingLevel: 3, wideThumbnail: true })}</section>`;
  return renderShell(config, language, {
    title: `${config.site.identity.name}`,
    description: localizedText(config.site.identity.descriptions, language),
    robots: "index,follow",
    canonical: config.localizeRoute(language, "/"),
    jsonLd: [websiteJsonLd(config, language)],
    pageKind: "home",
    body: `${hero}${author}${featuredHtml}${recentHtml}${workHtml}`,
  });
}

function renderFeaturedPost(
  config: ProjectConfig,
  language: SupportedLanguage,
  post: PreviewPostArtifact,
  presentation: ReadonlyMap<string, PostPresentation>,
): string {
  const messages = blogMessages(language);
  const href = withBasePath(config.resolved.basePath, post.route);
  const thumbnail = presentation.get(post.id)?.thumbnail;
  const category = config.taxonomy.categories[post.category]?.labels;
  const fallback = post.language !== language;
  const image = thumbnail
    ? `<img class="featured-post__image" src="${escape(thumbnail.src)}" srcset="${escape(thumbnail.srcset)}" sizes="(max-width: 48rem) 100vw, 42rem" width="${thumbnail.width}" height="${thumbnail.height}" alt="" loading="eager" decoding="async" data-post-thumbnail="${thumbnail.source}">`
    : `<div class="featured-post__placeholder" data-featured-placeholder aria-hidden="true"><span></span><span></span><span></span></div>`;
  return `<a class="featured-post-link" href="${href}"${fallback ? ` hreflang="${post.language}"` : ""}><article class="featured-post" data-featured-post>${image}<div class="featured-post__copy" data-featured-copy><p class="post-kicker" data-post-kicker>${escape(category ? localizedText(category, post.language) : post.category)}</p><h3>${escape(post.title)}</h3><p>${escape(post.description)}</p><p class="post-meta" data-post-meta><time datetime="${escape(post.createdAt)}">${escape(formatDate(post.createdAt))}</time><span>${escape(messages.readingTime.replaceAll("{n}", String(post.readingMinutes)))}</span></p><span class="text-link" data-text-link>${escape(messages.readMore)} <span aria-hidden="true">→</span></span></div></article></a>`;
}

function renderSearch(config: ProjectConfig, language: SupportedLanguage): string {
  const messages = blogMessages(language);
  const searchRoute = withBasePath(
    config.resolved.basePath,
    config.localizeRoute(language, config.routes.paths.search),
  );
  const browseLinks = `<p><a href="${withBasePath(config.resolved.basePath, config.localizeRoute(language, config.routes.paths.categories))}">${escape(messages.categories)}</a> · <a href="${withBasePath(config.resolved.basePath, config.localizeRoute(language, config.routes.paths.tags))}">${escape(messages.tags)}</a> · <a href="${withBasePath(config.resolved.basePath, config.localizeRoute(language, config.routes.paths.archive))}">${escape(messages.archive)}</a></p>`;
  const indexBase = `${config.resolved.basePath.replace(/\/$/u, "")}/_assets/search/${language}/`;
  return renderShell(config, language, {
    title: `${messages.search} · ${config.site.identity.name}`,
    description: messages.noJavaScriptSearch,
    robots: "noindex,follow",
    canonical: config.localizeRoute(language, config.routes.paths.search),
    pageKind: "search",
    body: `<section class="site-search" data-site-search data-search-index="${escape(indexBase)}" data-search-base="${escape(config.resolved.basePath)}" data-search-count="${escape(messages.searchResultCount)}" data-search-language="${language}">
  <h1>${escape(messages.search)}</h1>
  <noscript>
    <p>${escape(messages.noJavaScriptSearch)}</p>
    ${browseLinks}
  </noscript>
  <form role="search" method="get" action="${escape(searchRoute)}">
    <label for="site-search-query">${escape(messages.search)}</label>
    <input class="site-control site-control--field site-search__input" id="site-search-query" name="q" type="search" autocomplete="off" enterkeyhint="search" inputmode="search" placeholder="${escape(messages.searchPlaceholder)}">
    <button class="site-control site-control--button site-search__submit" type="submit">${escape(messages.search)}</button>
  </form>
  <p class="search-status" data-search-status aria-live="polite"></p>
  <ol class="search-results" data-search-results></ol>
  <p class="search-empty" data-search-empty hidden>${escape(messages.searchEmpty)}</p>
  ${browseLinks}
</section>`,
  });
}

function renderNotFound(config: ProjectConfig, language: SupportedLanguage): string {
  const messages = blogMessages(language);
  const recovery = (
    [
      ["/", messages.home],
      [config.routes.paths.posts, messages.posts],
      [config.routes.curated.work ?? "/work/", config.curatedCollections.collections.work?.labels[language] ?? ""],
      [config.routes.curated.daily ?? "/daily/", config.curatedCollections.collections.daily?.labels[language] ?? ""],
      [config.routes.paths.explore, messages.explore],
      [config.routes.paths.categories, messages.categories],
      [config.routes.paths.tags, messages.tags],
      [config.routes.paths.archive, messages.archive],
      [config.routes.paths.search, messages.search],
    ] as const
  ).filter((item) => item[1].length > 0)
    .map(
      ([route, label]) =>
        `<li><a href="${withBasePath(config.resolved.basePath, config.localizeRoute(language, route))}"><span>${escape(label)}</span><span aria-hidden="true">→</span></a></li>`,
    )
    .join("");
  return renderShell(config, language, {
    title: `${messages.notFoundTitle} · ${config.site.identity.name}`,
    description: messages.notFoundDescription,
    robots: "noindex,follow",
    canonical: config.localizeRoute(language, config.routes.paths.notFound),
    pageKind: "not-found",
    body: `<section class="not-found" data-not-found><p class="not-found__code" data-error-code>404</p><h1>${escape(messages.notFoundTitle)}</h1><p>${escape(messages.notFoundDescription)}</p><h2>${escape(messages.recoveryLinks)}</h2><nav aria-label="${escape(messages.recoveryLinks)}"><ul>${recovery}</ul></nav></section>`,
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
  const description = kind === "posts" ? messages.browseDescription : heading;
  return renderShell(config, language, {
    title: `${heading} · ${config.site.identity.name}`,
    description,
    robots: "index,follow",
    canonical: pageRoute(collectionRoute, pageNumber, config.routes.paginationSegment),
    pageKind: "collection",
    body: `<header class="page-intro" data-page-intro><p class="eyebrow" data-eyebrow>${escape(messages.logicalPostCount.replaceAll("{n}", String(posts.length)))}</p><h1>${escape(heading)}</h1><p>${escape(description)}</p></header>${renderPostFilters(config, language, posts)}${renderPostList(config, language, posts, presentation, pageNumber === 1)}${pager}`,
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
    .map(([id, grouped]) => {
      const labels = kind === "categories" ? config.taxonomy.categories[id]?.labels : config.taxonomy.tags[id]?.labels;
      const label = labels ? localizedText(labels, language) : id;
      return `<li><a href="${withBasePath(config.resolved.basePath, `${base}${id}/`)}"><span>${escape(label)}</span><small>${grouped.length}</small></a></li>`;
    })
    .join("");
  return renderShell(config, language, {
    title: `${heading} · ${config.site.identity.name}`,
    description: heading,
    robots: "index,follow",
    canonical: base,
    pageKind: "taxonomy",
    body: `<header class="page-intro" data-page-intro><p class="eyebrow" data-eyebrow>${escape(config.site.identity.name)}</p><h1>${escape(heading)}</h1><p>${escape(messages.exploreDescription)}</p></header><ul class="taxonomy-index" data-taxonomy-index>${items}</ul>`,
  });
}

function renderPostFilters(
  config: ProjectConfig,
  language: SupportedLanguage,
  posts: readonly PreviewPostArtifact[],
): string {
  if (posts.length === 0) return "";
  const messages = blogMessages(language);
  const categories = [...new Set(posts.map((post) => post.category))]
    .sort()
    .map((id) => {
      const labels = config.taxonomy.categories[id]?.labels;
      const label = labels ? localizedText(labels, language) : id;
      const href = withBasePath(config.resolved.basePath, `${config.localizeRoute(language, config.routes.paths.categories)}${id}/`);
      return `<li><a href="${href}">${escape(label)}</a></li>`;
    })
    .join("");
  const tags = [...new Set(posts.flatMap((post) => [...post.tags]))]
    .sort()
    .slice(0, 10)
    .map((id) => {
      const labels = config.taxonomy.tags[id]?.labels;
      const label = labels ? localizedText(labels, language) : id;
      const href = withBasePath(config.resolved.basePath, `${config.localizeRoute(language, config.routes.paths.tags)}${id}/`);
      return `<li><a href="${href}">${escape(label)}</a></li>`;
    })
    .join("");
  return `<nav class="post-filters" data-post-filters aria-label="${escape(messages.explore)}"><div><strong>${escape(messages.categories)}</strong><ul>${categories}</ul></div><div><strong>${escape(messages.tags)}</strong><ul>${tags}</ul></div></nav>`;
}

function renderPostList(
  config: ProjectConfig,
  language: SupportedLanguage,
  posts: readonly PreviewPostArtifact[],
  presentation: ReadonlyMap<string, PostPresentation>,
  eagerFirst: boolean,
  chronology?: ReadonlyMap<
    string,
    {
      readonly dateSource: "work-evidence" | "created-at";
      readonly sortDate: string;
      readonly period?: { readonly start: string; readonly end: string } | undefined;
    }
  >,
  options?: { readonly headingLevel?: 2 | 3; readonly wideThumbnail?: boolean },
): string {
  const messages = blogMessages(language);
  if (posts.length === 0) {
    return `<p class="empty-state" data-empty-state>${escape(messages.emptyCollection)}</p>`;
  }
  const heading = options?.headingLevel === 3 ? "h3" : "h2";
  return `<ul class="post-list" data-post-list>${posts
    .map((post, index) => {
      const fallback = post.language !== language;
      const label = fallback ? ` <small>${escape(messages.fallbackLanguage)}: ${post.language}</small>` : "";
      const href = withBasePath(config.resolved.basePath, post.route);
      const thumbnail = presentation.get(post.id)?.thumbnail;
      const loading = eagerFirst && index === 0 ? "eager" : "lazy";
      const thumbnailSizes = options?.wideThumbnail
        ? "(max-width: 40rem) 100vw, (max-width: 80rem) 35vw, 27rem"
        : "(max-width: 40rem) 100vw, 20rem";
      const image = thumbnail
        ? `<img class="post-card__thumbnail" src="${escape(thumbnail.src)}" srcset="${escape(thumbnail.srcset)}" sizes="${thumbnailSizes}" width="${thumbnail.width}" height="${thumbnail.height}" alt="" loading="${loading}" decoding="async" data-post-thumbnail="${thumbnail.source}">`
        : "";
      const item = chronology?.get(post.translationKey);
      const dateLabel =
        item?.dateSource === "work-evidence" && item.period
          ? `<p>${escape(messages.workPeriod)}: ${escape(formatDate(item.period.start))}–${escape(formatDate(item.period.end))}</p>`
          : item
            ? `<p>${escape(messages.publishedOn)}: <time datetime="${escape(item.sortDate)}">${escape(formatDate(item.sortDate))}</time></p>`
            : "";
      const categoryLabels = config.taxonomy.categories[post.category]?.labels;
      const category = categoryLabels ? localizedText(categoryLabels, post.language) : post.category;
      return `<li><a class="post-card-link" href="${href}"${fallback ? ` hreflang="${post.language}"` : ""}><article class="post-card" data-post-card><span class="post-card__index" data-post-index aria-hidden="true">${String(index + 1).padStart(2, "0")}</span><div class="post-card__copy" data-post-card-copy><p class="post-kicker" data-post-kicker>${escape(category)}${label}</p><${heading}>${escape(post.title)}</${heading}><p>${escape(post.description)}</p><p class="post-meta" data-post-meta><time datetime="${escape(post.createdAt)}">${escape(formatDate(post.createdAt))}</time><span>${escape(messages.readingTime.replaceAll("{n}", String(post.readingMinutes)))}</span></p>${dateLabel}</div>${image}</article></a></li>`;
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
  const pages = Array.from({ length: pageCount }, (_, index) => index + 1)
    .map((item) => {
      const href = withBasePath(config.resolved.basePath, pageRoute(collectionRoute, item, config.routes.paginationSegment));
      return item === pageNumber ? `<span aria-current="page">${item}</span>` : `<a href="${href}">${item}</a>`;
    })
    .join("");
  return `<nav class="pagination" data-pagination aria-label="${escape(messages.posts)}"><span>${previous}</span><p>${pages}</p><span>${next}</span></nav>`;
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
  const postNavigation = renderPostNavigation(config, post, input.posts);
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
    pageKind: "post",
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
    body: `<article class="post-document" data-post-document data-pagefind-body>
  <nav class="breadcrumb" data-breadcrumb aria-label="Breadcrumb"><ol><li><a href="${withBasePath(config.resolved.basePath, config.localizeRoute(post.language, "/"))}">${escape(messages.home)}</a></li><li><a href="${withBasePath(config.resolved.basePath, config.localizeRoute(post.language, config.routes.paths.posts))}">${escape(messages.posts)}</a></li><li aria-current="page">${escape(post.title)}</li></ol></nav>
  <header class="post-header" data-post-header>
    <p class="post-kicker" data-post-kicker><a href="${withBasePath(config.resolved.basePath, config.localizeRoute(post.language, `${config.routes.paths.categories}${post.category}/`))}" data-pagefind-filter="category" data-pagefind-weight="8">${escape(categoryLabel)}</a></p>
    <h1 data-pagefind-meta="title" data-pagefind-weight="10">${escape(post.title)}</h1>
    <p class="post-header__description" data-post-description>${escape(post.description)}</p>
    <p class="post-meta" data-post-meta><span>${escape(messages.authorBy)} ${escape(config.site.identity.owner.displayName)}</span><time datetime="${escape(post.createdAt)}">${escape(formatDate(post.createdAt))}</time><span>${escape(messages.readingTime.replaceAll("{n}", String(post.readingMinutes)))}</span></p>
    <ul class="post-tags" data-post-tags>${post.tags.map((tag) => {
      const labels = config.taxonomy.tags[tag]?.labels;
      const label = labels ? localizedText(labels, post.language) : tag;
      const href = withBasePath(config.resolved.basePath, `${config.localizeRoute(post.language, config.routes.paths.tags)}${tag}/`);
      return `<li data-pagefind-filter="tag" data-pagefind-weight="8"><a href="${href}">${escape(label)}</a></li>`;
    }).join("")}</ul>
  </header>
  <div class="post-layout" data-post-layout>
    ${toc}
    <div class="post-content" data-post-content>
      <div class="article-body" data-article-body>${bodyHtml}</div>
      ${renderOriginalPostFooter(post.language, origin)}
    </div>
    <aside class="post-author" data-post-author data-pagefind-ignore>
      <div class="author-monogram" data-author-monogram aria-hidden="true">CH</div>
      <p class="eyebrow" data-eyebrow>${escape(messages.authorRole)}</p>
      <h2>${escape(config.site.identity.owner.displayName)}</h2>
      <p>${escape(config.site.identity.owner.shortBios[post.language])}</p>
      <a href="${withBasePath(config.resolved.basePath, config.site.identity.owner.profileRoutes[post.language])}" rel="author">${escape(messages.profile)} <span aria-hidden="true">→</span></a>
    </aside>
    <div class="post-after" data-post-after>
      ${postNavigation}
      ${related}
    </div>
  </div>
</article>`,
  });
}

function renderPostNavigation(
  config: ProjectConfig,
  post: PreviewPostArtifact,
  posts: readonly PreviewPostArtifact[],
): string {
  const messages = blogMessages(post.language);
  const listed = listPostsForLanguage(post.language, posts);
  const index = listed.findIndex((candidate) => candidate.translationKey === post.translationKey);
  if (index < 0) return "";
  const previous = listed[index + 1];
  const next = listed[index - 1];
  if (!previous && !next) return "";
  const link = (candidate: PreviewPostArtifact | undefined, label: string, direction: "previous" | "next") =>
    candidate
      ? `<a class="post-navigation__link post-navigation__link--${direction}" href="${withBasePath(config.resolved.basePath, candidate.route)}"><small>${escape(label)}</small>\n<span>${escape(candidate.title)}</span></a>`
      : "";
  return `<nav class="post-navigation" data-post-navigation aria-label="${escape(messages.articleNavigation)}">${link(previous, messages.previousPost, "previous")}${link(next, messages.nextPost, "next")}</nav>`;
}

function renderRelated(
  config: ProjectConfig,
  post: PreviewPostArtifact,
  posts: readonly PreviewPostArtifact[],
  presentation: ReadonlyMap<string, PostPresentation>,
): string {
  const messages = blogMessages(post.language);
  const related = listPostsForLanguage(post.language, posts)
    .filter((candidate) => candidate.category === post.category && candidate.translationKey !== post.translationKey)
    .slice(0, config.site.relatedPosts.maxItems);
  if (related.length === 0) return "";
  return `<aside class="related-posts" data-related-posts data-search-ignore><div class="section-heading" data-section-heading><h2>${escape(messages.relatedPosts)}</h2></div>${renderPostList(config, post.language, related, presentation, false, undefined, { headingLevel: 3 })}</aside>`;
}

function renderToc(post: PreviewPostArtifact, label: string): string {
  if (post.headings.length === 0) return "";
  return `<details class="post-toc" data-post-toc data-pagefind-ignore open><summary class="site-control site-control--summary post-toc__summary">${escape(label)}</summary><nav aria-label="${escape(label)}"><ol>${post.headings
    .map((heading: { readonly anchor: string; readonly text: string; readonly depth: number }) => `<li data-depth="${heading.depth}"><a href="${heading.anchor}">${escape(heading.text)}</a></li>`)
    .join("")}</ol></nav></details>`;
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
    readonly pageKind: "home" | "post" | "collection" | "taxonomy" | "explore" | "search" | "not-found";
  },
): string {
  const messages = blogMessages(language);
  const consent =
    config.resolved.ga4.enabled && config.analytics.scope.blog && input.robots.includes("index")
      ? `<p class="analytics-consent" data-analytics-consent><button class="site-control site-control--button analytics-consent__grant" type="button" data-analytics-grant>${escape(messages.allowAnalytics)}</button> <button class="site-control site-control--button analytics-consent__deny" type="button" data-analytics-deny>${escape(messages.denyAnalytics)}</button></p>`
      : "";
  return renderDocument({
    language,
    title: input.title,
    description: input.description,
    siteName: config.site.identity.name,
    canonicalUrl: config.resolvePublicUrl(input.canonical),
    robots: input.robots,
    homeHref: withBasePath(config.resolved.basePath, config.localizeRoute(language, "/")),
    profileHref: withBasePath(config.resolved.basePath, config.site.identity.owner.profileRoutes[language]),
    authorName: config.site.identity.owner.displayName,
    searchIndex: `${config.resolved.basePath.replace(/\/$/u, "")}/_assets/search/${language}/`,
    basePath: config.resolved.basePath,
    primaryNavigation: config.navigation.primary.map((item) => ({
      href: withBasePath(
        config.resolved.basePath,
        item.type === "internal" ? config.localizeRoute(language, item.href) : item.href,
      ),
      label: localizedText(item.labels, language),
      current: navigationIsCurrent(config, language, input.canonical, item.type === "internal" ? item.href : item.href),
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
    footer: `<div class="site-footer__identity" data-footer-identity><strong>${escape(config.site.identity.name)}</strong><p>${escape(localizedText(config.site.identity.descriptions, language))}</p></div>${renderFooterNavigation(config, language)}${consent}`,
    pageKind: input.pageKind,
    ...(input.ogPrefix ? { ogPrefix: input.ogPrefix } : {}),
    ...(input.jsonLd ? { jsonLd: input.jsonLd } : {}),
    ...(input.pagefindBody ? { pagefindBody: true } : {}),
  });
}

function navigationIsCurrent(
  config: ProjectConfig,
  language: SupportedLanguage,
  canonical: string,
  logicalRoute: string,
): boolean {
  if (!logicalRoute.startsWith("/")) return false;
  const target = config.localizeRoute(language, logicalRoute);
  return canonical === target || (target !== "/" && canonical.startsWith(target));
}

function formatDate(value: string): string {
  const dateTime = /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?/u.exec(value);
  if (dateTime) {
    const [, year, month, day, hour, minute] = dateTime;
    return `${year}. ${month}. ${day}${hour && minute ? ` ${hour}:${minute}` : ""}`;
  }
  const yearMonth = /^(\d{4})-(\d{2})$/u.exec(value);
  return yearMonth ? `${yearMonth[1]}. ${yearMonth[2]}` : value;
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
  return `<nav aria-label="${escape(config.site.identity.name)}"><ul>${items}</ul></nav>`;
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
  const cssSource = resolve(here, "styles/blog.css");
  const cssDestination = resolve(siteDirectory, "_assets/app/blog.css");
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
  writeFileSync(
    resolve(siteDirectory, "_assets/app/image-viewer.js"),
    readFileSync(resolve(here, "post/image-viewer.js")),
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
