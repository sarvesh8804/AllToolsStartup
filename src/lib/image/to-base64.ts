import { formatBytes, isRasterImageFile } from "@/lib/image/format";

export type ImageBase64OutputFormat =
  | "data-url"
  | "raw"
  | "css"
  | "html";

export type ImageToBase64Result = {
  mime: string;
  base64: string;
  dataUrl: string;
  css: string;
  html: string;
  byteLength: number;
  sizeLabel: string;
  charLength: number;
};

/** Encode binary bytes as standard Base64 (browser + Node via btoa). */
export function bytesToBase64(bytes: Uint8Array): string {
  const chunkSize = 0x8000;
  let binary = "";
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const slice = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode(...slice);
  }
  return btoa(binary);
}

export function buildDataUrl(mime: string, base64: string): string {
  const type = mime.trim() || "application/octet-stream";
  return `data:${type};base64,${base64}`;
}

export function buildCssBackground(dataUrl: string): string {
  return `background-image: url("${dataUrl}");`;
}

export function buildHtmlImg(dataUrl: string, alt = ""): string {
  const safeAlt = alt
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  return `<img src="${dataUrl}" alt="${safeAlt}" />`;
}

export function isEncodableImageFile(file: {
  type: string;
  name: string;
}): boolean {
  if (file.type === "image/svg+xml" || /\.svg$/i.test(file.name)) return true;
  return isRasterImageFile(file);
}

export function guessImageMime(
  file: { type: string; name: string },
): string {
  if (file.type && file.type.startsWith("image/")) return file.type;
  const name = file.name.toLowerCase();
  if (name.endsWith(".png")) return "image/png";
  if (name.endsWith(".jpg") || name.endsWith(".jpeg")) return "image/jpeg";
  if (name.endsWith(".webp")) return "image/webp";
  if (name.endsWith(".gif")) return "image/gif";
  if (name.endsWith(".bmp")) return "image/bmp";
  if (name.endsWith(".svg")) return "image/svg+xml";
  return "application/octet-stream";
}

export function imageBytesToBase64(
  bytes: Uint8Array,
  mime: string,
  alt = "image",
): ImageToBase64Result {
  const base64 = bytesToBase64(bytes);
  const dataUrl = buildDataUrl(mime, base64);
  return {
    mime,
    base64,
    dataUrl,
    css: buildCssBackground(dataUrl),
    html: buildHtmlImg(dataUrl, alt),
    byteLength: bytes.byteLength,
    sizeLabel: formatBytes(bytes.byteLength),
    charLength: base64.length,
  };
}

export function selectImageBase64Output(
  result: ImageToBase64Result,
  format: ImageBase64OutputFormat,
): string {
  switch (format) {
    case "raw":
      return result.base64;
    case "css":
      return result.css;
    case "html":
      return result.html;
    case "data-url":
    default:
      return result.dataUrl;
  }
}

export { isRasterImageFile, formatBytes };
