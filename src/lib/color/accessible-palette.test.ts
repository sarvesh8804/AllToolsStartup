import { describe, expect, it } from "vitest";
import {
  adjustPrimaryForOnColor,
  findForegroundForBackground,
  generateAccessiblePalette,
  minTextContrast,
  paletteToJson,
} from "./accessible-palette";
import { checkContrast } from "./contrast";
import { colorFromRgb } from "./picker";

describe("minTextContrast", () => {
  it("returns WCAG thresholds", () => {
    expect(minTextContrast("AA", false)).toBe(4.5);
    expect(minTextContrast("AA", true)).toBe(3);
    expect(minTextContrast("AAA", false)).toBe(7);
    expect(minTextContrast("AAA", true)).toBe(4.5);
  });
});

describe("findForegroundForBackground", () => {
  it("finds dark text on white", () => {
    const bg = { r: 255, g: 255, b: 255 };
    const fg = findForegroundForBackground(bg, 210, 15, 4.5, true);
    const check = checkContrast(
      `#${fg.r.toString(16).padStart(2, "0")}${fg.g.toString(16).padStart(2, "0")}${fg.b.toString(16).padStart(2, "0")}`,
      "#ffffff",
    );
    expect(check.ok).toBe(true);
    if (check.ok) expect(check.value.aaNormal).toBe(true);
  });
});

describe("adjustPrimaryForOnColor", () => {
  it("returns readable label on primary", () => {
    const base = colorFromRgb(196, 167, 10);
    const { primary, onPrimary } = adjustPrimaryForOnColor(base, 4.5);
    const check = checkContrast(onPrimary.hex, primary.hex);
    expect(check.ok).toBe(true);
    if (check.ok) expect(check.value.aaNormal).toBe(true);
  });
});

describe("generateAccessiblePalette", () => {
  it("builds a light palette with passing body contrast", () => {
    const result = generateAccessiblePalette("#c4a70a", {
      theme: "light",
      level: "AA",
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.colors.length).toBeGreaterThanOrEqual(8);
    expect(result.pairs.some((p) => p.id === "body" && p.passesNormal)).toBe(
      true,
    );
    expect(result.cssVariables).toContain("--primary:");
    expect(paletteToJson(result)).toContain('"theme": "light"');
  });

  it("builds a dark palette", () => {
    const result = generateAccessiblePalette("#3b82f6", { theme: "dark" });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.theme).toBe("dark");
    expect(result.pairs.some((p) => p.id === "primary-btn")).toBe(true);
  });

  it("rejects invalid color", () => {
    expect(generateAccessiblePalette("not-a-color").ok).toBe(false);
  });
});
