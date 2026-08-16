const HTTPS_ORIGIN_PATTERN = /^https:\/\/[A-Za-z0-9.-]+(?::\d+)?$/u;
const BASE_PATH_PATTERN = /^\/[A-Za-z0-9._~-]+(?:\/[A-Za-z0-9._~-]+)*$/u;

export function normalizeOrigin(value: string, field: string): string {
  const trimmed = value.trim();
  if (!HTTPS_ORIGIN_PATTERN.test(trimmed)) {
    throw new Error(
      `${field} must be an absolute HTTPS origin with no path, query, or fragment.`,
    );
  }
  return trimmed;
}

export function normalizeBasePath(value: string, field: string): string {
  const trimmed = value.trim();
  if (trimmed === "" || trimmed === "/") {
    return "";
  }
  if (
    trimmed.includes("?") ||
    trimmed.includes("#") ||
    trimmed.includes("%2f") ||
    trimmed.includes("%2F") ||
    trimmed.includes("\\") ||
    trimmed.split("/").includes(".") ||
    trimmed.split("/").includes("..")
  ) {
    throw new Error(
      `${field} must be empty or a normalized path without traversal, query, or fragment.`,
    );
  }
  const withoutTrailing = trimmed.endsWith("/") ? trimmed.slice(0, -1) : trimmed;
  if (!BASE_PATH_PATTERN.test(withoutTrailing)) {
    throw new Error(`${field} must be empty or start with '/' and contain no trailing slash.`);
  }
  return withoutTrailing;
}

export function joinPublicUrl(
  origin: string,
  basePath: string,
  logicalRoute: string,
): string {
  if (!logicalRoute.startsWith("/")) {
    throw new Error(`A logical route must begin with '/': ${logicalRoute}`);
  }
  return `${origin}${basePath}${logicalRoute}`;
}

export function normalizeLogicalRoute(
  route: string,
  trailingSlash: "always" | "never",
): string {
  if (!route.startsWith("/")) {
    throw new Error(`A logical route must begin with '/': ${route}`);
  }
  if (route.includes("?") || route.includes("#") || route.includes("//")) {
    throw new Error(`A logical route must not contain '//', query, or fragment: ${route}`);
  }
  if (route.split("/").includes(".") || route.split("/").includes("..")) {
    throw new Error(`A logical route must not contain '.' or '..': ${route}`);
  }

  if (route === "/") {
    return "/";
  }

  const isFile = /\.[A-Za-z0-9]+$/u.test(route.split("/").at(-1) ?? "");
  if (isFile) {
    return route.endsWith("/") ? route.slice(0, -1) : route;
  }
  if (trailingSlash === "always") {
    return route.endsWith("/") ? route : `${route}/`;
  }
  return route.endsWith("/") ? route.slice(0, -1) : route;
}
