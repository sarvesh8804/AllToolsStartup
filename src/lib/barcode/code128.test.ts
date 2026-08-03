import { describe, expect, it } from "vitest";
import { buildCode128Svg, SAMPLE_BARCODE_TEXT } from "./code128";

describe("buildCode128Svg", () => {
  it("builds svg for ascii text", () => {
    const result = buildCode128Svg(SAMPLE_BARCODE_TEXT);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.svg).toContain("<svg");
    expect(result.svg).toContain(SAMPLE_BARCODE_TEXT);
  });

  it("rejects empty input", () => {
    expect(buildCode128Svg("  ").ok).toBe(false);
  });

  it("rejects unsupported characters", () => {
    expect(buildCode128Svg("hello\nworld").ok).toBe(false);
  });
});
