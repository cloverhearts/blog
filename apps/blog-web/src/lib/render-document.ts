import type { SupportedLanguage } from "../../../../packages/contracts/src/index.ts";
import { blogMessages } from "../i18n/messages.ts";
import { escapeHtml, withBasePath } from "./html.ts";

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
  readonly basePath: string;
  readonly primaryNavigation: readonly DocumentLink[];
  readonly languageNavigation: readonly DocumentLink[];
  readonly head: string;
  readonly body: string;
  readonly footer: string;
  readonly ogPrefix?: string;
  readonly jsonLd?: readonly string[];
  readonly pagefindBody?: boolean;
}

export function renderDocument(input: RenderDocumentInput): string {
  const messages = blogMessages(input.language);
  const favicon = withBasePath(input.basePath, "/favicon.svg");
  const manifest = withBasePath(input.basePath, "/site.webmanifest");
  const stylesheet = withBasePath(input.basePath, "/_assets/app/classless.css");
  const languageLinks = input.languageNavigation
    .map(
      (item) => `    <link rel="alternate" hreflang="${item.hreflang ?? item.label}" href="${escapeHtml(absoluteOrKeep(item.href, input.canonicalUrl))}">`,
    )
    .join("\n");
  const xDefault = input.languageNavigation.find((item) => item.hreflang === "ko") ?? input.languageNavigation[0];
  const jsonLd = (input.jsonLd ?? [])
    .map((block) => `    <script type="application/ld+json">${block}</script>`)
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
  </head>
  <body>
    <a data-skip-link href="#main">${escapeHtml(messages.skipToContent)}</a>
    <header>
      <a href="${escapeHtml(input.homeHref)}">${escapeHtml(input.siteName)}</a>
      <nav aria-label="${escapeHtml(messages.menu)}">
        <ul>
${input.primaryNavigation.map((item) => `          <li><a href="${escapeHtml(item.href)}"${item.current ? ' aria-current="page"' : ""}>${escapeHtml(item.label)}</a></li>`).join("\n")}
        </ul>
      </nav>
      <nav aria-label="${escapeHtml(messages.language)}">
        <ul>
${input.languageNavigation.map((item) => `          <li><a href="${escapeHtml(item.href)}"${item.hreflang ? ` hreflang="${item.hreflang}"` : ""}${item.current ? ' aria-current="page"' : ""}>${escapeHtml(item.label)}</a></li>`).join("\n")}
        </ul>
      </nav>
    </header>
    <main id="main" tabindex="-1"${input.pagefindBody ? " data-pagefind-body" : ""}>
${input.body}
    </main>
    <footer>
${input.footer}
    </footer>
  </body>
</html>
`;
}

function absoluteOrKeep(href: string, canonicalUrl: string): string {
  if (href.startsWith("https://")) return href;
  const url = new URL(canonicalUrl);
  return `${url.origin}${href}`;
}
