import {
  clampJpegQuality,
  type OutputImageFormat,
} from "@/lib/image/format";
import type { CropRect } from "@/lib/image/crop";

export type LoadedImage = {
  bitmap: ImageBitmap;
  width: number;
  height: number;
};

export async function loadImageBitmap(file: File): Promise<LoadedImage> {
  const bitmap = await createImageBitmap(file);
  return {
    bitmap,
    width: bitmap.width,
    height: bitmap.height,
  };
}

export type DrawOptions = {
  width: number;
  height: number;
  /** Fill under transparent pixels (JPEG has no alpha). */
  background?: string;
};

/** Crop a region from a source image into a new canvas. */
export function drawCropToCanvas(
  source: CanvasImageSource,
  crop: CropRect,
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = crop.width;
  canvas.height = crop.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Could not get canvas 2D context.");
  }
  ctx.drawImage(
    source,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    crop.width,
    crop.height,
  );
  return canvas;
}

export function drawImageToCanvas(
  source: CanvasImageSource,
  options: DrawOptions,
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = options.width;
  canvas.height = options.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Could not get canvas 2D context.");
  }
  if (options.background) {
    ctx.fillStyle = options.background;
    ctx.fillRect(0, 0, options.width, options.height);
  }
  ctx.drawImage(source, 0, 0, options.width, options.height);
  return canvas;
}

export function canvasToBlob(
  canvas: HTMLCanvasElement,
  mime: OutputImageFormat,
  quality?: number,
): Promise<Blob> {
  const q =
    mime === "image/jpeg" || mime === "image/webp"
      ? clampJpegQuality(quality ?? 0.92)
      : undefined;

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error(`Failed to encode ${mime}.`));
          return;
        }
        resolve(blob);
      },
      mime,
      q,
    );
  });
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
