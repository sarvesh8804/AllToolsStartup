export type OpenGraphInput = {
  title: string;
  description: string;
  url: string;
  siteName: string;
  type: string;
  imageUrl: string;
  imageAlt: string;
  twitterCard: "summary" | "summary_large_image";
  twitterSite: string;
  locale: string;
};

export type OpenGraphOutput = {
  html: string;
  warnings: string[];
};

function escapeAttr(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function meta(property: string, content: string): string {
  return `<meta property="${property}" content="${escapeAttr(content)}" />`;
}

function nameMeta(name: string, content: string): string {
  return `<meta name="${name}" content="${escapeAttr(content)}" />`;
}

export function buildOpenGraphHtml(input: OpenGraphInput): OpenGraphOutput {
  const title = input.title.trim();
  const description = input.description.trim();
  const url = input.url.trim();
  const siteName = input.siteName.trim();
  const type = input.type.trim() || "website";
  const imageUrl = input.imageUrl.trim();
  const imageAlt = input.imageAlt.trim();
  const twitterSite = input.twitterSite.trim().replace(/^@/, "");
  const locale = input.locale.trim() || "en_US";

  const warnings: string[] = [];
  if (!title) warnings.push("Add og:title — required for useful previews.");
  if (!description) warnings.push("Add og:description for richer shares.");
  if (!url) warnings.push("Add og:url (canonical page URL).");
  if (!imageUrl) {
    warnings.push("Add og:image (absolute HTTPS URL recommended).");
  } else if (!/^https?:\/\//i.test(imageUrl)) {
    warnings.push("og:image should be an absolute URL (https://…).");
  }
  if (description.length > 200) {
    warnings.push("Description is long — many networks truncate around ~200 chars.");
  }

  const lines: string[] = [
    meta("og:title", title || "Page title"),
    meta("og:description", description),
    meta("og:type", type),
  ];

  if (url) lines.push(meta("og:url", url));
  if (siteName) lines.push(meta("og:site_name", siteName));
  if (locale) lines.push(meta("og:locale", locale));
  if (imageUrl) {
    lines.push(meta("og:image", imageUrl));
    if (imageAlt) lines.push(meta("og:image:alt", imageAlt));
  }

  lines.push(nameMeta("twitter:card", input.twitterCard));
  if (title) lines.push(nameMeta("twitter:title", title));
  if (description) lines.push(nameMeta("twitter:description", description));
  if (imageUrl) lines.push(nameMeta("twitter:image", imageUrl));
  if (twitterSite) lines.push(nameMeta("twitter:site", `@${twitterSite}`));

  return {
    html: lines.join("\n") + "\n",
    warnings,
  };
}

export const DEFAULT_OG_INPUT: OpenGraphInput = {
  title: "Forge — Free browser tools",
  description:
    "Free online developer, PDF, image, calculator & productivity tools. Everything runs securely in your browser.",
  url: "https://forge.tools/",
  siteName: "Forge",
  type: "website",
  imageUrl: "https://forge.tools/opengraph-image",
  imageAlt: "Forge tools",
  twitterCard: "summary_large_image",
  twitterSite: "",
  locale: "en_US",
};
