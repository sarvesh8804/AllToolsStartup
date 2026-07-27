const NAMED_ENCODE: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

/** Common named entities for decode (subset + amp/lt/gt/quot/apos). */
const NAMED_DECODE: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: "\u00A0",
  copy: "©",
  reg: "®",
  trade: "™",
  mdash: "—",
  ndash: "–",
  hellip: "…",
  laquo: "«",
  raquo: "»",
  lsquo: "‘",
  rsquo: "’",
  ldquo: "“",
  rdquo: "”",
  euro: "€",
  pound: "£",
  yen: "¥",
  cent: "¢",
  sect: "§",
  para: "¶",
  deg: "°",
  plusmn: "±",
  times: "×",
  divide: "÷",
  micro: "µ",
  middot: "·",
  bull: "•",
  circ: "ˆ",
  tilde: "˜",
};

export type HtmlEntityEncodeOptions = {
  /** Escape & < > " ' (default true). */
  escapeBasic?: boolean;
  /** Encode non-ASCII as numeric entities (default false). */
  encodeNonAscii?: boolean;
  /** Use hex numeric entities when encoding non-ASCII (default false → decimal). */
  useHex?: boolean;
};

export function encodeHtmlEntities(
  input: string,
  options: HtmlEntityEncodeOptions = {},
): string {
  const escapeBasic = options.escapeBasic !== false;
  const encodeNonAscii = options.encodeNonAscii === true;
  const useHex = options.useHex === true;

  let out = "";
  for (const ch of input) {
    if (escapeBasic && ch in NAMED_ENCODE) {
      out += NAMED_ENCODE[ch];
      continue;
    }
    const code = ch.codePointAt(0)!;
    if (encodeNonAscii && code > 127) {
      out += useHex
        ? `&#x${code.toString(16).toUpperCase()};`
        : `&#${code};`;
      continue;
    }
    out += ch;
  }
  return out;
}

export type HtmlEntityDecodeResult =
  | { ok: true; value: string }
  | { ok: false; error: string };

export function decodeHtmlEntities(input: string): HtmlEntityDecodeResult {
  try {
    const value = input.replace(
      /&(#x[0-9a-fA-F]+|#\d+|[a-zA-Z][a-zA-Z0-9]*);/g,
      (full, body: string) => {
        if (body[0] === "#") {
          const isHex = body[1] === "x" || body[1] === "X";
          const num = isHex
            ? parseInt(body.slice(2), 16)
            : parseInt(body.slice(1), 10);
          if (!Number.isFinite(num) || num < 0 || num > 0x10ffff) {
            return full;
          }
          try {
            return String.fromCodePoint(num);
          } catch {
            return full;
          }
        }
        const named = NAMED_DECODE[body.toLowerCase()];
        return named ?? full;
      },
    );
    return { ok: true, value };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Decode failed.",
    };
  }
}
