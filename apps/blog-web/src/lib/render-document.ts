import type { SupportedLanguage } from "../../../../packages/contracts/src/index.ts";
import { blogMessages } from "../i18n/messages.ts";
import { escapeHtml, withBasePath } from "./html.ts";
import { searchIcon } from "./search-icon.ts";

export interface DocumentLink {
  readonly href: string;
  readonly label: string;
  readonly hreflang?: SupportedLanguage;
  readonly current?: boolean;
}

export interface RenderDocumentInput {
  readonly language: SupportedLanguage;
  readonly title: string;
  readonly description: string;
  readonly siteName: string;
  readonly canonicalUrl: string;
  readonly robots: string;
  readonly homeHref: string;
  readonly profileHref: string;
  readonly authorName: string;
  readonly searchIndex: string;
  readonly basePath: string;
  readonly rootLanguageSelection?: {
    readonly defaultLanguage: SupportedLanguage;
    readonly homes: Readonly<Record<string, string>>;
  } | undefined;
  readonly primaryNavigation: readonly DocumentLink[];
  readonly languageNavigation: readonly DocumentLink[];
  readonly head: string;
  readonly body: string;
  readonly footer: string;
  readonly ogPrefix?: string;
  readonly jsonLd?: readonly string[];
  readonly pagefindBody?: boolean;
  readonly pageKind: "home" | "post" | "collection" | "taxonomy" | "explore" | "search" | "not-found";
}

