/** Code 128 Set B barcode encoder and SVG renderer (browser-safe, no deps). */

export type Code128Options = {
  height?: number;
  moduleWidth?: number;
  quietZone?: number;
  barColor?: string;
  background?: string;
  showText?: boolean;
};

export type Code128Result =
  | { ok: true; svg: string; encoded: string }
  | { ok: false; error: string };

export const SAMPLE_BARCODE_TEXT = "FORGE-128";

const START_B = 104;
const STOP = 106;

/** ZXing Code 128 patterns (index = symbol value). */
const CODE_PATTERNS: readonly (readonly number[])[] = [
  [2, 1, 2, 2, 2, 2],
  [2, 2, 2, 1, 2, 2],
  [2, 2, 2, 2, 2, 1],
  [1, 2, 1, 2, 2, 3],
  [1, 2, 1, 3, 2, 2],
  [1, 3, 1, 2, 2, 2],
  [1, 2, 2, 2, 1, 3],
  [1, 2, 2, 3, 1, 2],
  [1, 3, 2, 2, 1, 2],
  [2, 2, 1, 2, 1, 3],
  [2, 2, 1, 3, 1, 2],
  [2, 3, 1, 2, 1, 2],
  [1, 1, 2, 2, 3, 2],
  [1, 2, 2, 1, 3, 2],
  [1, 2, 2, 2, 3, 1],
  [1, 1, 3, 2, 2, 2],
  [1, 2, 3, 1, 2, 2],
  [1, 2, 3, 2, 2, 1],
  [2, 2, 3, 2, 1, 1],
  [2, 2, 1, 1, 3, 2],
  [2, 2, 1, 2, 3, 1],
  [2, 1, 3, 2, 1, 2],
  [2, 2, 3, 1, 1, 2],
  [3, 1, 2, 1, 3, 1],
  [3, 1, 1, 2, 2, 2],
  [3, 2, 1, 1, 2, 2],
  [3, 2, 1, 2, 2, 1],
  [3, 1, 2, 2, 1, 2],
  [3, 2, 2, 1, 1, 2],
  [3, 2, 2, 2, 1, 1],
  [2, 1, 2, 1, 2, 3],
  [2, 1, 2, 3, 2, 1],
  [2, 3, 2, 1, 2, 1],
  [1, 1, 1, 3, 2, 3],
  [1, 3, 1, 1, 2, 3],
  [1, 3, 1, 3, 2, 1],
  [1, 1, 2, 3, 1, 3],
  [1, 3, 2, 1, 1, 3],
  [1, 3, 2, 3, 1, 1],
  [2, 1, 1, 3, 1, 3],
  [2, 3, 1, 1, 1, 3],
  [2, 3, 1, 3, 1, 1],
  [1, 1, 2, 1, 3, 3],
  [1, 1, 2, 3, 3, 1],
  [1, 3, 2, 1, 3, 1],
  [1, 1, 3, 1, 2, 3],
  [1, 1, 3, 3, 2, 1],
  [1, 3, 3, 1, 2, 1],
  [3, 1, 3, 1, 2, 1],
  [2, 1, 1, 3, 3, 1],
  [2, 3, 1, 1, 3, 1],
  [2, 1, 3, 1, 1, 3],
  [2, 1, 3, 3, 1, 1],
  [2, 1, 3, 1, 3, 1],
  [3, 1, 1, 1, 2, 3],
  [3, 1, 1, 3, 2, 1],
  [3, 3, 1, 1, 2, 1],
  [3, 1, 2, 1, 1, 3],
  [3, 1, 2, 3, 1, 1],
  [3, 3, 2, 1, 1, 1],
  [3, 1, 4, 1, 1, 1],
  [2, 2, 1, 4, 1, 1],
  [4, 3, 1, 1, 1, 1],
  [1, 1, 1, 2, 2, 4],
  [1, 1, 1, 4, 2, 2],
  [1, 2, 1, 1, 2, 4],
  [1, 2, 1, 4, 2, 1],
  [1, 4, 1, 1, 2, 2],
  [1, 4, 1, 2, 2, 1],
  [1, 1, 2, 2, 1, 4],
  [1, 1, 2, 4, 1, 2],
  [1, 2, 2, 1, 1, 4],
  [1, 2, 2, 4, 1, 1],
  [1, 4, 2, 1, 1, 2],
  [1, 4, 2, 2, 1, 1],
  [2, 4, 1, 2, 1, 1],
  [2, 2, 1, 1, 1, 4],
  [4, 1, 3, 1, 1, 1],
  [2, 4, 1, 1, 1, 2],
  [1, 3, 4, 1, 1, 1],
  [1, 1, 1, 2, 4, 2],
  [1, 2, 1, 1, 4, 2],
  [1, 2, 1, 2, 4, 1],
  [1, 1, 4, 2, 1, 2],
  [1, 2, 4, 1, 1, 2],
  [1, 2, 4, 2, 1, 1],
  [4, 1, 1, 2, 1, 2],
  [4, 2, 1, 1, 1, 2],
  [4, 2, 1, 2, 1, 1],
  [2, 1, 2, 1, 4, 1],
  [2, 1, 4, 1, 2, 1],
  [4, 1, 2, 1, 2, 1],
  [1, 1, 1, 1, 4, 3],
  [1, 1, 1, 3, 4, 1],
  [1, 3, 1, 1, 4, 1],
  [1, 1, 4, 1, 1, 3],
  [1, 1, 4, 3, 1, 1],
  [4, 1, 1, 1, 1, 3],
  [4, 1, 1, 3, 1, 1],
  [1, 1, 3, 1, 4, 1],
  [1, 1, 4, 1, 3, 1],
  [3, 1, 1, 1, 4, 1],
  [4, 1, 1, 1, 3, 1],
  [2, 1, 1, 4, 1, 2],
  [2, 1, 1, 2, 1, 4],
  [2, 1, 1, 2, 3, 2],
  [2, 3, 3, 1, 1, 1, 2],
];

