import { describe, expect, it } from "vitest";
import { listCsvHeaders, splitCsvColumn } from "./csv-column-split";

const SAMPLE = `name,tags,city
Ada,"ml|ai|math",London
Grace,"navy|cobol",New York
`;

describe("splitCsvColumn", () => {
  it("lists headers", () => {
    expect(listCsvHeaders(SAMPLE)).toEqual(["name", "tags", "city"]);
  });

  it("splits into new columns", () => {
    const result = splitCsvColumn(SAMPLE, {
      column: "tags",
      splitOn: "|",
      mode: "columns",
      keepOriginal: false,
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.columns).toEqual([
      "name",
      "tags_1",
      "tags_2",
      "tags_3",
      "city",
    ]);
    expect(result.csv).toContain("Ada,ml,ai,math,London");
    expect(result.partCount).toBe(3);
  });

  it("keeps original column when requested", () => {
    const result = splitCsvColumn(SAMPLE, {
      column: "tags",
      splitOn: "|",
      mode: "columns",
      keepOriginal: true,
      maxParts: 2,
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.columns).toContain("tags");
    expect(result.columns).toContain("tags_1");
    expect(result.columns).toContain("tags_2");
    expect(result.csv).toContain("ml,ai|math");
  });

  it("explodes rows", () => {
    const result = splitCsvColumn(SAMPLE, {
      column: "tags",
      splitOn: "|",
      mode: "rows",
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.rowCount).toBe(5);
    expect(result.csv).toContain("Ada,ml,London");
    expect(result.csv).toContain("Ada,ai,London");
    expect(result.csv).toContain("Grace,cobol,New York");
  });

  it("rejects missing column", () => {
    const result = splitCsvColumn(SAMPLE, {
      column: "nope",
      splitOn: "|",
      mode: "columns",
    });
    expect(result.ok).toBe(false);
  });
});
