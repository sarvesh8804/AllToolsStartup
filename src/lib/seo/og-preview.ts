import type { OpenGraphInput } from "@/lib/seo/open-graph";

export type OgPreviewPlatform = "facebook" | "twitter" | "linkedin" | "discord";

export type OgPreviewCard = {
  platform: OgPreviewPlatform;
  title: string;
  description: string;
  siteName: string;
  imageUrl: string;
  url: string;
  truncatedDescription: string;
};

const TRUNCATE: Record<OgPreviewPlatform, number> = {
  facebook: 200,
  twitter: 200,
  linkedin: 150,
  discord: 180,
};

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).trimEnd()}…`;
}

/** Build preview cards for common social platforms from OG fields. */
export function buildOgPreviewCards(
  input: OpenGraphInput,
): OgPreviewCard[] {
  const title = input.title.trim() || "Page title";
  const description = input.description.trim();
  const siteName = input.siteName.trim() || new URL(input.url.trim() || "https://example.com").hostname;
  const imageUrl = input.imageUrl.trim();
  const url = input.url.trim();

  return (["facebook", "twitter", "linkedin", "discord"] as const).map(
    (platform) => ({
      platform,
      title,
      description,
      siteName,
      imageUrl,
      url,
      truncatedDescription: truncate(description || "Description preview", TRUNCATE[platform]),
    }),
  );
}

/** Parse Open Graph and Twitter meta tags from HTML snippet. */
export function parseOpenGraphHtml(
  html: string,
): { ok: true; input: OpenGraphInput } | { ok: false; error: string } {
  const trimmed = html.trim();
  if (!trimmed) {
    return { ok: false, error: "Paste HTML containing meta tags." };
  }

  const getMeta = (attr: "property" | "name", key: string): string => {
    const re = new RegExp(
      `<meta[^>]+${attr}=["']${key}["'][^>]+content=["']([^"']*)["'][^>]*>`,
      "i",
    );
    const alt = new RegExp(
      `<meta[^>]+content=["']([^"']*)["'][^>]+${attr}=["']${key}["'][^>]*>`,
      "i",
    );
    return trimmed.match(re)?.[1] ?? trimmed.match(alt)?.[1] ?? "";
  };

  const twitterCard = getMeta("name", "twitter:card");
  const input: OpenGraphInput = {
    title: getMeta("property", "og:title") || getMeta("name", "twitter:title"),
    description:
      getMeta("property", "og:description") ||
      getMeta("name", "twitter:description") ||
      getMeta("name", "description"),
    url: getMeta("property", "og:url"),
    siteName: getMeta("property", "og:site_name"),
    type: getMeta("property", "og:type") || "website",
    imageUrl:
      getMeta("property", "og:image") || getMeta("name", "twitter:image"),
    imageAlt: getMeta("property", "og:image:alt"),
    twitterCard:
      twitterCard === "summary" ? "summary" : "summary_large_image",
    twitterSite: getMeta("name", "twitter:site").replace(/^@/, ""),
    locale: getMeta("property", "og:locale") || "en_US",
  };

  if (!input.title && !input.description && !input.imageUrl) {
    return { ok: false, error: "No Open Graph or Twitter meta tags found." };
  }

  return { ok: true, input };
}
