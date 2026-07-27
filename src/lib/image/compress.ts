import { roundPx } from "@/lib/image/resize";

export type FitMaxSideResult =
  | { ok: true; width: number; height: number; scaled: boolean }
  | { ok: false; error: string };

/**
 * Scale so the longer side ≤ maxSide (aspect preserved).
 * If maxSide is null/≤0 or image already fits, returns source size.
 */
export function fitWithinMaxSide(
  sourceWidth: number,
  sourceHeight: number,
  maxSide: number | null | undefined,
): FitMaxSideResult {
  if (
    !Number.isFinite(sourceWidth) ||
    !Number.isFinite(sourceHeight) ||
    sourceWidth <= 0 ||
    sourceHeight <= 0
  ) {
    return { ok: false, error: "Source dimensions must be positive." };
  }

  const long = Math.max(sourceWidth, sourceHeight);
  if (maxSide == null || !Number.isFinite(maxSide) || maxSide <= 0) {
    return {
      ok: true,
      width: roundPx(sourceWidth),
      height: roundPx(sourceHeight),
      scaled: false,
    };
  }
  if (maxSide > 10000) {
    return { ok: false, error: "Max side cannot exceed 10,000px." };
  }
  if (long <= maxSide) {
    return {
      ok: true,
      width: roundPx(sourceWidth),
      height: roundPx(sourceHeight),
      scaled: false,
    };
  }
  const scale = maxSide / long;
  return {
    ok: true,
    width: roundPx(sourceWidth * scale),
    height: roundPx(sourceHeight * scale),
    scaled: true,
  };
}

export type CompressionStats =
  | {
      ok: true;
      originalBytes: number;
      compressedBytes: number;
      savedBytes: number;
      savedPercent: number;
      /** compressed / original (1 = same size, <1 smaller) */
      ratio: number;
    }
  | { ok: false; error: string };

export function compressionStats(
  originalBytes: number,
  compressedBytes: number,
): CompressionStats {
  if (
    !Number.isFinite(originalBytes) ||
    !Number.isFinite(compressedBytes) ||
    originalBytes < 0 ||
    compressedBytes < 0
  ) {
    return { ok: false, error: "Byte sizes must be non-negative numbers." };
  }
  const savedBytes = originalBytes - compressedBytes;
  const savedPercent =
    originalBytes === 0
      ? 0
      : Math.round((savedBytes / originalBytes) * 1000) / 10;
  const ratio =
    originalBytes === 0
      ? 0
      : Math.round((compressedBytes / originalBytes) * 1000) / 1000;
  return {
    ok: true,
    originalBytes,
    compressedBytes,
    savedBytes,
    savedPercent,
    ratio,
  };
}

export const COMPRESS_QUALITY_PRESETS = [
  { id: "high", label: "High", quality: 85 },
  { id: "balanced", label: "Balanced", quality: 70 },
  { id: "small", label: "Small", quality: 50 },
] as const;

export const COMPRESS_MAX_SIDE_PRESETS = [
  { id: "none", label: "Original size", value: null },
  { id: "1920", label: "1920px", value: 1920 },
  { id: "1280", label: "1280px", value: 1280 },
  { id: "800", label: "800px", value: 800 },
] as const;
