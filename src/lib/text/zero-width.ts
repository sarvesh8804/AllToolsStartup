export type ZeroWidthMatch = {
  /** UTF-16 code unit index in the original string. */
  index: number;
  /** Unicode code point. */
  codePoint: number;
  /** U+XXXX form. */
  code: string;
  name: string;
  /** Visible stand-in for preview (e.g. ⟨ZWSP⟩). */
  label: string;
};

export type ZeroWidthScanResult = {
  matches: ZeroWidthMatch[];
  count: number;
  /** Unique code points found. */
  uniqueCodes: string[];
  cleaned: string;
  /** Original with zero-width chars replaced by visible markers. */
  highlighted: string;
};

/** Common invisible / zero-width characters worth detecting. */
export const ZERO_WIDTH_CHARS: ReadonlyArray<{
  codePoint: number;
  name: string;
  label: string;
}> = [
  { codePoint: 0x200b, name: "Zero Width Space", label: "ZWSP" },
  { codePoint: 0x200c, name: "Zero Width Non-Joiner", label: "ZWNJ" },
  { codePoint: 0x200d, name: "Zero Width Joiner", label: "ZWJ" },
  { codePoint: 0x200e, name: "Left-to-Right Mark", label: "LRM" },
  { codePoint: 0x200f, name: "Right-to-Left Mark", label: "RLM" },
  { codePoint: 0x2060, name: "Word Joiner", label: "WJ" },
  { codePoint: 0xfeff, name: "BOM / Zero Width No-Break Space", label: "BOM" },
  { codePoint: 0x00ad, name: "Soft Hyphen", label: "SHY" },
  { codePoint: 0x180e, name: "Mongolian Vowel Separator", label: "MVS" },
  { codePoint: 0x2061, name: "Function Application", label: "FA" },
  { codePoint: 0x2062, name: "Invisible Times", label: "IT" },
  { codePoint: 0x2063, name: "Invisible Separator", label: "IS" },
  { codePoint: 0x2064, name: "Invisible Plus", label: "IP" },
];

const LOOKUP = new Map(
  ZERO_WIDTH_CHARS.map((c) => [c.codePoint, c] as const),
);

function formatCode(cp: number): string {
  return `U+${cp.toString(16).toUpperCase().padStart(4, "0")}`;
}

/** Scan text for zero-width / invisible characters; return cleaned + highlighted forms. */
export function scanZeroWidth(input: string): ZeroWidthScanResult {
  const matches: ZeroWidthMatch[] = [];
  let cleaned = "";
  let highlighted = "";

  for (let i = 0; i < input.length; ) {
    const cp = input.codePointAt(i)!;
    const len = cp > 0xffff ? 2 : 1;
    const meta = LOOKUP.get(cp);
    if (meta) {
      matches.push({
        index: i,
        codePoint: cp,
        code: formatCode(cp),
        name: meta.name,
        label: meta.label,
      });
      highlighted += `⟨${meta.label}⟩`;
    } else {
      cleaned += input.slice(i, i + len);
      highlighted += input.slice(i, i + len);
    }
    i += len;
  }

  const uniqueCodes = [...new Set(matches.map((m) => m.code))];

  return {
    matches,
    count: matches.length,
    uniqueCodes,
    cleaned,
    highlighted,
  };
}

/** Remove all known zero-width characters from text. */
export function stripZeroWidth(input: string): string {
  return scanZeroWidth(input).cleaned;
}
