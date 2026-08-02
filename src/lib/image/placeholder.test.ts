import { describe, expect, it } from "vitest";
import {
  DEFAULT_PLACEHOLDER,
  buildPlaceholderSvg,
  placeholderSvgToDataUrl,
} from "./placeholder";

describe("buildPlaceholderSvg", () => {
  it("builds an svg with dimensions in the label", () => {
    const result = buildPlaceholderSvg({
      width: DEFAULT_PLACEHOLDER.width,
      height: DEFAULT_PLACEHOLDER.height,
      seed: DEFAULT_PLACEHOLDER.seed,
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.label).toBe("800 × 600");
    expect(result.svg).toContain('width="800"');
    expect(result.svg).toContain("linearGradient");
  });

  it("supports custom text", () => {
    const result = buildPlaceholderSvg({
      width: 320,
      height: 180,
      text: "Hero image",
      seed: 7,
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.svg).toContain("Hero image");
  });

  it("rejects invalid sizes", () => {
    expect(buildPlaceholderSvg({ width: 0, height: 100 }).ok).toBe(false);
  });
});

describe("placeholderSvgToDataUrl", () => {
  it("returns a data url", () => {
    const result = buildPlaceholderSvg({ width: 100, height: 50, seed: 1 });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(placeholderSvgToDataUrl(result.svg)).toMatch(/^data:image\/svg\+xml/);
  });
});