export function renderDocument(input: RenderDocumentInput): string {
  const messages = blogMessages(input.language);
  const favicon = withBasePath(input.basePath, "/favicon.svg");
  const manifest = withBasePath(input.basePath, "/site.webmanifest");
  const stylesheet = withBasePath(input.basePath, "/_assets/app/blog.css");
  const languageLinks = input.languageNavigation
    .map(
      (item) => `    <link rel="alternate" hreflang="${item.hreflang ?? item.label}" href="${escapeHtml(absoluteOrKeep(item.href, input.canonicalUrl))}">`,
    )
    .join("\n");
  const xDefault = input.languageNavigation.find((item) => item.hreflang === "ko") ?? input.languageNavigation[0];
  const jsonLd = (input.jsonLd ?? [])
    .map((block) => `    <script type="application/ld+json">${block.replaceAll("<", "\\u003c")}</script>`)
    .join("\n");

  return `<!doctype html>
<html lang="${input.language}"${input.ogPrefix ? ` prefix="${escapeHtml(input.ogPrefix)}"` : ""}>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width">
    <meta name="description" content="${escapeHtml(input.description)}">
    <meta name="robots" content="${escapeHtml(input.robots)}">
    <title>${escapeHtml(input.title)}</title>
    <link rel="canonical" href="${escapeHtml(input.canonicalUrl)}">
    <link rel="icon" href="${escapeHtml(favicon)}" type="image/svg+xml">
    <link rel="manifest" href="${escapeHtml(manifest)}">
    <link rel="stylesheet" href="${escapeHtml(stylesheet)}">
${languageLinks}
${xDefault ? `    <link rel="alternate" hreflang="x-default" href="${escapeHtml(absoluteOrKeep(xDefault.href, input.canonicalUrl))}">` : ""}
${input.head}
${jsonLd}
${input.rootLanguageSelection ? `    <script type="module" src="${escapeHtml(withBasePath(input.basePath, "/_assets/app/root-language.js"))}" data-root-language-selection data-default-language="${input.rootLanguageSelection.defaultLanguage}" data-language-homes="${escapeHtml(JSON.stringify(input.rootLanguageSelection.homes))}"></script>` : ""}
  </head>
  <body class="page page--${input.pageKind}" data-page-kind="${input.pageKind}">
    <a class="skip-link" data-skip-link href="#main">${escapeHtml(messages.skipToContent)}</a>
    <header class="site-header" data-site-header>
      <div class="site-header__inner" data-header-inner>
      <a class="site-brand" data-site-brand href="${escapeHtml(input.homeHref)}">${escapeHtml(input.siteName)}</a>
      <nav class="primary-navigation" data-primary-navigation aria-label="${escapeHtml(messages.menu)}">
        <ul>
${input.primaryNavigation.map((item) => `          <li><a href="${escapeHtml(item.href)}"${item.current ? ' aria-current="page"' : ""}${item.href.includes("/search/") ? " data-search-trigger" : ""}>${escapeHtml(item.label)}</a></li>`).join("\n")}
        </ul>
      </nav>
      <nav class="language-navigation" data-language-navigation aria-label="${escapeHtml(messages.language)}">
        <ul>
${input.languageNavigation.map((item) => `          <li><a href="${escapeHtml(item.href === withBasePath(input.basePath, "/") ? `${item.href}?lang=ko` : item.href)}"${item.hreflang ? ` hreflang="${item.hreflang}"` : ""}${item.current ? ' aria-current="page"' : ""}>${escapeHtml(item.label)}</a></li>`).join("\n")}
        </ul>
      </nav>
      </div>
    </header>
    <main id="main" tabindex="-1"${input.pagefindBody ? " data-pagefind-body" : ""}>
${input.body}
    </main>
    <footer class="site-footer" data-site-footer>
${input.footer}
    </footer>
    <dialog class="search-dialog" data-search-dialog data-search-index="${escapeHtml(input.searchIndex)}" data-search-base="${escapeHtml(input.basePath)}" data-search-count="${escapeHtml(messages.searchResultCount)}" aria-labelledby="search-dialog-title">
      <div class="search-dialog__inner" data-search-dialog-inner>
        <header class="search-dialog__header">
          <h2 id="search-dialog-title">${escapeHtml(messages.search)}</h2>
          <button class="site-control site-control--button search-dialog__close" type="button" data-search-close aria-label="${escapeHtml(messages.searchClose)}"><kbd aria-hidden="true">ESC</kbd><span>${escapeHtml(messages.searchClose)}</span></button>
        </header>
        <form class="search-dialog__form" role="search" method="dialog" data-search-dialog-form>
          <label class="search-dialog__label" for="dialog-search-query">${escapeHtml(messages.search)}</label>
          <div class="search-dialog__field">
            ${searchIcon}
            <input class="site-control site-control--field search-dialog__input" id="dialog-search-query" name="q" type="search" autocomplete="off" enterkeyhint="search" inputmode="search" placeholder="${escapeHtml(messages.searchPlaceholder)}">
            <button class="site-control site-control--button search-dialog__submit" type="submit">${escapeHtml(messages.search)}</button>
          </div>
        </form>
        <div class="search-dialog__body">
          <p class="search-dialog__hint" data-search-hint>${escapeHtml(messages.searchHint)}</p>
          <p class="search-status" data-search-status aria-live="polite"></p>
          <ol class="search-results" data-search-results></ol>
          <p class="search-empty" data-search-empty hidden>${escapeHtml(messages.searchEmpty)}</p>
        </div>
      </div>
    </dialog>
${input.pageKind === "post" ? `    <dialog class="image-viewer" data-image-viewer data-open-label="${escapeHtml(messages.imagePreviewOpen)}" aria-label="${escapeHtml(messages.imagePreview)}">
      <div class="image-viewer__inner">
        <button class="site-control site-control--button image-viewer__close" type="button" data-image-viewer-close aria-label="${escapeHtml(messages.imagePreviewClose)}"><kbd aria-hidden="true">ESC</kbd><span>${escapeHtml(messages.imagePreviewClose)}</span></button>
        <figure class="image-viewer__figure">
          <img data-image-viewer-image alt="">
          <figcaption data-image-viewer-caption tabindex="0" hidden></figcaption>
        </figure>
      </div>
    </dialog>
    <script type="module" src="${escapeHtml(withBasePath(input.basePath, "/_assets/app/image-viewer.js"))}"></script>` : ""}
    <script type="module" src="${escapeHtml(withBasePath(input.basePath, "/_assets/app/search.js"))}"></script>
  </body>
</html>
`;
}

function absoluteOrKeep(href: string, canonicalUrl: string): string {
  if (href.startsWith("https://")) return href;
  const url = new URL(canonicalUrl);
  return `${url.origin}${href}`;
}
