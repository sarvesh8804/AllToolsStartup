import { describe, expect, it } from "vitest";
import { PDFDocument } from "pdf-lib";
import { splitPdf } from "@/lib/pdf/split";

async function makePdf(pages: number): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  for (let i = 0; i < pages; i++) {
    doc.addPage([100 + i * 10, 200]);
  }
  const bytes = await doc.save();
  return bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
}

describe("splitPdf", () => {
  it("extracts a range into one part", async () => {
    const src = await makePdf(5);
    const r = await splitPdf(src, {
      mode: "range",
      rangeText: "2-4",
      basename: "demo",
    });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.parts).toHaveLength(1);
    expect(r.parts[0]!.pageCount).toBe(3);
    expect(r.parts[0]!.filename).toBe("demo-pages-2-4.pdf");

    const loaded = await PDFDocument.load(r.parts[0]!.bytes);
    expect(loaded.getPageCount()).toBe(3);
    expect(loaded.getPage(0).getSize().width).toBe(110); // page 2 of source
  });

  it("splits every page", async () => {
    const src = await makePdf(3);
    const r = await splitPdf(src, { mode: "every-page", basename: "x" });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.parts).toHaveLength(3);
    expect(r.parts[1]!.filename).toBe("x-p2.pdf");
  });

  it("splits into chunks", async () => {
    const src = await makePdf(5);
    const r = await splitPdf(src, {
      mode: "chunk",
      chunkSize: 2,
      basename: "doc",
    });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.parts).toHaveLength(3);
    expect(r.parts[0]!.pages).toEqual([1, 2]);
    expect(r.parts[2]!.pages).toEqual([5]);
  });

  it("rejects single-page every-page split", async () => {
    const src = await makePdf(1);
    const r = await splitPdf(src, { mode: "every-page" });
    expect(r.ok).toBe(false);
  });

  it("rejects bad range", async () => {
    const src = await makePdf(3);
    const r = await splitPdf(src, { mode: "range", rangeText: "9" });
    expect(r.ok).toBe(false);
  });
});
