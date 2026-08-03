import { csvToJson } from "@/lib/format/csv";

export type CsvDiffRowStatus = "equal" | "added" | "removed" | "changed";

export type CsvDiffRow = {
  status: CsvDiffRowStatus;
  left?: Record<string, unknown>;
  right?: Record<string, unknown>;
  key: string;
  changedColumns?: string[];
};

export type CsvDiffResult =
  | {
      ok: true;
      rows: CsvDiffRow[];
      stats: {
        equal: number;
        added: number;
        removed: number;
        changed: number;
      };
      columns: string[];
    }
  | { ok: false; error: string };

export type CsvDiffOptions = {
  delimiter?: string;
  keyColumn?: string;
  headers?: boolean;
};

function rowKey(row: Record<string, unknown>, keyColumn?: string): string {
  if (keyColumn && keyColumn in row) return String(row[keyColumn]);
  return JSON.stringify(row);
}

/** Diff two CSV files by key column or full row content. */
export function diffCsv(
  leftInput: string,
  rightInput: string,
  options: CsvDiffOptions = {},
): CsvDiffResult {
  const delimiter = options.delimiter ?? ",";
  const headers = options.headers !== false;

  const leftParsed = csvToJson(leftInput, {
    delimiter,
    headers,
    inferTypes: false,
    output: "objects",
  });
  const rightParsed = csvToJson(rightInput, {
    delimiter,
    headers,
    inferTypes: false,
    output: "objects",
  });

  if (!leftParsed.ok) return leftParsed;
  if (!rightParsed.ok) return rightParsed;

  const columns = [
    ...new Set([...leftParsed.columns, ...rightParsed.columns]),
  ];

  const leftRows = leftParsed.rows as Record<string, unknown>[];
  const rightRows = rightParsed.rows as Record<string, unknown>[];

  const leftMap = new Map<string, Record<string, unknown>>();
  const rightMap = new Map<string, Record<string, unknown>>();

  for (const row of leftRows) leftMap.set(rowKey(row, options.keyColumn), row);
  for (const row of rightRows) {
    rightMap.set(rowKey(row, options.keyColumn), row);
  }

  const keys = new Set([...leftMap.keys(), ...rightMap.keys()]);
  const rows: CsvDiffRow[] = [];
  const stats = { equal: 0, added: 0, removed: 0, changed: 0 };

  for (const key of keys) {
    const left = leftMap.get(key);
    const right = rightMap.get(key);

    if (left && right) {
      const changedColumns = columns.filter(
        (col) => String(left[col] ?? "") !== String(right[col] ?? ""),
      );
      if (changedColumns.length === 0) {
        rows.push({ status: "equal", left, right, key });
        stats.equal += 1;
      } else {
        rows.push({ status: "changed", left, right, key, changedColumns });
        stats.changed += 1;
      }
      continue;
    }

    if (left) {
      rows.push({ status: "removed", left, key });
      stats.removed += 1;
    } else if (right) {
      rows.push({ status: "added", right, key });
      stats.added += 1;
    }
  }

  return { ok: true, rows, stats, columns };
}

export const SAMPLE_CSV_LEFT = `id,name,role
1,Ada,admin
2,Grace,editor
`;

export const SAMPLE_CSV_RIGHT = `id,name,role
1,Ada,admin
2,Grace,manager
3,Alan,viewer
`;
