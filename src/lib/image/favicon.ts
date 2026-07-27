export type FaviconSize = {
  id: string;
  size: number;
  label: string;
  /** Suggested filename without extension */
  filename: string;
};

/** Common web favicon / PWA icon sizes. */
export const FAVICON_SIZES: FaviconSize[] = [
  { id: "16", size: 16, label: "16×16", filename: "favicon-16x16" },
  { id: "32", size: 32, label: "32×32", filename: "favicon-32x32" },
  { id: "48", size: 48, label: "48×48", filename: "favicon-48x48" },
  { id: "180", size: 180, label: "180×180 Apple", filename: "apple-touch-icon" },
  { id: "192", size: 192, label: "192×192", filename: "android-chrome-192x192" },
  { id: "512", size: 512, label: "512×512", filename: "android-chrome-512x512" },
];

/** Sizes packed into favicon.ico by default. */
export const ICO_PACK_SIZES = [16, 32, 48] as const;

export type SquareCrop = {
  sx: number;
  sy: number;
  sSize: number;
};

/** Center-crop the largest square from source dimensions. */
export function squareCropRect(
  sourceWidth: number,
  sourceHeight: number,
): SquareCrop | { ok: false; error: string } {
  if (
    !Number.isFinite(sourceWidth) ||
    !Number.isFinite(sourceHeight) ||
    sourceWidth <= 0 ||
    sourceHeight <= 0
  ) {
    return { ok: false, error: "Source dimensions must be positive." };
  }
  const sSize = Math.min(sourceWidth, sourceHeight);
  return {
    sx: Math.max(0, Math.floor((sourceWidth - sSize) / 2)),
    sy: Math.max(0, Math.floor((sourceHeight - sSize) / 2)),
    sSize: Math.max(1, Math.round(sSize)),
  };
}

export type PngIconLayer = {
  size: number;
  png: Uint8Array;
};

/**
 * Build a multi-resolution .ico containing PNG-compressed images
 * (supported by modern browsers).
 */
export function buildIcoFromPngs(layers: PngIconLayer[]): Uint8Array {
  if (layers.length === 0) {
    throw new Error("At least one PNG layer is required.");
  }
  if (layers.length > 255) {
    throw new Error("ICO cannot contain more than 255 images.");
  }
  for (const layer of layers) {
    if (!Number.isInteger(layer.size) || layer.size < 1 || layer.size > 256) {
      throw new Error("ICO layer size must be an integer from 1 to 256.");
    }
    if (layer.png.length < 8) {
      throw new Error("Invalid PNG layer.");
    }
  }

  const count = layers.length;
  const headerSize = 6;
  const entrySize = 16;
  const directorySize = headerSize + entrySize * count;

  let offset = directorySize;
  const offsets: number[] = [];
  for (const layer of layers) {
    offsets.push(offset);
    offset += layer.png.length;
  }
  const total = offset;
  const out = new Uint8Array(total);
  const view = new DataView(out.buffer);

  // ICONDIR
  view.setUint16(0, 0, true); // reserved
  view.setUint16(2, 1, true); // type = icon
  view.setUint16(4, count, true);

  for (let i = 0; i < count; i++) {
    const layer = layers[i]!;
    const entry = headerSize + i * entrySize;
    const dim = layer.size >= 256 ? 0 : layer.size;
    out[entry] = dim; // width
    out[entry + 1] = dim; // height
    out[entry + 2] = 0; // color count
    out[entry + 3] = 0; // reserved
    view.setUint16(entry + 4, 1, true); // planes
    view.setUint16(entry + 6, 32, true); // bit count
    view.setUint32(entry + 8, layer.png.length, true);
    view.setUint32(entry + 12, offsets[i]!, true);
    out.set(layer.png, offsets[i]!);
  }

  return out;
}

/** HTML snippet for dropping into <head>. */
export function faviconHtmlSnippet(opts?: {
  includeApple?: boolean;
  includeManifestIcons?: boolean;
}): string {
  const includeApple = opts?.includeApple !== false;
  const includeManifest = opts?.includeManifestIcons !== false;
  const lines = [
    `<link rel="icon" href="/favicon.ico" sizes="any">`,
    `<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">`,
    `<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">`,
  ];
  if (includeApple) {
    lines.push(
      `<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">`,
    );
  }
  if (includeManifest) {
    lines.push(
      `<link rel="icon" type="image/png" sizes="192x192" href="/android-chrome-192x192.png">`,
      `<link rel="icon" type="image/png" sizes="512x512" href="/android-chrome-512x512.png">`,
    );
  }
  return lines.join("\n");
}
