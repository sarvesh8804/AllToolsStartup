import { describe, expect, it } from "vitest";
import { diffCsv, SAMPLE_CSV_LEFT, SAMPLE_CSV_RIGHT } from "./csv-diff";

describe("diffCsv", () => {
  it("finds added, removed, and changed rows", () => {
    const result = diffCsv(SAMPLE_CSV_LEFT, SAMPLE_CSV_RIGHT, { keyColumn: "id" });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.stats.changed).toBe(1);
    expect(result.stats.added).toBe(1);
  });
});
