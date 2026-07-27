import jsQR from "jsqr";

export type QrDecodeResult =
  | { ok: true; text: string }
  | { ok: false; error: string };

export type ImageDataLike = {
  data: Uint8ClampedArray;
  width: number;
  height: number;
};

/**
 * Decode a QR code from raw RGBA ImageData (Canvas getImageData).
 */
export function decodeQrFromImageData(
  imageData: ImageDataLike,
): QrDecodeResult {
  if (!imageData.width || !imageData.height || imageData.data.length === 0) {
    return { ok: false, error: "No image data to decode." };
  }

  try {
    const code = jsQR(
      imageData.data,
      imageData.width,
      imageData.height,
      { inversionAttempts: "attemptBoth" },
    );
    if (!code || !code.data) {
      return { ok: false, error: "No QR code found in this image." };
    }
    return { ok: true, text: code.data };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Failed to decode QR code.",
    };
  }
}

/**
 * Render a black/white module matrix into RGBA ImageData for tests / offline use.
 * `modules` is a square boolean matrix (true = dark).
 */
export function modulesToImageData(
  modules: boolean[][],
  scale = 4,
  margin = 4,
): ImageDataLike {
  const n = modules.length;
  const size = (n + margin * 2) * scale;
  const data = new Uint8ClampedArray(size * size * 4);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const mx = Math.floor(x / scale) - margin;
      const my = Math.floor(y / scale) - margin;
      const dark =
        mx >= 0 && my >= 0 && mx < n && my < n ? modules[my]![mx]! : false;
      const i = (y * size + x) * 4;
      const v = dark ? 0 : 255;
      data[i] = v;
      data[i + 1] = v;
      data[i + 2] = v;
      data[i + 3] = 255;
    }
  }

  return { data, width: size, height: size };
}
