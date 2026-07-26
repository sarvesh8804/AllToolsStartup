import type { Metadata } from "next";
import { SITE_NAME, SITE_TAGLINE, absoluteUrl } from "@/lib/urls";
import type { ToolDefinition } from "@/types/tool";
import { FAMILY_LABELS, toolPath } from "@/lib/urls";

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
    title === SITE_NAME ? `${SITE_NAME} — ${SITE_TAGLINE}` : `${title} | ${SITE_NAME}`;

  return {
    title: fullTitle,
    description,
    alternates: { canonical: url },
    robots: noIndex ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: SITE_NAME,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
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
  };
}

export function faqJsonLd(tool: ToolDefinition) {
  if (!tool.faqs.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: tool.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

export function toolBreadcrumbs(tool: ToolDefinition) {
  return breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: FAMILY_LABELS[tool.family], path: `/${tool.family}` },
    { name: tool.name, path: toolPath(tool.family, tool.slug) },
  ]);
}
