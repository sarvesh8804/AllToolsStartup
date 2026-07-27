export type LineEnding = "lf" | "crlf" | "cr" | "mixed" | "none";

export type LineCounterStats = {
  /** Total lines (split on \r\n|\r|\n). Empty string → 0. */
  total: number;
  nonEmpty: number;
  blank: number;
  /** Lines that are only whitespace. */
  whitespaceOnly: number;
  longestLine: number;
  shortestNonEmpty: number | null;
  averageLength: number;
  ending: LineEnding;
  /** True if the input ends with a newline. */
  trailingNewline: boolean;
  characters: number;
};

export function detectLineEnding(input: string): LineEnding {
  let crlf = 0;
  let crOnly = 0;
  let lfOnly = 0;
  for (let i = 0; i < input.length; i += 1) {
    const ch = input[i];
    if (ch === "\r" && input[i + 1] === "\n") {
      crlf += 1;
      i += 1;
    } else if (ch === "\r") {
      crOnly += 1;
    } else if (ch === "\n") {
      lfOnly += 1;
    }
  }

  const kinds = [crlf > 0, crOnly > 0, lfOnly > 0].filter(Boolean).length;
  if (kinds === 0) return "none";
  if (kinds > 1) return "mixed";
  if (crlf > 0) return "crlf";
  if (crOnly > 0) return "cr";
  return "lf";
}

export function analyzeLines(input: string): LineCounterStats {
  if (input.length === 0) {
    return {
      total: 0,
      nonEmpty: 0,
      blank: 0,
      whitespaceOnly: 0,
      longestLine: 0,
      shortestNonEmpty: null,
      averageLength: 0,
      ending: "none",
      trailingNewline: false,
      characters: 0,
    };
  }

  const lines = input.split(/\r\n|\r|\n/);
  // Trailing empty from final newline is a blank line in split terms
  let nonEmpty = 0;
  let blank = 0;
  let whitespaceOnly = 0;
  let longest = 0;
  let shortestNonEmpty: number | null = null;
  let sum = 0;

  for (const line of lines) {
    const len = [...line].length;
    sum += len;
    if (len > longest) longest = len;
    if (line.length === 0) {
      blank += 1;
    } else if (line.trim().length === 0) {
      whitespaceOnly += 1;
      nonEmpty += 1;
    } else {
      nonEmpty += 1;
      if (shortestNonEmpty == null || len < shortestNonEmpty) {
        shortestNonEmpty = len;
      }
    }
  }

  const trailingNewline = /[\r\n]$/.test(input);

  return {
    total: lines.length,
    nonEmpty,
    blank,
    whitespaceOnly,
    longestLine: longest,
    shortestNonEmpty,
    averageLength: lines.length === 0 ? 0 : Math.round((sum / lines.length) * 10) / 10,
    ending: detectLineEnding(input),
    trailingNewline,
    characters: [...input].length,
  };
}
