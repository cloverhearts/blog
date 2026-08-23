const FORBIDDEN_HTML = /<script\b|on[a-z]+\s*=|javascript:|\bsrcdoc\s*=|data:text\/html/iu;

export function assertSafeEmbedHtml(
  html: string,
  pluginId: string,
  iframePermissions: readonly string[] = [],
): string {
  const trimmed = html.trim();
  if (trimmed.length === 0) {
    throw new Error(`${pluginId} returned empty embed HTML`);
  }
  if (FORBIDDEN_HTML.test(trimmed)) {
    throw new Error(`${pluginId} returned unsafe embed HTML`);
  }
  const iframeTags = [...trimmed.matchAll(/<iframe\b([^>]*)>/giu)];
  const iframeClosingTags = [...trimmed.matchAll(/<\/iframe>/giu)];
  if (iframeTags.length !== iframeClosingTags.length) {
    throw new Error(`${pluginId} returned an unbalanced iframe`);
  }
  for (const match of iframeTags) {
    const attributes = match[1] ?? "";
    const src = requiredQuotedAttribute(attributes, "src", pluginId);
    assertHttpsUrl(src, `${pluginId} iframe src`);
    if (requiredQuotedAttribute(attributes, "title", pluginId).trim().length === 0) {
      throw new Error(`${pluginId} iframe title must not be empty`);
    }
    if (requiredQuotedAttribute(attributes, "loading", pluginId) !== "lazy") {
      throw new Error(`${pluginId} iframe must use lazy loading`);
    }
    if (
      requiredQuotedAttribute(attributes, "referrerpolicy", pluginId) !==
      "strict-origin-when-cross-origin"
    ) {
      throw new Error(`${pluginId} iframe must use the approved referrer policy`);
    }
    if (requiredQuotedAttribute(attributes, "sandbox", pluginId).trim().length === 0) {
      throw new Error(`${pluginId} iframe must declare a sandbox`);
    }
    if (!/\sallowfullscreen(?:\s|>|$)/iu.test(`${attributes}>`)) {
      throw new Error(`${pluginId} iframe must allow fullscreen explicitly`);
    }
    const allow = optionalQuotedAttribute(attributes, "allow");
    const requested = allow
      .split(";")
      .map((value) => value.trim())
      .filter(Boolean);
    for (const permission of requested) {
      if (!iframePermissions.includes(permission)) {
        throw new Error(`${pluginId} iframe requested undeclared permission ${permission}`);
      }
    }
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
  const found = [...html.matchAll(/https:\/\/[A-Za-z0-9.-]+/gu)].map(
    (match) => new URL(match[0]).origin,
  );
  const allowedOrigins = origins.map((origin) => new URL(origin).origin);
  for (const origin of found) {
    const allowed = allowedOrigins.includes(origin);
    if (!allowed && origins.length === 0 && found.length > 0) {
      throw new Error(`${pluginId} referenced ${origin} without declaring a CSP origin`);
    }
    if (origins.length > 0 && !allowed) {
      throw new Error(`${pluginId} referenced undeclared origin ${origin}`);
    }
  }
}

function requiredQuotedAttribute(attributes: string, name: string, pluginId: string): string {
  const value = optionalQuotedAttribute(attributes, name);
  if (value.length === 0) {
    throw new Error(`${pluginId} iframe requires ${name}`);
  }
  return value;
}

function optionalQuotedAttribute(attributes: string, name: string): string {
  const match = new RegExp(`(?:^|\\s)${name}="([^"]*)"`, "iu").exec(attributes);
  return match?.[1] ?? "";
}
