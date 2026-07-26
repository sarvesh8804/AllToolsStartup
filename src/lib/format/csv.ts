export type CsvParseOptions = {
  delimiter?: string;
  /** Treat first row as headers (default true). */
  headers?: boolean;
};

export type CsvToJsonResult =
  | { ok: true; json: string; rows: unknown[]; columns: string[] }
  | { ok: false; error: string };

export type JsonToCsvResult =
  | { ok: true; csv: string; columns: string[]; rowCount: number }
  | { ok: false; error: string };

/** Parse a single CSV line respecting quotes. */
export function parseCsvLine(line: string, delimiter = ","): string[] {
  const fields: string[] = [];
  let cur = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          cur += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        cur += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === delimiter) {
      fields.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  fields.push(cur);
  return fields;
}

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

function inferValue(raw: string): string | number | boolean | null {
  const t = raw.trim();
  if (t === "") return "";
  if (t === "null") return null;
  if (t === "true") return true;
  if (t === "false") return false;
  if (/^-?\d+(\.\d+)?$/.test(t)) return Number(t);
  return raw;
}

export function csvToJson(
  input: string,
  options: CsvParseOptions & { spaces?: number } = {},
): CsvToJsonResult {
  const delimiter = options.delimiter ?? ",";
  const headers = options.headers !== false;
  const spaces = options.spaces ?? 2;

  const trimmed = input.replace(/^\uFEFF/, "").trim();
  if (!trimmed) {
    return { ok: false, error: "Paste CSV to convert." };
  }

  try {
    const lines = splitCsvRows(trimmed);
    if (lines.length === 0) {
      return { ok: false, error: "CSV has no rows." };
    }

    const parsed = lines.map((line) => parseCsvLine(line, delimiter));

    if (!headers) {
      const rows = parsed.map((cols) => cols.map(inferValue));
      return {
        ok: true,
        rows,
        columns: parsed[0]?.map((_, i) => `column_${i + 1}`) ?? [],
        json: JSON.stringify(rows, null, spaces) + "\n",
      };
    }

    const columns = parsed[0].map((h, i) => h.trim() || `column_${i + 1}`);
    const rows = parsed.slice(1).map((cols) => {
      const obj: Record<string, unknown> = {};
      for (let i = 0; i < columns.length; i += 1) {
        obj[columns[i]] = inferValue(cols[i] ?? "");
      }
      return obj;
    });

    return {
      ok: true,
      rows,
      columns,
      json: JSON.stringify(rows, null, spaces) + "\n",
    };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Failed to parse CSV",
    };
  }
}

function escapeCsvField(value: unknown, delimiter: string): string {
  if (value === null || value === undefined) return "";
  const str =
    typeof value === "object" ? JSON.stringify(value) : String(value);
  if (
    str.includes('"') ||
    str.includes(delimiter) ||
    str.includes("\n") ||
    str.includes("\r")
  ) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function jsonToCsv(
  input: string,
  options: { delimiter?: string } = {},
): JsonToCsvResult {
  const delimiter = options.delimiter ?? ",";
  const trimmed = input.trim();
  if (!trimmed) {
    return { ok: false, error: "Paste JSON to convert." };
  }

  let value: unknown;
  try {
    value = JSON.parse(trimmed);
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Invalid JSON",
    };
  }

  if (!Array.isArray(value)) {
    return { ok: false, error: "JSON must be an array of objects (or arrays)." };
  }

  if (value.length === 0) {
    return { ok: true, csv: "", columns: [], rowCount: 0 };
  }

  // Array of arrays
  if (Array.isArray(value[0])) {
    const rows = value as unknown[][];
    const csv = rows
      .map((row) =>
        row.map((cell) => escapeCsvField(cell, delimiter)).join(delimiter),
      )
      .join("\n");
    return {
      ok: true,
      csv: csv + "\n",
      columns: rows[0]?.map((_, i) => `column_${i + 1}`) ?? [],
      rowCount: rows.length,
    };
  }

  if (typeof value[0] !== "object" || value[0] === null) {
    return {
      ok: false,
      error: "JSON array items must be objects or arrays.",
    };
  }

  const columns: string[] = [];
  const seen = new Set<string>();
  for (const row of value as Record<string, unknown>[]) {
    for (const key of Object.keys(row)) {
      if (!seen.has(key)) {
        seen.add(key);
        columns.push(key);
      }
    }
  }

  const lines = [
    columns.map((c) => escapeCsvField(c, delimiter)).join(delimiter),
    ...(value as Record<string, unknown>[]).map((row) =>
      columns.map((c) => escapeCsvField(row[c], delimiter)).join(delimiter),
    ),
  ];

  return {
    ok: true,
    csv: lines.join("\n") + "\n",
    columns,
    rowCount: value.length,
  };
}
