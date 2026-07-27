import { uuidV4 } from "./uuid";

export type UuidBulkSeparator = "newline" | "comma" | "space" | "json";

export type UuidBulkOptions = {
  /** How many UUIDs to generate (1–10_000). */
  count: number;
  uppercase: boolean;
  /** Keep standard 8-4-4-4-12 hyphens (default true). */
  hyphens: boolean;
  /** Wrap each UUID in curly braces. */
  braces: boolean;
  /** Prefix with urn:uuid: */
  urn: boolean;
  separator: UuidBulkSeparator;
};

export const DEFAULT_UUID_BULK_OPTIONS: UuidBulkOptions = {
  count: 25,
  uppercase: false,
  hyphens: true,
  braces: false,
  urn: false,
  separator: "newline",
};

export const UUID_BULK_MAX = 10_000;

export function formatUuidV4(
  id: string,
  options: Pick<UuidBulkOptions, "uppercase" | "hyphens" | "braces" | "urn">,
): string {
  let out = id.trim();
  if (!options.hyphens) out = out.replace(/-/g, "");
  if (options.uppercase) out = out.toUpperCase();
  else out = out.toLowerCase();
  if (options.urn) {
    out = `urn:uuid:${out}`;
  } else if (options.braces) {
    out = `{${out}}`;
  }
  return out;
}

export function joinUuids(
  ids: string[],
  separator: UuidBulkSeparator,
): string {
  if (separator === "json") {
    return `${JSON.stringify(ids, null, 2)}\n`;
  }
  if (separator === "comma") return ids.join(", ") + (ids.length ? "\n" : "");
  if (separator === "space") return ids.join(" ") + (ids.length ? "\n" : "");
  return ids.join("\n") + (ids.length ? "\n" : "");
}

export type UuidBulkResult = {
  ids: string[];
  text: string;
  count: number;
};

/** Generate a bulk list of RFC 4122 v4 UUIDs with formatting options. */
export function generateUuidBulk(options: UuidBulkOptions): UuidBulkResult {
  const count = Math.max(
    1,
    Math.min(UUID_BULK_MAX, Math.floor(options.count) || 1),
  );
  const raw = Array.from({ length: count }, () => uuidV4());
  const ids = raw.map((id) =>
    formatUuidV4(id, {
      uppercase: options.uppercase,
      hyphens: options.hyphens,
      braces: options.braces,
      urn: options.urn,
    }),
  );
  return { ids, text: joinUuids(ids, options.separator), count: ids.length };
}
