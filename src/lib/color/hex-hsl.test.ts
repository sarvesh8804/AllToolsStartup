import { describe, expect, it } from "vitest";
import {
  convertToHsl,
  formatCssHsl,
  formatCssHslModern,
  hslChannelsToConversion,
} from "./hex-hsl";

describe("convertToHsl", () => {
  it("converts hex to hsl formats", () => {
    const result = convertToHsl("#c4a70a");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.hsl.h).toBeGreaterThanOrEqual(0);
    expect(result.cssHsl).toBe(
      `hsl(${result.hsl.h}, ${result.hsl.s}%, ${result.hsl.l}%)`,
    );
    expect(result.cssHslModern).toBe(
      `hsl(${result.hsl.h} ${result.hsl.s}% ${result.hsl.l}%)`,
    );
    expect(result.channels).toContain("%");
  });

  it("accepts rgb() input", () => {
    const result = convertToHsl("rgb(255, 0, 0)");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.hsl).toEqual({ h: 0, s: 100, l: 50 });
  });

  it("accepts hsl() input", () => {
    const result = convertToHsl("hsl(240, 100%, 50%)");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.hsl.h).toBe(240);
    expect(result.hex).toBe("#0000ff");
  });

  it("accepts modern hsl() syntax", () => {
    const result = convertToHsl("hsl(120 50% 40%)");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.hsl.h).toBe(120);
    expect(result.hsl.s).toBe(50);
    expect(result.hsl.l).toBe(40);
  });

  it("rejects invalid input", () => {
    expect(convertToHsl("").ok).toBe(false);
    expect(convertToHsl("nope").ok).toBe(false);
  });
});

describe("hslChannelsToConversion", () => {
  it("round-trips through rgb", () => {
    const result = hslChannelsToConversion(210, 50, 50);
    expect(result.hsl).toEqual({ h: 210, s: 50, l: 50 });
    expect(result.hex).toMatch(/^#[0-9a-f]{6}$/i);
  });
});

describe("format helpers", () => {
  it("formats css hsl strings", () => {
    const hsl = { h: 12, s: 34.5, l: 56.7 };
    expect(formatCssHsl(hsl)).toBe("hsl(12, 34.5%, 56.7%)");
    expect(formatCssHslModern(hsl)).toBe("hsl(12 34.5% 56.7%)");
  });
});
