import assert from "node:assert/strict";
import { test } from "vitest";

import {
  renderLlmsTxt,
  renderRobotsTxt,
} from "../../packages/site-discovery/src/ai-discovery.ts";
import { DISCOVERY_ARTIFACT_SCHEMA_VERSION } from "../../packages/contracts/src/index.ts";

const crawlers = [
  {
    id: "openai-search",
    provider: "OpenAI",
    purpose: "search",
    access: "allow",
    userAgents: ["OAI-SearchBot"],
    documentation: "https://developers.openai.com/api/docs/bots",
  },
  {
    id: "openai-training",
    provider: "OpenAI",
    purpose: "training",
    access: "allow",
    userAgents: ["GPTBot"],
    documentation: "https://developers.openai.com/api/docs/bots",
  },
  {
    id: "common-crawl-dataset",
    provider: "Common Crawl",
    purpose: "dataset",
    access: "allow",
    userAgents: ["CCBot"],
    documentation: "https://commoncrawl.org/ccbot",
  },
] as const;

test("uses the AI-guide discovery artifact schema version", () => {
  assert.equal(DISCOVERY_ARTIFACT_SCHEMA_VERSION, 3);
});

test("keeps search, training, dataset, and default crawler access open", () => {
  const output = renderRobotsTxt({
    defaultAccess: "allow",
    crawlers,
    sitemapUrl: "https://example.com/blog/sitemap.xml",
    llmsUrl: "https://example.com/blog/llms.txt",
  });

  assert.match(output, /User-agent: OAI-SearchBot\nAllow: \/\n/u);
  assert.match(output, /User-agent: GPTBot\nAllow: \/\n/u);
  assert.match(output, /User-agent: CCBot\nAllow: \/\n/u);
  assert.match(output, /User-agent: \*\nAllow: \/\n/u);
  assert.doesNotMatch(output, /Disallow: \/(?:\n|$)/u);
  assert.match(output, /Sitemap: https:\/\/example\.com\/blog\/sitemap\.xml/u);
  assert.match(output, /AI usage guide: https:\/\/example\.com\/blog\/llms\.txt/u);
});

test("rejects ambiguous, malformed, or insecure crawler configuration", () => {
  assert.throws(() =>
    renderRobotsTxt({
      defaultAccess: "allow",
      crawlers: [crawlers[0], { ...crawlers[1], userAgents: ["oai-searchbot"] }],
      sitemapUrl: "https://example.com/sitemap.xml",
      llmsUrl: "https://example.com/llms.txt",
    }),
  );
  assert.throws(() =>
    renderRobotsTxt({
      defaultAccess: "allow",
      crawlers: [{ ...crawlers[0], userAgents: ["Bot\nDisallow"] }],
      sitemapUrl: "https://example.com/sitemap.xml",
      llmsUrl: "https://example.com/llms.txt",
    }),
  );
  assert.throws(() =>
    renderRobotsTxt({
      defaultAccess: "allow",
      crawlers,
      sitemapUrl: "http://example.com/sitemap.xml",
      llmsUrl: "https://example.com/llms.txt",
    }),
  );
});

test("renders a concise deterministic llms.txt with canonical links", () => {
  const input = {
    siteName: "CloverHearts Blog",
    summary: "A personal blog, portfolio, and showcase of completed work.",
    dataUse: {
      searchAndAnswering: "allow",
      userDirectedRetrieval: "allow",
      modelDevelopment: "allow",
      publicDatasetInclusion: "allow",
      attribution: "requested",
    },
    sections: [
      {
        heading: "Languages",
        links: [
          {
            label: "한국어",
            url: "https://example.com/",
            description: "Default and fallback language.",
          },
          {
            label: "English",
            url: "https://example.com/en/",
            description: "English language route.",
          },
        ],
      },
      {
        heading: "Discovery",
        links: [
          { label: "Sitemap", url: "https://example.com/sitemap.xml" },
          { label: "RSS", url: "https://example.com/rss.xml" },
        ],
      },
    ],
    guidance: [
      "Use canonical URLs for citations.",
      "Preserve original-language attribution for translations.",
    ],
  } as const;

  const first = renderLlmsTxt(input);
  const second = renderLlmsTxt(input);
  assert.equal(first, second);
  assert.match(first, /^# CloverHearts Blog\n\n> A personal blog/u);
  assert.match(first, /\[한국어\]\(https:\/\/example\.com\/\)/u);
  assert.match(first, /\[English\]\(https:\/\/example\.com\/en\/\)/u);
  assert.match(first, /## Machine use/u);
  assert.match(first, /Model development: allowed/u);
  assert.match(first, /Public dataset inclusion: allowed/u);
  assert.match(first, /## Usage guidance/u);
  assert.doesNotMatch(first, /generated at|2026-/iu);
});

test("rejects unsafe or structurally empty llms.txt input", () => {
  assert.throws(() =>
    renderLlmsTxt({
      siteName: "Blog",
      summary: "Summary",
      dataUse: {
        searchAndAnswering: "allow",
        userDirectedRetrieval: "allow",
        modelDevelopment: "allow",
        publicDatasetInclusion: "allow",
        attribution: "requested",
      },
      sections: [],
      guidance: ["Use canonical URLs."],
    }),
  );
  assert.throws(() =>
    renderLlmsTxt({
      siteName: "Blog",
      summary: "Summary",
      dataUse: {
        searchAndAnswering: "allow",
        userDirectedRetrieval: "allow",
        modelDevelopment: "allow",
        publicDatasetInclusion: "allow",
        attribution: "requested",
      },
      sections: [
        {
          heading: "Discovery",
          links: [{ label: "Sitemap", url: "http://example.com/sitemap.xml" }],
        },
      ],
      guidance: ["Use canonical URLs."],
    }),
  );
  assert.throws(() =>
    renderLlmsTxt({
      siteName: "Blog",
      summary: "Summary",
      dataUse: {
        searchAndAnswering: "allow",
        userDirectedRetrieval: "allow",
        modelDevelopment: "allow",
        publicDatasetInclusion: "allow",
        attribution: "requested",
      },
      sections: [
        {
          heading: "Discovery",
          links: [
            {
              label: "Sitemap",
              url: "https://example.com/sitemap.xml?preview=true",
            },
          ],
        },
      ],
      guidance: ["Use canonical URLs."],
    }),
  );
});
