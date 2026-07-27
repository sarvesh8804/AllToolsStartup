import { describe, expect, it } from "vitest";
import { calculateSip } from "./sip";

describe("calculateSip", () => {
  it("matches a known SIP maturity roughly", () => {
    // P=10_000/mo, 12% p.a., 1 year → FV ≈ 128,093.5 (annuity due)
    const result = calculateSip({
      monthlyInvestment: 10_000,
      annualRatePercent: 12,
      years: 1,
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.months).toBe(12);
      expect(result.value.totalInvested).toBe(120_000);
      expect(result.value.maturityValue).toBeGreaterThan(127_000);
      expect(result.value.maturityValue).toBeLessThan(129_500);
      expect(result.value.estimatedReturns).toBeGreaterThan(0);
      expect(result.value.schedule).toHaveLength(1);
    }
  });

  it("handles zero expected return", () => {
    const result = calculateSip({
      monthlyInvestment: 1000,
      annualRatePercent: 0,
      years: 2,
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.maturityValue).toBe(24_000);
      expect(result.value.estimatedReturns).toBe(0);
    }
  });

  it("builds a multi-year schedule", () => {
    const result = calculateSip({
      monthlyInvestment: 5000,
      annualRatePercent: 10,
      years: 5,
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.schedule).toHaveLength(5);
      expect(result.value.schedule[4].value).toBeCloseTo(
        result.value.maturityValue,
        6,
      );
    }
  });

  it("rejects zero monthly investment", () => {
    expect(
      calculateSip({
        monthlyInvestment: 0,
        annualRatePercent: 10,
        years: 1,
      }).ok,
    ).toBe(false);
  });
});
