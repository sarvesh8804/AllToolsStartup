export type RegexCheatEntry = {
  token: string;
  name: string;
  description: string;
  example?: string;
};

export type RegexCheatCategory = {
  id: string;
  title: string;
  entries: RegexCheatEntry[];
};

export const REGEX_CHEATSHEET: RegexCheatCategory[] = [
  {
    id: "characters",
    title: "Characters",
    entries: [
      {
        token: ".",
        name: "Any character",
        description: "Matches any character except line breaks (unless dotAll).",
        example: "a.c → abc, a-c",
      },
      {
        token: "\\d",
        name: "Digit",
        description: "Matches a digit 0–9.",
        example: "\\d\\d → 42",
      },
      {
        token: "\\D",
        name: "Non-digit",
        description: "Matches anything that is not a digit.",
      },
      {
        token: "\\w",
        name: "Word character",
        description: "Letter, digit, or underscore [A-Za-z0-9_].",
      },
      {
        token: "\\W",
        name: "Non-word",
        description: "Anything outside [A-Za-z0-9_].",
      },
      {
        token: "\\s",
        name: "Whitespace",
        description: "Space, tab, newline, and other whitespace.",
      },
      {
        token: "\\S",
        name: "Non-whitespace",
        description: "Any non-whitespace character.",
      },
      {
        token: "\\t",
        name: "Tab",
        description: "Matches a tab character.",
      },
      {
        token: "\\n",
        name: "Newline",
        description: "Matches a newline character.",
      },
      {
        token: "\\\\",
        name: "Backslash",
        description: "Matches a literal backslash.",
      },
    ],
  },
  {
    id: "classes",
    title: "Character classes",
    entries: [
      {
        token: "[abc]",
        name: "Set",
        description: "One of the characters a, b, or c.",
        example: "[aeiou] → vowels",
      },
      {
        token: "[^abc]",
        name: "Negated set",
        description: "Any character except a, b, or c.",
      },
      {
        token: "[a-z]",
        name: "Range",
        description: "Characters from a through z.",
      },
      {
        token: "[A-Za-z0-9]",
        name: "Alphanumeric",
        description: "Letters and digits.",
      },
      {
        token: "[\\d.]",
        name: "Digit or dot",
        description: "Useful for simple number/IP fragments.",
      },
    ],
  },
  {
    id: "anchors",
    title: "Anchors",
    entries: [
      {
        token: "^",
        name: "Start",
        description: "Start of string (or line with m flag).",
        example: "^Hi → Hi there",
      },
      {
        token: "$",
        name: "End",
        description: "End of string (or line with m flag).",
      },
      {
        token: "\\b",
        name: "Word boundary",
        description: "Between a word and non-word character.",
        example: "\\bcat\\b → cat, not cats",
      },
      {
        token: "\\B",
        name: "Non-boundary",
        description: "Not at a word boundary.",
      },
    ],
  },
  {
    id: "quantifiers",
    title: "Quantifiers",
    entries: [
      {
        token: "*",
        name: "Zero or more",
        description: "Greedy: as many as possible.",
        example: "ab* → a, ab, abb",
      },
      {
        token: "+",
        name: "One or more",
        description: "Greedy: at least one.",
      },
      {
        token: "?",
        name: "Optional",
        description: "Zero or one.",
        example: "colou?r → color, colour",
      },
      {
        token: "{n}",
        name: "Exactly n",
        description: "Exactly n repetitions.",
        example: "\\d{4} → 2026",
      },
      {
        token: "{n,}",
        name: "n or more",
        description: "At least n repetitions.",
      },
      {
        token: "{n,m}",
        name: "Between n and m",
        description: "From n to m repetitions (greedy).",
      },
      {
        token: "*?",
        name: "Lazy *",
        description: "Zero or more, as few as possible.",
      },
      {
        token: "+?",
        name: "Lazy +",
        description: "One or more, as few as possible.",
      },
      {
        token: "??",
        name: "Lazy ?",
        description: "Optional, preferring zero.",
      },
    ],
  },
  {
    id: "groups",
    title: "Groups & alternation",
    entries: [
      {
        token: "(…)",
        name: "Capturing group",
        description: "Groups and captures for backrefs / replace.",
        example: "(ab)+ → ab, abab",
      },
      {
        token: "(?:…)",
        name: "Non-capturing",
        description: "Groups without creating a capture.",
      },
      {
        token: "(?<name>…)",
        name: "Named group",
        description: "Capturing group with a name (JS).",
      },
      {
        token: "\\1",
        name: "Backreference",
        description: "Match the same text as group 1.",
        example: "(\\w+)\\s+\\1 → go go",
      },
      {
        token: "|",
        name: "Alternation",
        description: "Or — match left or right.",
        example: "cat|dog",
      },
    ],
  },
  {
    id: "lookaround",
    title: "Lookaround",
    entries: [
      {
        token: "(?=…)",
        name: "Positive lookahead",
        description: "Assert what follows, without consuming.",
        example: "\\d(?=px) → 3 in 3px",
      },
      {
        token: "(?!…)",
        name: "Negative lookahead",
        description: "Assert what does not follow.",
      },
      {
        token: "(?<=…)",
        name: "Positive lookbehind",
        description: "Assert what precedes (JS).",
      },
      {
        token: "(?<!…)",
        name: "Negative lookbehind",
        description: "Assert what does not precede (JS).",
      },
    ],
  },
  {
    id: "flags",
    title: "Flags",
    entries: [
      {
        token: "g",
        name: "Global",
        description: "Find all matches, not only the first.",
      },
      {
        token: "i",
        name: "Ignore case",
        description: "Case-insensitive matching.",
      },
      {
        token: "m",
        name: "Multiline",
        description: "^ and $ match line starts/ends.",
      },
      {
        token: "s",
        name: "DotAll",
        description: ". also matches newlines.",
      },
      {
        token: "u",
        name: "Unicode",
        description: "Unicode mode (code points, \\p{…}).",
      },
      {
        token: "y",
        name: "Sticky",
        description: "Match only at lastIndex.",
      },
    ],
  },
  {
    id: "recipes",
    title: "Common recipes",
    entries: [
      {
        token: "^\\d+$",
        name: "Integer",
        description: "Whole string is digits only.",
      },
      {
        token: "^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$",
        name: "Simple email",
        description: "Basic email shape — not RFC-complete.",
      },
      {
        token: "https?:\\/\\/[^\\s]+",
        name: "HTTP(S) URL",
        description: "Rough URL finder in text.",
      },
      {
        token: "^#[0-9A-Fa-f]{3,8}$",
        name: "Hex color",
        description: "CSS hex color (#rgb to #rrggbbaa).",
      },
      {
        token: "\\b\\d{1,3}(\\.\\d{1,3}){3}\\b",
        name: "IPv4-ish",
        description: "Four dotted numbers — does not validate 0–255.",
      },
      {
        token: "^\\s+|\\s+$",
        name: "Trim edges",
        description: "Leading or trailing whitespace (use with g).",
      },
      {
        token: "(\\r\\n|\\r|\\n)",
        name: "Any newline",
        description: "CRLF, CR, or LF.",
      },
    ],
  },
];

export function filterCheatsheet(
  query: string,
  categories: RegexCheatCategory[] = REGEX_CHEATSHEET,
): RegexCheatCategory[] {
  const q = query.trim().toLowerCase();
  if (!q) return categories;

  return categories
    .map((cat) => ({
      ...cat,
      entries: cat.entries.filter((e) => {
        const hay = `${e.token} ${e.name} ${e.description} ${e.example ?? ""}`.toLowerCase();
        return hay.includes(q);
      }),
    }))
    .filter((cat) => cat.entries.length > 0);
}

export function countCheatsheetEntries(
  categories: RegexCheatCategory[] = REGEX_CHEATSHEET,
): number {
  return categories.reduce((sum, c) => sum + c.entries.length, 0);
}
