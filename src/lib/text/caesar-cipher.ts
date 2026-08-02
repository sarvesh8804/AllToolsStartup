export type CaesarMode = "encode" | "decode";

export const SAMPLE_CAESAR = "Forge tools run in your browser.";

function normalizeShift(shift: number): number {
  const n = Math.trunc(shift) % 26;
  return n < 0 ? n + 26 : n;
}

function shiftChar(char: string, amount: number): string {
  const code = char.charCodeAt(0);
  if (code >= 65 && code <= 90) {
    return String.fromCharCode(65 + ((code - 65 + amount) % 26));
  }
  if (code >= 97 && code <= 122) {
    return String.fromCharCode(97 + ((code - 97 + amount) % 26));
  }
  return char;
}

/** Apply a Caesar cipher with the given shift (1–25). Decode reverses the shift. */
export function caesarCipher(
  input: string,
  shift: number,
  mode: CaesarMode,
): string {
  const amount =
    mode === "encode" ? normalizeShift(shift) : normalizeShift(26 - shift);
  return [...input].map((char) => shiftChar(char, amount)).join("");
}
