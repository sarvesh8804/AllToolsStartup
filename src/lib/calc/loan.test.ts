import { describe, expect, it } from "vitest";
import { calculateLoan } from "./loan";

describe("calculateLoan", () => {
  it("computes a known EMI roughly", () => {
    // P=1_000_000, 10% annual, 1 year → EMI ≈ 87,915.89
    const result = calculateLoan({
      principal: 1_000_000,
      annualRatePercent: 10,
      years: 1,
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.months).toBe(12);
      expect(result.value.emi).toBeGreaterThan(87000);
      expect(result.value.emi).toBeLessThan(89000);
      expect(result.value.totalInterest).toBeGreaterThan(0);
      expect(result.value.schedule).toHaveLength(12);
      expect(result.value.schedule[11].balance).toBeCloseTo(0, 6);
    }
  });

  it("handles zero interest", () => {
    const result = calculateLoan({
      principal: 1200,
      annualRatePercent: 0,
      years: 1,
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.emi).toBeCloseTo(100, 8);
      expect(result.value.totalInterest).toBeCloseTo(0, 8);
    }
  });

  it("rejects invalid principal", () => {
    expect(
      calculateLoan({ principal: 0, annualRatePercent: 10, years: 1 }).ok,
    ).toBe(false);
  });

  it("rejects negative rate", () => {
    expect(
      calculateLoan({ principal: 100, annualRatePercent: -1, years: 1 }).ok,
    ).toBe(false);
  });
});
