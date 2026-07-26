import { describe, expect, it } from "vitest";
import {
  clampQrSize,
  generateQrDataUrl,
  generateQrSvg,
  DEFAULT_QR_OPTIONS,
} from "./generate";

describe("clampQrSize", () => {
  it("clamps to 128–1024", () => {
    expect(clampQrSize(10)).toBe(128);
    expect(clampQrSize(5000)).toBe(1024);
    expect(clampQrSize(300)).toBe(300);
  });
});

describe("generateQrDataUrl", () => {
  it("returns a PNG data URL", async () => {
    const url = await generateQrDataUrl("https://forge.tools", {
      ...DEFAULT_QR_OPTIONS,
      size: 128,
    });
    expect(url.startsWith("data:image/png;base64,")).toBe(true);
    expect(url.length).toBeGreaterThan(100);
  });

  it("rejects empty string", async () => {
    await expect(generateQrDataUrl("")).rejects.toThrow(/Enter text/);
  });
});

describe("generateQrSvg", () => {
  it("returns SVG markup", async () => {
    const svg = await generateQrSvg("hello forge", {
      ...DEFAULT_QR_OPTIONS,
      size: 128,
      errorCorrection: "H",
    });
    expect(svg).toContain("<svg");
    expect(svg).toContain("</svg>");
  });
});
