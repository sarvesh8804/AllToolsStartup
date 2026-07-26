import { parseColor, type Rgb } from "@/lib/color/contrast";

export type HexRgbConversion =
  | {
      ok: true;
      rgb: Rgb;
      hex: string;
      hexShort: string | null;
      cssRgb: string;
      hsl: { h: number; s: number; l: number };
      cssHsl: string;
    }
  | { ok: false; error: string };

function toShortHex(hex: string): string | null {
  const h = hex.replace(/^#/, "").toLowerCase();
  if (
    h.length === 6 &&
    h[0] === h[1] &&
    h[2] === h[3] &&
    h[4] === h[5]
  ) {
    return `#${h[0]}${h[2]}${h[4]}`;
  }
  return null;
}

export function rgbToHsl({ r, g, b }: Rgb): { h: number; s: number; l: number } {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  if (max === min) {
    return { h: 0, s: 0, l: Math.round(l * 1000) / 10 };
  }
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  switch (max) {
    case rn:
      h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6;
      break;
    case gn:
      h = ((bn - rn) / d + 2) / 6;
      break;
    default:
      h = ((rn - gn) / d + 4) / 6;
  }
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 1000) / 10,
    l: Math.round(l * 1000) / 10,
  };
}

export function convertColor(input: string): HexRgbConversion {
  const parsed = parseColor(input);
  if (!parsed.ok) return parsed;

  const { rgb, hex } = parsed;
  const hsl = rgbToHsl(rgb);
  return {
    ok: true,
    rgb,
    hex,
    hexShort: toShortHex(hex),
    cssRgb: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
    hsl,
    cssHsl: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`,
  };
}
