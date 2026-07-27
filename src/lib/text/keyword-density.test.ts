import { describe, expect, it } from "vitest";
import { analyzeKeywordDensity } from "./keyword-density";

describe("analyzeKeywordDensity", () => {
  it("counts keywords and density", () => {
    const result = analyzeKeywordDensity(
      "Forge tools help forge better pages. Forge is local.",
      { ignoreStopWords: true },
    );
    expect(result.totalWords).toBeGreaterThan(0);
    const forge = result.rows.find((r) => r.keyword === "forge");
    expect(forge?.count).toBe(3);
    expect(forge?.density).toBeGreaterThan(0);
  });

  it("can keep stop words", () => {
    const result = analyzeKeywordDensity("the the cat", {
      ignoreStopWords: false,
      minWordLength: 2,
    });
    expect(result.rows.find((r) => r.keyword === "the")?.count).toBe(2);
  });

  it("reports focus keywords even at zero", () => {
    const result = analyzeKeywordDensity("alpha beta alpha", {
      focusKeywords: ["alpha", "missing"],
      ignoreStopWords: false,
    });
    expect(result.focus[0]).toMatchObject({ keyword: "alpha", count: 2 });
    expect(result.focus[1]).toMatchObject({ keyword: "missing", count: 0 });
  });

  it("supports multi-word focus phrases", () => {
    const result = analyzeKeywordDensity(
      "Keyword density matters. Check keyword density often.",
      { focusKeywords: ["keyword density"], ignoreStopWords: true },
    );
    expect(result.focus[0].count).toBe(2);
  });
});
