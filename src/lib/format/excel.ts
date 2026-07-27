import * as XLSX from "xlsx";
import { parseCsvLine } from "@/lib/format/csv";

export type CsvToExcelOptions = {
  delimiter?: string;
  sheetName?: string;
};

export type CsvToExcelResult =
  | {
      ok: true;
      bytes: Uint8Array;
      rowCount: number;
      columnCount: number;
      sheetName: string;
    }
  | { ok: false; error: string };

export type ExcelToCsvOptions = {
  sheetName?: string;
  /** Prefer sheet index when name not set (default 0). */
  sheetIndex?: number;
};

export type ExcelToCsvResult =
  | {
      ok: true;
      csv: string;
      sheetName: string;
      sheetNames: string[];
      rowCount: number;
    }
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

function csvToAoA(input: string, delimiter: string): string[][] {
  const lines = splitCsvRows(input.replace(/^\uFEFF/, "").trim());
  return lines.map((line) => parseCsvLine(line, delimiter));
}

export function csvToExcel(
  input: string,
  options: CsvToExcelOptions = {},
): CsvToExcelResult {
  const delimiter = options.delimiter ?? ",";
  const sheetName = (options.sheetName?.trim() || "Sheet1").slice(0, 31);
  const trimmed = input.replace(/^\uFEFF/, "").trim();

  if (!trimmed) {
    return { ok: false, error: "Paste CSV to convert." };
  }

  try {
    const aoa = csvToAoA(trimmed, delimiter);
    if (aoa.length === 0) {
      return { ok: false, error: "CSV has no rows." };
    }

    const width = Math.max(...aoa.map((r) => r.length), 0);
    const normalized = aoa.map((row) =>
      Array.from({ length: width }, (_, i) => row[i] ?? ""),
    );

    const workbook = XLSX.utils.book_new();
    const sheet = XLSX.utils.aoa_to_sheet(normalized);
    XLSX.utils.book_append_sheet(workbook, sheet, sheetName);

    const raw = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    }) as ArrayBuffer | Uint8Array | number[];

    const bytes =
      raw instanceof Uint8Array
        ? raw
        : raw instanceof ArrayBuffer
          ? new Uint8Array(raw)
          : Uint8Array.from(raw as number[]);

    return {
      ok: true,
      bytes,
      rowCount: normalized.length,
      columnCount: width,
      sheetName,
    };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Failed to build Excel file",
    };
  }
}

export function excelToCsv(
  data: ArrayBuffer | Uint8Array,
  options: ExcelToCsvOptions = {},
): ExcelToCsvResult {
  try {
    const workbook = XLSX.read(data, { type: "array" });
    const sheetNames = workbook.SheetNames ?? [];
    if (sheetNames.length === 0) {
      return { ok: false, error: "Workbook has no sheets." };
    }

    const preferred = options.sheetName?.trim();
    const sheetName =
      preferred && sheetNames.includes(preferred)
        ? preferred
        : sheetNames[
            Math.min(
              Math.max(0, options.sheetIndex ?? 0),
              sheetNames.length - 1,
            )
          ];

    const sheet = workbook.Sheets[sheetName];
    if (!sheet) {
      return { ok: false, error: `Sheet “${sheetName}” not found.` };
    }

    const csv = XLSX.utils.sheet_to_csv(sheet);
    const rowCount = csv.trim()
      ? csv.replace(/\r\n/g, "\n").split("\n").filter((l) => l.length > 0)
          .length
      : 0;

    return {
      ok: true,
      csv: csv.endsWith("\n") ? csv : `${csv}\n`,
      sheetName,
      sheetNames,
      rowCount,
    };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Failed to read Excel file",
    };
  }
}

export function listExcelSheets(
  data: ArrayBuffer | Uint8Array,
): { ok: true; sheetNames: string[] } | { ok: false; error: string } {
  try {
    const workbook = XLSX.read(data, { type: "array", bookSheets: true });
    return { ok: true, sheetNames: workbook.SheetNames ?? [] };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Failed to read Excel file",
    };
  }
}
