import { describe, expect, it } from "vitest";
import { PDFDocument } from "pdf-lib";
import { imagesToPdf } from "@/lib/pdf/images-to-pdf";

/** Minimal 1×1 PNG (red pixel). */
function tinyPng(): Uint8Array {
  const b64 =
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

describe("imagesToPdf", () => {
  it("rejects empty list", async () => {
    const r = await imagesToPdf([]);
    expect(r.ok).toBe(false);
  });

  it("builds a one-page PDF from PNG", async () => {
    const png = tinyPng();
    const r = await imagesToPdf(
      [{ bytes: png, kind: "png", widthPx: 1, heightPx: 1 }],
      { pagePreset: "fit" },
    );
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.pageCount).toBe(1);
    expect(r.pdf[0]).toBe(0x25); // %
    expect(r.pdf[1]).toBe(0x50); // P
    expect(r.pdf[2]).toBe(0x44); // D
    expect(r.pdf[3]).toBe(0x46); // F

    const loaded = await PDFDocument.load(r.pdf);
    expect(loaded.getPageCount()).toBe(1);
  });

  it("builds multi-page A4 PDF", async () => {
    const png = tinyPng();
    const r = await imagesToPdf(
      [
        { bytes: png, kind: "png", widthPx: 1, heightPx: 1 },
        { bytes: png, kind: "png", widthPx: 1, heightPx: 1 },
      ],
      { pagePreset: "a4", margin: 24 },
    );
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    const loaded = await PDFDocument.load(r.pdf);
    expect(loaded.getPageCount()).toBe(2);
    const size = loaded.getPage(0).getSize();
    expect(size.width).toBeCloseTo(595.28, 1);
    expect(size.height).toBeCloseTo(841.89, 1);
  });
});
