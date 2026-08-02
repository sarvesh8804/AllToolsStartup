export type HtmlEntityEntry = {
  name: string;
  character: string;
  named: string;
  decimal: string;
  hex: string;
  description: string;
};

export type HtmlEntityCategory = {
  id: string;
  title: string;
  entries: HtmlEntityEntry[];
};

function entity(
  name: string,
  character: string,
  codePoint: number,
  description: string,
): HtmlEntityEntry {
  return {
    name,
    character,
    named: `&${name};`,
    decimal: `&#${codePoint};`,
    hex: `&#x${codePoint.toString(16).toUpperCase()};`,
    description,
  };
}

export const HTML_ENTITY_REFERENCE: HtmlEntityCategory[] = [
  {
    id: "essential",
    title: "Essential escapes",
    entries: [
      entity("amp", "&", 38, "Ampersand — must be escaped in HTML text and attributes."),
      entity("lt", "<", 60, "Less-than — starts tags; escape in text content."),
      entity("gt", ">", 62, "Greater-than — ends tags; escape in text content."),
      entity("quot", '"', 34, "Double quote — escape inside double-quoted attributes."),
      entity("apos", "'", 39, "Apostrophe — escape inside single-quoted attributes."),
    ],
  },
  {
    id: "typography",
    title: "Typography & spaces",
    entries: [
      entity("nbsp", "\u00A0", 160, "Non-breaking space — prevents a line break at this position."),
      entity("ensp", "\u2002", 8194, "En space — roughly the width of the letter n."),
      entity("emsp", "\u2003", 8195, "Em space — roughly the width of the letter m."),
      entity("thinsp", "\u2009", 8201, "Thin space — narrow gap, often used in units."),
      entity("mdash", "—", 8212, "Em dash — long dash for breaks in a sentence."),
      entity("ndash", "–", 8211, "En dash — ranges and compound modifiers."),
      entity("hellip", "…", 8230, "Horizontal ellipsis — three dots in one glyph."),
      entity("lsquo", "‘", 8216, "Left single quotation mark."),
      entity("rsquo", "’", 8217, "Right single quotation mark."),
      entity("ldquo", "“", 8220, "Left double quotation mark."),
      entity("rdquo", "”", 8221, "Right double quotation mark."),
      entity("laquo", "«", 171, "Left-pointing double angle quotation mark."),
      entity("raquo", "»", 187, "Right-pointing double angle quotation mark."),
      entity("middot", "·", 183, "Middle dot — often used as a bullet separator."),
      entity("bull", "•", 8226, "Bullet — list marker glyph."),
    ],
  },
  {
    id: "symbols",
    title: "Symbols & marks",
    entries: [
      entity("copy", "©", 169, "Copyright sign."),
      entity("reg", "®", 174, "Registered trademark sign."),
      entity("trade", "™", 8482, "Trademark sign."),
      entity("sect", "§", 167, "Section sign."),
      entity("para", "¶", 182, "Pilcrow — paragraph mark."),
      entity("dagger", "†", 8224, "Dagger — footnote marker."),
      entity("Dagger", "‡", 8225, "Double dagger — second footnote marker."),
      entity("permil", "‰", 8240, "Per mille sign — parts per thousand."),
    ],
  },
  {
    id: "currency",
    title: "Currency",
    entries: [
      entity("cent", "¢", 162, "Cent sign."),
      entity("pound", "£", 163, "Pound sterling."),
      entity("yen", "¥", 165, "Yen or yuan sign."),
      entity("euro", "€", 8364, "Euro sign."),
      entity("curren", "¤", 164, "Generic currency sign."),
    ],
  },
  {
    id: "math",
    title: "Math & science",
    entries: [
      entity("deg", "°", 176, "Degree sign — temperature or angles."),
      entity("plusmn", "±", 177, "Plus-minus sign."),
      entity("times", "×", 215, "Multiplication sign."),
      entity("divide", "÷", 247, "Division sign."),
      entity("micro", "µ", 181, "Micro sign — metric prefix."),
      entity("sup1", "¹", 185, "Superscript one."),
      entity("sup2", "²", 178, "Superscript two — squared."),
      entity("sup3", "³", 179, "Superscript three — cubed."),
      entity("frac14", "¼", 188, "Vulgar fraction one quarter."),
      entity("frac12", "½", 189, "Vulgar fraction one half."),
      entity("frac34", "¾", 190, "Vulgar fraction three quarters."),
      entity("infin", "∞", 8734, "Infinity symbol."),
      entity("asymp", "≈", 8776, "Almost equal to."),
      entity("ne", "≠", 8800, "Not equal to."),
      entity("le", "≤", 8804, "Less than or equal to."),
      entity("ge", "≥", 8805, "Greater than or equal to."),
    ],
  },
  {
    id: "arrows",
    title: "Arrows",
    entries: [
      entity("larr", "←", 8592, "Leftwards arrow."),
      entity("uarr", "↑", 8593, "Upwards arrow."),
      entity("rarr", "→", 8594, "Rightwards arrow."),
      entity("darr", "↓", 8595, "Downwards arrow."),
      entity("harr", "↔", 8596, "Left-right arrow."),
      entity("crarr", "↵", 8629, "Carriage return — down then left arrow."),
    ],
  },
  {
    id: "greek",
    title: "Greek letters",
    entries: [
      entity("Alpha", "Α", 913, "Greek capital letter alpha."),
      entity("Beta", "Β", 914, "Greek capital letter beta."),
      entity("Gamma", "Γ", 915, "Greek capital letter gamma."),
      entity("Delta", "Δ", 916, "Greek capital letter delta."),
      entity("Pi", "Π", 928, "Greek capital letter pi."),
      entity("Sigma", "Σ", 931, "Greek capital letter sigma."),
      entity("Omega", "Ω", 937, "Greek capital letter omega."),
      entity("alpha", "α", 945, "Greek small letter alpha."),
      entity("beta", "β", 946, "Greek small letter beta."),
      entity("gamma", "γ", 947, "Greek small letter gamma."),
      entity("delta", "δ", 948, "Greek small letter delta."),
      entity("pi", "π", 960, "Greek small letter pi."),
      entity("sigma", "σ", 963, "Greek small letter sigma."),
      entity("omega", "ω", 969, "Greek small letter omega."),
    ],
  },
];

export function filterHtmlEntities(query: string): HtmlEntityCategory[] {
  const q = query.trim().toLowerCase();
  if (!q) return HTML_ENTITY_REFERENCE;

  return HTML_ENTITY_REFERENCE.map((cat) => ({
    ...cat,
    entries: cat.entries.filter((e) => {
      const hay = [
        e.name,
        e.character,
        e.named,
        e.decimal,
        e.hex,
        e.description,
        cat.title,
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    }),
  })).filter((cat) => cat.entries.length > 0);
}

export function countHtmlEntityEntries(
  categories: HtmlEntityCategory[],
): number {
  return categories.reduce((n, c) => n + c.entries.length, 0);
}

export function findHtmlEntity(
  name: string,
  categories: HtmlEntityCategory[] = HTML_ENTITY_REFERENCE,
): HtmlEntityEntry | undefined {
  const key = name.trim().replace(/^&|;/g, "").toLowerCase();
  for (const cat of categories) {
    const hit = cat.entries.find((e) => e.name.toLowerCase() === key);
    if (hit) return hit;
  }
  return undefined;
}
