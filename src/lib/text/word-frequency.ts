import { STOP_WORDS } from "@/lib/text/keyword-density";

export type WordFrequencyOptions = {
  caseSensitive: boolean;
  ignoreStopWords: boolean;
  minWordLength: number;
  /** Max rows to return (1–500). */
  topN: number;
  sortBy: "count" | "alpha";
};

export type WordFrequencyRow = {
  rank: number;
  word: string;
  count: number;
  /** Percentage of total tokens (0–100, 2 decimals). */
  percent: number;
};

export type WordFrequencyResult = {
  totalWords: number;
  uniqueWords: number;
  rows: WordFrequencyRow[];
};

export const DEFAULT_WORD_FREQUENCY_OPTIONS: WordFrequencyOptions = {
  caseSensitive: false,
  ignoreStopWords: false,
  minWordLength: 1,
  topN: 100,
  sortBy: "count",
};

function tokenize(input: string, caseSensitive: boolean): string[] {
  const normalized = caseSensitive ? input : input.toLowerCase();
  const matches = normalized.match(/[a-zA-Z0-9][a-zA-Z0-9'-]*/g);
  return matches ?? [];
}

export function analyzeWordFrequency(
  input: string,
  options: Partial<WordFrequencyOptions> = {},
): WordFrequencyResult {
  const opts = { ...DEFAULT_WORD_FREQUENCY_OPTIONS, ...options };
  const topN = Math.min(500, Math.max(1, Math.floor(opts.topN)));
  const minLen = Math.max(1, Math.floor(opts.minWordLength));

  const tokens = tokenize(input, opts.caseSensitive);
  const totalWords = tokens.length;
  const counts = new Map<string, number>();

  for (const raw of tokens) {
    const word = raw.replace(/^'+|'+$/g, "");
    if (word.length < minLen) continue;
    const key = opts.caseSensitive ? word : word.toLowerCase();
    if (opts.ignoreStopWords && STOP_WORDS.has(key.toLowerCase())) continue;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  let entries = [...counts.entries()];
  if (opts.sortBy === "alpha") {
    entries.sort((a, b) => a[0].localeCompare(b[0]) || b[1] - a[1]);
  } else {
    entries.sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  }
  entries = entries.slice(0, topN);

  const rows: WordFrequencyRow[] = entries.map(([word, count], i) => ({
    rank: i + 1,
    word,
    count,
    percent:
      totalWords === 0
        ? 0
        : Math.round((count / totalWords) * 10000) / 100,
  }));

  return {
    totalWords,
    uniqueWords: counts.size,
    rows,
  };
}

export function wordFrequencyToCsv(rows: WordFrequencyRow[]): string {
  const lines = ["rank,word,count,percent"];
  for (const r of rows) {
    const word = /["\n,]/.test(r.word)
      ? `"${r.word.replace(/"/g, '""')}"`
      : r.word;
    lines.push(`${r.rank},${word},${r.count},${r.percent}`);
  }
  return lines.join("\n") + "\n";
}

export const SAMPLE_WORD_FREQUENCY = `Forge ships tools every day. Tools run in your browser.
Every tool stays local. Browser tools ship daily — forge on.`;
