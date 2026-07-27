export type MermaidTheme = "default" | "neutral" | "dark" | "forest";

export type MermaidTemplateId =
  | "flowchart"
  | "sequence"
  | "class"
  | "er"
  | "gantt"
  | "pie"
  | "state";

export type MermaidTemplate = {
  id: MermaidTemplateId;
  label: string;
  source: string;
};

export const MERMAID_THEMES: MermaidTheme[] = [
  "default",
  "neutral",
  "dark",
  "forest",
];

export const MERMAID_CDN_ESM =
  "https://cdn.jsdelivr.net/npm/mermaid@11.16.0/dist/mermaid.esm.min.mjs";

export const DEFAULT_MERMAID_SOURCE = `flowchart TD
  A[Start] --> B{Ready?}
  B -->|Yes| C[Ship it]
  B -->|No| D[Keep building]
  D --> B
  C --> E[Done]`;

export const MERMAID_TEMPLATES: MermaidTemplate[] = [
  {
    id: "flowchart",
    label: "Flowchart",
    source: DEFAULT_MERMAID_SOURCE,
  },
  {
    id: "sequence",
    label: "Sequence",
    source: `sequenceDiagram
  participant User
  participant App
  participant API
  User->>App: Open tool
  App->>API: Fetch data
  API-->>App: 200 OK
  App-->>User: Render result`,
  },
  {
    id: "class",
    label: "Class",
    source: `classDiagram
  class Tool {
    +string slug
    +render()
  }
  class Registry {
    +listShipped()
  }
  Registry --> Tool : contains`,
  },
  {
    id: "er",
    label: "ER",
    source: `erDiagram
  USER ||--o{ ORDER : places
  ORDER ||--|{ LINE_ITEM : contains
  PRODUCT ||--o{ LINE_ITEM : includes`,
  },
  {
    id: "gantt",
    label: "Gantt",
    source: `gantt
  title Ship calendar
  dateFormat  YYYY-MM-DD
  section Build
  Foundation    :done, a1, 2026-07-01, 2026-07-10
  Tools         :active, a2, 2026-07-11, 30d
  section Launch
  SEO pass      :a3, after a2, 14d`,
  },
  {
    id: "pie",
    label: "Pie",
    source: `pie title Traffic sources
  "Organic" : 45
  "Direct" : 25
  "Referral" : 20
  "Social" : 10`,
  },
  {
    id: "state",
    label: "State",
    source: `stateDiagram-v2
  [*] --> Draft
  Draft --> Review
  Review --> Shipped
  Review --> Draft
  Shipped --> [*]`,
  },
];

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Strip optional ```mermaid fences pasted from Markdown. */
export function normalizeMermaidSource(raw: string): string {
  const trimmed = raw.trim();
  const fenced = trimmed.match(
    /^```(?:mermaid)?\s*\n([\s\S]*?)\n```\s*$/i,
  );
  if (fenced?.[1] != null) return fenced[1].trimEnd();
  return trimmed;
}

export function detectMermaidDiagramKind(source: string): string | null {
  const first = normalizeMermaidSource(source)
    .split(/\r?\n/)
    .map((l) => l.trim())
    .find((l) => l && !l.startsWith("%%"));
  if (!first) return null;
  const token = first.split(/\s+/)[0]?.toLowerCase() ?? "";
  if (token.startsWith("flowchart") || token === "graph") return "flowchart";
  if (token.startsWith("sequencediagram")) return "sequence";
  if (token.startsWith("classdiagram")) return "class";
  if (token.startsWith("erdiagram")) return "er";
  if (token === "gantt") return "gantt";
  if (token === "pie") return "pie";
  if (token.startsWith("statediagram")) return "state";
  if (token.startsWith("journey")) return "journey";
  if (token.startsWith("gitgraph")) return "gitgraph";
  if (token.startsWith("mindmap")) return "mindmap";
  if (token.startsWith("timeline")) return "timeline";
  if (token.startsWith("quadrantchart")) return "quadrant";
  if (token.startsWith("requirementdiagram")) return "requirement";
  if (token.startsWith("c4context") || token.startsWith("c4")) return "c4";
  return token || null;
}

export type MermaidEmbedOptions = {
  source: string;
  theme: MermaidTheme;
  title?: string;
  /** CDN ESM URL for mermaid (defaults to pinned jsDelivr). */
  cdnUrl?: string;
};

/**
 * Self-contained HTML page that renders Mermaid via CDN (for paste/embed).
 * Live preview in the Forge tool uses the bundled mermaid package instead.
 */
export function buildMermaidEmbedHtml(options: MermaidEmbedOptions): string {
  const source = normalizeMermaidSource(options.source);
  const theme = MERMAID_THEMES.includes(options.theme)
    ? options.theme
    : "default";
  const title = escapeHtml(options.title?.trim() || "Mermaid diagram");
  const cdn = escapeHtml(options.cdnUrl?.trim() || MERMAID_CDN_ESM);
  const diagram = escapeHtml(source);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title}</title>
  <style>
    :root { color-scheme: light dark; }
    body {
      margin: 0;
      min-height: 100vh;
      display: grid;
      place-items: center;
      font-family: ui-sans-serif, system-ui, sans-serif;
      background: #f6f4ef;
      color: #1c1917;
    }
    @media (prefers-color-scheme: dark) {
      body { background: #1c1917; color: #f5f5f4; }
    }
    .wrap { width: min(960px, 100%); padding: 1.5rem; box-sizing: border-box; }
    .mermaid { display: flex; justify-content: center; }
    .err { color: #b91c1c; white-space: pre-wrap; font-family: ui-monospace, monospace; font-size: 0.875rem; }
  </style>
</head>
<body>
  <div class="wrap">
    <pre class="mermaid">${diagram}</pre>
    <p class="err" id="err" hidden></p>
  </div>
  <script type="module">
    import mermaid from "${cdn}";
    mermaid.initialize({
      startOnLoad: false,
      securityLevel: "strict",
      theme: ${JSON.stringify(theme)},
    });
    try {
      await mermaid.run({ querySelector: ".mermaid" });
    } catch (e) {
      const el = document.getElementById("err");
      if (el) {
        el.hidden = false;
        el.textContent = e instanceof Error ? e.message : String(e);
      }
    }
  </script>
</body>
</html>
`;
}

export function mermaidSourceStats(source: string): {
  lines: number;
  characters: number;
  kind: string | null;
} {
  const normalized = normalizeMermaidSource(source);
  return {
    lines: normalized ? normalized.split(/\r?\n/).length : 0,
    characters: normalized.length,
    kind: detectMermaidDiagramKind(normalized),
  };
}
