export function titleCase(s: string): string {
  return s.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function formatDetailValue(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (value == null) return "";
  if (Array.isArray(value)) {
    return value.map((v) => formatDetailValue(v)).filter(Boolean).join(", ");
  }
  if (typeof value === "object") {
    return Object.values(value as Record<string, unknown>)
      .map((v) => formatDetailValue(v))
      .filter(Boolean)
      .join(", ");
  }
  return String(value);
}
