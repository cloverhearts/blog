/** Resolve only an exact deployment-root visit; never rewrite a deep link. */
export function rootLanguageTarget(location, languages, homes, defaultLanguage) {
  const root = homes[defaultLanguage];
  if (!root || location.pathname !== root) return null;
  if (new URLSearchParams(location.search).get("lang") === defaultLanguage) return null;

  const language = languages
    .filter((value) => typeof value === "string")
    .map((value) => value.trim().toLowerCase().split("-")[0])
    .find((value) => Object.hasOwn(homes, value));
  if (!language || language === defaultLanguage) return null;
  const target = homes[language];
  // The build supplies validated local routes. Also fail closed on bad runtime data.
  if (!target?.startsWith(root) || target.startsWith("//") || /[\\?#]/u.test(target)) return null;
  const url = new URL(target, "https://local.invalid");
  if (url.pathname !== target || !target.endsWith("/")) return null;
  return `${target}${location.search}${location.hash}`;
}

export function applyRootLanguageSelection(browser, document) {
  const settings = document.querySelector("[data-root-language-selection]");
  if (!settings) return;
  try {
    const homes = JSON.parse(settings.dataset.languageHomes);
    // Do not even inspect browser preferences on a non-root URL (including 404s).
    if (browser.location.pathname !== homes[settings.dataset.defaultLanguage]) return;
    const languages = browser.navigator.languages?.length
      ? browser.navigator.languages
      : [browser.navigator.language];
    const target = rootLanguageTarget(browser.location, languages, homes, settings.dataset.defaultLanguage);
    if (target) browser.location.replace(target);
  } catch {
    // Missing preferences, blocked enhancement, or invalid settings keep static Korean.
  }
}

if (typeof window !== "undefined" && typeof document !== "undefined") {
  applyRootLanguageSelection(window, document);
}
