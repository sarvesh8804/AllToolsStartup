import { readdirSync, readFileSync } from "fs";
import path from "path";
import {
  toolDefinitionSchema,
  type ToolDefinitionInput,
} from "@/lib/tools/schema";
import type { ToolDefinition, ToolFamily } from "@/types/tool";
import { toolPath } from "@/lib/urls";

const TOOLS_DIR = path.join(process.cwd(), "content/tools");

function loadAllTools(): ToolDefinition[] {
  let files: string[] = [];
  try {
    files = readdirSync(TOOLS_DIR).filter((f) => f.endsWith(".json"));
  } catch {
    return [];
  }

  const tools = files.map((file) => {
    const raw = readFileSync(path.join(TOOLS_DIR, file), "utf8");
    const parsed = toolDefinitionSchema.parse(JSON.parse(raw));
    return parsed as ToolDefinition;
  });

  return tools.sort((a, b) => a.name.localeCompare(b.name));
}

let cache: ToolDefinition[] | null = null;

export function getAllTools(): ToolDefinition[] {
  if (!cache) cache = loadAllTools();
  return cache;
}

/** Clear cache (tests / validate script). */
export function clearToolCache() {
  cache = null;
}

export function getShippedTools(): ToolDefinition[] {
  return getAllTools().filter((t) => t.status === "shipped");
}

export function getToolsByFamily(family: ToolFamily): ToolDefinition[] {
  return getAllTools().filter((t) => t.family === family);
}

export function getShippedByFamily(family: ToolFamily): ToolDefinition[] {
  return getShippedTools().filter((t) => t.family === family);
}

export function getToolByFamilySlug(
  family: ToolFamily,
  slug: string,
): ToolDefinition | undefined {
  return getAllTools().find((t) => t.family === family && t.slug === slug);
}

export function getRelatedTools(tool: ToolDefinition): ToolDefinition[] {
  const bySlug = new Map(getAllTools().map((t) => [t.slug, t]));
  return tool.relatedSlugs
    .map((slug) => bySlug.get(slug))
    .filter((t): t is ToolDefinition => t != null && t.status === "shipped");
}

export function getSearchIndex() {
  return getShippedTools().map((t) => ({
    slug: t.slug,
    name: t.name,
    family: t.family,
    category: t.category,
    summary: t.summary,
    href: toolPath(t.family, t.slug),
    keywords: t.keywords,
  }));
}

export function assertRegistryValid(tools: ToolDefinitionInput[]) {
  const slugs = new Map<string, string>();
  for (const tool of tools) {
    const key = `${tool.family}/${tool.slug}`;
    if (slugs.has(key)) {
      throw new Error(`Duplicate tool path: ${key}`);
    }
    slugs.set(key, tool.name);
  }

  for (const tool of tools) {
    for (const related of tool.relatedSlugs) {
      const exists = tools.some((t) => t.slug === related);
      if (!exists) {
        throw new Error(
          `Tool ${tool.slug} relatedSlugs references missing slug: ${related}`,
        );
      }
    }
  }
}
