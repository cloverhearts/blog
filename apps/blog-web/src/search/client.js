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
      return `<li><a class="search-result" href="${escapeHtml(href)}"><span class="search-result__icon" aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false"><path d="M6.75 3.75h7.5l3 3v13.5H6.75z"/><path d="M14.25 3.75v3h3M9.5 11h5M9.5 14.5h5"/></svg></span><span class="search-result__copy"><strong>${escapeHtml(title)}</strong>${excerpt ? `<span class="search-result__excerpt">${excerpt}</span>` : ""}</span><span class="search-result__arrow" aria-hidden="true">→</span></a></li>`;
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

/**
 * @param {ParentNode} root
 */
export function bindSearchDialog(root) {
  const dialog = root.querySelector("[data-search-dialog]");
  const triggers = [...root.querySelectorAll("[data-search-trigger]")];
  if (!(dialog instanceof HTMLDialogElement) || triggers.length === 0) {
    return;
  }

  const form = dialog.querySelector("[data-search-dialog-form]");
  const input = dialog.querySelector("#dialog-search-query");
  const status = dialog.querySelector("[data-search-status]");
  const list = dialog.querySelector("[data-search-results]");
  const empty = dialog.querySelector("[data-search-empty]");
  const hint = dialog.querySelector("[data-search-hint]");
  const close = dialog.querySelector("[data-search-close]");
  const indexBase = dialog.getAttribute("data-search-index") ?? "";
  const basePath = dialog.getAttribute("data-search-base") ?? "";
  const countTemplate = dialog.getAttribute("data-search-count") ?? "{n}";
  /** @type {PagefindApi | undefined} */
  let pagefind;
  /** @type {HTMLElement | null} */
  let lastTrigger = null;

  const render = (/** @type {Awaited<ReturnType<typeof searchPagefindIndex>>} */ results) => {
    if (list) list.innerHTML = renderSearchResultItems(results, basePath);
    if (status) {
      status.textContent = results.length > 0 ? formatResultCount(countTemplate, results.length) : "";
    }
    if (empty instanceof HTMLElement) {
      empty.hidden = results.length > 0;
    }
  };

  const run = async () => {
    if (!(input instanceof HTMLInputElement) || !shouldRunSearch(input.value)) {
      render([]);
      if (hint instanceof HTMLElement) hint.hidden = false;
      if (empty instanceof HTMLElement) empty.hidden = true;
      if (status) status.textContent = "";
      return;
    }
    if (hint instanceof HTMLElement) hint.hidden = true;
    pagefind ??= await loadPagefind(indexBase);
    render(await searchPagefindIndex(pagefind, input.value));
  };

  const open = (/** @type {HTMLElement} */ trigger) => {
    lastTrigger = trigger;
    dialog.showModal();
    if (input instanceof HTMLInputElement) input.focus();
  };

  const restore = () => {
    lastTrigger?.focus();
    lastTrigger = null;
  };

  for (const trigger of triggers) {
    if (!(trigger instanceof HTMLAnchorElement)) continue;
    trigger.addEventListener("click", (event) => {
      event.preventDefault();
      open(trigger);
    });
  }

  if (form instanceof HTMLFormElement) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      void run();
    });
  }
  close?.addEventListener("click", () => dialog.close());
  dialog.addEventListener("close", restore);
  dialog.addEventListener("cancel", restore);
}

if (typeof document !== "undefined") {
  if (document.querySelector("[data-site-search]")) {
    bindSiteSearch(document);
  }
  bindSearchDialog(document);
}
