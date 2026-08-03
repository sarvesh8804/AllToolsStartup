import { describe, expect, it } from "vitest";
import { cleanCsv, SAMPLE_CSV_DIRTY } from "./csv-cleaner";

describe("cleanCsv", () => {
  it("trims and dedupes rows", () => {
    const result = cleanCsv(SAMPLE_CSV_DIRTY, { dedupeRows: true });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.outputRows).toBeLessThan(result.inputRows);
    expect(result.csv).toContain("Grace");
  });
});
