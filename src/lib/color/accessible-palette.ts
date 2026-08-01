import {
  contrastRatio,
  parseColor,
  rgbToHex,
  type Rgb,
} from "@/lib/color/contrast";
import { colorFromHsl, colorFromRgb, hslToRgb, type PickedColor } from "@/lib/color/picker";

export type AccessibleTheme = "light" | "dark";
export type WcagLevel = "AA" | "AAA";

export type PaletteColor = {
  token: string;
  name: string;
  hex: string;
  role: string;
};

export type PaletteContrastPair = {
  id: string;
  label: string;
  foregroundToken: string;
  backgroundToken: string;
  foreground: string;
  background: string;
  ratio: number;
  ratioLabel: string;
  passesNormal: boolean;
  passesLarge: boolean;
};

export type AccessiblePaletteResult =
  | {
      ok: true;
      theme: AccessibleTheme;
      level: WcagLevel;
      colors: PaletteColor[];
      pairs: PaletteContrastPair[];
      cssVariables: string;
    }
  | { ok: false; error: string };

const WHITE: Rgb = { r: 255, g: 255, b: 255 };
const BLACK: Rgb = { r: 0, g: 0, b: 0 };

export function minTextContrast(level: WcagLevel, large = false): number {
  if (large) return level === "AAA" ? 4.5 : 3;
  return level === "AAA" ? 7 : 4.5;
}

export function minUiContrast(): number {
  return 3;
}

function roundRatio(ratio: number): number {
  return Math.round(ratio * 100) / 100;
}

function rgbAtLightness(h: number, s: number, l: number): Rgb {
  return hslToRgb({ h, s, l });
}

/** Binary-search HSL lightness until fg/ bg meets minRatio. */
export function findForegroundForBackground(
  bg: Rgb,
  hue: number,
  saturation: number,
  minRatio: number,
  preferDark: boolean,
): Rgb {
  let low = 0;
  let high = 100;
  let best: Rgb | null = null;

  for (let i = 0; i < 48; i += 1) {
    const mid = (low + high) / 2;
    const candidate = rgbAtLightness(hue, saturation, mid);
    const ratio = contrastRatio(candidate, bg);
    if (ratio >= minRatio) {
      best = candidate;
      if (preferDark) high = mid;
      else low = mid;
    } else if (preferDark) {
      low = mid;
    } else {
      high = mid;
    }
  }

  if (best) return best;

  const whiteRatio = contrastRatio(WHITE, bg);
  const blackRatio = contrastRatio(BLACK, bg);
  return whiteRatio >= blackRatio ? WHITE : BLACK;
}

/** Pick white or black text on a solid background, or adjust bg L until one works. */
export function adjustPrimaryForOnColor(
  base: PickedColor,
  minRatio: number,
): { primary: PickedColor; onPrimary: PickedColor } {
  const whiteRatio = contrastRatio(WHITE, base.rgb);
  const blackRatio = contrastRatio(BLACK, base.rgb);

  if (whiteRatio >= minRatio) {
    return { primary: base, onPrimary: colorFromRgb(255, 255, 255) };
  }
  if (blackRatio >= minRatio) {
    return { primary: base, onPrimary: colorFromRgb(0, 0, 0) };
  }

  const { h, s } = base.hsl;
  let low = 0;
  let high = 100;
  let bestPrimary: PickedColor | null = null;
  let bestOn: PickedColor | null = null;

  for (let i = 0; i < 48; i += 1) {
    const mid = (low + high) / 2;
    const candidate = colorFromHsl(h, s, mid);
    const wr = contrastRatio(WHITE, candidate.rgb);
    const br = contrastRatio(BLACK, candidate.rgb);
    const wrOk = wr >= minRatio;
    const brOk = br >= minRatio;

    if (wrOk || brOk) {
      bestPrimary = candidate;
      bestOn = wrOk && (!brOk || wr >= br)
        ? colorFromRgb(255, 255, 255)
        : colorFromRgb(0, 0, 0);
      if (mid < base.hsl.l) high = mid;
      else low = mid;
    } else if (mid < base.hsl.l) {
      low = mid;
    } else {
      high = mid;
    }
  }

  if (bestPrimary && bestOn) {
    return { primary: bestPrimary, onPrimary: bestOn };
  }

  return {
    primary: base,
    onPrimary: whiteRatio >= blackRatio
      ? colorFromRgb(255, 255, 255)
      : colorFromRgb(0, 0, 0),
  };
}

function toPaletteColor(
  token: string,
  name: string,
  color: PickedColor,
  role: string,
): PaletteColor {
  return { token, name, hex: color.hex, role };
}

function buildPair(
  id: string,
  label: string,
  fgToken: string,
  bgToken: string,
  fg: string,
  bg: string,
  level: WcagLevel,
): PaletteContrastPair {
  const fgRgb = parseColor(fg);
  const bgRgb = parseColor(bg);
  const ratio =
    fgRgb.ok && bgRgb.ok
      ? roundRatio(contrastRatio(fgRgb.rgb, bgRgb.rgb))
      : 1;
  const minNormal = minTextContrast(level, false);
  const minLarge = minTextContrast(level, true);
  return {
    id,
    label,
    foregroundToken: fgToken,
    backgroundToken: bgToken,
    foreground: fg,
    background: bg,
    ratio,
    ratioLabel: `${ratio.toFixed(2)}:1`,
    passesNormal: ratio >= minNormal,
    passesLarge: ratio >= minLarge,
  };
}

function buildCssVariables(colors: PaletteColor[]): string {
  const lines = colors.map((c) => `  ${c.token}: ${c.hex};`);
  return `:root {\n${lines.join("\n")}\n}\n`;
}

