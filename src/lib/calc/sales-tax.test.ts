import { describe, expect, it } from "vitest";
import { calculateSalesTax } from "./sales-tax";

describe("calculateSalesTax", () => {
  it("adds GST exclusively", () => {
    const result = calculateSalesTax({
      amount: 1000,
      ratePercent: 18,
      mode: "exclusive",
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.net).toBeCloseTo(1000, 8);
      expect(result.value.tax).toBeCloseTo(180, 8);
      expect(result.value.gross).toBeCloseTo(1180, 8);
    }
  });

  it("extracts GST inclusively", () => {
    const result = calculateSalesTax({
      amount: 1180,
      ratePercent: 18,
      mode: "inclusive",
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.gross).toBeCloseTo(1180, 8);
      expect(result.value.net).toBeCloseTo(1000, 8);
      expect(result.value.tax).toBeCloseTo(180, 8);
    }
  });

  it("handles zero rate", () => {
    const result = calculateSalesTax({
      amount: 500,
      ratePercent: 0,
      mode: "inclusive",
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.tax).toBe(0);
      expect(result.value.net).toBe(500);
    }
  });

  it("rejects negative amount", () => {
    expect(
      calculateSalesTax({
        amount: -1,
        ratePercent: 5,
        mode: "exclusive",
      }).ok,
    ).toBe(false);
  });

  it("rejects rate over 100", () => {
    expect(
      calculateSalesTax({
        amount: 100,
        ratePercent: 101,
        mode: "exclusive",
      }).ok,
    ).toBe(false);
  });
});
