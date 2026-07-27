import { describe, expect, it } from "vitest";
import {
  filterCsvRows,
  parseCsvTable,
  sortCsvRows,
} from "./csv-table";

describe("parseCsvTable", () => {
  it("parses headered CSV", () => {
    const result = parseCsvTable("name,count\nForge,3\nAlpha,1");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.columns).toEqual(["name", "count"]);
      expect(result.value.rowCount).toBe(2);
      expect(result.value.rows[0]).toEqual(["Forge", "3"]);
    }
  });

  it("handles quoted commas", () => {
    const result = parseCsvTable('city,note\n"Sao Paulo","a, b"');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.rows[0][0]).toBe("Sao Paulo");
      expect(result.value.rows[0][1]).toBe("a, b");
    }
  });

  it("supports headerless mode", () => {
    const result = parseCsvTable("a,b\nc,d", { headers: false });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.columns[0]).toBe("Column 1");
      expect(result.value.rowCount).toBe(2);
    }
  });
});

describe("sortCsvRows / filterCsvRows", () => {
  const rows = [
    ["b", "2"],
    ["a", "10"],
    ["c", "1"],
  ];

  it("sorts numerically when possible", () => {
    expect(sortCsvRows(rows, 1, "asc").map((r) => r[1])).toEqual([
      "1",
      "2",
      "10",
    ]);
  });

  it("filters by query", () => {
    expect(filterCsvRows(rows, "a")).toEqual([["a", "10"]]);
  });
});
