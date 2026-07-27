/** Clamp JPEG quality to 0.01–1 (canvas.toBlob expects 0–1). */
export function clampJpegQuality(quality: number): number {
  if (!Number.isFinite(quality)) return 0.92;
  if (quality > 1) {
    // Accept 1–100 UI scale
    return Math.min(1, Math.max(0.01, quality / 100));
  }
  return Math.min(1, Math.max(0.01, quality));
}

/** Quality shown in UI as 1–100. */
export function qualityToPercent(quality: number): number {
  const q = clampJpegQuality(quality);
  return Math.round(q * 100);
}

export function changeExtension(filename: string, ext: string): string {
  const clean = ext.replace(/^\./, "").toLowerCase();
  const base = filename.replace(/\.[^.]+$/, "") || "image";
  return `${base}.${clean}`;
}

export function isPngFile(file: { type: string; name: string }): boolean {
  if (file.type === "image/png") return true;
  return /\.png$/i.test(file.name);
}

export function isJpegFile(file: { type: string; name: string }): boolean {
  if (file.type === "image/jpeg" || file.type === "image/jpg") return true;
  return /\.jpe?g$/i.test(file.name);
}

export function isWebpFile(file: { type: string; name: string }): boolean {
  if (file.type === "image/webp") return true;
  return /\.webp$/i.test(file.name);
}

/** PNG / JPEG / WebP — formats this converter suite accepts. */
export function isConvertibleImageFile(file: {
  type: string;
  name: string;
}): boolean {
  return isPngFile(file) || isJpegFile(file) || isWebpFile(file);
}

export function detectImageMime(
  file: { type: string; name: string },
): OutputImageFormat | null {
  if (isPngFile(file)) return "image/png";
  if (isJpegFile(file)) return "image/jpeg";
  if (isWebpFile(file)) return "image/webp";
  return null;
}

export function isRasterImageFile(file: { type: string; name: string }): boolean {
  if (file.type.startsWith("image/") && file.type !== "image/svg+xml") {
    return true;
  }
  return /\.(png|jpe?g|webp|gif|bmp)$/i.test(file.name);
}

export type OutputImageFormat = "image/jpeg" | "image/png" | "image/webp";

export function mimeToExtension(mime: OutputImageFormat): string {
  switch (mime) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
  }
}

/** Parse #RGB / #RRGGBB into CSS color; fallback white. */
export function normalizeHexColor(input: string): string {
  const raw = input.trim();
  if (/^#[0-9a-fA-F]{6}$/.test(raw)) return raw.toLowerCase();
  if (/^#[0-9a-fA-F]{3}$/.test(raw)) {
    const r = raw[1];
    const g = raw[2];
    const b = raw[3];
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }
  return "#ffffff";
}

export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
