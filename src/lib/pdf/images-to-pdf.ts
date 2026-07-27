import { PDFDocument } from "pdf-lib";
import {
  fitImageOnPage,
  resolvePageSize,
  type PagePresetId,
} from "@/lib/pdf/page-fit";

export type ImageBytesKind = "png" | "jpg";

export type PdfImageInput = {
  bytes: Uint8Array;
  kind: ImageBytesKind;
  /** Pixel dimensions (used for fit-to-image page sizing + layout). */
  widthPx: number;
  heightPx: number;
};

export type ImagesToPdfOptions = {
  pagePreset?: PagePresetId;
  /** Margin in PDF points when using a fixed page size. Ignored for fit. */
  margin?: number;
};

export type ImagesToPdfResult =
  | { ok: true; pdf: Uint8Array; pageCount: number }
  | { ok: false; error: string };

/**
 * Build a PDF with one page per image (png/jpg bytes).
 * Runs in browser or Node via pdf-lib.
 */
export async function imagesToPdf(
  images: PdfImageInput[],
  options: ImagesToPdfOptions = {},
): Promise<ImagesToPdfResult> {
  if (images.length === 0) {
    return { ok: false, error: "Add at least one image." };
  }

  const preset = options.pagePreset ?? "fit";
  const margin = options.margin ?? 36;

  try {
    const doc = await PDFDocument.create();

    for (const img of images) {
      if (img.bytes.length === 0) {
        return { ok: false, error: "One of the images is empty." };
      }

      const embedded =
        img.kind === "png"
          ? await doc.embedPng(img.bytes)
          : await doc.embedJpg(img.bytes);

      const pageSize = resolvePageSize(preset, img.widthPx, img.heightPx);
      if ("ok" in pageSize) {
        return pageSize;
      }

      const { width: pageW, height: pageH } = pageSize;
      const page = doc.addPage([pageW, pageH]);

      if (preset === "fit") {
        page.drawImage(embedded, {
          x: 0,
          y: 0,
          width: pageW,
          height: pageH,
        });
      } else {
        const fitted = fitImageOnPage({
          pageWidth: pageW,
          pageHeight: pageH,
          imageWidth: embedded.width,
          imageHeight: embedded.height,
          margin,
        });
        if ("ok" in fitted) {
          return fitted;
        }
        page.drawImage(embedded, fitted);
      }
    }

    const pdf = await doc.save();
    return {
      ok: true,
      pdf: pdf instanceof Uint8Array ? pdf : new Uint8Array(pdf),
      pageCount: images.length,
    };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Failed to build PDF.",
    };
  }
}
