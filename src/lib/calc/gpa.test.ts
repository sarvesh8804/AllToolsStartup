import { describe, expect, it } from "vitest";
import { calculateGpa, letterToPoints } from "./gpa";

describe("calculateGpa", () => {
  it("computes a weighted 4.0 GPA", () => {
    const result = calculateGpa([
      { id: "1", name: "Calc", credits: 4, points: letterToPoints("A") },
      { id: "2", name: "Chem", credits: 3, points: letterToPoints("B+") },
      { id: "3", name: "Hist", credits: 3, points: letterToPoints("B") },
    ]);
    expect(result.ok).toBe(true);
    if (result.ok) {
      // (4*4 + 3.3*3 + 3*3) / 10 = (16 + 9.9 + 9) / 10 = 3.49
      expect(result.value.totalCredits).toBe(10);
      expect(result.value.gpa).toBeCloseTo(3.49, 8);
    }
  });

  it("rejects empty course list", () => {
    expect(calculateGpa([]).ok).toBe(false);
  });

  it("rejects credits ≤ 0", () => {
    expect(
      calculateGpa([{ id: "1", name: "X", credits: 0, points: 4 }]).ok,
    ).toBe(false);
  });

  it("rejects points outside 0–4", () => {
    expect(
      calculateGpa([{ id: "1", name: "X", credits: 3, points: 4.5 }]).ok,
    ).toBe(false);
  });
});
