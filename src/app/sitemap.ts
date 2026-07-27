import type { MetadataRoute } from "next";
import { getShippedTools } from "@/lib/tools/registry";
import { getAllPosts } from "@/lib/blog";
import { SITE_URL, TOOL_FAMILIES_PATHS } from "@/lib/sitemap-data";

export async function generateSitemaps() {
  return [{ id: "static" }, { id: "tools" }, { id: "blog" }];
}

export default async function sitemap(props: {
  id: Promise<string>;
}): Promise<MetadataRoute.Sitemap> {
  const id = await props.id;

  if (id === "static") {
    return [
      "",
      "/about",
      "/privacy",
      "/terms",
      "/blog",
      ...TOOL_FAMILIES_PATHS,
    ].map((path) => ({
      url: `${SITE_URL}${path || "/"}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: path === "" ? 1 : 0.7,
    }));
  }

  if (id === "tools") {
    return getShippedTools().map((tool) => ({
      url: `${SITE_URL}/${tool.family}/${tool.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
  }

  return getAllPosts().map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: "monthly" as const,
    priority: 0.55,
  }));
}
