/**
 * Progressive enhancement for the static search page.
 * Queries stay in the browser and never reach a server or analytics.
 */

/**
 * @param {string} value
 * @returns {string}
 */
export function normalizeQuery(value) {
  return value.trim();
}

/**
 * @param {string} value
 * @returns {boolean}
 */
export function shouldRunSearch(value) {
  return normalizeQuery(value).length > 0;
}

/**
 * @param {string} basePath
 * @param {"en" | "ko" | "ja"} language
 * @returns {string}
 */
export function searchIndexBasePath(basePath, language) {
  const prefix = basePath.replace(/\/$/u, "");
  return `${prefix}/_assets/search/${language}/`;
}

/**
 * @param {string} template
 * @param {number} count
 * @returns {string}
 */
export function formatResultCount(template, count) {
  return template.replaceAll("{n}", String(count));
}

/**
 * @param {string} basePath
 * @param {string} url
 * @returns {string}
 */
export function publicResultUrl(basePath, url) {
  if (url.startsWith("https://") || url.startsWith("http://")) {
    return url;
  }
  const path = url.startsWith("/") ? url : `/${url}`;
  return `${basePath.replace(/\/$/u, "")}${path}`;
}

/**
 * @param {string} value
 * @returns {string}
 */
export function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

/**
 * @param {readonly { url?: string, meta?: { title?: string }, excerpt?: string }[]} results
 * @param {string} basePath
 * @returns {string}
 */
export function renderSearchResultItems(results, basePath) {
  return results
    .map((result) => {
      const href = publicResultUrl(basePath, result.url ?? "/");
      const title = result.meta?.title || href;
      const excerpt = result.excerpt ?? "";
      return `<li><a href="${escapeHtml(href)}">${escapeHtml(title)}</a>${excerpt ? `<p>${excerpt}</p>` : ""}</li>`;
    })
    .join("");
}

/**
 * @typedef {object} PagefindApi
 * @property {(options: { basePath: string }) => Promise<void>=} options
 * @property {(query: string) => Promise<{ results?: Array<{ data: () => Promise<object> }> }>} search
 */

/**
 * @param {string} indexBase
 * @returns {Promise<PagefindApi>}
 */
export async function loadPagefind(indexBase) {
  const module = /** @type {PagefindApi} */ (await import(`${indexBase}pagefind.js`));
  if (typeof module.options === "function") {
    await module.options({ basePath: indexBase });
  }
  return module;
}

/**
 * @param {PagefindApi} pagefind
 * @param {string} query
 */
export async function searchPagefindIndex(pagefind, query) {
  const normalized = normalizeQuery(query);
  if (!normalized) {
    return [];
  }
  const response = await pagefind.search(normalized);
  const records = response.results ?? [];
  return Promise.all(records.map((record) => record.data()));
}

/**
 * @param {ParentNode} root
 */
export function bindSiteSearch(root) {
  const form = root.querySelector("[data-site-search] form");
  const input = root.querySelector("#site-search-query");
  const status = root.querySelector("[data-search-status]");
  const list = root.querySelector("[data-search-results]");
  const empty = root.querySelector("[data-search-empty]");
  const region = root.querySelector("[data-site-search]");
  if (!(form instanceof HTMLFormElement) || !(input instanceof HTMLInputElement) || !region) {
    return;
  }

  const indexBase = region.getAttribute("data-search-index") ?? "";
  const basePath = region.getAttribute("data-search-base") ?? "";
  const countTemplate = region.getAttribute("data-search-count") ?? "{n}";
  /** @type {PagefindApi | undefined} */
  let pagefind;

  const render = (/** @type {Awaited<ReturnType<typeof searchPagefindIndex>>} */ results) => {
    if (list) {
      list.innerHTML = renderSearchResultItems(results, basePath);
    }
    if (status) {
      status.textContent = results.length > 0 ? formatResultCount(countTemplate, results.length) : "";
    }
    if (empty instanceof HTMLElement) {
      empty.hidden = results.length > 0;
    }
  };

  const run = async () => {
    if (!shouldRunSearch(input.value)) {
      render([]);
      if (empty instanceof HTMLElement) empty.hidden = true;
      if (status) status.textContent = "";
      return;
    }
    pagefind ??= await loadPagefind(indexBase);
    const results = await searchPagefindIndex(pagefind, input.value);
    render(results);
  };

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const next = new URL(window.location.href);
    if (shouldRunSearch(input.value)) {
      next.searchParams.set("q", normalizeQuery(input.value));
    } else {
      next.searchParams.delete("q");
    }
    window.history.replaceState({}, "", next);
    void run();
  });

  const initial = new URL(window.location.href).searchParams.get("q") ?? "";
  if (shouldRunSearch(initial)) {
    input.value = initial;
    void run();
  }
}

if (typeof document !== "undefined" && document.querySelector("[data-site-search]")) {
  bindSiteSearch(document);
}
