import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getRelatedTools,
  getShippedByFamily,
  getToolByFamilySlug,
  getToolsByFamily,
} from "@/lib/tools/registry";
import { ComingSoon } from "@/components/tool/ComingSoon";
import { ToolShell } from "@/components/tool/ToolShell";
import { ToolWorkbench } from "@/components/tool/ToolWorkbench";
import {
  createPageMetadata,
  familyBreadcrumbs,
  faqJsonLd,
  itemListJsonLd,
  metaDescription,
  toolBreadcrumbs,
  toolFaqJsonLd,
  webApplicationJsonLd,
} from "@/lib/seo";
import {
  FAMILY_DESCRIPTIONS,
  FAMILY_LABELS,
  toolPath,
} from "@/lib/urls";
import { HUB_CONTENT } from "@/lib/seo/hubs";
import { FamilyHub } from "@/components/home/FamilyHub";
import type { ToolFamily } from "@/types/tool";
import { TOOL_FAMILIES } from "@/types/tool";

export function isToolFamily(value: string): value is ToolFamily {
  return (TOOL_FAMILIES as readonly string[]).includes(value);
}

export function familyHubMetadata(family: ToolFamily): Metadata {
  const hub = HUB_CONTENT[family];
  const description = metaDescription(
    `${FAMILY_DESCRIPTIONS[family]} ${hub.intro[0]}`,
  );
  return createPageMetadata({
    title: FAMILY_LABELS[family],
    description,
    path: `/${family}`,
  });
}

export function generateFamilyStaticParams(family: ToolFamily) {
  return getToolsByFamily(family).map((tool) => ({ slug: tool.slug }));
}

export async function toolPageMetadata(
  family: ToolFamily,
  slug: string,
): Promise<Metadata> {
  const tool = getToolByFamilySlug(family, slug);
  if (!tool) return {};
  const description = metaDescription(
    tool.description?.trim() || tool.summary,
  );
  return createPageMetadata({
    title: `${tool.name} Online`,
    description,
    path: toolPath(tool.family, tool.slug),
    noIndex: tool.status !== "shipped",
  });
}

export function FamilyIndexPage({ family }: { family: ToolFamily }) {
  const shipped = getShippedByFamily(family);
  const hub = HUB_CONTENT[family];
  const schemas = [
    familyBreadcrumbs(family),
    itemListJsonLd(
      FAMILY_LABELS[family],
      shipped.map((t) => ({
        name: t.name,
        path: toolPath(t.family, t.slug),
      })),
    ),
    faqJsonLd(hub.faqs),
  ].filter(Boolean);

  return (
    <>
      {schemas.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
      <FamilyHub family={family} shipped={shipped} />
    </>
  );
}

export function ToolPage({
  family,
  slug,
}: {
  family: ToolFamily;
  slug: string;
}) {
  const tool = getToolByFamilySlug(family, slug);
  if (!tool) notFound();

  if (tool.status === "planned" || tool.status === "deprecated") {
    const crumbs = toolBreadcrumbs(tool);
    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(crumbs) }}
        />
        <ComingSoon tool={tool} />
      </>
    );
  }

  const related = getRelatedTools(tool);
  const schemas = [
    toolBreadcrumbs(tool),
    webApplicationJsonLd(tool),
    toolFaqJsonLd(tool),
  ].filter(Boolean);

  return (
    <>
      {schemas.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
      <ToolShell tool={tool} related={related}>
        <ToolWorkbench component={tool.component} />
      </ToolShell>
    </>
  );
}
