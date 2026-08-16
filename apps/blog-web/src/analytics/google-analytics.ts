export type AnalyticsConsent = "unknown" | "denied" | "granted";
export type AnalyticsEventValue = string | number | boolean;
export type AnalyticsEventParameters = Readonly<
  Record<string, AnalyticsEventValue | undefined>
>;

export interface GoogleAnalyticsOptions {
  readonly measurementId: string | null;
  readonly consentStorageKey?: string;
}

export interface BlogAnalytics {
  readonly configured: boolean;
  getConsent(): AnalyticsConsent;
  grantConsent(): void;
  denyConsent(): void;
  trackPageView(pathname?: string): void;
  trackEvent(name: string, parameters?: AnalyticsEventParameters): void;
}

type Gtag = (...command: unknown[]) => void;

declare global {
  interface Window {
    dataLayer?: unknown[][];
    gtag?: Gtag;
  }
}

const DEFAULT_STORAGE_KEY = "blog.analytics-consent.v1";
const SCRIPT_ELEMENT_ID = "blog-ga4-script";
const MEASUREMENT_ID_PATTERN = /^G-[A-Z0-9]{4,20}$/u;
const EVENT_NAME_PATTERN = /^[a-z][a-z0-9_]{0,39}$/u;
const BLOCKED_EVENT_PARAMETER_NAMES = new Set([
  "email",
  "page_location",
  "search_term",
  "user_id",
]);

const deniedConsent = {
  ad_personalization: "denied",
  ad_storage: "denied",
  ad_user_data: "denied",
  analytics_storage: "denied",
} as const;

const grantedAnalyticsConsent = {
  ...deniedConsent,
  analytics_storage: "granted",
} as const;

function hasBrowserEnvironment(): boolean {
  return typeof window !== "undefined" && typeof document !== "undefined";
}

function readConsent(storageKey: string): AnalyticsConsent {
  if (!hasBrowserEnvironment()) {
    return "unknown";
  }
  try {
    const value = window.localStorage.getItem(storageKey);
    return value === "granted" || value === "denied" ? value : "unknown";
  } catch {
    return "unknown";
  }
}

function writeConsent(
  storageKey: string,
  consent: Exclude<AnalyticsConsent, "unknown">,
): void {
  if (!hasBrowserEnvironment()) {
    return;
  }
  try {
    window.localStorage.setItem(storageKey, consent);
  } catch {
    // Storage can be unavailable. The in-memory choice still applies to this page.
  }
}

function installGtag(): Gtag {
  window.dataLayer ??= [];
  window.gtag ??= (...command: unknown[]) => {
    window.dataLayer?.push(command);
  };
  return window.gtag;
}

function safePathname(pathname: string): string {
  return new URL(pathname, window.location.origin).pathname;
}

function safePageLocation(pathname: string): string {
  return new URL(safePathname(pathname), window.location.origin).toString();
}

function safeEventParameters(
  parameters: AnalyticsEventParameters,
): Record<string, AnalyticsEventValue> {
  return Object.fromEntries(
    Object.entries(parameters).flatMap(([name, value]) => {
      if (
        value === undefined ||
        BLOCKED_EVENT_PARAMETER_NAMES.has(name) ||
        !EVENT_NAME_PATTERN.test(name)
      ) {
        return [];
      }

      const safeValue = typeof value === "string" ? value.slice(0, 100) : value;
      return [[name, safeValue]];
    }),
  );
}

/**
 * Creates the blog's GA4 adapter without making a network request.
 *
 * The Google script is appended only after stored or explicit consent is
 * granted. Query strings and fragments are excluded from page-view events.
 */
export function createGoogleAnalytics(
  options: GoogleAnalyticsOptions,
): BlogAnalytics {
  const measurementId = options.measurementId?.trim().toUpperCase() ?? "";
  const configured = measurementId.length > 0;

  if (configured && !MEASUREMENT_ID_PATTERN.test(measurementId)) {
    throw new Error("Invalid GA4 Measurement ID.");
  }

  const storageKey = options.consentStorageKey ?? DEFAULT_STORAGE_KEY;
  let consent: AnalyticsConsent = configured ? readConsent(storageKey) : "denied";
  let initialized = false;

  const initialize = (): void => {
    if (
      !hasBrowserEnvironment() ||
      !configured ||
      consent !== "granted" ||
      initialized
    ) {
      return;
    }

    const gtag = installGtag();
    gtag("consent", "default", grantedAnalyticsConsent);
    gtag("js", new Date());
    gtag("config", measurementId, {
      allow_ad_personalization_signals: false,
      allow_google_signals: false,
      send_page_view: false,
    });

    if (!document.getElementById(SCRIPT_ELEMENT_ID)) {
      const script = document.createElement("script");
      script.id = SCRIPT_ELEMENT_ID;
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
      document.head.append(script);
    }

    initialized = true;
  };

  const trackPageView = (pathname?: string): void => {
    initialize();
    if (!initialized || consent !== "granted") {
      return;
    }

    const pagePath = safePathname(pathname ?? window.location.pathname);

    window.gtag?.("event", "page_view", {
      page_location: safePageLocation(pagePath),
      page_path: pagePath,
      page_title: document.title,
    });
  };

  const client: BlogAnalytics = {
    configured,
    getConsent: () => consent,
    grantConsent: () => {
      if (!configured) {
        return;
      }
      consent = "granted";
      writeConsent(storageKey, consent);
      if (initialized) {
        window.gtag?.("consent", "update", grantedAnalyticsConsent);
      } else {
        initialize();
      }
      trackPageView();
    },
    denyConsent: () => {
      consent = "denied";
      writeConsent(storageKey, consent);
      if (hasBrowserEnvironment()) {
        window.gtag?.("consent", "update", deniedConsent);
      }
    },
    trackPageView,
    trackEvent: (name, parameters = {}) => {
      if (!EVENT_NAME_PATTERN.test(name)) {
        throw new Error(`Invalid analytics event name: ${name}`);
      }
      initialize();
      if (!initialized || consent !== "granted") {
        return;
      }
      window.gtag?.("event", name, safeEventParameters(parameters));
    },
  };

  if (consent === "granted") {
    initialize();
    trackPageView();
  }

  return client;
}
