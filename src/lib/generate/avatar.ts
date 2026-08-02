import { rgbToHex } from "@/lib/color/contrast";
import { hslToRgb } from "@/lib/color/picker";

export type AvatarShape = "circle" | "rounded" | "square";
export type AvatarStyle = "initials" | "pattern";

export type ColorfulAvatarInput = {
  name: string;
  size?: number;
  shape?: AvatarShape;
  style?: AvatarStyle;
};

export type ColorfulAvatarResult =
  | {
      ok: true;
      svg: string;
      initials: string;
      background: string;
      foreground: string;
    }
  | { ok: false; error: string };

export const DEFAULT_AVATAR_NAME = "Ada Lovelace";
export const DEFAULT_AVATAR_SIZE = 128;

const MIN_SIZE = 32;
const MAX_SIZE = 512;

function hashString(input: string): number {
  let hash = 5381;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 33) ^ input.charCodeAt(i)!;
  }
  return hash >>> 0;
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function hslHex(hash: number, offset = 0): string {
  const rgb = hslToRgb({
    h: (hash + offset) % 360,
    s: 58 + (hash % 22),
    l: 40 + ((hash >> 3) % 16),
  });
  return rgbToHex(rgb);
}

function relativeLuminance(hex: string): number {
  const value = hex.replace("#", "");
  const channels = [0, 2, 4].map((i) => {
    const c = Number.parseInt(value.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * channels[0]! + 0.7152 * channels[1]! + 0.0722 * channels[2]!;
}

/** Derive 1–2 letter initials from a name or label. */
export function getAvatarInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) {
    const word = parts[0]!;
    return word.slice(0, 2).toUpperCase();
  }
  return `${parts[0]![0] ?? ""}${parts[parts.length - 1]![0] ?? ""}`.toUpperCase();
}

function borderRadius(shape: AvatarShape, size: number): number {
  if (shape === "circle") return size / 2;
  if (shape === "rounded") return Math.round(size * 0.18);
  return 0;
}

function patternShapes(hash: number, size: number): string {
  const shapes: string[] = [];
  for (let i = 0; i < 4; i += 1) {
    const hueOffset = i * 47 + (hash % 29);
    const fill = hslHex(hash, hueOffset);
    const cx = 20 + ((hash + i * 37) % 60);
    const cy = 20 + ((hash + i * 53) % 60);
    const r = 18 + ((hash + i * 17) % 28);
    shapes.push(
      `<circle cx="${(cx / 100) * size}" cy="${(cy / 100) * size}" r="${(r / 100) * size}" fill="${fill}" opacity="0.75" />`,
    );
  }
  return shapes.join("\n  ");
}

/** Build a colorful SVG avatar from a name seed. */
export function buildColorfulAvatarSvg(
  input: ColorfulAvatarInput,
): ColorfulAvatarResult {
  const trimmed = input.name.trim();
  if (!trimmed) {
    return { ok: false, error: "Enter a name or label for the avatar." };
  }

  const size = Math.max(
    MIN_SIZE,
    Math.min(MAX_SIZE, Math.floor(input.size ?? DEFAULT_AVATAR_SIZE)),
  );
  const shape = input.shape ?? "circle";
  const style = input.style ?? "initials";
  const hash = hashString(trimmed.toLowerCase());
  const background = hslHex(hash);
  const foreground = relativeLuminance(background) > 0.55 ? "#111827" : "#ffffff";
  const initials = getAvatarInitials(trimmed);
  const radius = borderRadius(shape, size);
  const clipId = `avatar-clip-${hash.toString(16)}`;

  const pattern =
    style === "pattern"
      ? patternShapes(hash, size)
      : "";

  const fontSize = Math.round(size * (initials.length > 1 ? 0.38 : 0.46));
  const text =
    style === "initials"
      ? `<text x="50%" y="50%" dominant-baseline="central" text-anchor="middle" fill="${foreground}" font-family="system-ui,Segoe UI,sans-serif" font-size="${fontSize}" font-weight="600">${escapeXml(initials)}</text>`
      : "";

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" role="img" aria-label="${escapeXml(trimmed)} avatar">
  <defs>
    <clipPath id="${clipId}">
      <rect width="${size}" height="${size}" rx="${radius}" ry="${radius}" />
    </clipPath>
  </defs>
  <g clip-path="url(#${clipId})">
    <rect width="${size}" height="${size}" fill="${background}" />
    ${pattern}
    ${text}
  </g>
</svg>
`;

  return {
    ok: true,
    svg,
    initials,
    background,
    foreground,
  };
}
