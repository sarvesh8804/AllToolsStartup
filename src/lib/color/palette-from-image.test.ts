import { describe, expect, it } from "vitest";
import {
  extractPaletteFromPixels,
  formatPaletteCss,
} from "./palette-from-image";

function rgba(
  pixels: Array<[number, number, number, number?]>,
): Uint8ClampedArray {
  const data = new Uint8ClampedArray(pixels.length * 4);
  pixels.forEach(([r, g, b, a = 255], i) => {
    data[i * 4] = r;
    data[i * 4 + 1] = g;
    data[i * 4 + 2] = b;
    data[i * 4 + 3] = a;
  });
  return data;
}

describe("extractPaletteFromPixels", () => {
  it("returns empty for empty buffer", () => {
    expect(extractPaletteFromPixels(new Uint8ClampedArray())).toEqual([]);
  });

  it("finds dominant solid colors", () => {
    const data = rgba([
      ...Array.from({ length: 20 }, () => [255, 0, 0, 255] as [number, number, number, number]),
      ...Array.from({ length: 10 }, () => [0, 0, 255, 255] as [number, number, number, number]),
      ...Array.from({ length: 5 }, () => [0, 255, 0, 255] as [number, number, number, number]),
    ]);
    const palette = extractPaletteFromPixels(data, {
      maxColors: 3,
      sampleStep: 1,
      bits: 8,
      minDistance: 10,
    });
    expect(palette.length).toBe(3);
    expect(palette[0]?.hex).toBe("#ff0000");
    expect(palette.map((p) => p.hex)).toContain("#0000ff");
    expect(palette.map((p) => p.hex)).toContain("#00ff00");
  });

  it("ignores transparent pixels", () => {
    const data = rgba([
      [255, 0, 0, 10],
      [0, 255, 0, 255],
      [0, 255, 0, 255],
    ]);
    const palette = extractPaletteFromPixels(data, {
      maxColors: 2,
      sampleStep: 1,
      bits: 8,
      ignoreAlphaBelow: 128,
    });
    expect(palette).toHaveLength(1);
    expect(palette[0]?.hex).toBe("#00ff00");
  });
});

describe("formatPaletteCss", () => {
  it("emits CSS variables", () => {
    const css = formatPaletteCss([
      { hex: "#ff0000", rgb: { r: 255, g: 0, b: 0 }, count: 1, percent: 100 },
    ]);
    expect(css).toContain("--color-1: #ff0000;");
    expect(css.startsWith(":root")).toBe(true);
  });
});
