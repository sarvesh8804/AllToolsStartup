import {
  clampJpegQuality,
  type OutputImageFormat,
} from "@/lib/image/format";

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
