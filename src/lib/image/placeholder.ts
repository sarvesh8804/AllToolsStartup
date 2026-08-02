import { rgbToHex } from "@/lib/color/contrast";
import { hslToRgb } from "@/lib/color/picker";

export type PlaceholderInput = {
  width: number;
  height: number;
  seed?: number;
  text?: string;
  showDimensions?: boolean;
};

export type PlaceholderResult =
  | {
      ok: true;
      svg: string;
      width: number;
      height: number;
      label: string;
      background: string;
    }
  | { ok: false; error: string };

export const DEFAULT_PLACEHOLDER = {
  width: 800,
  height: 600,
  seed: 42,
} as const;

export const PLACEHOLDER_MIN = 16;
export const PLACEHOLDER_MAX = 4000;

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function gradientColors(seed: number): { start: string; end: string; text: string } {
  const start = rgbToHex(
    hslToRgb({
      h: seed % 360,
      s: 48 + (seed % 20),
      l: 42 + (seed % 10),
    }),
  );
  const end = rgbToHex(
    hslToRgb({
      h: (seed + 58) % 360,
      s: 52 + (seed % 18),
      l: 34 + (seed % 12),
    }),
  );
  const text = rgbToHex(
    hslToRgb({
      h: (seed + 180) % 360,
      s: 18,
      l: 96,
    }),
  );
  return { start, end, text };
}

/** Build an SVG placeholder image similar to common lorem picsum-style blocks. */
export function buildPlaceholderSvg(
  input: PlaceholderInput,
): PlaceholderResult {
  const width = Math.floor(input.width);
  const height = Math.floor(input.height);

  if (
    !Number.isFinite(width) ||
    !Number.isFinite(height) ||
    width < PLACEHOLDER_MIN ||
    width > PLACEHOLDER_MAX ||
    height < PLACEHOLDER_MIN ||
    height > PLACEHOLDER_MAX
  ) {
    return {
      ok: false,
      error: `Width and height must be between ${PLACEHOLDER_MIN} and ${PLACEHOLDER_MAX}.`,
    };
  }

  const seed =
    input.seed ??
    Math.abs(width * 73856093) ^ Math.abs(height * 19349663);
  const { start, end, text } = gradientColors(seed >>> 0);
  const showDimensions = input.showDimensions !== false;
  const label =
    input.text?.trim() ||
    (showDimensions ? `${width} × ${height}` : "Placeholder");
  const fontSize = Math.max(14, Math.min(72, Math.round(Math.min(width, height) / 10)));

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeXml(label)}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${start}" />
      <stop offset="100%" stop-color="${end}" />
    </linearGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#bg)" />
  <text x="50%" y="50%" dominant-baseline="central" text-anchor="middle" fill="${text}" font-family="system-ui,Segoe UI,sans-serif" font-size="${fontSize}" font-weight="600">${escapeXml(label)}</text>
</svg>
`;

  return {
    ok: true,
    svg,
    width,
    height,
    label,
    background: start,
  };
}

/** Data URL for inline preview or download links. */
export function placeholderSvgToDataUrl(svg: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
