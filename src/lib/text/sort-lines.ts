export type SortLinesDirection = "asc" | "desc";

export type SortLinesOptions = {
  /** Sort direction (default "asc"). */
  direction?: SortLinesDirection;
  /** Case-insensitive comparison (default false). */
  ignoreCase?: boolean;
  /** Trim lines before sorting; output uses trimmed text (default false). */
  trimLines?: boolean;
  /** Drop blank / whitespace-only lines before sorting (default false). */
  removeEmpty?: boolean;
  /** Numeric-aware sort: "10" after "2" when both look numeric (default false). */
  numeric?: boolean;
};

export type SortLinesResult = {
  text: string;
  lineCount: number;
};

function normalizeNewlines(input: string): string {
  return input.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
}

function compareLines(
  a: string,
  b: string,
  options: Required<
    Pick<SortLinesOptions, "ignoreCase" | "numeric" | "direction">
  >,
): number {
  let left = a;
  let right = b;
  if (options.ignoreCase) {
    left = left.toLowerCase();
    right = right.toLowerCase();
  }

  let cmp: number;
  if (options.numeric) {
    cmp = left.localeCompare(right, undefined, {
      numeric: true,
      sensitivity: options.ignoreCase ? "accent" : "variant",
    });
  } else {
    cmp = left < right ? -1 : left > right ? 1 : 0;
  }

  return options.direction === "desc" ? -cmp : cmp;
}

/**
 * Sort lines of text. Line endings are normalized to `\n`.
 */
export function sortLines(
  input: string,
  options: SortLinesOptions = {},
): SortLinesResult {
  const direction = options.direction ?? "asc";
  const ignoreCase = options.ignoreCase ?? false;
  const trimLines = options.trimLines ?? false;
  const removeEmpty = options.removeEmpty ?? false;
  const numeric = options.numeric ?? false;

  const raw = normalizeNewlines(input);
  if (raw.length === 0) {
    return { text: "", lineCount: 0 };
  }

  let lines = raw.split("\n");
  if (trimLines) {
    lines = lines.map((l) => l.trim());
  }
  if (removeEmpty) {
    lines = lines.filter((l) => l.trim() !== "");
  }

  lines.sort((a, b) =>
    compareLines(a, b, { ignoreCase, numeric, direction }),
  );

  return { text: lines.join("\n"), lineCount: lines.length };
}
