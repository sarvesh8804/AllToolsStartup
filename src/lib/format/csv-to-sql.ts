import { csvToJson } from "@/lib/format/csv";

export type SqlDialect = "mysql" | "postgres" | "sqlite" | "mssql" | "none";

export type CsvToSqlInsertOptions = {
  tableName?: string;
  delimiter?: string;
  /** First row is headers (default true). */
  headers?: boolean;
  /** Infer numbers / booleans / null (default true). */
  inferTypes?: boolean;
  trimFields?: boolean;
  skipEmptyRows?: boolean;
  /** Quote style for identifiers (default "postgres"). */
  dialect?: SqlDialect;
  /**
   * Rows per INSERT statement. 1 = one statement per row.
   * Higher values emit multi-row VALUES lists (default 1).
   */
  batchSize?: number;
  /** Treat empty strings as NULL (default false). */
  emptyAsNull?: boolean;
};

export type CsvToSqlInsertResult =
  | {
      ok: true;
      sql: string;
      rowCount: number;
      columnCount: number;
      statementCount: number;
    }
  | { ok: false; error: string };

function clamp(n: number, min: number, max: number): number {
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, Math.floor(n)));
}

/** Escape a SQL string literal (single-quote style). */
export function escapeSqlString(value: string): string {
  return value.replace(/'/g, "''");
}

export function quoteSqlIdentifier(
  name: string,
  dialect: SqlDialect = "postgres",
): string {
  const trimmed = name.trim();
  if (!trimmed) return quoteSqlIdentifier("column", dialect);

  if (dialect === "none") {
    // Keep only safe unquoted identifiers
    const safe = trimmed.replace(/[^A-Za-z0-9_]/g, "_");
    const withLead = /^[A-Za-z_]/.test(safe) ? safe : `c_${safe}`;
    return withLead || "column";
  }

  if (dialect === "mysql") {
    return `\`${trimmed.replace(/`/g, "``")}\``;
  }
  if (dialect === "mssql") {
    return `[${trimmed.replace(/]/g, "]]")}]`;
  }
  // postgres / sqlite
  return `"${trimmed.replace(/"/g, '""')}"`;
}

export function formatSqlValue(
  value: unknown,
  options: { emptyAsNull?: boolean } = {},
): string {
  if (value === null || value === undefined) return "NULL";
  if (typeof value === "number") {
    if (!Number.isFinite(value)) return "NULL";
    return String(value);
  }
  if (typeof value === "boolean") return value ? "TRUE" : "FALSE";
  if (typeof value === "string") {
    if (options.emptyAsNull && value === "") return "NULL";
    return `'${escapeSqlString(value)}'`;
  }
  return `'${escapeSqlString(JSON.stringify(value))}'`;
}

function sanitizeTableName(raw: string, dialect: SqlDialect): string {
  const name = raw.trim() || "my_table";
  return quoteSqlIdentifier(name, dialect);
}

/**
 * Convert CSV text into SQL INSERT statements.
 */
export function csvToSqlInsert(
  input: string,
  options: CsvToSqlInsertOptions = {},
): CsvToSqlInsertResult {
  const dialect = options.dialect ?? "postgres";
  const batchSize = clamp(options.batchSize ?? 1, 1, 500);
  const emptyAsNull = options.emptyAsNull ?? false;
  const table = sanitizeTableName(options.tableName ?? "my_table", dialect);

  const parsed = csvToJson(input, {
    delimiter: options.delimiter ?? ",",
    headers: options.headers !== false,
    inferTypes: options.inferTypes !== false,
    trimFields: options.trimFields !== false,
    skipEmptyRows: options.skipEmptyRows !== false,
    output: "objects",
    spaces: 0,
  });

  if (!parsed.ok) return parsed;

  if (parsed.rows.length === 0) {
    return { ok: false, error: "CSV has a header but no data rows." };
  }

  const columns = parsed.columns;
  if (columns.length === 0) {
    return { ok: false, error: "CSV has no columns." };
  }

  const colList = columns
    .map((c) => quoteSqlIdentifier(c, dialect))
    .join(", ");

  const valueRows = (parsed.rows as Record<string, unknown>[]).map((row) => {
    const values = columns
      .map((c) => formatSqlValue(row[c], { emptyAsNull }))
      .join(", ");
    return `(${values})`;
  });

  const statements: string[] = [];
  for (let i = 0; i < valueRows.length; i += batchSize) {
    const chunk = valueRows.slice(i, i + batchSize);
    if (batchSize === 1) {
      statements.push(`INSERT INTO ${table} (${colList}) VALUES ${chunk[0]};`);
    } else {
      statements.push(
        `INSERT INTO ${table} (${colList}) VALUES\n  ${chunk.join(",\n  ")};`,
      );
    }
  }

  return {
    ok: true,
    sql: statements.join("\n") + "\n",
    rowCount: valueRows.length,
    columnCount: columns.length,
    statementCount: statements.length,
  };
}
