export type JsonEscapeMode = "escape" | "unescape";

export type JsonEscapeOptions = {
  /** Wrap escaped output in JSON string quotes (default true). */
  wrapQuotes?: boolean;
};

export const SAMPLE_JSON_TEXT = 'Line one\n"quoted"';
export const SAMPLE_JSON_ESCAPED = '"Line one\\n\\"quoted\\""';

const JSON_ESCAPES: Record<string, string> = {
  "\b": "\\b",
  "\f": "\\f",
  "\n": "\\n",
  "\r": "\\r",
  "\t": "\\t",
  '"': '\\"',
  "\\": "\\\\",
};

const JSON_UNESCAPES: Record<string, string> = {
  b: "\b",
  f: "\f",
  n: "\n",
  r: "\r",
  t: "\t",
  '"': '"',
  "\\": "\\",
  "/": "/",
};

/** Escape text for use inside a JSON string literal. */
export function escapeJsonString(
  input: string,
  options: JsonEscapeOptions = {},
): { ok: true; escaped: string } | { ok: false; error: string } {
  if (!input) {
    return { ok: false, error: "Enter text to escape for JSON." };
  }

  let out = "";
  for (const ch of input) {
    const mapped = JSON_ESCAPES[ch];
    if (mapped) {
      out += mapped;
      continue;
    }
    const code = ch.codePointAt(0)!;
    if (code < 0x20) {
      out += `\\u${code.toString(16).padStart(4, "0")}`;
      continue;
    }
    if (code > 0xffff) {
      out += `\\u{${code.toString(16)}}`;
      continue;
    }
    out += ch;
  }

  const wrapQuotes = options.wrapQuotes !== false;
  return { ok: true, escaped: wrapQuotes ? `"${out}"` : out };
}

/** Unescape a JSON string literal or escaped fragment. */
export function unescapeJsonString(
  input: string,
): { ok: true; text: string } | { ok: false; error: string } {
  let trimmed = input.trim();
  if (!trimmed) {
    return { ok: false, error: "Paste escaped JSON text to decode." };
  }

  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    trimmed = trimmed.slice(1, -1);
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

      const mapped = JSON_UNESCAPES[next];
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
export function convertJsonEscape(
  input: string,
  mode: JsonEscapeMode,
  options: JsonEscapeOptions = {},
):
  | { ok: true; output: string }
  | { ok: false; error: string } {
  if (mode === "escape") {
    const result = escapeJsonString(input, options);
    return result.ok
      ? { ok: true, output: result.escaped }
      : { ok: false, error: result.error };
  }

  const result = unescapeJsonString(input);
  return result.ok
    ? { ok: true, output: result.text }
    : { ok: false, error: result.error };
}
