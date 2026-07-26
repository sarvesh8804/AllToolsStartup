import { describe, expect, it } from "vitest";
import {
  adjustByPercent,
  formatNumber,
  percentChange,
  percentOf,
  whatPercent,
} from "./percentage";

describe("percentOf", () => {
  it("computes X% of Y", () => {
    const result = percentOf(20, 150);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.value).toBe(30);
  });
});

describe("whatPercent", () => {
  it("computes what percent part is of whole", () => {
    const result = whatPercent(25, 200);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.percent).toBe(12.5);
  });

  it("rejects zero whole", () => {
    expect(whatPercent(1, 0).ok).toBe(false);
  });
});

describe("percentChange", () => {
  it("computes increase", () => {
    const result = percentChange(100, 130);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.change).toBe(30);
      expect(result.value.percent).toBe(30);
    }
  });

  it("computes decrease", () => {
    const result = percentChange(80, 60);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.percent).toBe(-25);
  });
});

describe("adjustByPercent", () => {
  it("increases and decreases", () => {
    const up = adjustByPercent(200, 10, "increase");
    const down = adjustByPercent(200, 10, "decrease");
    expect(up.ok && up.value.value).toBe(220);
    expect(down.ok && down.value.value).toBe(180);
  });
});

describe("formatNumber", () => {
  it("trims trailing zeros", () => {
    expect(formatNumber(12.5)).toBe("12.5");
    expect(formatNumber(12)).toBe("12");
  });
});
