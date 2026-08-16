export interface PerformanceBudgets {
  readonly sourceRepositoryMiB: number;
  readonly publishedSiteMiB: number;
  readonly deploymentMinutes: number;
  readonly routeCount: number;
  readonly largestPublishedFileMiB: number;
  readonly monthlyBandwidthWarningGiB: number;
  readonly monthlyActionsMinutesWarning: number;
  readonly actionsArtifactStorageMiB: number;
  readonly page: {
    readonly htmlKiB: number;
    readonly stylesheetGzipKiB: number;
    readonly initialScriptGzipKiB: number;
    readonly searchScriptGzipKiB: number;
    readonly initialFontKiB: number;
    readonly initialTransferKiB: number;
  };
  readonly images: {
    readonly sourceFileMiB: number;
    readonly sourceMegapixels: number;
    readonly renderedFileKiB: number;
  };
  readonly fonts: {
    readonly publishedAssetsMiB: number;
  };
}

export const GITHUB_PAGES_PRO_LIMITS = {
  publishedSiteMiB: 1024,
  deploymentMinutes: 10,
  softBandwidthGiBPerMonth: 100,
  actionsMinutesPerMonth: 3000,
  actionsStorageMiB: 1024,
} as const;

function requirePositiveInteger(value: number, field: string): void {
  if (!Number.isSafeInteger(value) || value <= 0) {
    throw new Error(`${field} must be a positive integer.`);
  }
}

/** Validate enforceable budgets against the GitHub Pages hosting boundary. */
export function validatePerformanceBudgets(
  budgets: PerformanceBudgets,
): Readonly<PerformanceBudgets> {
  const scalarEntries: Array<readonly [string, number]> = [
    ["sourceRepositoryMiB", budgets.sourceRepositoryMiB],
    ["publishedSiteMiB", budgets.publishedSiteMiB],
    ["deploymentMinutes", budgets.deploymentMinutes],
    ["routeCount", budgets.routeCount],
    ["largestPublishedFileMiB", budgets.largestPublishedFileMiB],
    ["monthlyBandwidthWarningGiB", budgets.monthlyBandwidthWarningGiB],
    ["monthlyActionsMinutesWarning", budgets.monthlyActionsMinutesWarning],
    ["actionsArtifactStorageMiB", budgets.actionsArtifactStorageMiB],
    ...Object.entries(budgets.page).map(
      ([name, value]) => [`page.${name}`, value] as const,
    ),
    ...Object.entries(budgets.images).map(([name, value]) => [
      `images.${name}`,
      value,
    ] as const),
    ...Object.entries(budgets.fonts).map(([name, value]) => [
      `fonts.${name}`,
      value,
    ] as const),
  ];

  for (const [field, value] of scalarEntries) {
    requirePositiveInteger(value, field);
  }

  if (budgets.publishedSiteMiB > GITHUB_PAGES_PRO_LIMITS.publishedSiteMiB) {
    throw new Error("publishedSiteMiB exceeds the GitHub Pages site limit.");
  }
  if (budgets.sourceRepositoryMiB > GITHUB_PAGES_PRO_LIMITS.publishedSiteMiB) {
    throw new Error("sourceRepositoryMiB exceeds the Pages repository recommendation.");
  }
  if (budgets.deploymentMinutes >= GITHUB_PAGES_PRO_LIMITS.deploymentMinutes) {
    throw new Error("deploymentMinutes must leave headroom below the Pages timeout.");
  }
  if (
    budgets.monthlyBandwidthWarningGiB >=
    GITHUB_PAGES_PRO_LIMITS.softBandwidthGiBPerMonth
  ) {
    throw new Error("The bandwidth warning must occur below the Pages soft limit.");
  }
  if (
    budgets.monthlyActionsMinutesWarning >=
    GITHUB_PAGES_PRO_LIMITS.actionsMinutesPerMonth
  ) {
    throw new Error("The Actions warning must occur below the GitHub Pro allowance.");
  }
  if (
    budgets.actionsArtifactStorageMiB >
    GITHUB_PAGES_PRO_LIMITS.actionsStorageMiB
  ) {
    throw new Error("The Actions artifact budget exceeds GitHub Pro storage.");
  }
  if (budgets.largestPublishedFileMiB > budgets.publishedSiteMiB) {
    throw new Error("A published file cannot exceed the whole release budget.");
  }
  if (budgets.page.initialScriptGzipKiB > budgets.page.searchScriptGzipKiB) {
    throw new Error("The search-only script allowance cannot be smaller than the baseline.");
  }
  if (budgets.page.htmlKiB > budgets.page.initialTransferKiB) {
    throw new Error("HTML cannot exceed the complete initial-transfer budget.");
  }

  return Object.freeze(budgets);
}