function encodeSetB(text: string): number[] {
  const codes: number[] = [START_B];
  for (const ch of text) {
    const code = ch.charCodeAt(0);
    if (code < 32 || code > 126) {
      throw new Error(
        `Character "${ch}" is not supported in Code 128 Set B (use ASCII 32–126).`,
      );
    }
    codes.push(code - 32);
  }

  let checksum = codes[0]!;
  for (let i = 1; i < codes.length; i += 1) {
    checksum += codes[i]! * i;
  }
  codes.push(checksum % 103);
  codes.push(STOP);
  return codes;
}

function patternToBars(
  pattern: readonly number[],
  startX: number,
  height: number,
  moduleWidth: number,
  barColor: string,
): { svg: string; width: number } {
  let x = startX;
  let drawBar = true;
  const parts: string[] = [];

  for (const digit of pattern) {
    const w = digit * moduleWidth;
    if (drawBar) {
      parts.push(
        `<rect x="${x}" y="0" width="${w}" height="${height}" fill="${barColor}" />`,
      );
    }
    x += w;
    drawBar = !drawBar;
  }

  return { svg: parts.join(""), width: x - startX };
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Build a Code 128 Set B barcode as SVG. */
export function buildCode128Svg(
  text: string,
  options: Code128Options = {},
): Code128Result {
  const trimmed = text.trim();
  if (!trimmed) {
    return { ok: false, error: "Enter text to encode as Code 128." };
  }

  const height = Math.max(40, Math.min(240, Math.floor(options.height ?? 80)));
  const moduleWidth = Math.max(1, Math.min(4, options.moduleWidth ?? 2));
  const quietZone = Math.max(8, Math.floor(options.quietZone ?? 10));
  const barColor = options.barColor ?? "#111827";
  const background = options.background ?? "#ffffff";
  const showText = options.showText !== false;

  try {
    const codes = encodeSetB(trimmed);
    const bars: string[] = [];
    let x = quietZone;

    for (const code of codes) {
      const pattern = CODE_PATTERNS[code];
      if (!pattern) {
        return { ok: false, error: `Invalid barcode symbol code ${code}.` };
      }
      const segment = patternToBars(pattern, x, height, moduleWidth, barColor);
      bars.push(segment.svg);
      x += segment.width;
    }

    const totalWidth = x + quietZone;
    const textY = height + (showText ? 18 : 0);
    const svgHeight = height + (showText ? 22 : 0);
    const label = showText
      ? `<text x="${totalWidth / 2}" y="${textY}" text-anchor="middle" font-family="monospace" font-size="14" fill="${barColor}">${escapeXml(trimmed)}</text>`
      : "";

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="${svgHeight}" viewBox="0 0 ${totalWidth} ${svgHeight}" role="img" aria-label="Code 128 barcode for ${escapeXml(trimmed)}">
  <rect width="100%" height="100%" fill="${background}" />
  ${bars.join("\n  ")}
  ${label}
</svg>
`;

    return { ok: true, svg, encoded: trimmed };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Barcode encoding failed.",
    };
  }
}
