import { PDFDocument } from "pdf-lib";

export const MAX_PDF_MERGE_FILES = 50;
/** Soft warning threshold (bytes). Merge still allowed. */
export const WARN_TOTAL_BYTES = 25 * 1024 * 1024;
/** Hard stop total bytes to avoid OOM in typical browsers. */
export const MAX_TOTAL_BYTES = 120 * 1024 * 1024;

export function isPdfFile(file: { type: string; name: string }): boolean {
  if (file.type === "application/pdf") return true;
  return /\.pdf$/i.test(file.name);
}

export function looksLikePdf(bytes: Uint8Array): boolean {
  if (bytes.length < 5) return false;
  // %PDF-
  return (
    bytes[0] === 0x25 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x44 &&
    bytes[3] === 0x46 &&
    bytes[4] === 0x2d
  );
}

export type PdfInspectResult =
  | { ok: true; pageCount: number }
  | { ok: false; error: string };

export async function inspectPdf(bytes: Uint8Array): Promise<PdfInspectResult> {
  if (!looksLikePdf(bytes)) {
    return { ok: false, error: "Not a valid PDF file." };
  }
  try {
    const doc = await PDFDocument.load(bytes, {
      ignoreEncryption: false,
      updateMetadata: false,
    });
    return { ok: true, pageCount: doc.getPageCount() };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (/encrypt|password|permission/i.test(msg)) {
      return {
        ok: false,
        error: "This PDF is encrypted or password-protected and can’t be opened.",
      };
    }
    return {
      ok: false,
      error: "Could not read this PDF (it may be corrupt).",
    };
  }
}

export type MergePdfInput = {
  bytes: Uint8Array;
  /** Optional label for error messages */
  label?: string;
};

export type MergePdfsResult =
  | { ok: true; pdf: Uint8Array; pageCount: number; fileCount: number }
  | { ok: false; error: string };

/**
 * Merge PDFs in the given order by copying all pages into a new document.
 */
export async function mergePdfs(
  files: MergePdfInput[],
): Promise<MergePdfsResult> {
  if (files.length < 2) {
    return { ok: false, error: "Add at least two PDFs to merge." };
  }
  if (files.length > MAX_PDF_MERGE_FILES) {
    return {
      ok: false,
      error: `Too many files (max ${MAX_PDF_MERGE_FILES}).`,
    };
  }

  const totalBytes = files.reduce((sum, f) => sum + f.bytes.length, 0);
  if (totalBytes > MAX_TOTAL_BYTES) {
    return {
      ok: false,
      error:
        "Combined file size is too large for a reliable browser merge. Try fewer or smaller PDFs.",
    };
  }

  try {
    const out = await PDFDocument.create();
    let pageCount = 0;

    for (const file of files) {
      const label = file.label ?? "PDF";
      if (!looksLikePdf(file.bytes)) {
        return { ok: false, error: `${label}: not a valid PDF.` };
      }
      let src: PDFDocument;
      try {
        src = await PDFDocument.load(file.bytes, {
          ignoreEncryption: false,
          updateMetadata: false,
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (/encrypt|password|permission/i.test(msg)) {
          return {
            ok: false,
            error: `${label}: encrypted or password-protected PDFs aren’t supported.`,
          };
        }
        return {
          ok: false,
          error: `${label}: could not be read (corrupt or unsupported).`,
        };
      }

      const indices = src.getPageIndices();
      const pages = await out.copyPages(src, indices);
      for (const page of pages) {
        out.addPage(page);
        pageCount += 1;
      }
    }

    const pdf = await out.save();
    return {
      ok: true,
      pdf: pdf instanceof Uint8Array ? pdf : new Uint8Array(pdf),
      pageCount,
      fileCount: files.length,
    };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Failed to merge PDFs.",
    };
  }
}

export function totalBytesWarning(totalBytes: number): string | null {
  if (totalBytes > WARN_TOTAL_BYTES) {
    return "Large combined size — merge may be slow or use a lot of memory.";
  }
  return null;
}
