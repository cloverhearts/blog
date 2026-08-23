const root = document;
const dialog = root.querySelector("[data-image-viewer]");
const preview = dialog?.querySelector("[data-image-viewer-image]");
const caption = dialog?.querySelector("[data-image-viewer-caption]");
const close = dialog?.querySelector("[data-image-viewer-close]");

if (dialog instanceof HTMLDialogElement && preview instanceof HTMLImageElement) {
  const triggers = [...root.querySelectorAll("[data-article-body] img")]
    .filter((image) => image instanceof HTMLImageElement && !image.closest("a"));
  let activeTrigger = null;
  const openLabel = dialog.getAttribute("data-open-label") ?? "Open enlarged image";

  const open = (image) => {
    activeTrigger = image;
    preview.src = image.currentSrc || image.src;
    preview.alt = image.alt;
    if (caption instanceof HTMLElement) {
      caption.textContent = image.alt;
      caption.hidden = image.alt.length === 0;
    }
    dialog.showModal();
  };

  for (const image of triggers) {
    image.setAttribute("role", "button");
    image.tabIndex = 0;
    image.setAttribute("aria-haspopup", "dialog");
    image.setAttribute("aria-label", image.alt ? `${openLabel}: ${image.alt}` : openLabel);
    image.addEventListener("click", () => open(image));
    image.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      open(image);
    });
  }

  close?.addEventListener("click", () => dialog.close());
  dialog.addEventListener("close", () => {
    preview.removeAttribute("src");
    activeTrigger?.focus();
    activeTrigger = null;
  });
}
