import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

export function sha256Hex(value: string | Uint8Array): string {
  return createHash("sha256").update(value).digest("hex");
}

export function sha256File(path: string): string {
  return sha256Hex(readFileSync(path));
}

export function stableSerialize(value: unknown): string {
  return JSON.stringify(sortValue(value));
}

export function sha256Json(value: unknown): string {
  return sha256Hex(stableSerialize(value));
}

function sortValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sortValue);
  }
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    return Object.fromEntries(
      Object.keys(record)
        .sort((left, right) => left.localeCompare(right, "en"))
        .map((key) => [key, sortValue(record[key])]),
    );
  }
  return value;
}
