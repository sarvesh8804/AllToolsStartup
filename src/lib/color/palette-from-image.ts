import { rgbToHex, type Rgb } from "@/lib/color/contrast";

export type PaletteColor = {
  hex: string;
  rgb: Rgb;
  count: number;
  percent: number;
};

export type ExtractPaletteOptions = {
  /** Max colors to return (default 6). */
  maxColors?: number;
  /** Sample every Nth pixel (default 4). Lower = slower, more accurate. */
  sampleStep?: number;
  /** Ignore pixels with alpha below this 0–255 (default 128). */
  ignoreAlphaBelow?: number;
  /** Quantization bits per channel 1–8 (default 4). */
  bits?: number;
  /** Minimum Euclidean distance between returned colors (default 32). */
  minDistance?: number;
};

function clamp(n: number, min: number, max: number): number {
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, n));
}

function quantizeChannel(value: number, bits: number): number {
  const v = clamp(value, 0, 255);
  if (bits >= 8) return Math.round(v);
  const levels = 1 << bits;
  const max = levels - 1;
  const q = Math.round((v / 255) * max);
  return Math.round((q / max) * 255);
}

function distance(a: Rgb, b: Rgb): number {
  const dr = a.r - b.r;
  const dg = a.g - b.g;
  const db = a.b - b.b;
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

/**
 * Extract dominant colors from RGBA pixel buffer (ImageData.data).
 * Pure / Node-safe — no Canvas dependency.
 */
export function extractPaletteFromPixels(
  data: ArrayLike<number>,
  options: ExtractPaletteOptions = {},
): PaletteColor[] {
  const maxColors = clamp(Math.round(options.maxColors ?? 6), 1, 16);
  const sampleStep = clamp(Math.round(options.sampleStep ?? 4), 1, 64);
  const ignoreAlphaBelow = clamp(
    Math.round(options.ignoreAlphaBelow ?? 128),
    0,
    255,
  );
  const bits = clamp(Math.round(options.bits ?? 4), 1, 8);
  const minDistance = clamp(options.minDistance ?? 32, 0, 200);

  const counts = new Map<string, { rgb: Rgb; count: number }>();
  let sampled = 0;

  for (let i = 0; i + 3 < data.length; i += 4 * sampleStep) {
    const a = data[i + 3] ?? 255;
    if (a < ignoreAlphaBelow) continue;
    const rgb: Rgb = {
      r: quantizeChannel(data[i] ?? 0, bits),
      g: quantizeChannel(data[i + 1] ?? 0, bits),
      b: quantizeChannel(data[i + 2] ?? 0, bits),
    };
    const key = `${rgb.r},${rgb.g},${rgb.b}`;
    const prev = counts.get(key);
    if (prev) prev.count += 1;
    else counts.set(key, { rgb, count: 1 });
    sampled += 1;
  }

  if (sampled === 0) return [];

  const ranked = [...counts.values()].sort((a, b) => b.count - a.count);
  const picked: { rgb: Rgb; count: number }[] = [];

  for (const entry of ranked) {
    if (picked.length >= maxColors) break;
    const tooClose = picked.some(
      (p) => distance(p.rgb, entry.rgb) < minDistance,
    );
    if (tooClose) continue;
    picked.push(entry);
  }

  // If distance filter left us short, fill from ranked without distance.
  for (const entry of ranked) {
    if (picked.length >= maxColors) break;
    if (picked.some((p) => p.rgb.r === entry.rgb.r && p.rgb.g === entry.rgb.g && p.rgb.b === entry.rgb.b)) {
      continue;
    }
    picked.push(entry);
  }

  const total = picked.reduce((n, p) => n + p.count, 0) || 1;
  return picked.map((p) => ({
    hex: rgbToHex(p.rgb),
    rgb: p.rgb,
    count: p.count,
    percent: Math.round((p.count / total) * 1000) / 10,
  }));
}

export type ImageDataLike = {
  data: ArrayLike<number>;
  width: number;
  height: number;
};

export function extractPaletteFromImageData(
  imageData: ImageDataLike,
  options: ExtractPaletteOptions = {},
): PaletteColor[] {
  return extractPaletteFromPixels(imageData.data, options);
}

/** Format palette as CSS custom properties block. */
export function formatPaletteCss(
  colors: PaletteColor[],
  prefix = "color",
): string {
  if (!colors.length) return "";
  const lines = colors.map(
    (c, i) => `  --${prefix}-${i + 1}: ${c.hex};`,
  );
  return `:root {\n${lines.join("\n")}\n}`;
}
