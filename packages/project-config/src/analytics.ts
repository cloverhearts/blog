/**
 * Build-time GA4 configuration resolution.
 *
 * `GA4_MEASUREMENT_ID` is a public build value, not a secret. An absent value
 * disables analytics completely. Runtime YAML schema validation will own the
 * surrounding source object after the project's schema library is selected.
 */

export const GA4_MEASUREMENT_ID_PATTERN = /^G-[A-Z0-9]{4,20}$/u;

export interface ResolvedAnalyticsConfig {
  readonly enabled: boolean;
  readonly provider: "google-analytics-4";
  readonly measurementId: string | null;
}

export function resolveGa4AnalyticsConfig(
  environment: Readonly<Record<string, string | undefined>>,
  environmentVariable = "GA4_MEASUREMENT_ID",
): ResolvedAnalyticsConfig {
  const rawValue = environment[environmentVariable];
  const measurementId = rawValue?.trim().toUpperCase() ?? "";

  if (measurementId.length === 0) {
    return {
      enabled: false,
      provider: "google-analytics-4",
      measurementId: null,
    };
  }

  if (!GA4_MEASUREMENT_ID_PATTERN.test(measurementId)) {
    throw new Error(
      `${environmentVariable} must be a GA4 Measurement ID such as G-XXXXXXXXXX.`,
    );
  }

  return {
    enabled: true,
    provider: "google-analytics-4",
    measurementId,
  };
}
