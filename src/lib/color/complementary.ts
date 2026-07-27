import { parseColor } from "@/lib/color/contrast";
import {
  colorFromHsl,
  colorFromRgb,
  type PickedColor,
} from "@/lib/color/picker";

export type HarmonySwatch = {
  id: string;
  label: string;
  role: string;
  color: PickedColor;
};

export type ComplementaryPaletteResult =
  | {
      ok: true;
      base: PickedColor;
      complementary: PickedColor;
      swatches: HarmonySwatch[];
    }
  | { ok: false; error: string };

function wrapHue(h: number): number {
  return ((h % 360) + 360) % 360;
}

/** Build complementary + common harmony swatches from a base color. */
export function complementaryPalette(
  input: string,
): ComplementaryPaletteResult {
  const parsed = parseColor(input);
  if (!parsed.ok) return parsed;

  const base = colorFromRgb(parsed.rgb.r, parsed.rgb.g, parsed.rgb.b);
  const { h, s, l } = base.hsl;
  const complementary = colorFromHsl(wrapHue(h + 180), s, l);

  const swatches: HarmonySwatch[] = [
    {
      id: "base",
      label: "Base",
      role: "Input color",
      color: base,
    },
    {
      id: "complementary",
      label: "Complementary",
      role: "Hue + 180°",
      color: complementary,
    },
    {
      id: "split-a",
      label: "Split A",
      role: "Hue + 150°",
      color: colorFromHsl(wrapHue(h + 150), s, l),
    },
    {
      id: "split-b",
      label: "Split B",
      role: "Hue + 210°",
      color: colorFromHsl(wrapHue(h + 210), s, l),
    },
    {
      id: "analogous-a",
      label: "Analogous −",
      role: "Hue − 30°",
      color: colorFromHsl(wrapHue(h - 30), s, l),
    },
    {
      id: "analogous-b",
      label: "Analogous +",
      role: "Hue + 30°",
      color: colorFromHsl(wrapHue(h + 30), s, l),
    },
    {
      id: "triadic-a",
      label: "Triadic A",
      role: "Hue + 120°",
      color: colorFromHsl(wrapHue(h + 120), s, l),
    },
    {
      id: "triadic-b",
      label: "Triadic B",
      role: "Hue + 240°",
      color: colorFromHsl(wrapHue(h + 240), s, l),
    },
  ];

  return { ok: true, base, complementary, swatches };
}