/** Generate a WCAG-aware semantic palette from a brand/primary color. */
export function generateAccessiblePalette(
  input: string,
  options: { theme?: AccessibleTheme; level?: WcagLevel } = {},
): AccessiblePaletteResult {
  const parsed = parseColor(input);
  if (!parsed.ok) return parsed;

  const theme = options.theme ?? "light";
  const level = options.level ?? "AA";
  const minText = minTextContrast(level, false);
  const minUi = minUiContrast();

  const base = colorFromRgb(parsed.rgb.r, parsed.rgb.g, parsed.rgb.b);
  const { h, s } = base.hsl;

  let background: PickedColor;
  let foreground: PickedColor;
  let muted: PickedColor;
  let mutedForeground: PickedColor;
  let border: PickedColor;
  let secondary: PickedColor;
  let accent: PickedColor;

  if (theme === "light") {
    background = colorFromRgb(255, 255, 255);
    const fgRgb = findForegroundForBackground(
      background.rgb,
      h,
      Math.min(20, Math.max(8, s * 0.35)),
      minText,
      true,
    );
    foreground = colorFromRgb(fgRgb.r, fgRgb.g, fgRgb.b);

    muted = colorFromHsl(h, Math.min(18, s * 0.25), 96);
    const mutedFgRgb = findForegroundForBackground(
      background.rgb,
      h,
      Math.min(12, s * 0.2),
      minText,
      true,
    );
    mutedForeground = colorFromRgb(
      mutedFgRgb.r,
      mutedFgRgb.g,
      mutedFgRgb.b,
    );

    const borderRgb = findForegroundForBackground(
      background.rgb,
      h,
      Math.min(10, s * 0.15),
      minUi,
      true,
    );
    border = colorFromRgb(borderRgb.r, borderRgb.g, borderRgb.b);

    secondary = colorFromHsl(h, Math.min(35, s * 0.5), 92);
    accent = colorFromHsl((h + 180) % 360, Math.min(55, s), 42);
  } else {
    background = colorFromHsl(h, Math.min(22, s * 0.35), 8);
    const fgRgb = findForegroundForBackground(
      background.rgb,
      h,
      Math.min(15, s * 0.25),
      minText,
      false,
    );
    foreground = colorFromRgb(fgRgb.r, fgRgb.g, fgRgb.b);

    muted = colorFromHsl(h, Math.min(18, s * 0.3), 14);
    const mutedFgRgb = findForegroundForBackground(
      background.rgb,
      h,
      Math.min(10, s * 0.18),
      minText,
      false,
    );
    mutedForeground = colorFromRgb(
      mutedFgRgb.r,
      mutedFgRgb.g,
      mutedFgRgb.b,
    );

    const borderRgb = findForegroundForBackground(
      background.rgb,
      h,
      Math.min(12, s * 0.2),
      minUi,
      false,
    );
    border = colorFromRgb(borderRgb.r, borderRgb.g, borderRgb.b);

    secondary = colorFromHsl(h, Math.min(30, s * 0.45), 18);
    accent = colorFromHsl((h + 180) % 360, Math.min(50, s), 58);
  }

  const { primary, onPrimary } = adjustPrimaryForOnColor(base, minText);

  const colors: PaletteColor[] = [
    toPaletteColor("--background", "Background", background, "Page canvas"),
    toPaletteColor("--foreground", "Foreground", foreground, "Body text"),
    toPaletteColor("--primary", "Primary", primary, "Buttons & links"),
    toPaletteColor(
      "--primary-foreground",
      "Primary foreground",
      onPrimary,
      "Text on primary",
    ),
    toPaletteColor("--secondary", "Secondary", secondary, "Subtle surfaces"),
    toPaletteColor("--muted", "Muted", muted, "Cards & panels"),
    toPaletteColor(
      "--muted-foreground",
      "Muted foreground",
      mutedForeground,
      "Secondary text",
    ),
    toPaletteColor("--accent", "Accent", accent, "Highlights"),
    toPaletteColor("--border", "Border", border, "Dividers & outlines"),
  ];

  const pairs: PaletteContrastPair[] = [
    buildPair(
      "body",
      "Body text on background",
      "--foreground",
      "--background",
      foreground.hex,
      background.hex,
      level,
    ),
    buildPair(
      "muted",
      "Muted text on background",
      "--muted-foreground",
      "--background",
      mutedForeground.hex,
      background.hex,
      level,
    ),
    buildPair(
      "primary-btn",
      "Primary button label",
      "--primary-foreground",
      "--primary",
      onPrimary.hex,
      primary.hex,
      level,
    ),
    buildPair(
      "accent-text",
      "Accent on background",
      "--accent",
      "--background",
      accent.hex,
      background.hex,
      level,
    ),
    buildPair(
      "border-ui",
      "Border vs background (UI)",
      "--border",
      "--background",
      border.hex,
      background.hex,
      level,
    ),
  ];

  return {
    ok: true,
    theme,
    level,
    colors,
    pairs,
    cssVariables: buildCssVariables(colors),
  };
}

/** Export palette as JSON for design tokens. */
export function paletteToJson(result: Extract<AccessiblePaletteResult, { ok: true }>): string {
  const tokens = Object.fromEntries(
    result.colors.map((c) => [c.token.replace(/^--/, ""), c.hex]),
  );
  return (
    JSON.stringify(
      {
        theme: result.theme,
        level: result.level,
        colors: tokens,
      },
      null,
      2,
    ) + "\n"
  );
}

export { rgbToHex };
