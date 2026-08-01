import {
  parseCsvLine,
  splitCsvRows,
  type CsvParseOptions,
} from "@/lib/format/csv";
import {
  buildMarkdownTable,
  type CellAlign,
} from "@/lib/text/markdown-table";

export type CsvToMarkdownOptions = Pick<
  CsvParseOptions,
  "delimiter" | "headers" | "trimFields" | "skipEmptyRows"
> & {
  pretty?: boolean;
  /** Apply one alignment to every column. */
  alignment?: CellAlign;
  alignments?: CellAlign[];
};

export type CsvToMarkdownResult =
  | {
      ok: true;
      markdown: string;
      rowCount: number;
      columnCount: number;
      columns: string[];
    }
  | { ok: false; error: string };

export const SAMPLE_CSV_TO_MARKDOWN = `name,category,local
JSON Formatter,JSON & Data Formats,true
CSV to Markdown,CSV & Spreadsheets,true
"Pipe | test","Text Tools",true
`;

function normalizeField(raw: string, trim: boolean): string {
  const value = trim ? raw.trim() : raw;
  return value;
}

function columnAlignments(
  cols: number,
  options: CsvToMarkdownOptions,
): CellAlign[] {
  if (options.alignments?.length) {
    return Array.from(
      { length: cols },
      (_, i) => options.alignments?.[i] ?? options.alignment ?? "left",
    );
  }
  const align = options.alignment ?? "left";
  return Array.from({ length: cols }, () => align);
}

/** Convert CSV text to a GitHub-flavored Markdown table. */
export function csvToMarkdown(
  input: string,
  options: CsvToMarkdownOptions = {},
): CsvToMarkdownResult {
  const delimiter = options.delimiter ?? ",";
  const headers = options.headers !== false;
  const trimFields = options.trimFields !== false;
  const skipEmptyRows = options.skipEmptyRows !== false;
  const pretty = options.pretty !== false;

  const trimmed = input.replace(/^\uFEFF/, "").trim();
  if (!trimmed) {
    return { ok: false, error: "Paste CSV to convert." };
  }

  try {
    let lines = splitCsvRows(trimmed);
    if (skipEmptyRows) {
      lines = lines.filter((line) => line.trim().length > 0);
    }
    if (lines.length === 0) {
      return { ok: false, error: "CSV has no rows." };
    }

    const parsed = lines.map((line) =>
      parseCsvLine(line, delimiter).map((cell) =>
        normalizeField(cell, trimFields),
      ),
    );

    if (!headers) {
      const cols = Math.max(...parsed.map((r) => r.length), 1);
      const headerRow = Array.from(
        { length: cols },
        (_, i) => `Column ${i + 1}`,
      );
      const alignments = columnAlignments(cols, options);

      const markdown = buildMarkdownTable({
        headers: headerRow,
        rows: parsed,
        alignments,
        pretty,
      });

      return {
        ok: true,
        markdown,
        rowCount: parsed.length,
        columnCount: cols,
        columns: headerRow,
      };
    }

    if (parsed.length < 1) {
      return { ok: false, error: "CSV has no header row." };
    }

    const headerCells = parsed[0];
    const columns = headerCells.map((h, i) => h || `Column ${i + 1}`);
    const cols = Math.max(columns.length, ...parsed.slice(1).map((r) => r.length));
    const normalizedHeaders = Array.from(
      { length: cols },
      (_, i) => columns[i] ?? `Column ${i + 1}`,
    );
    const rows = parsed.slice(1).map((cells) =>
      Array.from({ length: cols }, (_, i) => cells[i] ?? ""),
    );
    const alignments = columnAlignments(cols, options);

    const markdown = buildMarkdownTable({
      headers: normalizedHeaders,
      rows,
      alignments,
      pretty,
    });

    return {
      ok: true,
      markdown,
      rowCount: rows.length,
      columnCount: cols,
      columns: normalizedHeaders,
    };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Failed to parse CSV",
    };
  }
}
