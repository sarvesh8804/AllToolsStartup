export type Rgb = { r: number; g: number; b: number };

export type ContrastResult = {
  ratio: number;
  ratioLabel: string;
  foreground: Rgb;
  background: Rgb;
  aaNormal: boolean;
  aaLarge: boolean;
  aaaNormal: boolean;
  aaaLarge: boolean;
};

export type ColorParseResult =
  | { ok: true; rgb: Rgb; hex: string }
  | { ok: false; error: string };

function clampChannel(n: number): number {
  return Math.min(255, Math.max(0, Math.round(n)));
}

export function rgbToHex({ r, g, b }: Rgb): string {
  return (
    "#" +
    [r, g, b]
      .map((c) => clampChannel(c).toString(16).padStart(2, "0"))
      .join("")
  );
}

export function parseColor(input: string): ColorParseResult {
  const raw = input.trim();
  if (!raw) return { ok: false, error: "Enter a color." };

  const hex = raw.replace(/^#/, "");
  if (/^[0-9a-fA-F]{3}$/.test(hex)) {
    const r = parseInt(hex[0] + hex[0], 16);
    const g = parseInt(hex[1] + hex[1], 16);
    const b = parseInt(hex[2] + hex[2], 16);
    const rgb = { r, g, b };
    return { ok: true, rgb, hex: rgbToHex(rgb) };
  }
  if (/^[0-9a-fA-F]{6}$/.test(hex)) {
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    const rgb = { r, g, b };
    return { ok: true, rgb, hex: rgbToHex(rgb) };
  }

  const rgbMatch = raw.match(
    /^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})(?:\s*,\s*[\d.]+)?\s*\)$/i,
  );
  if (rgbMatch) {
    const r = Number(rgbMatch[1]);
    const g = Number(rgbMatch[2]);
    const b = Number(rgbMatch[3]);
    if ([r, g, b].some((c) => c > 255)) {
      return { ok: false, error: "RGB channels must be 0–255." };
    }
    const rgb = { r, g, b };
    return { ok: true, rgb, hex: rgbToHex(rgb) };
  }

  return {
    ok: false,
    error: "Use hex (#rgb / #rrggbb) or rgb(r, g, b).",
  };
}

/** sRGB channel to linear (WCAG 2). */
function toLinear(channel: number): number {
  const c = channel / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

export function relativeLuminance({ r, g, b }: Rgb): number {
  return (
    0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b)
  );
}

export function contrastRatio(fg: Rgb, bg: Rgb): number {
  const l1 = relativeLuminance(fg);
  const l2 = relativeLuminance(bg);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

export function checkContrast(
  foreground: string,
  background: string,
):
  | { ok: true; value: ContrastResult }
  | { ok: false; error: string } {
  const fg = parseColor(foreground);
  const bg = parseColor(background);
  if (!fg.ok) return { ok: false, error: `Foreground: ${fg.error}` };
  if (!bg.ok) return { ok: false, error: `Background: ${bg.error}` };

  const ratio = contrastRatio(fg.rgb, bg.rgb);
  const rounded = Math.round(ratio * 100) / 100;

  return {
    ok: true,
    value: {
      ratio: rounded,
      ratioLabel: `${rounded.toFixed(2)}:1`,
      foreground: fg.rgb,
      background: bg.rgb,
      aaNormal: ratio >= 4.5,
      aaLarge: ratio >= 3,
      aaaNormal: ratio >= 7,
      aaaLarge: ratio >= 4.5,
    },
  };
}
