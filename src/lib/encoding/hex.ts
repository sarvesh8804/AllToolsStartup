export type HexMode = "encode" | "decode";

export type HexSeparator = "space" | "none";

export type HexOptions = {
  separator?: HexSeparator;
  uppercase?: boolean;
};

export const SAMPLE_HEX_TEXT = "Forge";
export const SAMPLE_HEX_ENCODED = "466f726765";

function formatByte(byte: number, options: HexOptions): string {
  const hex = byte.toString(16).padStart(2, "0");
  return options.uppercase ? hex.toUpperCase() : hex;
}

/** Encode UTF-8 text as hexadecimal bytes. */
export function encodeHex(
  input: string,
  options: HexOptions = {},
): { ok: true; hex: string } | { ok: false; error: string } {
  if (!input) {
    return { ok: false, error: "Enter text to encode as hexadecimal." };
  }

  const separator = options.separator ?? "none";
  const bytes = [...new TextEncoder().encode(input)];
  const chunks = bytes.map((byte) => formatByte(byte, options));
  const hex = separator === "space" ? chunks.join(" ") : chunks.join("");

  return { ok: true, hex };
}

/** Decode hexadecimal strings into UTF-8 text. */
export function decodeHex(
  input: string,
): { ok: true; text: string } | { ok: false; error: string } {
  const trimmed = input.trim();
  if (!trimmed) {
    return { ok: false, error: "Paste hexadecimal to decode." };
  }

  const normalized = trimmed
    .replace(/0x/gi, "")
    .replace(/[^0-9a-fA-F]/g, "");

  if (!normalized) {
    return { ok: false, error: "No hexadecimal digits found." };
  }

  if (normalized.length % 2 !== 0) {
    return {
      ok: false,
      error: "Hex input must have an even number of digits.",
    };
  }

  const bytes: number[] = [];
  for (let i = 0; i < normalized.length; i += 2) {
    const pair = normalized.slice(i, i + 2);
    const value = Number.parseInt(pair, 16);
    if (Number.isNaN(value)) {
      return { ok: false, error: `Invalid hex pair: ${pair}` };
    }
    bytes.push(value);
  }

  try {
    const text = new TextDecoder().decode(new Uint8Array(bytes));
    return { ok: true, text };
  } catch {
    return { ok: false, error: "Could not decode bytes as UTF-8 text." };
  }
}

/** Encode or decode hex depending on mode. */
export function convertHex(
  input: string,
  mode: HexMode,
  options: HexOptions = {},
):
  | { ok: true; output: string }
  | { ok: false; error: string } {
  if (mode === "encode") {
    const result = encodeHex(input, options);
    return result.ok
      ? { ok: true, output: result.hex }
      : { ok: false, error: result.error };
  }

  const result = decodeHex(input);
  return result.ok
    ? { ok: true, output: result.text }
    : { ok: false, error: result.error };
}
