import { describe, expect, it } from "vitest";
import {
  colorFromHex,
  colorFromHsl,
  colorFromRgb,
  hslToRgb,
  relatedColors,
} from "./picker";
import { rgbToHsl } from "./hex-rgb";

describe("color picker math", () => {
  it("round-trips hsl → rgb → hsl roughly", () => {
    const rgb = hslToRgb({ h: 45, s: 80, l: 50 });
    const hsl = rgbToHsl(rgb);
    expect(hsl.h).toBeGreaterThanOrEqual(40);
    expect(hsl.h).toBeLessThanOrEqual(50);
    expect(hsl.s).toBeGreaterThan(70);
  });

  it("parses hex", () => {
    const c = colorFromHex("#c4a70a");
    expect(c?.hex.toLowerCase()).toBe("#c4a70a");
    expect(c?.cssRgb).toContain("196");
  });

  it("builds from rgb and hsl", () => {
    expect(colorFromRgb(255, 0, 0).hex.toLowerCase()).toBe("#ff0000");
    expect(colorFromHsl(0, 100, 50).hex.toLowerCase()).toBe("#ff0000");
  });

  it("computes complementary", () => {
    const base = colorFromHsl(10, 70, 40);
    const { complementary } = relatedColors(base);
    expect(Math.abs(complementary.hsl.h - 190)).toBeLessThanOrEqual(1);
  });
});
