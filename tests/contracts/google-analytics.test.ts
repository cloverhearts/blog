import assert from "node:assert/strict";
import test from "node:test";

import { createGoogleAnalytics } from "../../apps/blog-web/src/analytics/google-analytics.ts";
import { resolveGa4AnalyticsConfig } from "../../packages/project-config/src/analytics.ts";

interface FakeBrowser {
  readonly appendedScripts: Array<Record<string, unknown>>;
  readonly storage: Map<string, string>;
  restore(): void;
}

function installFakeBrowser(): FakeBrowser {
  const previousWindow = globalThis.window;
  const previousDocument = globalThis.document;
  const storage = new Map<string, string>();
  const appendedScripts: Array<Record<string, unknown>> = [];

  Object.assign(globalThis, {
    window: {
      localStorage: {
        getItem: (key: string) => storage.get(key) ?? null,
        setItem: (key: string, value: string) => storage.set(key, value),
      },
      location: {
        origin: "https://example.com",
        pathname: "/posts/example/",
      },
    },
    document: {
      title: "Example",
      getElementById: (id: string) =>
        appendedScripts.find((script) => script.id === id) ?? null,
      createElement: () => ({}),
      head: {
        append: (script: Record<string, unknown>) => {
          appendedScripts.push(script);
        },
      },
    },
  });

  return {
    appendedScripts,
    storage,
    restore: () => {
      Object.assign(globalThis, {
        window: previousWindow,
        document: previousDocument,
      });
    },
  };
}

test("resolves absent, normalized, and invalid build configuration", () => {
  assert.deepEqual(resolveGa4AnalyticsConfig({}), {
    enabled: false,
    provider: "google-analytics-4",
    measurementId: null,
  });
  assert.deepEqual(
    resolveGa4AnalyticsConfig({ GA4_MEASUREMENT_ID: " g-abc12345 " }),
    {
      enabled: true,
      provider: "google-analytics-4",
      measurementId: "G-ABC12345",
    },
  );
  assert.throws(() =>
    resolveGa4AnalyticsConfig({ GA4_MEASUREMENT_ID: "UA-NOT-GA4" }),
  );
});

test("does not load GA4 without configuration or consent", () => {
  const browser = installFakeBrowser();
  try {
    const disabled = createGoogleAnalytics({ measurementId: null });
    disabled.grantConsent();
    assert.equal(disabled.configured, false);
    assert.equal(browser.appendedScripts.length, 0);

    const pending = createGoogleAnalytics({ measurementId: "G-ABC12345" });
    assert.equal(pending.getConsent(), "unknown");
    assert.equal(browser.appendedScripts.length, 0);
  } finally {
    browser.restore();
  }
});

test("loads once after consent and removes sensitive URL/event values", () => {
  const browser = installFakeBrowser();
  try {
    const analytics = createGoogleAnalytics({ measurementId: "G-ABC12345" });
    analytics.grantConsent();
    analytics.trackPageView("/search/?q=private#fragment");
    analytics.trackEvent("related_post_click", {
      post_id: "safe-post",
      search_term: "private",
    });
    analytics.trackPageView();

    assert.equal(browser.appendedScripts.length, 1);
    const serialized = JSON.stringify(window.dataLayer);
    assert.doesNotMatch(serialized, /private|\?q=/u);
    assert.match(serialized, /safe-post/u);
  } finally {
    browser.restore();
  }
});

test("updates GA4 when consent is revoked and granted again", () => {
  const browser = installFakeBrowser();
  try {
    const analytics = createGoogleAnalytics({ measurementId: "G-ABC12345" });
    analytics.grantConsent();
    analytics.denyConsent();
    analytics.grantConsent();

    assert.equal(browser.appendedScripts.length, 1);
    const consentUpdates = window.dataLayer?.filter(
      (entry) => entry[0] === "consent" && entry[1] === "update",
    );
    assert.equal(consentUpdates?.length, 2);
    assert.equal(
      (consentUpdates?.[1]?.[2] as { analytics_storage?: string })
        .analytics_storage,
      "granted",
    );
  } finally {
    browser.restore();
  }
});

test("rejects an invalid configured Measurement ID", () => {
  const browser = installFakeBrowser();
  try {
    assert.throws(() =>
      createGoogleAnalytics({ measurementId: "UA-NOT-GA4" }),
    );
  } finally {
    browser.restore();
  }
});
