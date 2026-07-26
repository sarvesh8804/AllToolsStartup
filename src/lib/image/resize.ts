export type ResizeMode = "exact" | "fit" | "percent";

export type ResizeInput = {
  sourceWidth: number;
  sourceHeight: number;
  /** Target width (pixels). Ignored for percent mode when unset. */
  width?: number | null;
  /** Target height (pixels). Ignored for percent mode when unset. */
  height?: number | null;
  /** Scale percentage (100 = same size). Used when mode is percent. */
  percent?: number | null;
  mode: ResizeMode;
  /** When true (exact/fit), missing side is derived from aspect ratio. */
  lockAspect?: boolean;
};

export type ResizeOutput =
  | { ok: true; width: number; height: number }
  | { ok: false; error: string };

function isPositiveInt(n: unknown): n is number {
  return typeof n === "number" && Number.isFinite(n) && n > 0;
}

/** Round to nearest pixel, minimum 1. */
export function roundPx(n: number): number {
  return Math.max(1, Math.round(n));
}

/**
 * Compute output pixel size for an image resize.
 * Pure math — no canvas / DOM.
 */
export function computeResizeSize(input: ResizeInput): ResizeOutput {
  const { sourceWidth: sw, sourceHeight: sh, mode } = input;
  if (!isPositiveInt(sw) || !isPositiveInt(sh)) {
    return { ok: false, error: "Source dimensions must be positive numbers." };
  }

  const lock = input.lockAspect !== false;
  const aspect = sw / sh;

  if (mode === "percent") {
    const p = input.percent;
    if (p == null || !Number.isFinite(p) || p <= 0) {
      return { ok: false, error: "Enter a scale percentage greater than 0." };
    }
    if (p > 1000) {
      return { ok: false, error: "Scale percentage cannot exceed 1000%." };
    }
    return {
      ok: true,
      width: roundPx((sw * p) / 100),
      height: roundPx((sh * p) / 100),
    };
  }

  const w = input.width ?? null;
  const h = input.height ?? null;
  const hasW = w != null && Number.isFinite(w);
  const hasH = h != null && Number.isFinite(h);

  if (hasW && w! <= 0) {
    return { ok: false, error: "Width must be greater than 0." };
  }
  if (hasH && h! <= 0) {
    return { ok: false, error: "Height must be greater than 0." };
  }

  if (mode === "exact") {
    if (!hasW && !hasH) {
      return { ok: false, error: "Enter a width, height, or both." };
    }
    if (hasW && hasH && !lock) {
      return { ok: true, width: roundPx(w!), height: roundPx(h!) };
    }
    if (hasW && hasH && lock) {
      // Prefer width; derive height from aspect
      return {
        ok: true,
        width: roundPx(w!),
        height: roundPx(w! / aspect),
      };
    }
    if (hasW) {
      return {
        ok: true,
        width: roundPx(w!),
        height: roundPx(w! / aspect),
      };
    }
    return {
      ok: true,
      width: roundPx(h! * aspect),
      height: roundPx(h!),
    };
  }

  // fit — contain inside bounding box
  if (!hasW && !hasH) {
    return { ok: false, error: "Enter a max width, max height, or both." };
  }
  const maxW = hasW ? w! : Number.POSITIVE_INFINITY;
  const maxH = hasH ? h! : Number.POSITIVE_INFINITY;
  const scale = Math.min(
    hasW ? maxW / sw : Number.POSITIVE_INFINITY,
    hasH ? maxH / sh : Number.POSITIVE_INFINITY,
  );
  if (!Number.isFinite(scale) || scale <= 0) {
    return { ok: false, error: "Invalid fit dimensions." };
  }
  return {
    ok: true,
    width: roundPx(sw * scale),
    height: roundPx(sh * scale),
  };
}

export const RESIZE_PRESETS = [
  { id: "1920", label: "1920 wide", width: 1920, height: null },
  { id: "1280", label: "1280 wide", width: 1280, height: null },
  { id: "800", label: "800 wide", width: 800, height: null },
  { id: "512", label: "512×512", width: 512, height: 512 },
  { id: "50", label: "50%", percent: 50 },
  { id: "25", label: "25%", percent: 25 },
] as const;
