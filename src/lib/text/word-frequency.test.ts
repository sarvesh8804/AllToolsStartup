import { describe, expect, it } from "vitest";
import {
  analyzeWordFrequency,
  wordFrequencyToCsv,
} from "./word-frequency";

describe("word frequency", () => {
  it("counts and ranks words", () => {
    const result = analyzeWordFrequency("cat dog cat bird cat");
    expect(result.totalWords).toBe(5);
    expect(result.uniqueWords).toBe(3);
    expect(result.rows[0]).toMatchObject({
      rank: 1,
      word: "cat",
      count: 3,
    });
    expect(result.rows[0]?.percent).toBe(60);
  });

  it("can ignore stop words and sort alpha", () => {
    const result = analyzeWordFrequency("the cat and the dog", {
      ignoreStopWords: true,
      sortBy: "alpha",
    });
    expect(result.rows.map((r) => r.word)).toEqual(["cat", "dog"]);
  });

  it("exports csv", () => {
    const { rows } = analyzeWordFrequency("a a b");
    const csv = wordFrequencyToCsv(rows);
    expect(csv).toContain("rank,word,count,percent");
    expect(csv).toContain("1,a,2,");
  });
});
