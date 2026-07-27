import { PDFDocument } from "pdf-lib";
import { looksLikePdf } from "@/lib/pdf/merge";
import {
  chunkPages,
  everyPageChunks,
  parsePageRanges,
  type SplitMode,
} from "@/lib/pdf/ranges";

export type SplitPart = {
  /** 1-based pages included */
  pages: number[];
  filename: string;
  bytes: Uint8Array;
  pageCount: number;
};

export type SplitPdfResult =
  | { ok: true; parts: SplitPart[]; sourcePageCount: number }
  | { ok: false; error: string };

export type SplitPdfOptions = {
  mode: SplitMode;
  /** Used when mode === "range" */
  rangeText?: string;
  /** Used when mode === "chunk" */
  chunkSize?: number;
  /** Base name without extension */
  basename?: string;
};

async function extractPages(
  source: PDFDocument,
  pages1Based: number[],
): Promise<Uint8Array> {
  const out = await PDFDocument.create();
  const zeroBased = pages1Based.map((p) => p - 1);
  const copied = await out.copyPages(source, zeroBased);
  for (const page of copied) out.addPage(page);
  const bytes = await out.save();
  return bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
}

function partName(basename: string, pages: number[], index: number, total: number): string {
  if (pages.length === 1) {
    return `${basename}-p${pages[0]}.pdf`;
  }
  const a = pages[0];
  const b = pages[pages.length - 1];
  if (total === 1) {
    return `${basename}-pages-${a}-${b}.pdf`;
  }
  return `${basename}-part${index + 1}-p${a}-${b}.pdf`;
}

/**
 * Split a PDF into one or more PDFs based on mode.
 */
export async function splitPdf(
  bytes: Uint8Array,
  options: SplitPdfOptions,
): Promise<SplitPdfResult> {
  if (!looksLikePdf(bytes)) {
    return { ok: false, error: "Not a valid PDF file." };
  }

  let source: PDFDocument;
  try {
    source = await PDFDocument.load(bytes, {
      ignoreEncryption: false,
      updateMetadata: false,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (/encrypt|password|permission/i.test(msg)) {
      return {
        ok: false,
        error:
          "This PDF is encrypted or password-protected and can’t be split.",
      };
    }
    return {
      ok: false,
      error: "Could not read this PDF (it may be corrupt).",
    };
  }

  const pageCount = source.getPageCount();
  if (pageCount < 1) {
    return { ok: false, error: "PDF has no pages." };
  }
  if (pageCount === 1 && options.mode !== "range") {
    return {
      ok: false,
      error: "This PDF has only one page — nothing to split.",
    };
  }

  const basename = (options.basename || "forge-split").replace(/\.pdf$/i, "");
  let groups: number[][] = [];

  if (options.mode === "range") {
    const parsed = parsePageRanges(options.rangeText ?? "", pageCount);
    if (!parsed.ok) return parsed;
    groups = [parsed.pages];
  } else if (options.mode === "every-page") {
    groups = everyPageChunks(pageCount);
  } else {
    const chunked = chunkPages(pageCount, options.chunkSize ?? 1);
    if (!chunked.ok) return chunked;
    groups = chunked.chunks;
  }

  if (groups.length > 100) {
    return {
      ok: false,
      error: `This would create ${groups.length} files (max 100). Use larger chunks or extract a range.`,
    };
  }

  try {
    const parts: SplitPart[] = [];
    for (let i = 0; i < groups.length; i++) {
      const pages = groups[i]!;
      const partBytes = await extractPages(source, pages);
      parts.push({
        pages,
        filename: partName(basename, pages, i, groups.length),
        bytes: partBytes,
        pageCount: pages.length,
      });
    }
    return { ok: true, parts, sourcePageCount: pageCount };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Failed to split PDF.",
    };
  }
}
