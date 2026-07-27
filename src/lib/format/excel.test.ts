import { describe, expect, it } from "vitest";
import { csvToExcel, excelToCsv } from "./excel";

describe("csvToExcel / excelToCsv", () => {
  it("round-trips a simple CSV", () => {
    const csv = "name,count\nForge,3\nAlpha,1\n";
    const xlsx = csvToExcel(csv);
    expect(xlsx.ok).toBe(true);
    if (!xlsx.ok) return;

    expect(xlsx.rowCount).toBe(3);
    expect(xlsx.columnCount).toBe(2);
    expect(xlsx.bytes.byteLength).toBeGreaterThan(100);

    const back = excelToCsv(xlsx.bytes);
    expect(back.ok).toBe(true);
    if (!back.ok) return;
    expect(back.csv).toContain("name,count");
    expect(back.csv).toContain("Forge,3");
    expect(back.sheetName).toBe("Sheet1");
  });

  it("preserves quoted commas", () => {
    const csv = 'city,note\n"Sao Paulo","a, b"\n';
    const xlsx = csvToExcel(csv);
    expect(xlsx.ok).toBe(true);
    if (!xlsx.ok) return;
    const back = excelToCsv(xlsx.bytes);
    expect(back.ok).toBe(true);
    if (!back.ok) return;
    expect(back.csv).toContain("Sao Paulo");
    expect(back.csv).toMatch(/a,\s*b|a, b/);
  });

  it("rejects empty CSV", () => {
    expect(csvToExcel("").ok).toBe(false);
  });

  it("uses a custom sheet name", () => {
    const xlsx = csvToExcel("a,b\n1,2", { sheetName: "Data" });
    expect(xlsx.ok).toBe(true);
    if (!xlsx.ok) return;
    const back = excelToCsv(xlsx.bytes);
    expect(back.ok).toBe(true);
    if (back.ok) expect(back.sheetName).toBe("Data");
  });
});
