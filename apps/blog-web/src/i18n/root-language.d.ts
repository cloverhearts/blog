export function rootLanguageTarget(
  location: Pick<Location, "pathname" | "search" | "hash">,
  languages: readonly unknown[],
  homes: Readonly<Record<string, string>>,
  defaultLanguage: string,
): string | null;
export function applyRootLanguageSelection(
  browser: Pick<Window, "location" | "navigator">,
  document: Pick<Document, "querySelector">,
): void;
