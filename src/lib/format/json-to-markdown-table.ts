import { buildMarkdownTable, type CellAlign } from "@/lib/text/markdown-table";

export type JsonToMarkdownTableOptions = {
  pretty?: boolean;
  alignment?: CellAlign;
  /** Sort column keys alphabetically (default: first-row key order). */
  sortKeys?: boolean;
};

export type JsonToMarkdownTableResult =
  | {
      ok: true;
      markdown: string;
      rowCount: number;
      columnCount: number;
      columns: string[];
    }
  | { ok: false; error: string };

export const SAMPLE_JSON_TO_MARKDOWN_TABLE = `[
  { "name": "JSON Formatter", "category": "JSON & Data", "local": true },
  { "name": "CSV to JSON", "category": "CSV & Spreadsheets", "local": true },
  { "name": "Word Counter", "category": "Text Tools", "local": true }
]`;

function cellValue(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function collectColumns(
  rows: Record<string, unknown>[],
  sortKeys: boolean,
): string[] {
  const seen = new Set<string>();
  const order: string[] = [];

  for (const row of rows) {
    for (const key of Object.keys(row)) {
      if (!seen.has(key)) {
        seen.add(key);
        order.push(key);
      }
    }
  }

  return sortKeys ? [...order].sort() : order;
}

/** Convert a JSON array of objects to a GitHub-flavored Markdown table. */
export function jsonToMarkdownTable(
  input: string,
  options: JsonToMarkdownTableOptions = {},
): JsonToMarkdownTableResult {
  const pretty = options.pretty !== false;
  const sortKeys = options.sortKeys === true;
  const alignment = options.alignment ?? "left";

  const trimmed = input.replace(/^\uFEFF/, "").trim();
  if (!trimmed) {
    return { ok: false, error: "Paste JSON to convert." };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed);
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Invalid JSON",
    };
  }

  if (!Array.isArray(parsed)) {
    return { ok: false, error: "JSON must be an array of objects." };
  }

  if (parsed.length === 0) {
    return { ok: false, error: "JSON array is empty." };
  }

  const rows: Record<string, unknown>[] = [];
  for (let i = 0; i < parsed.length; i += 1) {
    const item = parsed[i];
    if (typeof item !== "object" || item === null || Array.isArray(item)) {
      return {
        ok: false,
        error: `Row ${i + 1} must be an object.`,
      };
    }
    rows.push(item as Record<string, unknown>);
  }

  const columns = collectColumns(rows, sortKeys);
  if (columns.length === 0) {
    return { ok: false, error: "No object keys found to use as columns." };
  }

  const tableRows = rows.map((row) =>
    columns.map((col) => cellValue(row[col])),
  );

  const alignments = Array.from({ length: columns.length }, () => alignment);

  const markdown = buildMarkdownTable({
    headers: columns,
    rows: tableRows,
    alignments,
    pretty,
  });

  return {
    ok: true,
    markdown,
    rowCount: rows.length,
    columnCount: columns.length,
    columns,
  };
}
