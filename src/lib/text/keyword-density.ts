export type KeywordDensityOptions = {
  /** Drop words shorter than this (default 2). */
  minWordLength?: number;
  /** Ignore common English stop words (default true). */
  ignoreStopWords?: boolean;
  /** Keep original casing in output keys (default false → lowercase). */
  caseSensitive?: boolean;
  /** How many rows to return (default 50, max 200). */
  topN?: number;
  /** Always include these keywords in the results (comma/newline separated in UI). */
  focusKeywords?: string[];
};

export type KeywordDensityRow = {
  keyword: string;
  count: number;
  density: number;
};

export type KeywordDensityResult = {
  totalWords: number;
  uniqueWords: number;
  analyzedWords: number;
  rows: KeywordDensityRow[];
  focus: KeywordDensityRow[];
};

/** Compact English stop-word list for SEO / density checks. */
export const STOP_WORDS = new Set([
  "a",
  "about",
  "above",
  "after",
  "again",
  "against",
  "all",
  "am",
  "an",
  "and",
  "any",
  "are",
  "as",
  "at",
  "be",
  "because",
  "been",
  "before",
  "being",
  "below",
  "between",
  "both",
  "but",
  "by",
  "can",
  "did",
  "do",
  "does",
  "doing",
  "down",
  "during",
  "each",
  "few",
  "for",
  "from",
  "further",
  "had",
  "has",
  "have",
  "having",
  "he",
  "her",
  "here",
  "hers",
  "herself",
  "him",
  "himself",
  "his",
  "how",
  "i",
  "if",
  "in",
  "into",
  "is",
  "it",
  "its",
  "itself",
  "just",
  "me",
  "more",
  "most",
  "my",
  "myself",
  "no",
  "nor",
  "not",
  "now",
  "of",
  "off",
  "on",
  "once",
  "only",
  "or",
  "other",
  "our",
  "ours",
  "ourselves",
  "out",
  "over",
  "own",
  "same",
  "she",
  "should",
  "so",
  "some",
  "such",
  "than",
  "that",
  "the",
  "their",
  "theirs",
  "them",
  "themselves",
  "then",
  "there",
  "these",
  "they",
  "this",
  "those",
  "through",
  "to",
  "too",
  "under",
  "until",
  "up",
  "very",
  "was",
  "we",
  "were",
  "what",
  "when",
  "where",
  "which",
  "while",
  "who",
  "whom",
  "why",
  "will",
  "with",
  "you",
  "your",
  "yours",
  "yourself",
  "yourselves",
]);

export const DEFAULT_KEYWORD_DENSITY_OPTIONS: Required<
  Omit<KeywordDensityOptions, "focusKeywords">
> & { focusKeywords: string[] } = {
  minWordLength: 2,
  ignoreStopWords: true,
  caseSensitive: false,
  topN: 50,
  focusKeywords: [],
};

function tokenize(input: string, caseSensitive: boolean): string[] {
  const normalized = caseSensitive ? input : input.toLowerCase();
  const matches = normalized.match(/[a-zA-Z0-9][a-zA-Z0-9'-]*/g);
  return matches ?? [];
}

function toRow(
  keyword: string,
  count: number,
  totalWords: number,
): KeywordDensityRow {
  const density =
    totalWords === 0
      ? 0
      : Math.round((count / totalWords) * 10000) / 100;
  return { keyword, count, density };
}

export function analyzeKeywordDensity(
  input: string,
  options: KeywordDensityOptions = {},
): KeywordDensityResult {
  const opts = { ...DEFAULT_KEYWORD_DENSITY_OPTIONS, ...options };
  const topN = Math.min(200, Math.max(1, Math.floor(opts.topN)));
  const minLen = Math.max(1, Math.floor(opts.minWordLength));

  const tokens = tokenize(input, opts.caseSensitive);
  const totalWords = tokens.length;

  const counts = new Map<string, number>();
  let analyzedWords = 0;

  for (const raw of tokens) {
    const word = raw.replace(/^'+|'+$/g, "");
    if (word.length < minLen) continue;
    const key = opts.caseSensitive ? word : word.toLowerCase();
    if (opts.ignoreStopWords && STOP_WORDS.has(key.toLowerCase())) continue;
    analyzedWords += 1;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const rows = [...counts.entries()]
    .map(([keyword, count]) => toRow(keyword, count, totalWords))
    .sort((a, b) => b.count - a.count || a.keyword.localeCompare(b.keyword))
    .slice(0, topN);

  const focus = (opts.focusKeywords ?? [])
    .map((k) => k.trim())
    .filter(Boolean)
    .map((k) => {
      const key = opts.caseSensitive ? k : k.toLowerCase();
      // Count focus as phrase occurrences in original token stream for single words;
      // for multi-word, scan the lowercased text.
      if (key.includes(" ")) {
        const hay = opts.caseSensitive ? input : input.toLowerCase();
        const needle = key;
        let count = 0;
        let idx = 0;
        while (true) {
          const found = hay.indexOf(needle, idx);
          if (found === -1) break;
          count += 1;
          idx = found + needle.length;
        }
        return toRow(k, count, totalWords);
      }
      return toRow(k, counts.get(key) ?? 0, totalWords);
    });

  return {
    totalWords,
    uniqueWords: counts.size,
    analyzedWords,
    rows,
    focus,
  };
}
