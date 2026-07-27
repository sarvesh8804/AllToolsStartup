import { PDFDocument, degrees } from "pdf-lib";
import { looksLikePdf } from "@/lib/pdf/merge";
import { parsePageRanges } from "@/lib/pdf/ranges";

export type RotateDegrees = 90 | 180 | 270;

export const ROTATE_OPTIONS: { degrees: RotateDegrees; label: string }[] = [
  { degrees: 90, label: "90° clockwise" },
  { degrees: 180, label: "180°" },
  { degrees: 270, label: "270° clockwise (90° CCW)" },
];

/** Normalize any angle to 0, 90, 180, or 270. */
export function normalizeRotation(angle: number): number {
  if (!Number.isFinite(angle)) return 0;
  const n = ((Math.round(angle) % 360) + 360) % 360;
  const snapped = Math.round(n / 90) * 90;
  return snapped === 360 ? 0 : snapped;
}

export function applyRotationDelta(
  currentAngle: number,
  delta: RotateDegrees,
): number {
  return normalizeRotation(currentAngle + delta);
}

export type RotatePdfOptions = {
  degrees: RotateDegrees;
  /** If omitted or empty after parse, rotate all pages. */
  rangeText?: string;
  /** When true (default), empty range means all pages. */
  allPagesIfEmpty?: boolean;
};

export type RotatePdfResult =
  | {
      ok: true;
      pdf: Uint8Array;
      pageCount: number;
      rotatedPages: number[];
    }
  | { ok: false; error: string };

/**
 * Rotate selected (or all) pages by 90/180/270 clockwise.
 */
export async function rotatePdf(
  bytes: Uint8Array,
  options: RotatePdfOptions,
): Promise<RotatePdfResult> {
  if (!looksLikePdf(bytes)) {
    return { ok: false, error: "Not a valid PDF file." };
  }
  if (![90, 180, 270].includes(options.degrees)) {
    return { ok: false, error: "Rotation must be 90, 180, or 270 degrees." };
  }

  let doc: PDFDocument;
  try {
    doc = await PDFDocument.load(bytes, {
      ignoreEncryption: false,
      updateMetadata: false,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (/encrypt|password|permission/i.test(msg)) {
      return {
        ok: false,
        error:
          "This PDF is encrypted or password-protected and can’t be rotated.",
      };
    }
    return {
      ok: false,
      error: "Could not read this PDF (it may be corrupt).",
    };
  }

  const pageCount = doc.getPageCount();
  if (pageCount < 1) {
    return { ok: false, error: "PDF has no pages." };
  }

  const rangeRaw = options.rangeText?.trim() ?? "";
  let pages1Based: number[];
  if (!rangeRaw && options.allPagesIfEmpty !== false) {
    pages1Based = Array.from({ length: pageCount }, (_, i) => i + 1);
  } else {
    const parsed = parsePageRanges(rangeRaw, pageCount);
    if (!parsed.ok) return parsed;
    pages1Based = parsed.pages;
  }

  try {
    for (const p of pages1Based) {
      const page = doc.getPage(p - 1);
      const current = page.getRotation().angle;
      page.setRotation(degrees(applyRotationDelta(current, options.degrees)));
    }
    const pdf = await doc.save();
    return {
      ok: true,
      pdf: pdf instanceof Uint8Array ? pdf : new Uint8Array(pdf),
      pageCount,
      rotatedPages: pages1Based,
    };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Failed to rotate PDF.",
    };
  }
}
