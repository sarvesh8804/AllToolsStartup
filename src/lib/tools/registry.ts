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

/**
 * Explicit relatedSlugs first, then same category, then same family —
 * enough links for crawl paths without editing every JSON by hand.
 */
export function getRelatedTools(
  tool: ToolDefinition,
  limit = 8,
): ToolDefinition[] {
  const bySlug = new Map(getAllTools().map((t) => [t.slug, t]));
  const seen = new Set<string>([tool.slug]);
  const out: ToolDefinition[] = [];

  const push = (candidate: ToolDefinition | undefined) => {
    if (!candidate || candidate.status !== "shipped") return;
    if (seen.has(candidate.slug)) return;
    seen.add(candidate.slug);
    out.push(candidate);
  };

  for (const slug of tool.relatedSlugs) {
    if (out.length >= limit) break;
    push(bySlug.get(slug));
  }

  for (const candidate of getShippedTools()) {
    if (out.length >= limit) break;
    if (candidate.category === tool.category) push(candidate);
  }

  for (const candidate of getShippedByFamily(tool.family)) {
    if (out.length >= limit) break;
    push(candidate);
  }

  return out;
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
