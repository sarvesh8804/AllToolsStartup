export type CropRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type CropValidation =
  | { ok: true; rect: CropRect }
  | { ok: false; error: string };

export type CropAspectPreset = {
  id: string;
  label: string;
  ratio: number | null;
};

export const CROP_ASPECT_PRESETS: CropAspectPreset[] = [
  { id: "free", label: "Free", ratio: null },
  { id: "1:1", label: "1:1", ratio: 1 },
  { id: "4:3", label: "4:3", ratio: 4 / 3 },
  { id: "16:9", label: "16:9", ratio: 16 / 9 },
  { id: "3:2", label: "3:2", ratio: 3 / 2 },
];

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, Math.floor(n)));
}

/** Validate and clamp a crop rectangle inside image bounds. */
export function validateCropRect(
  sourceWidth: number,
  sourceHeight: number,
  rect: CropRect,
): CropValidation {
  if (
    !Number.isFinite(sourceWidth) ||
    !Number.isFinite(sourceHeight) ||
    sourceWidth <= 0 ||
    sourceHeight <= 0
  ) {
    return { ok: false, error: "Image dimensions must be positive." };
  }

  const width = clamp(rect.width, 1, sourceWidth);
  const height = clamp(rect.height, 1, sourceHeight);
  const x = clamp(rect.x, 0, sourceWidth - width);
  const y = clamp(rect.y, 0, sourceHeight - height);

  return { ok: true, rect: { x, y, width, height } };
}

/** Fit the largest crop rect with a fixed aspect ratio inside the image. */
export function centerCropForAspect(
  sourceWidth: number,
  sourceHeight: number,
  ratio: number,
): CropRect {
  const sourceRatio = sourceWidth / sourceHeight;
  if (sourceRatio > ratio) {
    const height = sourceHeight;
    const width = Math.round(height * ratio);
    return {
      x: Math.round((sourceWidth - width) / 2),
      y: 0,
      width,
      height,
    };
  }
  const width = sourceWidth;
  const height = Math.round(width / ratio);
  return {
    x: 0,
    y: Math.round((sourceHeight - height) / 2),
    width,
    height,
  };
}

/** Default crop: full image. */
export function defaultCropRect(
  sourceWidth: number,
  sourceHeight: number,
): CropRect {
  return { x: 0, y: 0, width: sourceWidth, height: sourceHeight };
}
