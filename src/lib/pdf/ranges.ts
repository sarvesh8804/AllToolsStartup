/**
 * Parse 1-based page selection strings like "1-3,5,8-".
 * Trailing open range ("8-") means through pageCount.
 */
export function parsePageRanges(
  input: string,
  pageCount: number,
): { ok: true; pages: number[] } | { ok: false; error: string } {
  if (!Number.isInteger(pageCount) || pageCount < 1) {
    return { ok: false, error: "PDF has no pages." };
  }
  const raw = input.trim();
  if (!raw) {
    return { ok: false, error: "Enter page numbers or ranges (e.g. 1-3,5)." };
  }

  const selected = new Set<number>();
  const parts = raw.split(/[,;\s]+/).filter(Boolean);

  for (const part of parts) {
    if (/^\d+$/.test(part)) {
      const n = Number(part);
      if (n < 1 || n > pageCount) {
        return {
          ok: false,
          error: `Page ${n} is out of range (1–${pageCount}).`,
        };
      }
      selected.add(n);
      continue;
    }

    const m = part.match(/^(\d+)\s*[-–—]\s*(\d+)?$/);
    if (!m) {
      return {
        ok: false,
        error: `Could not parse “${part}”. Use forms like 2 or 1-4.`,
      };
    }
    const start = Number(m[1]);
    const end = m[2] != null && m[2] !== "" ? Number(m[2]) : pageCount;
    if (start < 1 || end < 1 || start > pageCount || end > pageCount) {
      return {
        ok: false,
        error: `Range ${part} is out of bounds (1–${pageCount}).`,
      };
    }
    if (start > end) {
      return { ok: false, error: `Range ${part} is backwards.` };
    }
    for (let p = start; p <= end; p++) selected.add(p);
  }

  const pages = [...selected].sort((a, b) => a - b);
  if (pages.length === 0) {
    return { ok: false, error: "No pages selected." };
  }
  return { ok: true, pages };
}

/** Split 1..pageCount into contiguous chunks of size chunkSize. */
export function chunkPages(
  pageCount: number,
  chunkSize: number,
): { ok: true; chunks: number[][] } | { ok: false; error: string } {
  if (!Number.isInteger(pageCount) || pageCount < 1) {
    return { ok: false, error: "PDF has no pages." };
  }
  if (!Number.isInteger(chunkSize) || chunkSize < 1) {
    return { ok: false, error: "Chunk size must be a positive integer." };
  }
  if (chunkSize > 500) {
    return { ok: false, error: "Chunk size cannot exceed 500." };
  }
  const chunks: number[][] = [];
  for (let start = 1; start <= pageCount; start += chunkSize) {
    const end = Math.min(pageCount, start + chunkSize - 1);
    const chunk: number[] = [];
    for (let p = start; p <= end; p++) chunk.push(p);
    chunks.push(chunk);
  }
  return { ok: true, chunks };
}

export function everyPageChunks(pageCount: number): number[][] {
  return Array.from({ length: pageCount }, (_, i) => [i + 1]);
}

export type SplitMode = "range" | "every-page" | "chunk";
