import { describe, expect, it } from "vitest";
import { PDFDocument, degrees } from "pdf-lib";
import {
  applyRotationDelta,
  normalizeRotation,
  rotatePdf,
} from "@/lib/pdf/rotate";

async function makePdf(pages: number): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  for (let i = 0; i < pages; i++) {
    doc.addPage([200, 300]);
  }
  const bytes = await doc.save();
  return bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
}

describe("normalizeRotation / applyRotationDelta", () => {
  it("normalizes angles", () => {
    expect(normalizeRotation(0)).toBe(0);
    expect(normalizeRotation(90)).toBe(90);
    expect(normalizeRotation(450)).toBe(90);
    expect(normalizeRotation(-90)).toBe(270);
  });

  it("applies deltas", () => {
    expect(applyRotationDelta(0, 90)).toBe(90);
    expect(applyRotationDelta(90, 90)).toBe(180);
    expect(applyRotationDelta(270, 90)).toBe(0);
    expect(applyRotationDelta(0, 180)).toBe(180);
    expect(applyRotationDelta(0, 270)).toBe(270);
  });
});

describe("rotatePdf", () => {
  it("rotates all pages by 90", async () => {
    const src = await makePdf(2);
    const r = await rotatePdf(src, { degrees: 90 });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.rotatedPages).toEqual([1, 2]);
    const doc = await PDFDocument.load(r.pdf);
    expect(doc.getPage(0).getRotation().angle).toBe(90);
    expect(doc.getPage(1).getRotation().angle).toBe(90);
  });

  it("rotates a range only", async () => {
    const src = await makePdf(3);
    const r = await rotatePdf(src, { degrees: 180, rangeText: "2" });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    const doc = await PDFDocument.load(r.pdf);
    expect(doc.getPage(0).getRotation().angle).toBe(0);
    expect(doc.getPage(1).getRotation().angle).toBe(180);
    expect(doc.getPage(2).getRotation().angle).toBe(0);
  });

  it("stacks on existing rotation", async () => {
    const doc = await PDFDocument.create();
    const page = doc.addPage([100, 100]);
    page.setRotation(degrees(90));
    const bytes = await doc.save();
    const src = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
    const r = await rotatePdf(src, { degrees: 90 });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    const out = await PDFDocument.load(r.pdf);
    expect(out.getPage(0).getRotation().angle).toBe(180);
  });

  it("rejects bad range", async () => {
    const src = await makePdf(2);
    const r = await rotatePdf(src, { degrees: 90, rangeText: "9" });
    expect(r.ok).toBe(false);
  });
});
