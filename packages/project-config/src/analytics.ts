import { z } from "zod";

// Public project identifier, never a URL, script snippet or secret.
export const CLARITY_PROJECT_ID_PATTERN = /^[a-z0-9]{1,32}$/u;
export const resolvedAnalyticsSchema = z.object({
  enabled: z.boolean(),
  provider: z.literal("microsoft-clarity"),
  projectId: z.string().regex(CLARITY_PROJECT_ID_PATTERN).nullable(),
}).strict();
export type ResolvedAnalyticsConfig = z.infer<typeof resolvedAnalyticsSchema>;

export function resolveClarityAnalyticsConfig(
  environment: Readonly<Record<string, string | undefined>>,
  environmentVariable = "CLARITY_PROJECT_ID",
): ResolvedAnalyticsConfig {
  const projectId = environment[environmentVariable]?.trim() ?? "";
  if (projectId && !CLARITY_PROJECT_ID_PATTERN.test(projectId)) {
    throw new Error(`${environmentVariable} must contain only 1–32 lowercase letters or digits, not a URL or tracking snippet.`);
  }
  return resolvedAnalyticsSchema.parse({
    enabled: projectId.length > 0, provider: "microsoft-clarity", projectId: projectId || null,
  });
}
