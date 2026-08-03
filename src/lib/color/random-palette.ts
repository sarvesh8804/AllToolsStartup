import { rgbToHex } from "@/lib/color/contrast";
import { hslToRgb } from "@/lib/color/picker";

export type RandomPaletteOptions = {
  count?: number;
  seed?: number;
  scheme?: "analogous" | "complementary" | "triadic" | "random";
};

export type PaletteSwatch = {
  name: string;
  hex: string;
};

export type RandomPaletteResult =
  | { ok: true; colors: PaletteSwatch[]; cssVariables: string }
  | { ok: false; error: string };

function mulberry32(seed: number): () => number {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function hueFromScheme(
  base: number,
  index: number,
  scheme: RandomPaletteOptions["scheme"],
): number {
  if (scheme === "complementary") return (base + (index % 2) * 180) % 360;
  if (scheme === "triadic") return (base + (index % 3) * 120) % 360;
  if (scheme === "analogous") return (base + index * 24) % 360;
  return (base + index * 47) % 360;
}

/** Generate a random color palette with optional seed. */
export function generateRandomPalette(
  options: RandomPaletteOptions = {},
): RandomPaletteResult {
  const count = Math.max(3, Math.min(8, Math.floor(options.count ?? 5)));
  const seed = options.seed ?? 42;
  const scheme = options.scheme ?? "analogous";
  const rand = mulberry32(seed);
  const baseHue = Math.floor(rand() * 360);

  const colors: PaletteSwatch[] = [];
  for (let i = 0; i < count; i += 1) {
    const hue = hueFromScheme(baseHue, i, scheme);
    const sat = 48 + Math.floor(rand() * 30);
    const light = 38 + Math.floor(rand() * 24);
    const hex = rgbToHex(hslToRgb({ h: hue, s: sat, l: light }));
    colors.push({ name: `color-${i + 1}`, hex });
  }

  const cssVariables = `:root {\n${colors
    .map((c) => `  --${c.name}: ${c.hex};`)
    .join("\n")}\n}\n`;

  return { ok: true, colors, cssVariables };
}
