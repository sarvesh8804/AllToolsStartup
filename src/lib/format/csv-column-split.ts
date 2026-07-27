import { parseCsvLine, splitCsvRows } from "@/lib/format/csv";

export type ColumnSplitMode = "columns" | "rows";

export type CsvColumnSplitOptions = {
  delimiter?: string;
  /** Column name or 0-based index to split. */
  column: string;
  /** Separator inside the cell (default "|"). */
  splitOn: string;
  mode: ColumnSplitMode;
  /**
   * columns mode: keep the original column alongside new part columns.
   * rows mode: add `{column}_original` with the unsplit value.
   */
  keepOriginal?: boolean;
  /** Max parts when mode=columns (0 = unlimited). */
  maxParts?: number;
  /** Prefix for new column names when mode=columns. */
  namePrefix?: string;
};

export type CsvColumnSplitResult =
  | {
      ok: true;
      csv: string;
      columns: string[];
      rowCount: number;
      partCount: number;
    }
  | { ok: false; error: string };

function escapeField(value: string, delimiter: string): string {
  if (
    value.includes('"') ||
    value.includes(delimiter) ||
    value.includes("\n") ||
    value.includes("\r")
  ) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function serialize(rows: string[][], delimiter: string): string {
  return (
    rows
      .map((r) => r.map((c) => escapeField(c, delimiter)).join(delimiter))
      .join("\n") + "\n"
  );
}

function resolveColumnIndex(headers: string[], column: string): number {
  const trimmed = column.trim();
  if (/^\d+$/.test(trimmed)) {
    return Number(trimmed);
  }
  return headers.findIndex(
    (h) => h.trim().toLowerCase() === trimmed.toLowerCase(),
  );
}

function splitCell(value: string, splitOn: string, maxParts: number): string[] {
  if (!splitOn) return [value];
  if (maxParts > 0) {
    const parts = value.split(splitOn);
    if (parts.length <= maxParts) return parts.map((p) => p.trim());
    const head = parts.slice(0, maxParts - 1).map((p) => p.trim());
    const tail = parts.slice(maxParts - 1).join(splitOn).trim();
    return [...head, tail];
  }
  return value.split(splitOn).map((p) => p.trim());
}

/** Split one CSV column by a delimiter into extra columns or exploded rows. */
export function splitCsvColumn(
  input: string,
  options: CsvColumnSplitOptions,
): CsvColumnSplitResult {
  const delimiter = options.delimiter ?? ",";
  const splitOn = options.splitOn;
  const mode = options.mode;
  const keepOriginal = options.keepOriginal === true;
  const maxParts = Math.max(0, Math.floor(options.maxParts ?? 0));

  const trimmed = input.replace(/^\uFEFF/, "").trim();
  if (!trimmed) {
    return { ok: false, error: "Paste CSV to split a column." };
  }
  if (!splitOn) {
    return { ok: false, error: "Set a split separator (e.g. | or ;)." };
  }

  try {
    const lines = splitCsvRows(trimmed).filter((l) => l.trim().length > 0);
    if (lines.length === 0) {
      return { ok: false, error: "CSV has no rows." };
    }

    const parsed = lines.map((line) => parseCsvLine(line, delimiter));
    const headers = parsed[0]!.map((h, i) => h.trim() || `column_${i + 1}`);
    const data = parsed.slice(1);
    if (data.length === 0) {
      return {
        ok: false,
        error: "CSV needs a header row and at least one data row.",
      };
    }

    const colIndex = resolveColumnIndex(headers, options.column);
    if (colIndex < 0 || colIndex >= headers.length) {
      return {
        ok: false,
        error: `Column “${options.column}” not found. Use a header name or 0-based index.`,
      };
    }

    const width = Math.max(headers.length, ...data.map((r) => r.length));
    const pad = (row: string[]) =>
      Array.from({ length: width }, (_, i) => row[i] ?? "");

    const allParts = data.map((row) =>
      splitCell(pad(row)[colIndex]!, splitOn, maxParts),
    );
    const partCount = Math.max(0, ...allParts.map((p) => p.length));
    const sourceName = headers[colIndex]!;

    if (mode === "rows") {
      const originalName = `${sourceName}_original`;
      const outHeaders = keepOriginal
        ? [
            ...headers.slice(0, colIndex),
            originalName,
            ...headers.slice(colIndex),
          ]
        : headers;
      const outRows: string[][] = [outHeaders];

      for (let r = 0; r < data.length; r += 1) {
        const row = pad(data[r]!);
        const original = row[colIndex]!;
        const parts = allParts[r]!.length ? allParts[r]! : [""];
        for (const part of parts) {
          if (keepOriginal) {
            outRows.push([
              ...row.slice(0, colIndex),
              original,
              part,
              ...row.slice(colIndex + 1),
            ]);
          } else {
            const next = [...row];
            next[colIndex] = part;
            outRows.push(next);
          }
        }
      }

      return {
        ok: true,
        csv: serialize(outRows, delimiter),
        columns: outHeaders,
        rowCount: outRows.length - 1,
        partCount,
      };
    }

    const prefix =
      (options.namePrefix?.trim() ||
        `${sourceName.replace(/\s+/g, "_") || "part"}`);
    const newNames = Array.from(
      { length: partCount },
      (_, i) => `${prefix}_${i + 1}`,
    );
    const outHeaders = keepOriginal
      ? [
          ...headers.slice(0, colIndex + 1),
          ...newNames,
          ...headers.slice(colIndex + 1),
        ]
      : [
          ...headers.slice(0, colIndex),
          ...newNames,
          ...headers.slice(colIndex + 1),
        ];

    const outRows: string[][] = [outHeaders];
    for (let r = 0; r < data.length; r += 1) {
      const row = pad(data[r]!);
      const parts = [...allParts[r]!];
      while (parts.length < partCount) parts.push("");
      if (keepOriginal) {
        outRows.push([
          ...row.slice(0, colIndex + 1),
          ...parts,
          ...row.slice(colIndex + 1),
        ]);
      } else {
        outRows.push([
          ...row.slice(0, colIndex),
          ...parts,
          ...row.slice(colIndex + 1),
        ]);
      }
    }

    return {
      ok: true,
      csv: serialize(outRows, delimiter),
      columns: outHeaders,
      rowCount: outRows.length - 1,
      partCount,
    };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Failed to split CSV column",
    };
  }
}

/** List header names from CSV (empty if none). */
export function listCsvHeaders(input: string, delimiter = ","): string[] {
  const trimmed = input.replace(/^\uFEFF/, "").trim();
  if (!trimmed) return [];
  const lines = splitCsvRows(trimmed).filter((l) => l.trim().length > 0);
  if (lines.length === 0) return [];
  return parseCsvLine(lines[0]!, delimiter).map(
    (h, i) => h.trim() || `column_${i + 1}`,
  );
}
