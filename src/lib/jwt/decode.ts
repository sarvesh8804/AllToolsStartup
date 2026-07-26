import { decodeBase64Url } from "@/lib/encoding/base64";

export type JwtParts = {
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
  signature: string;
};

export type JwtDecodeResult =
  | { ok: true; value: JwtParts }
  | { ok: false; error: string };

function parseJsonSegment(segment: string, label: string): Record<string, unknown> {
  const json = decodeBase64Url(segment);
  const parsed = JSON.parse(json);
  if (typeof parsed !== "object" || parsed === null) {
    throw new Error(`${label} is not a JSON object`);
  }
  return parsed as Record<string, unknown>;
}

/** Decode (does NOT verify) a JWT into header/payload/signature. */
export function decodeJwt(token: string): JwtDecodeResult {
  const trimmed = token.trim();
  if (!trimmed) {
    return { ok: false, error: "Paste a JWT to decode." };
  }

  const parts = trimmed.split(".");
  if (parts.length !== 3) {
    return {
      ok: false,
      error: "A JWT must have three dot-separated segments.",
    };
  }

  try {
    const header = parseJsonSegment(parts[0], "Header");
    const payload = parseJsonSegment(parts[1], "Payload");
    return {
      ok: true,
      value: { header, payload, signature: parts[2] },
    };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Invalid JWT",
    };
  }
}

/** Convert a numeric epoch (seconds) claim to an ISO string, if present. */
export function claimToDate(value: unknown): string | null {
  if (typeof value !== "number") return null;
  const ms = value * 1000;
  if (!Number.isFinite(ms)) return null;
  return new Date(ms).toISOString();
}
