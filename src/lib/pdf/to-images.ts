import { parsePageRanges } from "@/lib/pdf/ranges";

export type ImageOutputFormat = "image/png" | "image/jpeg";

export const RENDER_DPI_PRESETS = [
  { id: "72", label: "72 DPI (screen)", dpi: 72 },
  { id: "144", label: "144 DPI", dpi: 144 },
  { id: "150", label: "150 DPI", dpi: 150 },
  { id: "300", label: "300 DPI (print)", dpi: 300 },
] as const;

export const MAX_PDF_TO_IMAGE_PAGES = 40;

/** PDF points are 1/72"; scale = dpi / 72. */
export function dpiToScale(dpi: number): number {
  if (!Number.isFinite(dpi) || dpi <= 0) return 1;
  return Math.min(8, Math.max(0.25, dpi / 72));
}

export function imageExtension(format: ImageOutputFormat): "png" | "jpg" {
  return format === "image/jpeg" ? "jpg" : "png";
}

export function pageImageFilename(
  basename: string,
  page: number,
  format: ImageOutputFormat,
): string {
  const base = basename.replace(/\.pdf$/i, "") || "page";
  return `${base}-p${page}.${imageExtension(format)}`;
}

export function resolvePagesToRender(
  pageCount: number,
  rangeText: string | undefined,
): { ok: true; pages: number[] } | { ok: false; error: string } {
  if (!Number.isInteger(pageCount) || pageCount < 1) {
    return { ok: false, error: "PDF has no pages." };
  }
  const raw = rangeText?.trim() ?? "";
  const parsed = raw
    ? parsePageRanges(raw, pageCount)
    : {
        ok: true as const,
        pages: Array.from({ length: pageCount }, (_, i) => i + 1),
      };
  if (!parsed.ok) return parsed;
  if (parsed.pages.length > MAX_PDF_TO_IMAGE_PAGES) {
    return {
      ok: false,
      error: `Too many pages selected (max ${MAX_PDF_TO_IMAGE_PAGES}). Narrow the range.`,
    };
  }
  return parsed;
}
