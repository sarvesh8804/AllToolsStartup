import { csvToJson, jsonToCsv, splitCsvRows, parseCsvLine } from "@/lib/format/csv";

export type CsvCleanerOptions = {
  delimiter?: string;
  trimFields?: boolean;
  removeEmptyRows?: boolean;
  dedupeRows?: boolean;
  dedupeKey?: string;
  headers?: boolean;
};

export type CsvCleanerResult =
  | {
      ok: true;
      csv: string;
      inputRows: number;
      outputRows: number;
      removedRows: number;
    }
  | { ok: false; error: string };

function rowKey(
  row: Record<string, unknown>,
  key: string | undefined,
): string {
  if (key && key in row) return String(row[key]);
  return JSON.stringify(row);
}

/** Clean CSV data by trimming, deduping, and removing empty rows. */
export function cleanCsv(
  input: string,
  options: CsvCleanerOptions = {},
): CsvCleanerResult {
  const delimiter = options.delimiter ?? ",";
  const headers = options.headers !== false;
  const trimFields = options.trimFields !== false;
  const removeEmptyRows = options.removeEmptyRows !== false;
  const dedupeRows = options.dedupeRows !== false;

  const parsed = csvToJson(input, {
    delimiter,
    headers,
    inferTypes: false,
    trimFields,
    skipEmptyRows: false,
    output: "objects",
  });

  if (!parsed.ok) return parsed;

  const inputRows = parsed.rows.length;
  let rows = parsed.rows as Record<string, unknown>[];

  if (removeEmptyRows) {
    rows = rows.filter((row) =>
      Object.values(row).some((value) => String(value ?? "").trim() !== ""),
    );
  }

  if (dedupeRows) {
    const seen = new Set<string>();
    rows = rows.filter((row) => {
      const key = rowKey(row, options.dedupeKey);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  const csvResult = jsonToCsv(JSON.stringify(rows), { delimiter });
  if (!csvResult.ok) return csvResult;

  return {
    ok: true,
    csv: csvResult.csv,
    inputRows,
    outputRows: rows.length,
    removedRows: inputRows - rows.length,
  };
}

/** Trim whitespace from raw CSV fields without changing structure. */
export function trimCsvFields(
  input: string,
  delimiter = ",",
): CsvCleanerResult {
  const rows = splitCsvRows(input);
  if (rows.length === 0) {
    return { ok: false, error: "CSV is empty." };
  }

  const cleaned = rows
    .map((row) =>
      parseCsvLine(row, delimiter)
        .map((field) => field.trim())
        .join(delimiter),
    )
    .join("\n");

  return {
    ok: true,
    csv: cleaned.endsWith("\n") ? cleaned : `${cleaned}\n`,
    inputRows: rows.length,
    outputRows: rows.length,
    removedRows: 0,
  };
}

export const SAMPLE_CSV_DIRTY = `name, email ,role
Ada,ada@example.com,admin
Ada,ada@example.com,admin
 , ,
Grace ,grace@example.com,editor
`;
