import {
  csvToSqlInsert,
  type CsvToSqlInsertOptions,
  type CsvToSqlInsertResult,
} from "@/lib/format/csv-to-sql";

export type CsvToSqlBulkOptions = CsvToSqlInsertOptions & {
  /** Wrap output in BEGIN/COMMIT (default false). */
  wrapTransaction?: boolean;
  /** Prepend TRUNCATE TABLE before inserts (default false). */
  truncateFirst?: boolean;
};

export type CsvToSqlBulkResult = CsvToSqlInsertResult;

const DEFAULT_BULK_BATCH = 100;

/** Convert CSV into batched SQL INSERT statements optimized for bulk loads. */
export function csvToSqlInsertBulk(
  input: string,
  options: CsvToSqlBulkOptions = {},
): CsvToSqlBulkResult {
  const batchSize = options.batchSize ?? DEFAULT_BULK_BATCH;
  const base = csvToSqlInsert(input, { ...options, batchSize });
  if (!base.ok) return base;

  const tableName = (options.tableName ?? "my_table").trim() || "my_table";
  const dialect = options.dialect ?? "postgres";
  const prefix: string[] = [];

  if (options.truncateFirst) {
    const quoted =
      dialect === "mysql"
        ? `\`${tableName.replace(/`/g, "``")}\``
        : dialect === "mssql"
          ? `[${tableName.replace(/]/g, "]]")}]`
          : `"${tableName.replace(/"/g, '""')}"`;
    prefix.push(`TRUNCATE TABLE ${quoted};`);
  }

  let sql = base.sql;
  if (options.wrapTransaction) {
    sql = `BEGIN;\n${sql}COMMIT;\n`;
  }

  if (prefix.length > 0) {
    sql = `${prefix.join("\n")}\n${sql}`;
  }

  return { ...base, sql };
}

export const DEFAULT_BULK_BATCH_SIZE = DEFAULT_BULK_BATCH;
