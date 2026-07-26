import { describe, expect, it } from "vitest";
import { calculateTip, formatMoney } from "./tip";

describe("calculateTip", () => {
  it("computes tip total and split", () => {
    const result = calculateTip({ bill: 100, tipPercent: 15, people: 2 });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.tipAmount).toBe(15);
      expect(result.value.total).toBe(115);
      expect(result.value.perPerson).toBe(57.5);
      expect(result.value.tipPerPerson).toBe(7.5);
    }
  });

  it("rejects invalid people", () => {
    expect(calculateTip({ bill: 10, tipPercent: 10, people: 0 }).ok).toBe(
      false,
    );
    expect(calculateTip({ bill: 10, tipPercent: 10, people: 1.5 }).ok).toBe(
      false,
    );
  });

  it("rejects negative bill", () => {
    expect(calculateTip({ bill: -1, tipPercent: 10, people: 1 }).ok).toBe(
      false,
    );
  });
});

describe("formatMoney", () => {
  it("formats with two decimals", () => {
    const out = formatMoney(12.5, "USD");
    expect(out).toMatch(/12\.50/);
  });
});
