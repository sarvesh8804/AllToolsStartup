import type { MetadataRoute } from "next";
import { getShippedTools } from "@/lib/tools/registry";
import { getAllPosts } from "@/lib/blog";
import { SITE_URL, TOOL_FAMILIES_PATHS } from "@/lib/sitemap-data";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
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

  const tools = getShippedTools().map((tool) => ({
    url: `${SITE_URL}/${tool.family}/${tool.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const posts = getAllPosts().map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  return [...staticRoutes, ...tools, ...posts];
}
