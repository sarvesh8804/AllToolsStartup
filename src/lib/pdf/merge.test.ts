import { describe, expect, it } from "vitest";
import { PDFDocument } from "pdf-lib";
import {
  inspectPdf,
  isPdfFile,
  looksLikePdf,
  mergePdfs,
  totalBytesWarning,
  WARN_TOTAL_BYTES,
} from "@/lib/pdf/merge";

async function makePdf(pages: number): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  for (let i = 0; i < pages; i++) {
    const page = doc.addPage([200 + i, 300]);
    page.drawText(`Page ${i + 1}`, { x: 20, y: 150, size: 12 });
  }
  const bytes = await doc.save();
  return bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
}

describe("isPdfFile / looksLikePdf", () => {
  it("sniffs by type and name", () => {
    expect(isPdfFile({ type: "application/pdf", name: "x" })).toBe(true);
    expect(isPdfFile({ type: "", name: "doc.PDF" })).toBe(true);
    expect(isPdfFile({ type: "image/png", name: "a.png" })).toBe(false);
  });

  it("checks magic bytes", async () => {
    const pdf = await makePdf(1);
    expect(looksLikePdf(pdf)).toBe(true);
    expect(looksLikePdf(new Uint8Array([1, 2, 3]))).toBe(false);
  });
});

describe("inspectPdf", () => {
  it("returns page count", async () => {
    const pdf = await makePdf(3);
    const r = await inspectPdf(pdf);
    expect(r).toEqual({ ok: true, pageCount: 3 });
  });

  it("rejects non-pdf", async () => {
    const r = await inspectPdf(new Uint8Array([0, 1, 2, 3, 4]));
    expect(r.ok).toBe(false);
  });
});

describe("mergePdfs", () => {
  it("requires at least two files", async () => {
    const a = await makePdf(1);
    expect((await mergePdfs([{ bytes: a }])).ok).toBe(false);
  });

  it("merges pages in order", async () => {
    const a = await makePdf(2);
    const b = await makePdf(1);
    const r = await mergePdfs([
      { bytes: a, label: "a.pdf" },
      { bytes: b, label: "b.pdf" },
    ]);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.pageCount).toBe(3);
    expect(r.fileCount).toBe(2);

    const loaded = await PDFDocument.load(r.pdf);
    expect(loaded.getPageCount()).toBe(3);
    // First page came from doc A (width 200)
    expect(loaded.getPage(0).getSize().width).toBe(200);
    // Third page from doc B (width 200)
    expect(loaded.getPage(2).getSize().width).toBe(200);
  });

  it("preserves reorder (B then A)", async () => {
    const a = await makePdf(1);
    // Make B's pages distinctive widths
    const bDoc = await PDFDocument.create();
    bDoc.addPage([500, 300]);
    bDoc.addPage([501, 300]);
    const bBytes = await bDoc.save();

    const r = await mergePdfs([
      { bytes: bBytes instanceof Uint8Array ? bBytes : new Uint8Array(bBytes) },
      { bytes: a },
    ]);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    const loaded = await PDFDocument.load(r.pdf);
    expect(loaded.getPage(0).getSize().width).toBe(500);
    expect(loaded.getPageCount()).toBe(3);
  });
});

describe("totalBytesWarning", () => {
  it("warns above threshold", () => {
    expect(totalBytesWarning(WARN_TOTAL_BYTES + 1)).toMatch(/large/i);
    expect(totalBytesWarning(1000)).toBeNull();
  });
});
