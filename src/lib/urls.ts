import type { ToolFamily } from "@/types/tool";

export const SITE_NAME = "Forge";
export const SITE_TAGLINE = "Everything you need. One website.";
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://forge.tools";

export const FAMILY_LABELS: Record<ToolFamily, string> = {
  tools: "Tools",
  pdf: "PDF",
  image: "Image",
  calculators: "Calculators",
  convert: "Convert",
};

export const FAMILY_DESCRIPTIONS: Record<ToolFamily, string> = {
  tools: "Developer utilities, formatters, generators, and text tools.",
  pdf: "Merge, split, rotate, and transform PDFs in your browser.",
  image: "Resize, compress, convert, and clean images locally.",
  calculators: "Finance, math, health, and everyday calculators.",
  convert: "Units, timestamps, timezones, and data converters.",
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
