export type DiffSide = {
  lineNumber: number | null;
  text: string;
  type: "equal" | "add" | "remove" | "empty";
};

export type DiffRow = {
  left: DiffSide;
  right: DiffSide;
};

export type DiffStats = {
  additions: number;
  deletions: number;
  unchanged: number;
};

export type DiffResult = {
  rows: DiffRow[];
  stats: DiffStats;
};

export type InlineSeg = {
  text: string;
  type: "equal" | "add" | "remove";
};

export type InlineDiffLine = {
  kind: "equal" | "add" | "remove" | "replace";
  leftNumber: number | null;
  rightNumber: number | null;
  /** Full line text for equal/add/remove; for replace, joined display. */
  text: string;
  segments?: InlineSeg[];
};

function splitLines(text: string): string[] {
  if (text.length === 0) return [];
  return text.split(/\r\n|\n|\r/);
}

/** LCS lengths table for two string arrays. */
function lcsTable(a: string[], b: string[]): number[][] {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    Array.from({ length: n + 1 }, () => 0),
  );
  for (let i = 1; i <= m; i += 1) {
    for (let j = 1; j <= n; j += 1) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1] + 1
          : Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
  }
  return dp;
}

type RawOp =
  | { type: "equal"; text: string }
  | { type: "remove"; text: string }
  | { type: "add"; text: string };

function backtrack(a: string[], b: string[], dp: number[][]): RawOp[] {
  const ops: RawOp[] = [];
  let i = a.length;
  let j = b.length;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && a[i - 1] === b[j - 1]) {
      ops.push({ type: "equal", text: a[i - 1] });
      i -= 1;
      j -= 1;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      ops.push({ type: "add", text: b[j - 1] });
      j -= 1;
    } else {
      ops.push({ type: "remove", text: a[i - 1] });
      i -= 1;
    }
  }
  ops.reverse();
  return ops;
}

/** Pair adjacent remove/add into side-by-side replace rows. */
function toRows(ops: RawOp[]): DiffRow[] {
  const rows: DiffRow[] = [];
  let leftNo = 1;
  let rightNo = 1;
  let i = 0;

  while (i < ops.length) {
    const op = ops[i];
    if (op.type === "equal") {
      rows.push({
        left: { lineNumber: leftNo++, text: op.text, type: "equal" },
        right: { lineNumber: rightNo++, text: op.text, type: "equal" },
      });
      i += 1;
      continue;
    }

    const removes: string[] = [];
    const adds: string[] = [];
    while (i < ops.length && ops[i].type === "remove") {
      removes.push(ops[i].text);
      i += 1;
    }
    while (i < ops.length && ops[i].type === "add") {
      adds.push(ops[i].text);
      i += 1;
    }

    const max = Math.max(removes.length, adds.length);
    for (let k = 0; k < max; k += 1) {
      const leftText = removes[k];
      const rightText = adds[k];
      rows.push({
        left:
          leftText !== undefined
            ? { lineNumber: leftNo++, text: leftText, type: "remove" }
            : { lineNumber: null, text: "", type: "empty" },
        right:
          rightText !== undefined
            ? { lineNumber: rightNo++, text: rightText, type: "add" }
            : { lineNumber: null, text: "", type: "empty" },
      });
    }
  }

  return rows;
}

function tokenizeWords(line: string): string[] {
  return line.match(/\s+|[^\s]+/g) ?? [];
}

/** Word-level segments for a changed line pair. */
export function wordDiffSegments(left: string, right: string): InlineSeg[] {
  const a = tokenizeWords(left);
  const b = tokenizeWords(right);
  const dp = lcsTable(a, b);
  const ops = backtrack(a, b, dp);
  return ops.map((op) => ({
    text: op.text,
    type: op.type === "equal" ? "equal" : op.type === "add" ? "add" : "remove",
  }));
}

export function diffLines(left: string, right: string): DiffResult {
  const a = splitLines(left);
  const b = splitLines(right);
  const dp = lcsTable(a, b);
  const ops = backtrack(a, b, dp);
  const rows = toRows(ops);

  let additions = 0;
  let deletions = 0;
  let unchanged = 0;
  for (const row of rows) {
    if (row.left.type === "equal") unchanged += 1;
    if (row.left.type === "remove") deletions += 1;
    if (row.right.type === "add") additions += 1;
  }

  return { rows, stats: { additions, deletions, unchanged } };
}

/** Single-column inline view with word highlights on replacements. */
export function diffInline(
  left: string,
  right: string,
): {
  lines: InlineDiffLine[];
  stats: DiffStats;
} {
  const { rows, stats } = diffLines(left, right);
  const lines: InlineDiffLine[] = [];

  for (const row of rows) {
    if (row.left.type === "equal") {
      lines.push({
        kind: "equal",
        leftNumber: row.left.lineNumber,
        rightNumber: row.right.lineNumber,
        text: row.left.text,
      });
      continue;
    }

    if (row.left.type === "remove" && row.right.type === "add") {
      lines.push({
        kind: "replace",
        leftNumber: row.left.lineNumber,
        rightNumber: row.right.lineNumber,
        text: row.right.text,
        segments: wordDiffSegments(row.left.text, row.right.text),
      });
      continue;
    }

    if (row.left.type === "remove") {
      lines.push({
        kind: "remove",
        leftNumber: row.left.lineNumber,
        rightNumber: null,
        text: row.left.text,
      });
    }
    if (row.right.type === "add") {
      lines.push({
        kind: "add",
        leftNumber: null,
        rightNumber: row.right.lineNumber,
        text: row.right.text,
      });
    }
  }

  return { lines, stats };
}

export function unifiedDiff(left: string, right: string): string {
  const { rows } = diffLines(left, right);
  const out: string[] = [];
  for (const row of rows) {
    if (row.left.type === "equal") {
      out.push(`  ${row.left.text}`);
    } else {
      if (row.left.type === "remove") out.push(`- ${row.left.text}`);
      if (row.right.type === "add") out.push(`+ ${row.right.text}`);
    }
  }
  return out.join("\n");
}
