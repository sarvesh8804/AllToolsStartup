import { describe, expect, it } from "vitest";
import { convertColor, rgbToHsl } from "./hex-rgb";

describe("convertColor", () => {
  it("converts hex to rgb and hsl", () => {
    const result = convertColor("#c4a70a");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.rgb).toEqual({ r: 196, g: 167, b: 10 });
      expect(result.cssRgb).toBe("rgb(196, 167, 10)");
      expect(result.hex).toBe("#c4a70a");
      expect(result.cssHsl).toMatch(/^hsl\(/);
    }
  });

  it("shortens compressible hex", () => {
    const result = convertColor("#ffffff");
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.hexShort).toBe("#fff");
  });

  it("accepts rgb() input", () => {
    const result = convertColor("rgb(255, 0, 0)");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.hex).toBe("#ff0000");
      expect(result.hsl).toEqual({ h: 0, s: 100, l: 50 });
    }
  });

  it("rejects invalid input", () => {
    expect(convertColor("nope").ok).toBe(false);
  });
});

describe("rgbToHsl", () => {
  it("maps pure blue", () => {
    expect(rgbToHsl({ r: 0, g: 0, b: 255 })).toEqual({
      h: 240,
      s: 100,
      l: 50,
    });
  });
});
