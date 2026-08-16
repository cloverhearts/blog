import { ZodError } from "zod";

export class ConfigurationError extends Error {
  readonly issues: readonly string[];

  constructor(issues: readonly string[]) {
    super(`Configuration validation failed:\n${issues.map((issue) => `- ${issue}`).join("\n")}`);
    this.name = "ConfigurationError";
    this.issues = issues;
  }
}

export function issue(path: string, message: string): string {
  return `${path}: ${message}`;
}

export function issuesFromZod(prefix: string, error: ZodError): readonly string[] {
  return error.issues.map((entry) => {
    const path = entry.path.length > 0 ? `${prefix}.${entry.path.join(".")}` : prefix;
    return `${path}: ${entry.message}`;
  });
}

export function throwIfIssues(issues: readonly string[]): void {
  if (issues.length > 0) {
    throw new ConfigurationError(issues);
  }
}
