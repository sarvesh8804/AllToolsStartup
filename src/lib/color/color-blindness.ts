import { rgbToHex, type Rgb } from "@/lib/color/contrast";

export type ColorBlindnessType =
  | "protanopia"
  | "deuteranopia"
  | "tritanopia"
  | "achromatopsia";

export type SimulatedColor = {
  hex: string;
  rgb: Rgb;
};

const MATRICES: Record<ColorBlindnessType, number[][]> = {
  protanopia: [
    [0.56667, 0.43333, 0],
    [0.55833, 0.44167, 0],
    [0, 0.24167, 0.75833],
  ],
  deuteranopia: [
    [0.625, 0.375, 0],
    [0.7, 0.3, 0],
    [0, 0.3, 0.7],
  ],
  tritanopia: [
    [0.95, 0.05, 0],
    [0, 0.43333, 0.56667],
    [0, 0.475, 0.525],
  ],
  achromatopsia: [
    [0.299, 0.587, 0.114],
    [0.299, 0.587, 0.114],
    [0.299, 0.587, 0.114],
  ],
};

function clampChannel(n: number): number {
  return Math.min(255, Math.max(0, Math.round(n)));
}

function applyMatrix(rgb: Rgb, matrix: number[][]): Rgb {
  return {
    r: clampChannel(
      rgb.r * matrix[0]![0]! + rgb.g * matrix[0]![1]! + rgb.b * matrix[0]![2]!,
    ),
    g: clampChannel(
      rgb.r * matrix[1]![0]! + rgb.g * matrix[1]![1]! + rgb.b * matrix[1]![2]!,
    ),
    b: clampChannel(
      rgb.r * matrix[2]![0]! + rgb.g * matrix[2]![1]! + rgb.b * matrix[2]![2]!,
    ),
  };
}

/** Simulate color blindness on an sRGB color. */
export function simulateColorBlindness(
  hex: string,
  type: ColorBlindnessType,
): SimulatedColor | { ok: false; error: string } {
  const normalized = hex.trim().replace(/^#/, "");
  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) {
    return { ok: false, error: "Enter a 6-digit hex color." };
  }

  const rgb: Rgb = {
    r: Number.parseInt(normalized.slice(0, 2), 16),
    g: Number.parseInt(normalized.slice(2, 4), 16),
    b: Number.parseInt(normalized.slice(4, 6), 16),
  };

  const simulated = applyMatrix(rgb, MATRICES[type]);
  return { hex: rgbToHex(simulated), rgb: simulated };
}

/** Simulate multiple blindness types for one color. */
export function simulateAllColorBlindness(hex: string): Array<{
  type: ColorBlindnessType;
  hex: string;
}> {
  const types: ColorBlindnessType[] = [
    "protanopia",
    "deuteranopia",
    "tritanopia",
    "achromatopsia",
  ];

  return types.flatMap((type) => {
    const result = simulateColorBlindness(hex, type);
    return "hex" in result ? [{ type, hex: result.hex }] : [];
  });
}

export const SAMPLE_COLOR = "#c4a70a";
