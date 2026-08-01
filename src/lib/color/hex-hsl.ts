import { parseColor, rgbToHex, type Rgb } from "@/lib/color/contrast";
import { rgbToHsl } from "@/lib/color/hex-rgb";
import { hslToRgb } from "@/lib/color/picker";

export type Hsl = { h: number; s: number; l: number };

export type HexHslConversion =
  | {
      ok: true;
      hex: string;
      rgb: Rgb;
      hsl: Hsl;
      /** hsl(210, 50%, 50%) */
      cssHsl: string;
      /** hsl(210 50% 50%) — CSS Color Level 4 */
      cssHslModern: string;
      /** Space-separated channels: 210, 50%, 50% */
      channels: string;
      hLabel: string;
      sLabel: string;
      lLabel: string;
    }
  | { ok: false; error: string };

export function formatCssHsl(hsl: Hsl): string {
  return `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
}

export function formatCssHslModern(hsl: Hsl): string {
  return `hsl(${hsl.h} ${hsl.s}% ${hsl.l}%)`;
}

export function formatHslChannels(hsl: Hsl): string {
  return `${hsl.h}, ${hsl.s}%, ${hsl.l}%`;
}

function normalizeHsl(h: number, s: number, l: number): Hsl {
  return {
    h: Math.round(((h % 360) + 360) % 360),
    s: Math.round(Math.min(100, Math.max(0, s)) * 10) / 10,
    l: Math.round(Math.min(100, Math.max(0, l)) * 10) / 10,
  };
}

function buildResult(hex: string, rgb: Rgb, hsl: Hsl): Extract<HexHslConversion, { ok: true }> {
  return {
    ok: true,
    hex,
    rgb,
    hsl,
    cssHsl: formatCssHsl(hsl),
    cssHslModern: formatCssHslModern(hsl),
    channels: formatHslChannels(hsl),
    hLabel: `${hsl.h}°`,
    sLabel: `${hsl.s}%`,
    lLabel: `${hsl.l}%`,
  };
}

function parseHslInput(input: string): Hsl | null {
  const match = input.match(
    /^hsla?\(\s*([\d.]+)(?:deg)?\s*[,/\s]\s*([\d.]+)%\s*[,/\s]\s*([\d.]+)%/i,
  );
  if (!match) return null;
  return normalizeHsl(Number(match[1]), Number(match[2]), Number(match[3]));
}

/** Convert hex, rgb(), or hsl() input to HSL values and CSS formats. */
export function convertToHsl(input: string): HexHslConversion {
  const trimmed = input.trim();
  if (!trimmed) {
    return { ok: false, error: "Enter a color." };
  }

  const hslParsed = parseHslInput(trimmed);
  if (hslParsed) {
    const rgb = hslToRgb(hslParsed);
    return buildResult(rgbToHex(rgb), rgb, hslParsed);
  }

  const parsed = parseColor(trimmed);
  if (!parsed.ok) return parsed;

  return buildResult(parsed.hex, parsed.rgb, rgbToHsl(parsed.rgb));
}

/** Recompute hex/rgb when user edits HSL sliders (h 0–360, s/l 0–100). */
export function hslChannelsToConversion(
  h: number,
  s: number,
  l: number,
): Extract<HexHslConversion, { ok: true }> {
  const hsl = normalizeHsl(h, s, l);
  const rgb = hslToRgb(hsl);
  return buildResult(rgbToHex(rgb), rgb, hsl);
}
