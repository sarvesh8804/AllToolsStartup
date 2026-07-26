import { describe, expect, it } from "vitest";
import {
  checkContrast,
  contrastRatio,
  parseColor,
  relativeLuminance,
} from "./contrast";

describe("parseColor", () => {
  it("parses 6-digit hex", () => {
    const result = parseColor("#ff0000");
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.rgb).toEqual({ r: 255, g: 0, b: 0 });
  });

  it("parses 3-digit hex", () => {
    const result = parseColor("#0f0");
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.hex).toBe("#00ff00");
  });

  it("parses rgb()", () => {
    const result = parseColor("rgb(36, 48, 24)");
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.rgb).toEqual({ r: 36, g: 48, b: 24 });
  });

  it("rejects garbage", () => {
    expect(parseColor("not-a-color").ok).toBe(false);
  });
});

describe("WCAG contrast", () => {
  it("black on white is 21:1", () => {
    expect(
      contrastRatio({ r: 0, g: 0, b: 0 }, { r: 255, g: 255, b: 255 }),
    ).toBeCloseTo(21, 5);
  });

  it("same color is 1:1", () => {
    expect(
      contrastRatio({ r: 100, g: 100, b: 100 }, { r: 100, g: 100, b: 100 }),
    ).toBeCloseTo(1, 5);
  });

  it("white luminance is 1", () => {
    expect(relativeLuminance({ r: 255, g: 255, b: 255 })).toBeCloseTo(1, 5);
  });

  it("reports WCAG pass/fail thresholds", () => {
    const result = checkContrast("#000000", "#ffffff");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.aaNormal).toBe(true);
      expect(result.value.aaaNormal).toBe(true);
      expect(result.value.ratioLabel).toBe("21.00:1");
    }
  });

  it("fails low-contrast pairs for AA normal", () => {
    const result = checkContrast("#777777", "#999999");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.aaNormal).toBe(false);
    }
  });
});
