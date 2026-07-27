import type { OutputImageFormat } from "@/lib/image/format";

/** JPEG has no alpha — transparent pixels need a fill color. */
export function needsBackgroundFill(output: OutputImageFormat): boolean {
  return output === "image/jpeg";
}

/** Quality slider applies to lossy encoders. */
export function qualityApplies(output: OutputImageFormat): boolean {
  return output === "image/jpeg" || output === "image/webp";
}

export const WEBP_OUTPUT_OPTIONS: {
  id: OutputImageFormat;
  label: string;
}[] = [
  { id: "image/webp", label: "WebP" },
  { id: "image/png", label: "PNG" },
  { id: "image/jpeg", label: "JPEG" },
];

/**
 * Pick a sensible default target: if already WebP → PNG; otherwise → WebP.
 */
export function defaultWebpTarget(
  source: OutputImageFormat | null,
): OutputImageFormat {
  if (source === "image/webp") return "image/png";
  return "image/webp";
}
