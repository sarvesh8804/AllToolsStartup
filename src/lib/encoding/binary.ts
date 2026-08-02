export type BinaryMode = "encode" | "decode";

export type BinarySeparator = "space" | "none";

export type BinaryOptions = {
  separator?: BinarySeparator;
};

export const SAMPLE_BINARY_TEXT = "Forge";
export const SAMPLE_BINARY_ENCODED =
  "01000110 01101111 01110010 01100111 01100101";

function padByte(n: number): string {
  return n.toString(2).padStart(8, "0");
}

/** Encode UTF-8 text as 8-bit binary strings. */
export function encodeBinary(
  input: string,
  options: BinaryOptions = {},
): { ok: true; binary: string } | { ok: false; error: string } {
  if (!input) {
    return { ok: false, error: "Enter text to encode as binary." };
  }

  const separator = options.separator ?? "space";
  const bytes = [...new TextEncoder().encode(input)];
  const chunks = bytes.map((byte) => padByte(byte));
  const binary =
    separator === "space" ? chunks.join(" ") : chunks.join("");

  return { ok: true, binary };
}

/** Decode 8-bit binary strings into UTF-8 text. */
export function decodeBinary(
  input: string,
  options: BinaryOptions = {},
): { ok: true; text: string } | { ok: false; error: string } {
  const trimmed = input.trim();
  if (!trimmed) {
    return { ok: false, error: "Paste binary digits to decode." };
  }

  const separator = options.separator ?? "space";
  const normalized = trimmed.replace(/\s+/g, separator === "none" ? "" : " ");
  const chunks =
    separator === "none"
      ? normalized.match(/.{1,8}/g) ?? []
      : normalized.split(/\s+/).filter(Boolean);

  if (chunks.length === 0) {
    return { ok: false, error: "No binary bytes found." };
  }

  const bytes: number[] = [];
  for (const chunk of chunks) {
    if (!/^[01]+$/.test(chunk)) {
      return { ok: false, error: `Invalid binary chunk: ${chunk}` };
    }
    if (chunk.length > 8) {
      return {
        ok: false,
        error: `Each byte must be 8 bits or fewer (got ${chunk.length}).`,
      };
    }
    bytes.push(parseInt(chunk.padStart(8, "0"), 2));
  }

  try {
    const text = new TextDecoder().decode(new Uint8Array(bytes));
    return { ok: true, text };
  } catch {
    return { ok: false, error: "Could not decode bytes as UTF-8 text." };
  }
}

/** Encode or decode binary depending on mode. */
export function convertBinary(
  input: string,
  mode: BinaryMode,
  options: BinaryOptions = {},
):
  | { ok: true; output: string }
  | { ok: false; error: string } {
  if (mode === "encode") {
    const result = encodeBinary(input, options);
    return result.ok
      ? { ok: true, output: result.binary }
      : { ok: false, error: result.error };
  }

  const result = decodeBinary(input, options);
  return result.ok
    ? { ok: true, output: result.text }
    : { ok: false, error: result.error };
}
