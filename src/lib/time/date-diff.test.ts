import { describe, expect, it } from "vitest";
import { calculateDateDifference } from "./date-diff";

describe("calculateDateDifference", () => {
  it("computes calendar and absolute spans", () => {
    const result = calculateDateDifference("2024-01-01", "2025-03-15");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.years).toBe(1);
      expect(result.value.months).toBe(2);
      expect(result.value.days).toBe(14);
      expect(result.value.absoluteDays).toBe(439);
      expect(result.value.signedDays).toBe(439);
      expect(result.value.endIsBeforeStart).toBe(false);
    }
  });

  it("handles reverse order with signed days", () => {
    const result = calculateDateDifference("2025-01-10", "2025-01-01");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.signedDays).toBe(-9);
      expect(result.value.absoluteDays).toBe(9);
      expect(result.value.endIsBeforeStart).toBe(true);
      expect(result.value.years).toBe(0);
      expect(result.value.months).toBe(0);
      expect(result.value.days).toBe(9);
    }
  });

  it("same day is zero", () => {
    const result = calculateDateDifference("2026-07-27", "2026-07-27");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.absoluteDays).toBe(0);
      expect(result.value.hours).toBe(0);
    }
  });

  it("rejects invalid dates", () => {
    expect(calculateDateDifference("nope", "2026-01-01").ok).toBe(false);
    expect(calculateDateDifference("2026-01-01", "2026-13-01").ok).toBe(false);
  });
});
