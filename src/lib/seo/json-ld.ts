export const SAMPLE_JSON_LD = `{
"@context": "https://schema.org",
"@type": "WebSite",
"name": "Forge",
"url": "https://forge.tools",
"description": "Browser-first utility tools"
}`;

export type JsonLdFormatOptions = {
  spaces?: number;
  wrapScript?: boolean;
};

export type JsonLdFormatResult =
  | { ok: true; formatted: string; warnings: string[] }
  | { ok: false; error: string };

function collectJsonLdNodes(value: unknown): Record<string, unknown>[] {
  if (!value || typeof value !== "object") return [];
  if (Array.isArray(value)) {
    return value.filter(
      (item): item is Record<string, unknown> =>
        !!item && typeof item === "object" && !Array.isArray(item),
    );
  }
  const obj = value as Record<string, unknown>;
  if (Array.isArray(obj["@graph"])) {
    return obj["@graph"].filter(
      (item): item is Record<string, unknown> =>
        !!item && typeof item === "object" && !Array.isArray(item),
    );
  }
  return [obj];
}

/** Return non-blocking hints for common JSON-LD issues. */
export function analyzeJsonLd(value: unknown): string[] {
  const warnings: string[] = [];
  const nodes = collectJsonLdNodes(value);

  if (nodes.length === 0) {
    warnings.push("Expected a JSON object or array of structured data nodes.");
    return warnings;
  }

  for (const node of nodes) {
    if (!("@context" in node)) {
      warnings.push("Missing @context — JSON-LD should declare a vocabulary URL.");
    }
    if (!("@type" in node)) {
      warnings.push("Missing @type — describe the schema.org type for each node.");
    }
  }

  return [...new Set(warnings)];
}

export function wrapJsonLdScript(formatted: string): string {
  return `<script type="application/ld+json">\n${formatted}\n</script>\n`;
}

/** Format or minify JSON-LD with optional script-tag wrapping. */
export function formatJsonLd(
  input: string,
  options: JsonLdFormatOptions = {},
): JsonLdFormatResult {
  const trimmed = input.trim();
  if (!trimmed) {
    return { ok: false, error: "Paste JSON-LD to format." };
  }

  try {
    const parsed = JSON.parse(trimmed) as unknown;
    const spaces = options.spaces ?? 2;
    const formatted =
      spaces === 0
        ? JSON.stringify(parsed)
        : JSON.stringify(parsed, null, spaces);
    const output = options.wrapScript
      ? wrapJsonLdScript(formatted)
      : formatted + (spaces === 0 ? "" : "\n");
    return {
      ok: true,
      formatted: output,
      warnings: analyzeJsonLd(parsed),
    };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Invalid JSON",
    };
  }
}
