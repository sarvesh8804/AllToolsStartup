import {
  parseCsvLine,
  splitCsvRows,
  type CsvParseOptions,
} from "@/lib/format/csv";
import {
  buildHtmlTable,
  type CellAlign,
} from "@/lib/html/table";

export type CsvToHtmlTableOptions = Pick<
  CsvParseOptions,
  "delimiter" | "headers" | "trimFields" | "skipEmptyRows"
> & {
  border?: boolean;
  useSections?: boolean;
  accessible?: boolean;
  caption?: string;
  tableClass?: string;
  alignment?: CellAlign;
};

export type CsvToHtmlTableResult =
  | {
      ok: true;
      html: string;
      rowCount: number;
      columnCount: number;
      columns: string[];
    }
  | { ok: false; error: string };

export const SAMPLE_CSV_TO_HTML = `name,category,local
JSON Formatter,JSON & Data Formats,true
CSV to HTML Table,CSV & Spreadsheets,true
"Pipe | test","Text Tools",true
`;

function normalizeField(raw: string, trim: boolean): string {
  return trim ? raw.trim() : raw;
}

/** Convert CSV text into an HTML table string. */
export function csvToHtmlTable(
  input: string,
  options: CsvToHtmlTableOptions = {},
): CsvToHtmlTableResult {
  const delimiter = options.delimiter ?? ",";
  const headers = options.headers !== false;
  const trimFields = options.trimFields !== false;
  const skipEmptyRows = options.skipEmptyRows !== false;

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

    let headerRow: string[];
    let bodyRows: string[][];

    if (!headers) {
      const cols = Math.max(...parsed.map((r) => r.length), 1);
      headerRow = Array.from({ length: cols }, (_, i) => `Column ${i + 1}`);
      bodyRows = parsed;
    } else {
      if (parsed.length < 1) {
        return { ok: false, error: "CSV has no header row." };
      }
      const headerCells = parsed[0]!;
      const cols = Math.max(
        headerCells.length,
        ...parsed.slice(1).map((r) => r.length),
      );
      headerRow = Array.from(
        { length: cols },
        (_, i) => headerCells[i] || `Column ${i + 1}`,
      );
      bodyRows = parsed.slice(1).map((cells) =>
        Array.from({ length: cols }, (_, i) => cells[i] ?? ""),
      );
    }

    const cols = headerRow.length;
    const alignments = Array.from(
      { length: cols },
      () => options.alignment ?? "left",
    );

    const html = buildHtmlTable({
      headers: headerRow,
      rows: bodyRows,
      alignments,
      caption: options.caption ?? "",
      border: options.border !== false,
      useSections: options.useSections !== false,
      accessible: options.accessible !== false,
      tableClass: options.tableClass ?? "",
    });

    return {
      ok: true,
      html,
      rowCount: bodyRows.length,
      columnCount: cols,
      columns: headerRow,
    };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Failed to parse CSV",
    };
  }
}
