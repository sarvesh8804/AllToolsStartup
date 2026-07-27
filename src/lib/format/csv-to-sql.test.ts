import { describe, expect, it } from "vitest";
import {
  csvToSqlInsert,
  escapeSqlString,
  formatSqlValue,
  quoteSqlIdentifier,
} from "./csv-to-sql";

describe("escapeSqlString", () => {
  it("doubles single quotes", () => {
    expect(escapeSqlString("O'Brien")).toBe("O''Brien");
  });
});

describe("quoteSqlIdentifier", () => {
  it("quotes per dialect", () => {
    expect(quoteSqlIdentifier("user", "postgres")).toBe('"user"');
    expect(quoteSqlIdentifier("user", "mysql")).toBe("`user`");
    expect(quoteSqlIdentifier("user", "mssql")).toBe("[user]");
    expect(quoteSqlIdentifier("my-col", "none")).toBe("my_col");
  });
});

describe("formatSqlValue", () => {
  it("formats primitives", () => {
    expect(formatSqlValue(null)).toBe("NULL");
    expect(formatSqlValue(42)).toBe("42");
    expect(formatSqlValue(true)).toBe("TRUE");
    expect(formatSqlValue("hi")).toBe("'hi'");
    expect(formatSqlValue("", { emptyAsNull: true })).toBe("NULL");
  });
});

describe("csvToSqlInsert", () => {
  it("emits one INSERT per row by default", () => {
    const result = csvToSqlInsert(
      `name,age,active
Ada,36,true
Grace,40,false`,
      { tableName: "people", dialect: "postgres" },
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.rowCount).toBe(2);
      expect(result.statementCount).toBe(2);
      expect(result.sql).toContain(
        'INSERT INTO "people" ("name", "age", "active") VALUES (\'Ada\', 36, TRUE);',
      );
      expect(result.sql).toContain("FALSE");
    }
  });

  it("supports multi-row batches and MySQL quoting", () => {
    const result = csvToSqlInsert(
      `id,label
1,a
2,b`,
      { tableName: "items", dialect: "mysql", batchSize: 10 },
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.statementCount).toBe(1);
      expect(result.sql).toContain("INSERT INTO `items` (`id`, `label`) VALUES");
      expect(result.sql).toContain("(1, 'a'),");
      expect(result.sql).toContain("(2, 'b');");
    }
  });

  it("escapes quotes in values", () => {
    const result = csvToSqlInsert(`name\n"O'Brien"`, {
      tableName: "t",
      dialect: "none",
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.sql).toContain("'O''Brien'");
    }
  });

  it("rejects empty input", () => {
    expect(csvToSqlInsert("").ok).toBe(false);
  });
});
