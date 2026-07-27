import { describe, expect, it } from "vitest";
import {
  fitImageOnPage,
  resolvePageSize,
} from "@/lib/pdf/page-fit";

describe("resolvePageSize", () => {
  it("rejects bad image size", () => {
    expect(resolvePageSize("fit", 0, 100)).toMatchObject({ ok: false });
  });

  it("fits to image using px→pt scale", () => {
    expect(resolvePageSize("fit", 800, 600, 0.75)).toEqual({
      width: 600,
      height: 450,
    });
  });

  it("returns A4 portrait", () => {
    const r = resolvePageSize("a4", 100, 100);
    expect(r).toEqual({ width: 595.28, height: 841.89 });
  });
});

describe("fitImageOnPage", () => {
  it("centers a landscape image on portrait page", () => {
    const r = fitImageOnPage({
      pageWidth: 600,
      pageHeight: 800,
      imageWidth: 400,
      imageHeight: 200,
      margin: 0,
    });
    expect(r).toEqual({
      x: 0,
      y: 250,
      width: 600,
      height: 300,
    });
  });

  it("respects margins", () => {
    const r = fitImageOnPage({
      pageWidth: 200,
      pageHeight: 200,
      imageWidth: 100,
      imageHeight: 100,
      margin: 20,
    });
    expect(r).toEqual({
      x: 20,
      y: 20,
      width: 160,
      height: 160,
    });
  });

  it("rejects oversized margin", () => {
    expect(
      fitImageOnPage({
        pageWidth: 100,
        pageHeight: 100,
        imageWidth: 50,
        imageHeight: 50,
        margin: 60,
      }),
    ).toMatchObject({ ok: false });
  });
});
