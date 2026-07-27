import type { Metadata } from "next";
import { SITE_NAME, SITE_TAGLINE, absoluteUrl, SITE_URL } from "@/lib/urls";
import type { ToolDefinition, ToolFamily } from "@/types/tool";
import { FAMILY_LABELS, toolPath } from "@/lib/urls";

/** Prefer ~155-char meta descriptions for SERP snippets. */
export function metaDescription(text: string, max = 155): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const sliced = clean.slice(0, max - 1);
  const cut = sliced.lastIndexOf(" ");
  return `${(cut > 80 ? sliced.slice(0, cut) : sliced).trimEnd()}…`;
}

export function createPageMetadata({
  title,
  description,
  path,
  noIndex = false,
}: {
  title: string;
  description: string;
  path: string;
  noIndex?: boolean;
}): Metadata {
  const url = absoluteUrl(path);
  const fullTitle =
    title === SITE_NAME
      ? `${SITE_NAME} — ${SITE_TAGLINE}`
      : `${title} | ${SITE_NAME}`;
  const desc = metaDescription(description);
  const ogImage = absoluteUrl("/opengraph-image");

  return {
    title: fullTitle,
    description: desc,
    alternates: { canonical: url },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
    openGraph: {
      title: fullTitle,
      description: desc,
      url,
      siteName: SITE_NAME,
      type: "website",
      images: [{ url: ogImage, width: 1200, height: 630, alt: SITE_NAME }],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: desc,
      images: [ogImage],
    },
  };
}

export function breadcrumbJsonLd(
  items: { name: string; path: string }[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_TAGLINE,
    slogan: SITE_TAGLINE,
  };
}

export function webSiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_TAGLINE,
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/tools?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function itemListJsonLd(
  name: string,
  items: { name: string; path: string }[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    numberOfItems: items.length,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      url: absoluteUrl(item.path),
    })),
  };
}

export function webApplicationJsonLd(tool: ToolDefinition) {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: tool.name,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    description: tool.description,
    url: absoluteUrl(toolPath(tool.family, tool.slug)),
    browserRequirements: "Requires JavaScript",
    featureList: tool.privacyLocal
      ? "Runs locally in the browser; input is not uploaded"
      : undefined,
  };
}

export function faqJsonLd(
  faqs: { question: string; answer: string }[],
) {
  if (!faqs.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

export function toolFaqJsonLd(tool: ToolDefinition) {
  return faqJsonLd(tool.faqs);
}

export function articleJsonLd(input: {
  title: string;
  description: string;
  path: string;
  date: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: input.title,
    description: input.description,
    datePublished: input.date,
    dateModified: input.date,
    author: {
      "@type": "Organization",
      name: SITE_NAME,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
    mainEntityOfPage: absoluteUrl(input.path),
  };
}

export function toolBreadcrumbs(tool: ToolDefinition) {
  return breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: FAMILY_LABELS[tool.family], path: `/${tool.family}` },
    { name: tool.name, path: toolPath(tool.family, tool.slug) },
  ]);
}

export function familyBreadcrumbs(family: ToolFamily) {
  return breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: FAMILY_LABELS[family], path: `/${family}` },
  ]);
}
