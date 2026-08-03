import { describe, expect, it } from "vitest";
import { csvToSqlInsertBulk } from "./csv-to-sql-bulk";

const SAMPLE = `id,name
1,Ada
2,Grace
3,Alan
`;

describe("csvToSqlInsertBulk", () => {
  it("defaults to larger batch size", () => {
    const rows = Array.from({ length: 5 }, (_, i) => `${i + 1},User${i + 1}`);
    const csv = `id,name\n${rows.join("\n")}\n`;
    const result = csvToSqlInsertBulk(csv, { tableName: "users" });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.statementCount).toBe(1);
    expect(result.sql).toContain("VALUES");
  });

  it("can wrap in a transaction", () => {
    const result = csvToSqlInsertBulk(SAMPLE, {
      tableName: "people",
      wrapTransaction: true,
      batchSize: 10,
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.sql.startsWith("BEGIN;")).toBe(true);
    expect(result.sql).toContain("COMMIT;");
  });
});
