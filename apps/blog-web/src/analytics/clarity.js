const STORAGE_KEY = "blog.clarity-consent.v1";

// The SDK reads URL metadata itself; skip query/hash entries, rather than
// claiming that custom page-view events can sanitize provider-owned capture.
export function createClarity({ projectId, storageKey = STORAGE_KEY }, browser = window) {
  if (projectId && !/^[a-z0-9]{1,32}$/.test(projectId)) throw new Error("Invalid Clarity project ID");
  const doc = browser.document;
  let consent = "unknown";
  try { consent = browser.localStorage.getItem(storageKey) || "unknown"; } catch { /* In-memory consent still works. */ }
  if (!["granted", "denied"].includes(consent)) consent = "unknown";
  let started = false;
  const safeEntry = () => {
    try {
      const current = new URL(browser.location.href);
      const referrer = doc.referrer ? new URL(doc.referrer) : null;
      return !current.search && !current.hash && !referrer?.search && !referrer?.hash;
    } catch { return false; }
  };
  const save = (value) => {
    consent = value;
    try { browser.localStorage.setItem(storageKey, value); } catch { /* No persistent storage available. */ }
  };
  const start = () => {
    if (!projectId || consent === "denied" || started || !safeEntry()) return;
    doc.body.setAttribute("data-clarity-mask", "true");
    doc.querySelectorAll("[data-clarity-unmask]").forEach((element) => element.removeAttribute("data-clarity-unmask"));
    browser.clarity ??= function (...args) { (browser.clarity.q ??= []).push(args); };
    // Queue before fetching the SDK. Old permission never enables cookies.
    browser.clarity("consentv2", { analytics_Storage: "denied", ad_Storage: "denied" });
    const script = doc.createElement("script");
    script.id = "blog-clarity-script";
    script.async = true;
    script.referrerPolicy = "no-referrer";
    script.src = `https://www.clarity.ms/tag/${projectId}`;
    doc.head.append(script);
    started = true;
  };
  const client = {
    getConsent: () => consent,
    denyConsent() {
      save("denied");
      if (started) {
        started = false;
        browser.clarity?.("consentv2", { analytics_Storage: "denied", ad_Storage: "denied" });
        // Denial alone permits cookieless telemetry: unload the SDK as well.
        browser.location.reload();
      }
    },
  };
  start();
  return client;
}

if (typeof document !== "undefined") {
  const controls = document.querySelector("[data-clarity-project]");
  if (controls) {
    const client = createClarity({ projectId: controls.dataset.clarityProject, storageKey: controls.dataset.consentKey });
    const deny = controls.querySelector("[data-analytics-deny]");
    const update = () => {
      deny.setAttribute("aria-pressed", String(client.getConsent() === "denied"));
      deny.disabled = client.getConsent() === "denied";
    };
    deny.addEventListener("click", () => { client.denyConsent(); update(); });
    window.addEventListener("storage", (event) => {
      if ((event.key === null || event.key === controls.dataset.consentKey) && event.newValue !== "granted") client.denyConsent();
    });
    update();
  }
}
