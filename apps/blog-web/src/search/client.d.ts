export function normalizeQuery(value: string): string;
export function shouldRunSearch(value: string): boolean;
export function searchIndexBasePath(
  basePath: string,
  language: "en" | "ko" | "ja",
): string;
export function formatResultCount(template: string, count: number): string;
export function publicResultUrl(basePath: string, url: string): string;
export function escapeHtml(value: string): string;
export function renderSearchResultItems(
  results: readonly {
    readonly url?: string;
    readonly meta?: { readonly title?: string };
    readonly excerpt?: string;
  }[],
  basePath: string,
): string;
export function bindSiteSearch(root: ParentNode): void;
