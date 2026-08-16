import { ZodError } from "zod";

export class ContractValidationError extends Error {
  readonly issues: readonly string[];

  constructor(context: string, issues: readonly string[]) {
    super(`${context}:\n${issues.map((issue) => `- ${issue}`).join("\n")}`);
    this.name = "ContractValidationError";
    this.issues = issues;
  }
}

export function formatZodIssues(error: ZodError): readonly string[] {
  return error.issues.map((issue) => {
    const path = issue.path.length > 0 ? issue.path.join(".") : "(root)";
    return `${path}: ${issue.message}`;
  });
}

export function parseWithContract<T>(
  context: string,
  schema: { parse: (value: unknown) => T },
  value: unknown,
): T {
  try {
    return schema.parse(value);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new ContractValidationError(context, formatZodIssues(error));
    }
    throw error;
  }
}
