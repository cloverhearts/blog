export function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function withBasePath(basePath: string, route: string): string {
  if (route.startsWith("http://") || route.startsWith("https://")) {
    return route;
  }
  if (!route.startsWith("/")) {
    throw new Error(`Route must be root-relative: ${route}`);
  }
  return `${basePath}${route}`;
}

export function rewriteArtifactUrls(
  html: string,
  basePath: string,
  contentAssetPrefix: string,
): string {
  return html.replaceAll(
    /artifact:assets\//gu,
    `${basePath}${contentAssetPrefix}`.replace(/\/$/u, "/") + "",
  ).replaceAll("artifact:assets/", `${basePath}${contentAssetPrefix}`);
}
