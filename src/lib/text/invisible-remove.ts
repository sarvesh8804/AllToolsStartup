import {
  ZERO_WIDTH_CHARS,
  scanZeroWidth,
  stripZeroWidth,
} from "@/lib/text/zero-width";

export type InvisibleCharCategoryId =
  | "zero-width"
  | "nbsp"
  | "other-spaces"
  | "bidi"
  | "format";

export type InvisibleCharDef = {
  codePoint: number;
  code: string;
  name: string;
  category: InvisibleCharCategoryId;
  /** When true, replace with a normal space instead of deleting. */
  replaceWithSpace?: boolean;
};

function code(cp: number): string {
  return `U+${cp.toString(16).toUpperCase().padStart(4, "0")}`;
}

/** Extra invisible / awkward spaces beyond the zero-width detector set. */
export const INVISIBLE_EXTRA_CHARS: InvisibleCharDef[] = [
  {
    codePoint: 0x00a0,
    code: "U+00A0",
    name: "No-Break Space (NBSP)",
    category: "nbsp",
    replaceWithSpace: true,
  },
  {
    codePoint: 0x202f,
    code: "U+202F",
    name: "Narrow No-Break Space",
    category: "nbsp",
    replaceWithSpace: true,
  },
  {
    codePoint: 0x2007,
    code: "U+2007",
    name: "Figure Space",
    category: "other-spaces",
    replaceWithSpace: true,
  },
  {
    codePoint: 0x2008,
    code: "U+2008",
    name: "Punctuation Space",
    category: "other-spaces",
    replaceWithSpace: true,
  },
  {
    codePoint: 0x2009,
    code: "U+2009",
    name: "Thin Space",
    category: "other-spaces",
    replaceWithSpace: true,
  },
  {
    codePoint: 0x200a,
    code: "U+200A",
    name: "Hair Space",
    category: "other-spaces",
    replaceWithSpace: true,
  },
  {
    codePoint: 0x205f,
    code: "U+205F",
    name: "Medium Mathematical Space",
    category: "other-spaces",
    replaceWithSpace: true,
  },
  {
    codePoint: 0x3000,
    code: "U+3000",
    name: "Ideographic Space",
    category: "other-spaces",
    replaceWithSpace: true,
  },
  {
    codePoint: 0x202a,
    code: "U+202A",
    name: "Left-to-Right Embedding",
    category: "bidi",
  },
  {
    codePoint: 0x202b,
    code: "U+202B",
    name: "Right-to-Left Embedding",
    category: "bidi",
  },
  {
    codePoint: 0x202c,
    code: "U+202C",
    name: "Pop Directional Formatting",
    category: "bidi",
  },
  {
    codePoint: 0x202d,
    code: "U+202D",
    name: "Left-to-Right Override",
    category: "bidi",
  },
  {
    codePoint: 0x202e,
    code: "U+202E",
    name: "Right-to-Left Override",
    category: "bidi",
  },
];

function categoryForShared(cp: number): InvisibleCharCategoryId | null {
  if (cp === 0x200e || cp === 0x200f) return "bidi";
  if (cp === 0xfeff || cp === 0x00ad) return "format";
  return null;
}

const ZERO_WIDTH_DEFS: InvisibleCharDef[] = ZERO_WIDTH_CHARS.map((c) => ({
  codePoint: c.codePoint,
  code: code(c.codePoint),
  name: c.name,
  category: categoryForShared(c.codePoint) ?? ("zero-width" as const),
}));

/** Deduped catalog used by the remover (zero-width + extras). */
export const INVISIBLE_CHAR_CATALOG: InvisibleCharDef[] = (() => {
  const map = new Map<number, InvisibleCharDef>();
  for (const d of [...ZERO_WIDTH_DEFS, ...INVISIBLE_EXTRA_CHARS]) {
    if (!map.has(d.codePoint)) map.set(d.codePoint, d);
  }
  return [...map.values()].sort((a, b) => a.codePoint - b.codePoint);
})();

export type InvisibleCategoryFlags = Record<InvisibleCharCategoryId, boolean>;

export const DEFAULT_INVISIBLE_CATEGORIES: InvisibleCategoryFlags = {
  "zero-width": true,
  nbsp: true,
  "other-spaces": true,
  bidi: true,
  format: true,
};

export const INVISIBLE_CATEGORY_LABELS: Record<
  InvisibleCharCategoryId,
  string
> = {
  "zero-width": "Zero-width",
  nbsp: "Non-breaking spaces",
  "other-spaces": "Odd spaces",
  bidi: "BiDi marks",
  format: "Format / BOM",
};

export type InvisibleRemoveResult = {
  cleaned: string;
  removed: number;
  byCategory: Partial<Record<InvisibleCharCategoryId, number>>;
  byCode: { code: string; name: string; count: number }[];
};

export function removeInvisibleCharacters(
  input: string,
  categories: InvisibleCategoryFlags = DEFAULT_INVISIBLE_CATEGORIES,
  /** When true, NBSP-like chars become a normal space; otherwise deleted. */
  nbspToSpace = true,
): InvisibleRemoveResult {
  const active = new Map<number, InvisibleCharDef>();
  for (const def of INVISIBLE_CHAR_CATALOG) {
    if (categories[def.category]) active.set(def.codePoint, def);
  }

  let cleaned = "";
  const counts = new Map<number, number>();
  const byCategory: Partial<Record<InvisibleCharCategoryId, number>> = {};

  for (let i = 0; i < input.length; ) {
    const cp = input.codePointAt(i)!;
    const len = cp > 0xffff ? 2 : 1;
    const def = active.get(cp);
    if (def) {
      counts.set(cp, (counts.get(cp) ?? 0) + 1);
      byCategory[def.category] = (byCategory[def.category] ?? 0) + 1;
      if (def.replaceWithSpace && nbspToSpace) cleaned += " ";
      // else drop
    } else {
      cleaned += input.slice(i, i + len);
    }
    i += len;
  }

  const byCode = [...counts.entries()]
    .map(([cp, count]) => {
      const def = active.get(cp)!;
      return { code: def.code, name: def.name, count };
    })
    .sort((a, b) => b.count - a.count);

  return {
    cleaned,
    removed: [...counts.values()].reduce((a, b) => a + b, 0),
    byCategory,
    byCode,
  };
}

export { scanZeroWidth, stripZeroWidth };
