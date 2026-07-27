import { describe, expect, it } from "vitest";
import {
  changeExtension,
  clampJpegQuality,
  detectImageMime,
  formatBytes,
  isConvertibleImageFile,
  isJpegFile,
  isPngFile,
  isRasterImageFile,
  isWebpFile,
  mimeToExtension,
  normalizeHexColor,
  qualityToPercent,
} from "@/lib/image/format";

describe("clampJpegQuality", () => {
  it("accepts 0–1 range", () => {
    expect(clampJpegQuality(0.5)).toBe(0.5);
    expect(clampJpegQuality(0)).toBe(0.01);
    expect(clampJpegQuality(1)).toBe(1);
  });

  it("accepts 1–100 UI scale", () => {
    expect(clampJpegQuality(92)).toBe(0.92);
    expect(clampJpegQuality(150)).toBe(1);
  });

  it("falls back for NaN", () => {
    expect(clampJpegQuality(Number.NaN)).toBe(0.92);
  });
});

describe("qualityToPercent", () => {
  it("maps to 1–100", () => {
    expect(qualityToPercent(0.85)).toBe(85);
    expect(qualityToPercent(85)).toBe(85);
  });
});

describe("changeExtension", () => {
  it("replaces extension", () => {
    expect(changeExtension("photo.PNG", "jpg")).toBe("photo.jpg");
    expect(changeExtension("noext", "webp")).toBe("noext.webp");
  });
});

describe("file sniffers", () => {
  it("detects PNG", () => {
    expect(isPngFile({ type: "image/png", name: "x.bin" })).toBe(true);
    expect(isPngFile({ type: "", name: "x.PNG" })).toBe(true);
    expect(isPngFile({ type: "image/jpeg", name: "x.jpg" })).toBe(false);
  });

  it("detects JPEG", () => {
    expect(isJpegFile({ type: "image/jpeg", name: "a" })).toBe(true);
    expect(isJpegFile({ type: "", name: "shot.JPEG" })).toBe(true);
    expect(isJpegFile({ type: "image/png", name: "a.png" })).toBe(false);
  });

  it("detects WebP", () => {
    expect(isWebpFile({ type: "image/webp", name: "a" })).toBe(true);
    expect(isWebpFile({ type: "", name: "a.webp" })).toBe(true);
  });

  it("detects convertible + mime", () => {
    expect(isConvertibleImageFile({ type: "", name: "a.jpg" })).toBe(true);
    expect(isConvertibleImageFile({ type: "", name: "a.gif" })).toBe(false);
    expect(detectImageMime({ type: "", name: "a.png" })).toBe("image/png");
    expect(detectImageMime({ type: "", name: "a.txt" })).toBe(null);
  });

  it("detects raster images", () => {
    expect(isRasterImageFile({ type: "image/webp", name: "a" })).toBe(true);
    expect(isRasterImageFile({ type: "image/svg+xml", name: "a.svg" })).toBe(
      false,
    );
    expect(isRasterImageFile({ type: "", name: "shot.jpeg" })).toBe(true);
  });
});

describe("mimeToExtension / hex / bytes", () => {
  it("maps mime", () => {
    expect(mimeToExtension("image/jpeg")).toBe("jpg");
    expect(mimeToExtension("image/png")).toBe("png");
  });

  it("normalizes hex", () => {
    expect(normalizeHexColor("#AbC")).toBe("#aabbcc");
    expect(normalizeHexColor("#112233")).toBe("#112233");
    expect(normalizeHexColor("nope")).toBe("#ffffff");
  });

  it("formats bytes", () => {
    expect(formatBytes(500)).toBe("500 B");
    expect(formatBytes(2048)).toBe("2.0 KB");
  });
});
