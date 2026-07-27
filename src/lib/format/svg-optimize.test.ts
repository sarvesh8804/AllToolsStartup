import { describe, expect, it } from "vitest";
import { formatBytes, optimizeSvg } from "./svg-optimize";

const SAMPLE = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
  <!-- icon -->
  <rect x="10.0000" y="10.0000" width="50.0000" height="50.0000" fill="#ff0000"></rect>
</svg>
`;

describe("optimizeSvg", () => {
  it("minifies SVG and reports savings", () => {
    const result = optimizeSvg(SAMPLE, { multipass: true, pretty: false });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.svg).toContain("<svg");
      expect(result.svg.includes("<!--")).toBe(false);
      expect(result.optimizedBytes).toBeLessThan(result.originalBytes);
      expect(result.savedPercent).toBeGreaterThan(0);
    }
  });

  it("can keep viewBox", () => {
    const result = optimizeSvg(SAMPLE, { keepViewBox: true });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.svg).toContain("viewBox");
  });

  it("pretty-prints when requested", () => {
    const result = optimizeSvg(SAMPLE, { pretty: true, indent: 2 });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.svg).toContain("\n");
      expect(result.svg.trimStart().startsWith("<svg")).toBe(true);
    }
  });

  it("rejects empty and non-svg input", () => {
    expect(optimizeSvg("").ok).toBe(false);
    expect(optimizeSvg("<div>nope</div>").ok).toBe(false);
  });
});

describe("formatBytes", () => {
  it("formats sizes", () => {
    expect(formatBytes(500)).toBe("500 B");
    expect(formatBytes(2048)).toBe("2.0 KB");
  });
});
