/** UTF-8 safe Base64 encode/decode that works in the browser and Node. */

function toBinary(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return binary;
}

export function encodeBase64(input: string): string {
  const bytes = new TextEncoder().encode(input);
  return btoa(toBinary(bytes));
}

export function decodeBase64(input: string): string {
  const normalized = input.trim();
  const binary = atob(normalized);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

/** URL-safe Base64 (RFC 4648 §5): +/ -> -_ and strip padding. */
export function encodeBase64Url(input: string): string {
  return encodeBase64(input)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export function decodeBase64Url(input: string): string {
  const padded = input
    .replace(/-/g, "+")
    .replace(/_/g, "/")
    .padEnd(Math.ceil(input.length / 4) * 4, "=");
  return decodeBase64(padded);
}
