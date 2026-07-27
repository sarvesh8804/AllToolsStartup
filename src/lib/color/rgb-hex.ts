import { convertColor, type HexRgbConversion } from "@/lib/color/hex-rgb";
import { rgbToHex, type Rgb } from "@/lib/color/contrast";

export type RgbChannels = Rgb;

function clamp(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.min(255, Math.max(0, Math.round(n)));
}

export function convertRgbChannels(
  r: number,
  g: number,
  b: number,
): HexRgbConversion {
  const rgb = { r: clamp(r), g: clamp(g), b: clamp(b) };
  return convertColor(rgbToHex(rgb));
}

export function parseRgbInput(input: string): HexRgbConversion {
  const trimmed = input.trim();
  if (!trimmed) return { ok: false, error: "Enter RGB values." };

  // Accept "r, g, b" without rgb()
  const bare = trimmed.match(
    /^(\d{1,3})\s*[, ]\s*(\d{1,3})\s*[, ]\s*(\d{1,3})$/,
  );
  if (bare) {
    const channels = [bare[1], bare[2], bare[3]].map(Number);
    if (channels.some((c) => c > 255)) {
      return { ok: false, error: "RGB channels must be 0–255." };
    }
    return convertRgbChannels(channels[0], channels[1], channels[2]);
  }

  return convertColor(trimmed);
}
