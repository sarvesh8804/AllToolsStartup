/**
 * Browser-only PDF → image rendering via pdf.js.
 * Keep DOM/canvas work here; pure helpers live in to-images.ts.
 */

import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";
import type { PDFDocumentProxy } from "pdfjs-dist";
import {
  dpiToScale,
  pageImageFilename,
  resolvePagesToRender,
  type ImageOutputFormat,
} from "@/lib/pdf/to-images";
import { clampJpegQuality } from "@/lib/image/format";

let workerConfigured = false;

export function ensurePdfjsWorker(): void {
  if (workerConfigured || typeof window === "undefined") return;
  GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
  workerConfigured = true;
}

export type RenderedPageImage = {
  page: number;
  filename: string;
  blob: Blob;
  width: number;
  height: number;
  url: string;
};

export type PdfToImagesOptions = {
  dpi?: number;
  format?: ImageOutputFormat;
  /** JPEG quality 0–1 or 1–100 */
  quality?: number;
  rangeText?: string;
  basename?: string;
  onProgress?: (done: number, total: number) => void;
};

export type PdfToImagesResult =
  | { ok: true; images: RenderedPageImage[]; pageCount: number }
  | { ok: false; error: string };

async function canvasToBlob(
  canvas: HTMLCanvasElement,
  format: ImageOutputFormat,
  quality?: number,
): Promise<Blob> {
  const q =
    format === "image/jpeg" ? clampJpegQuality(quality ?? 0.92) : undefined;
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) reject(new Error(`Failed to encode ${format}.`));
        else resolve(blob);
      },
      format,
      q,
    );
  });
}

export async function loadPdfDocument(
  data: Uint8Array,
): Promise<PDFDocumentProxy> {
  ensurePdfjsWorker();
  // pdf.js may transfer/detach the buffer — pass a copy
  const copy = data.slice();
  const task = getDocument({ data: copy, useSystemFonts: true });
  return task.promise;
}

export async function pdfToImages(
  data: Uint8Array,
  options: PdfToImagesOptions = {},
): Promise<PdfToImagesResult> {
  if (typeof document === "undefined") {
    return { ok: false, error: "PDF rendering requires a browser." };
  }

  const dpi = options.dpi ?? 144;
  const format = options.format ?? "image/png";
  const scale = dpiToScale(dpi);
  const basename = options.basename ?? "page";

  let pdf: PDFDocumentProxy;
  try {
    pdf = await loadPdfDocument(data);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (/password|encrypt/i.test(msg)) {
      return {
        ok: false,
        error: "This PDF is encrypted or password-protected.",
      };
    }
    return {
      ok: false,
      error: "Could not open this PDF for rendering.",
    };
  }

  try {
    const pageCount = pdf.numPages;
    const pages = resolvePagesToRender(pageCount, options.rangeText);
    if (!pages.ok) {
      await pdf.cleanup();
      return pages;
    }

    const images: RenderedPageImage[] = [];
    for (let i = 0; i < pages.pages.length; i++) {
      const pageNum = pages.pages[i]!;
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale });
      const canvas = document.createElement("canvas");
      canvas.width = Math.ceil(viewport.width);
      canvas.height = Math.ceil(viewport.height);
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        await pdf.cleanup();
        return { ok: false, error: "Could not get canvas 2D context." };
      }
      await page.render({ canvasContext: ctx, viewport, canvas }).promise;
      const blob = await canvasToBlob(canvas, format, options.quality);
      images.push({
        page: pageNum,
        filename: pageImageFilename(basename, pageNum, format),
        blob,
        width: canvas.width,
        height: canvas.height,
        url: URL.createObjectURL(blob),
      });
      options.onProgress?.(i + 1, pages.pages.length);
      page.cleanup();
    }

    await pdf.cleanup();
    return { ok: true, images, pageCount };
  } catch (e) {
    try {
      await pdf.cleanup();
    } catch {
      /* ignore */
    }
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Failed to render PDF pages.",
    };
  }
}
