import { parseCsvLine } from "@/lib/format/csv";

export type CsvTable = {
  columns: string[];
  rows: string[][];
  rowCount: number;
  columnCount: number;
};

export type CsvTableResult =
  | { ok: true; value: CsvTable }
  | { ok: false; error: string };

function splitCsvRows(input: string): string[] {
  const rows: string[] = [];
  let cur = "";
  let inQuotes = false;

  for (let i = 0; i < input.length; i += 1) {
    const ch = input[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
      cur += ch;
      continue;
    }
    if (!inQuotes && (ch === "\n" || ch === "\r")) {
      if (ch === "\r" && input[i + 1] === "\n") i += 1;
      rows.push(cur);
      cur = "";
      continue;
    }
    cur += ch;
  }
  if (cur.length > 0 || input.endsWith("\n") || input.endsWith("\r")) {
    rows.push(cur);
  }
  return rows.filter((r, idx, arr) => !(r === "" && idx === arr.length - 1));
}

export function parseCsvTable(
  input: string,
  options: { delimiter?: string; headers?: boolean } = {},
): CsvTableResult {
  const delimiter = options.delimiter ?? ",";
  const headers = options.headers !== false;
  const trimmed = input.replace(/^\uFEFF/, "").trim();

  if (!trimmed) {
    return { ok: false, error: "Paste CSV to preview as a table." };
  }

  try {
    const lines = splitCsvRows(trimmed);
    if (lines.length === 0) {
      return { ok: false, error: "CSV has no rows." };
    }

    const parsed = lines.map((line) => parseCsvLine(line, delimiter));
    const width = Math.max(...parsed.map((r) => r.length), 0);

    if (headers) {
      const columns = Array.from({ length: width }, (_, i) => {
        const h = parsed[0][i]?.trim();
        return h || `Column ${i + 1}`;
      });
      const rows = parsed.slice(1).map((cols) =>
        Array.from({ length: width }, (_, i) => cols[i] ?? ""),
      );
      return {
        ok: true,
        value: {
          columns,
          rows,
          rowCount: rows.length,
          columnCount: width,
        },
      };
    }

    const columns = Array.from(
      { length: width },
      (_, i) => `Column ${i + 1}`,
    );
    const rows = parsed.map((cols) =>
      Array.from({ length: width }, (_, i) => cols[i] ?? ""),
    );
    return {
      ok: true,
      value: {
        columns,
        rows,
        rowCount: rows.length,
        columnCount: width,
      },
    };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Failed to parse CSV",
    };
  }
}

export function sortCsvRows(
  rows: string[][],
  columnIndex: number,
  direction: "asc" | "desc",
): string[][] {
  const mult = direction === "asc" ? 1 : -1;
  return [...rows].sort((a, b) => {
    const av = a[columnIndex] ?? "";
    const bv = b[columnIndex] ?? "";
    const an = Number(av);
    const bn = Number(bv);
    if (av !== "" && bv !== "" && Number.isFinite(an) && Number.isFinite(bn)) {
      return (an - bn) * mult;
    }
    return av.localeCompare(bv, undefined, { sensitivity: "base" }) * mult;
  });
}

export function filterCsvRows(
  rows: string[][],
  query: string,
): string[][] {
  const q = query.trim().toLowerCase();
  if (!q) return rows;
  return rows.filter((row) =>
    row.some((cell) => cell.toLowerCase().includes(q)),
  );
}
