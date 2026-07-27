/** PDF points (1/72 inch). */

export type PagePresetId = "fit" | "a4" | "letter" | "a4-landscape" | "letter-landscape";

export type PageSizePts = { width: number; height: number };

export const PAGE_PRESETS: {
  id: PagePresetId;
  label: string;
  size: PageSizePts | null;
}[] = [
  { id: "fit", label: "Fit to image", size: null },
  { id: "a4", label: "A4 portrait", size: { width: 595.28, height: 841.89 } },
  {
    id: "a4-landscape",
    label: "A4 landscape",
    size: { width: 841.89, height: 595.28 },
  },
  { id: "letter", label: "Letter portrait", size: { width: 612, height: 792 } },
  {
    id: "letter-landscape",
    label: "Letter landscape",
    size: { width: 792, height: 612 },
  },
];

export function resolvePageSize(
  preset: PagePresetId,
  imageWidthPx: number,
  imageHeightPx: number,
  /** px → pt scale when fitting (96 CSS px ≈ 72 pt → 0.75) */
  pxToPt = 0.75,
): PageSizePts | { ok: false; error: string } {
  if (
    !Number.isFinite(imageWidthPx) ||
    !Number.isFinite(imageHeightPx) ||
    imageWidthPx <= 0 ||
    imageHeightPx <= 0
  ) {
    return { ok: false, error: "Image dimensions must be positive." };
  }

  const found = PAGE_PRESETS.find((p) => p.id === preset);
  if (!found) {
    return { ok: false, error: "Unknown page preset." };
  }
  if (found.size) {
    return { width: found.size.width, height: found.size.height };
  }

  return {
    width: imageWidthPx * pxToPt,
    height: imageHeightPx * pxToPt,
  };
}

export type FitImageResult = {
  x: number;
  y: number;
  width: number;
  height: number;
};

/**
 * Contain-fit an image into a page with uniform margins (points).
 * Origin is bottom-left (PDF).
 */
export function fitImageOnPage(input: {
  pageWidth: number;
  pageHeight: number;
  imageWidth: number;
  imageHeight: number;
  margin?: number;
}): FitImageResult | { ok: false; error: string } {
  const {
    pageWidth: pw,
    pageHeight: ph,
    imageWidth: iw,
    imageHeight: ih,
    margin = 36,
  } = input;

  if (
    [pw, ph, iw, ih].some((n) => !Number.isFinite(n) || n <= 0) ||
    !Number.isFinite(margin) ||
    margin < 0
  ) {
    return { ok: false, error: "Page, image, and margin values must be valid." };
  }
  if (margin * 2 >= pw || margin * 2 >= ph) {
    return { ok: false, error: "Margin is too large for the page size." };
  }

  const maxW = pw - margin * 2;
  const maxH = ph - margin * 2;
  const scale = Math.min(maxW / iw, maxH / ih);
  const width = iw * scale;
  const height = ih * scale;
  const x = (pw - width) / 2;
  const y = (ph - height) / 2;
  return { x, y, width, height };
}

export const MAX_IMAGES_TO_PDF = 40;
