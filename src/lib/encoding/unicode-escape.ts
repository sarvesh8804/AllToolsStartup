export type UnicodeEscapeMode = "escape" | "unescape";

export type UnicodeEscapeOptions = {
  /** Escape ASCII characters too (default: only non-ASCII). */
  escapeAscii?: boolean;
  uppercase?: boolean;
};

export const SAMPLE_UNICODE_TEXT = "Hello 世界 🚀";
export const SAMPLE_UNICODE_ESCAPED =
  "Hello \\u4e16\\u754c \\u{1f680}";

const JS_SHORT_ESCAPES: Record<string, string> = {
  n: "\n",
  t: "\t",
  r: "\r",
  b: "\b",
  f: "\f",
  v: "\v",
  "'": "'",
  '"': '"',
  "\\": "\\",
};

function formatCodePoint(code: number, uppercase: boolean): string {
  if (code <= 0xffff) {
    const hex = code.toString(16).padStart(4, "0");
    const body = uppercase ? hex.toUpperCase() : hex;
    return `\\u${body}`;
  }
  const hex = code.toString(16);
  const body = uppercase ? hex.toUpperCase() : hex;
  return `\\u{${body}}`;
}

/** Escape text into JavaScript-style Unicode sequences. */
export function escapeUnicode(
  input: string,
  options: UnicodeEscapeOptions = {},
): { ok: true; escaped: string } | { ok: false; error: string } {
  if (!input) {
    return { ok: false, error: "Enter text to escape." };
  }

  const escapeAscii = options.escapeAscii === true;
  const uppercase = options.uppercase === true;
  let out = "";

  for (const ch of input) {
    const code = ch.codePointAt(0)!;
    if (!escapeAscii && code < 128) {
      out += ch;
      continue;
    }
    out += formatCodePoint(code, uppercase);
    if (code > 0xffff) continue; // skip surrogate pair second unit
  }

  return { ok: true, escaped: out };
}

/** Unescape JavaScript-style Unicode and common escape sequences. */
export function unescapeUnicode(
  input: string,
): { ok: true; text: string } | { ok: false; error: string } {
  const trimmed = input.trim();
  if (!trimmed) {
    return { ok: false, error: "Paste escaped Unicode to decode." };
  }

  try {
    let i = 0;
    let out = "";

    while (i < trimmed.length) {
      const ch = trimmed[i]!;
      if (ch !== "\\") {
        out += ch;
        i += 1;
        continue;
      }

      if (i + 1 >= trimmed.length) {
        return { ok: false, error: "Trailing backslash at end of input." };
      }

      const next = trimmed[i + 1]!;

      if (next === "u") {
        if (trimmed[i + 2] === "{") {
          const end = trimmed.indexOf("}", i + 3);
          if (end === -1) {
            return { ok: false, error: "Unclosed \\u{...} sequence." };
          }
          const hex = trimmed.slice(i + 3, end);
          const code = Number.parseInt(hex, 16);
          if (!Number.isFinite(code) || code < 0 || code > 0x10ffff) {
            return { ok: false, error: `Invalid code point: \\u{${hex}}` };
          }
          out += String.fromCodePoint(code);
          i = end + 1;
          continue;
        }

        const hex = trimmed.slice(i + 2, i + 6);
        if (!/^[0-9a-fA-F]{4}$/.test(hex)) {
          return { ok: false, error: `Invalid \\u sequence near position ${i}.` };
        }
        out += String.fromCharCode(Number.parseInt(hex, 16));
        i += 6;
        continue;
      }

      if (next === "x") {
        const hex = trimmed.slice(i + 2, i + 4);
        if (!/^[0-9a-fA-F]{2}$/.test(hex)) {
          return { ok: false, error: `Invalid \\x sequence near position ${i}.` };
        }
        out += String.fromCharCode(Number.parseInt(hex, 16));
        i += 4;
        continue;
      }

      const mapped = JS_SHORT_ESCAPES[next];
      if (mapped !== undefined) {
        out += mapped;
        i += 2;
        continue;
      }

      out += next;
      i += 2;
    }

    return { ok: true, text: out };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Unescape failed.",
    };
  }
}

/** Escape or unescape depending on mode. */
export function convertUnicodeEscape(
  input: string,
  mode: UnicodeEscapeMode,
  options: UnicodeEscapeOptions = {},
):
  | { ok: true; output: string }
  | { ok: false; error: string } {
  if (mode === "escape") {
    const result = escapeUnicode(input, options);
    return result.ok
      ? { ok: true, output: result.escaped }
      : { ok: false, error: result.error };
  }

  const result = unescapeUnicode(input);
  return result.ok
    ? { ok: true, output: result.text }
    : { ok: false, error: result.error };
}
