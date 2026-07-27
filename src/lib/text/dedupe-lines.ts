export type DedupeLinesOptions = {
  /** Compare lines case-insensitively (default false). */
  ignoreCase?: boolean;
  /** Trim each line before comparing (default false). Output keeps original line text for kept rows. */
  trimCompare?: boolean;
  /** When true, blank lines are never considered duplicates of each other (default false). */
  keepEmpty?: boolean;
  /** Keep the last occurrence instead of the first (default false). */
  keepLast?: boolean;
};

export type DedupeLinesResult = {
  text: string;
  originalCount: number;
  uniqueCount: number;
  removedCount: number;
};

function normalizeLine(
  line: string,
  options: Required<
    Pick<DedupeLinesOptions, "ignoreCase" | "trimCompare">
  >,
): string {
  let s = options.trimCompare ? line.trim() : line;
  if (options.ignoreCase) s = s.toLowerCase();
  return s;
}

/**
 * Remove duplicate lines while preserving order of first (or last) occurrence.
 * Line endings are normalized to `\n` in the output.
 */
export function removeDuplicateLines(
  input: string,
  options: DedupeLinesOptions = {},
): DedupeLinesResult {
  const ignoreCase = options.ignoreCase ?? false;
  const trimCompare = options.trimCompare ?? false;
  const keepEmpty = options.keepEmpty ?? false;
  const keepLast = options.keepLast ?? false;

  const raw = input.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const lines = raw.length === 0 ? [] : raw.split("\n");
  // Preserve a trailing empty segment only when input ends with newline —
  // split("a\n") → ["a", ""] which is correct for line-oriented tools.
  const originalCount = lines.length === 0 && input.length === 0 ? 0 : lines.length;

  if (lines.length === 0) {
    return { text: "", originalCount: 0, uniqueCount: 0, removedCount: 0 };
  }

  const normOpts = { ignoreCase, trimCompare };

  if (keepLast) {
    const lastIndex = new Map<string, number>();
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]!;
      const isEmpty = normalizeLine(line, { ignoreCase: false, trimCompare: true }) === "";
      if (keepEmpty && isEmpty) continue;
      lastIndex.set(normalizeLine(line, normOpts), i);
    }

    const kept: string[] = [];
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]!;
      const isEmpty = normalizeLine(line, { ignoreCase: false, trimCompare: true }) === "";
      if (keepEmpty && isEmpty) {
        kept.push(line);
        continue;
      }
      if (lastIndex.get(normalizeLine(line, normOpts)) === i) kept.push(line);
    }

    return {
      text: kept.join("\n"),
      originalCount,
      uniqueCount: kept.length,
      removedCount: originalCount - kept.length,
    };
  }

  const seen = new Set<string>();
  const kept: string[] = [];
  for (const line of lines) {
    const isEmpty =
      normalizeLine(line, { ignoreCase: false, trimCompare: true }) === "";
    if (keepEmpty && isEmpty) {
      kept.push(line);
      continue;
    }
    const key = normalizeLine(line, normOpts);
    if (seen.has(key)) continue;
    seen.add(key);
    kept.push(line);
  }

  return {
    text: kept.join("\n"),
    originalCount,
    uniqueCount: kept.length,
    removedCount: originalCount - kept.length,
  };
}
