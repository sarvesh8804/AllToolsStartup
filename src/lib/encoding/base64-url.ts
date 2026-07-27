import {
  decodeBase64,
  decodeBase64Url,
  encodeBase64,
  encodeBase64Url,
} from "./base64";

export type Base64UrlMode = "encode" | "decode" | "to-url" | "to-standard";

export type Base64UrlResult =
  | { ok: true; output: string }
  | { ok: false; error: string };

/** Encode text as URL-safe Base64 (no padding). */
export function base64UrlEncode(input: string): Base64UrlResult {
  try {
    return { ok: true, output: encodeBase64Url(input) };
  } catch {
    return { ok: false, error: "Unable to encode input." };
  }
}

/** Decode URL-safe Base64 to UTF-8 text. */
export function base64UrlDecode(input: string): Base64UrlResult {
  const trimmed = input.trim();
  if (!trimmed) {
    return { ok: false, error: "Paste URL-safe Base64 to decode." };
  }
  try {
    return { ok: true, output: decodeBase64Url(trimmed) };
  } catch {
    return { ok: false, error: "That input is not valid URL-safe Base64." };
  }
}

/** Convert standard Base64 to URL-safe (optional padding strip). */
export function standardToUrlSafe(
  input: string,
  stripPadding = true,
): Base64UrlResult {
  const trimmed = input.trim().replace(/\s+/g, "");
  if (!trimmed) {
    return { ok: false, error: "Paste standard Base64 to convert." };
  }
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(trimmed)) {
    return { ok: false, error: "Input is not standard Base64 (+/ alphabet)." };
  }
  try {
    // Validate by decoding
    decodeBase64(trimmed);
  } catch {
    return { ok: false, error: "Invalid standard Base64." };
  }
  let out = trimmed.replace(/\+/g, "-").replace(/\//g, "_");
  if (stripPadding) out = out.replace(/=+$/, "");
  return { ok: true, output: out };
}

/** Convert URL-safe Base64 to standard (+/ with padding). */
export function urlSafeToStandard(input: string): Base64UrlResult {
  const trimmed = input.trim().replace(/\s+/g, "");
  if (!trimmed) {
    return { ok: false, error: "Paste URL-safe Base64 to convert." };
  }
  if (!/^[A-Za-z0-9\-_]*={0,2}$/.test(trimmed)) {
    return {
      ok: false,
      error: "Input is not URL-safe Base64 (-_ alphabet).",
    };
  }
  try {
    decodeBase64Url(trimmed);
  } catch {
    return { ok: false, error: "Invalid URL-safe Base64." };
  }
  const padded = trimmed
    .replace(/-/g, "+")
    .replace(/_/g, "/")
    .padEnd(Math.ceil(trimmed.length / 4) * 4, "=");
  return { ok: true, output: padded };
}

export function runBase64Url(
  mode: Base64UrlMode,
  input: string,
): Base64UrlResult {
  switch (mode) {
    case "encode":
      return base64UrlEncode(input);
    case "decode":
      return base64UrlDecode(input);
    case "to-url":
      return standardToUrlSafe(input);
    case "to-standard":
      return urlSafeToStandard(input);
  }
}

/** Convenience: standard encode (with padding) for comparison display. */
export function standardEncode(input: string): string {
  return encodeBase64(input);
}
