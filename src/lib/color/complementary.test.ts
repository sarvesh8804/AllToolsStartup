import { describe, expect, it } from "vitest";
import { complementaryPalette } from "./complementary";

describe("complementaryPalette", () => {
  it("finds complementary opposite hue", () => {
    const result = complementaryPalette("#ff0000");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.base.hex.toLowerCase()).toBe("#ff0000");
    const diff = Math.abs(
      result.complementary.hsl.h - ((result.base.hsl.h + 180) % 360),
    );
    expect(diff === 0 || diff === 360).toBe(true);
    expect(result.swatches.length).toBeGreaterThanOrEqual(6);
  });

  it("accepts rgb() input", () => {
    const result = complementaryPalette("rgb(0, 128, 255)");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.complementary.hex).toMatch(/^#[0-9a-f]{6}$/i);
  });

  it("rejects empty input", () => {
    expect(complementaryPalette("").ok).toBe(false);
  });
});
