import { describe, expect, it } from "vitest";
import {
  SAMPLE_CSV_TO_HTML,
  csvToHtmlTable,
} from "./csv-to-html-table";

describe("csvToHtmlTable", () => {
  it("converts CSV with headers to an HTML table", () => {
    const result = csvToHtmlTable(SAMPLE_CSV_TO_HTML);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.columns).toEqual(["name", "category", "local"]);
    expect(result.rowCount).toBe(3);
    expect(result.html).toContain("<thead>");
    expect(result.html).toContain("<th scope=\"col\">name</th>");
    expect(result.html).toContain("JSON Formatter");
    expect(result.html).toContain("Pipe | test");
  });

  it("escapes HTML in cell values", () => {
    const result = csvToHtmlTable("a,b\n<tag>,&");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.html).toContain("&lt;tag&gt;");
    expect(result.html).toContain("&amp;");
  });

  it("supports no-header mode", () => {
    const result = csvToHtmlTable("a,b\nc,d", { headers: false });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.columns).toEqual(["Column 1", "Column 2"]);
    expect(result.rowCount).toBe(2);
  });

  it("rejects empty input", () => {
    expect(csvToHtmlTable("").ok).toBe(false);
  });
});
