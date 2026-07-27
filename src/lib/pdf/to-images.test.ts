import { describe, expect, it } from "vitest";
import {
  dpiToScale,
  pageImageFilename,
  resolvePagesToRender,
  MAX_PDF_TO_IMAGE_PAGES,
} from "@/lib/pdf/to-images";

describe("dpiToScale", () => {
  it("maps DPI to PDF scale", () => {
    expect(dpiToScale(72)).toBe(1);
    expect(dpiToScale(144)).toBe(2);
    expect(dpiToScale(216)).toBe(3);
  });

  it("clamps extremes", () => {
    expect(dpiToScale(0)).toBe(1);
    expect(dpiToScale(10000)).toBe(8);
  });
});

describe("pageImageFilename", () => {
  it("builds names", () => {
    expect(pageImageFilename("report.pdf", 3, "image/png")).toBe(
      "report-p3.png",
    );
    expect(pageImageFilename("x", 1, "image/jpeg")).toBe("x-p1.jpg");
  });
});

describe("resolvePagesToRender", () => {
  it("defaults to all pages", () => {
    expect(resolvePagesToRender(3, undefined)).toEqual({
      ok: true,
      pages: [1, 2, 3],
    });
  });

  it("parses range", () => {
    expect(resolvePagesToRender(10, "2-4")).toEqual({
      ok: true,
      pages: [2, 3, 4],
    });
  });

  it("enforces max pages", () => {
    const r = resolvePagesToRender(MAX_PDF_TO_IMAGE_PAGES + 5, undefined);
    expect(r.ok).toBe(false);
  });
});
