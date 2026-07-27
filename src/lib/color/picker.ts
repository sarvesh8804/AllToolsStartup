import { rgbToHex, type Rgb } from "@/lib/color/contrast";
import { rgbToHsl } from "@/lib/color/hex-rgb";

export type Hsl = { h: number; s: number; l: number };

function clamp(n: number, min: number, max: number): number {
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, n));
}

export function hslToRgb({ h, s, l }: Hsl): Rgb {
  const hh = ((h % 360) + 360) % 360;
  const ss = clamp(s, 0, 100) / 100;
  const ll = clamp(l, 0, 100) / 100;

  if (ss === 0) {
    const v = Math.round(ll * 255);
    return { r: v, g: v, b: v };
  }

  const q = ll < 0.5 ? ll * (1 + ss) : ll + ss - ll * ss;
  const p = 2 * ll - q;
  const hk = hh / 360;

  const channel = (t: number) => {
    let tt = t;
    if (tt < 0) tt += 1;
    if (tt > 1) tt -= 1;
    if (tt < 1 / 6) return p + (q - p) * 6 * tt;
    if (tt < 1 / 2) return q;
    if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
    return p;
  };

  return {
    r: Math.round(channel(hk + 1 / 3) * 255),
    g: Math.round(channel(hk) * 255),
    b: Math.round(channel(hk - 1 / 3) * 255),
  };
}

export type PickedColor = {
  hex: string;
  rgb: Rgb;
  hsl: Hsl;
  cssRgb: string;
  cssHsl: string;
  cssHex: string;
};

export function colorFromRgb(r: number, g: number, b: number): PickedColor {
  const rgb = {
    r: Math.round(clamp(r, 0, 255)),
    g: Math.round(clamp(g, 0, 255)),
    b: Math.round(clamp(b, 0, 255)),
  };
  const hex = rgbToHex(rgb);
  const hsl = rgbToHsl(rgb);
  return {
    hex,
    rgb,
    hsl,
    cssRgb: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
    cssHsl: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`,
    cssHex: hex,
  };
}

export function colorFromHsl(h: number, s: number, l: number): PickedColor {
  const wrapped = ((h % 360) + 360) % 360;
  const hsl = {
    h: Math.round(wrapped),
    s: Math.round(clamp(s, 0, 100) * 10) / 10,
    l: Math.round(clamp(l, 0, 100) * 10) / 10,
  };
  const rgb = hslToRgb(hsl);
  return colorFromRgb(rgb.r, rgb.g, rgb.b);
}

export function colorFromHex(hex: string): PickedColor | null {
  const m = hex.trim().match(/^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/);
  if (!m) return null;
  let h = m[1];
  if (h.length === 3) {
    h = `${h[0]}${h[0]}${h[1]}${h[1]}${h[2]}${h[2]}`;
  }
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return colorFromRgb(r, g, b);
}

/** Simple complementary (hue + 180) and analogous helpers. */
export function relatedColors(base: PickedColor): {
  complementary: PickedColor;
  analogous: [PickedColor, PickedColor];
} {
  const { h, s, l } = base.hsl;
  return {
    complementary: colorFromHsl(h + 180, s, l),
    analogous: [colorFromHsl(h - 30, s, l), colorFromHsl(h + 30, s, l)],
  };
}
