export type AiCrawlerPurpose =
  | "search"
  | "training"
  | "dataset"
  | "user-directed"
  | "mixed-search-training";

export type CrawlerAccess = "allow" | "disallow";

export interface AiCrawlerRule {
  readonly id: string;
  readonly provider: string;
  readonly purpose: AiCrawlerPurpose;
  readonly access: CrawlerAccess;
  readonly userAgents: readonly string[];
  readonly documentation: string;
}

export interface RobotsTxtInput {
  readonly defaultAccess: CrawlerAccess;
  readonly crawlers: readonly AiCrawlerRule[];
  readonly sitemapUrl: string;
  readonly llmsUrl: string;
}

export interface LlmsLink {
  readonly label: string;
  readonly url: string;
  readonly description?: string;
}

export interface LlmsSection {
  readonly heading: string;
  readonly links: readonly LlmsLink[];
}

export interface AiDataUsePolicy {
  readonly searchAndAnswering: CrawlerAccess;
  readonly userDirectedRetrieval: CrawlerAccess;
  readonly modelDevelopment: CrawlerAccess;
  readonly publicDatasetInclusion: CrawlerAccess;
  readonly attribution: "requested" | "required" | "not-requested";
}

export interface LlmsTxtInput {
  readonly siteName: string;
  readonly summary: string;
  readonly dataUse: AiDataUsePolicy;
  readonly sections: readonly LlmsSection[];
  readonly guidance: readonly string[];
}

const USER_AGENT_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._-]*$/u;

function assertSingleLine(value: string, name: string): string {
  const normalized = value.trim();
  if (normalized.length === 0 || /[\r\n]/u.test(normalized)) {
    throw new Error(`${name} must be a non-empty single line.`);
  }
  return normalized;
}

function assertHttpsUrl(value: string, name: string): string {
  const normalized = assertSingleLine(value, name);
  const parsed = new URL(normalized);
  if (
    parsed.protocol !== "https:" ||
    parsed.username ||
    parsed.password ||
    parsed.search ||
    parsed.hash
  ) {
    throw new Error(
      `${name} must be an absolute HTTPS URL without credentials, query, or fragment.`,
    );
  }
  return parsed.toString();
}

function accessDirective(access: CrawlerAccess): string {
  if (access === "allow") return "Allow: /";
  if (access === "disallow") return "Disallow: /";
  throw new Error(`Unsupported crawler access: ${String(access)}`);
}

function accessLabel(access: CrawlerAccess): string {
  if (access === "allow") return "allowed";
  if (access === "disallow") return "not allowed";
  throw new Error(`Unsupported data-use access: ${String(access)}`);
}

export function renderRobotsTxt(input: RobotsTxtInput): string {
  const sitemapUrl = assertHttpsUrl(input.sitemapUrl, "sitemapUrl");
  const llmsUrl = assertHttpsUrl(input.llmsUrl, "llmsUrl");
  const seenUserAgents = new Set<string>();
  const groups: Array<{ userAgent: string; access: CrawlerAccess }> = [];

  for (const crawler of input.crawlers) {
    assertSingleLine(crawler.id, "crawler id");
    assertSingleLine(crawler.provider, `provider for ${crawler.id}`);
    assertHttpsUrl(crawler.documentation, `documentation for ${crawler.id}`);
    if (crawler.userAgents.length === 0) {
      throw new Error(`${crawler.id} must declare at least one User-Agent.`);
    }

    for (const rawUserAgent of crawler.userAgents) {
      const userAgent = assertSingleLine(
        rawUserAgent,
        `User-Agent for ${crawler.id}`,
      );
      if (!USER_AGENT_PATTERN.test(userAgent)) {
        throw new Error(`Invalid User-Agent token: ${userAgent}`);
      }
      const identity = userAgent.toLowerCase();
      if (seenUserAgents.has(identity)) {
        throw new Error(`Duplicate User-Agent policy: ${userAgent}`);
      }
      seenUserAgents.add(identity);
      groups.push({ userAgent, access: crawler.access });
    }
  }

  groups.sort((left, right) =>
    left.userAgent.localeCompare(right.userAgent, "en"),
  );

  const lines = [
    "# Generated from config/ai-crawlers.yaml. Do not edit by hand.",
    `# AI usage guide: ${llmsUrl}`,
    "",
  ];

  for (const group of groups) {
    lines.push(
      `User-agent: ${group.userAgent}`,
      accessDirective(group.access),
      "",
    );
  }

  lines.push(
    "User-agent: *",
    accessDirective(input.defaultAccess),
    "",
    `Sitemap: ${sitemapUrl}`,
    "",
  );

  return lines.join("\n");
}

function renderLlmsLink(link: LlmsLink, context: string): string {
  const label = assertSingleLine(link.label, `${context} label`);
  const url = assertHttpsUrl(link.url, `${context} URL`);
  const description = link.description
    ? `: ${assertSingleLine(link.description, `${context} description`)}`
    : "";
  return `- [${label}](${url})${description}`;
}

export function renderLlmsTxt(input: LlmsTxtInput): string {
  const siteName = assertSingleLine(input.siteName, "siteName");
  const summary = assertSingleLine(input.summary, "summary");
  if (input.sections.length === 0) {
    throw new Error("llms.txt must contain at least one link section.");
  }
  if (input.guidance.length === 0) {
    throw new Error("llms.txt must contain at least one guidance item.");
  }

  const lines = [
    `# ${siteName}`,
    "",
    `> ${summary}`,
    "",
    "Canonical generated HTML is authoritative. This guide is informational; robots.txt and page-level metadata define crawler discovery policy.",
    "",
  ];

  for (const [sectionIndex, section] of input.sections.entries()) {
    const heading = assertSingleLine(
      section.heading,
      `section ${sectionIndex + 1} heading`,
    );
    if (section.links.length === 0) {
      throw new Error(`llms.txt section ${heading} must contain a link.`);
    }
    lines.push(`## ${heading}`, "");
    section.links.forEach((link, linkIndex) => {
      lines.push(
        renderLlmsLink(link, `${heading} link ${linkIndex + 1}`),
      );
    });
    lines.push("");
  }

  lines.push(
    "## Machine use",
    "",
    `- Search and answer generation: ${accessLabel(input.dataUse.searchAndAnswering)}.`,
    `- User-directed retrieval: ${accessLabel(input.dataUse.userDirectedRetrieval)}.`,
    `- Model development: ${accessLabel(input.dataUse.modelDevelopment)}.`,
    `- Public dataset inclusion: ${accessLabel(input.dataUse.publicDatasetInclusion)}.`,
    `- Attribution: ${input.dataUse.attribution}; use the canonical URL and preserve visible authorship and original-language provenance.`,
    "- This operational declaration does not replace applicable copyright or license terms.",
    "",
  );

  lines.push("## Usage guidance", "");
  input.guidance.forEach((item, index) => {
    lines.push(`- ${assertSingleLine(item, `guidance item ${index + 1}`)}`);
  });
  lines.push("");

  return lines.join("\n");
}
