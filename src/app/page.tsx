import { Hero } from "@/components/home/Hero";
import { FamilyGrid } from "@/components/home/FamilyGrid";
import { FeaturedTools } from "@/components/home/FeaturedTools";
import { getShippedTools, getShippedByFamily } from "@/lib/tools/registry";
import { TOOL_FAMILIES, type ToolFamily } from "@/types/tool";
import { breadcrumbJsonLd } from "@/lib/seo";

export default function HomePage() {
  const shipped = getShippedTools();
  const counts = Object.fromEntries(
    TOOL_FAMILIES.map((family) => [family, getShippedByFamily(family).length]),
  ) as Record<ToolFamily, number>;

  const jsonLd = breadcrumbJsonLd([{ name: "Home", path: "/" }]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Hero />
      <FamilyGrid counts={counts} />
      <FeaturedTools tools={shipped} />
    </>
  );
}
