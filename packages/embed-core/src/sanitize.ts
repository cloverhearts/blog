const FORBIDDEN_HTML = /<script\b|on[a-z]+\s*=|<iframe\b|javascript:/iu;

export function assertSafeEmbedHtml(html: string, pluginId: string): string {
  const trimmed = html.trim();
  if (trimmed.length === 0) {
    throw new Error(`${pluginId} returned empty embed HTML`);
  }
  if (FORBIDDEN_HTML.test(trimmed)) {
    throw new Error(`${pluginId} returned unsafe embed HTML`);
  }
  return trimmed;
}

export function assertHttpsUrl(value: string, field: string): string {
  const url = new URL(value);
  if (url.protocol !== "https:") {
    throw new Error(`${field} must be HTTPS`);
  }
  if (url.username || url.password) {
    throw new Error(`${field} must not include credentials`);
  }
  return url.toString();
}

export function assertDeclaredOrigins(
  html: string,
  origins: readonly string[],
  pluginId: string,
): void {
  const found = [...html.matchAll(/https:\/\/[A-Za-z0-9.-]+/gu)].map((match) => match[0]);
  for (const origin of found) {
    const allowed = origins.some((candidate) => origin.startsWith(candidate));
    if (!allowed && origins.length === 0 && found.length > 0) {
      throw new Error(`${pluginId} referenced ${origin} without declaring a CSP origin`);
    }
    if (origins.length > 0 && !allowed) {
      throw new Error(`${pluginId} referenced undeclared origin ${origin}`);
    }
  }
}
