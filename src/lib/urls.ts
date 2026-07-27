import type { ToolFamily } from "@/types/tool";

export const SITE_NAME = "Forge";
export const SITE_TAGLINE =
  "Free online developer, PDF, image, calculator & productivity tools";
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://forge.tools";

export const FAMILY_LABELS: Record<ToolFamily, string> = {
  tools: "Developer Tools",
  pdf: "PDF Tools",
  image: "Image Tools",
  calculators: "Calculators",
  convert: "Converters",
};

export const FAMILY_DESCRIPTIONS: Record<ToolFamily, string> = {
  tools:
    "Free browser-based developer tools — JSON, JWT, regex, Base64, UUID, formatters, and more. No upload, no account.",
  pdf: "Merge, split, rotate, and convert PDFs in your browser. Private client-side PDF utilities — files stay on your device.",
  image:
    "Resize, compress, convert, and strip EXIF from images locally. Free image tools that never upload your photos.",
  calculators:
    "Free tip, percentage, EMI/loan, and everyday calculators that run instantly in your browser.",
  convert:
    "Convert units, timestamps, timezones, number bases, and data sizes — fast, accurate, private converters.",
};

export function familyPath(family: ToolFamily): string {
  return `/${family}`;
}

export function toolPath(family: ToolFamily, slug: string): string {
  return `/${family}/${slug}`;
}

export function absoluteUrl(pathname: string): string {
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${SITE_URL}${path}`;
}

export function blogPath(slug: string): string {
  return `/blog/${slug}`;
}
