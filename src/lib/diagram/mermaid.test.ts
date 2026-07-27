import { describe, expect, it } from "vitest";
import {
  buildMermaidEmbedHtml,
  detectMermaidDiagramKind,
  escapeHtml,
  mermaidSourceStats,
  normalizeMermaidSource,
} from "./mermaid";

describe("mermaid helpers", () => {
  it("strips mermaid fences", () => {
    expect(
      normalizeMermaidSource("```mermaid\nflowchart TD\n  A-->B\n```"),
    ).toBe("flowchart TD\n  A-->B");
    expect(normalizeMermaidSource("pie title X\n  \"A\" : 1")).toContain("pie");
  });

  it("detects diagram kinds", () => {
    expect(detectMermaidDiagramKind("flowchart LR\nA-->B")).toBe("flowchart");
    expect(detectMermaidDiagramKind("graph TD\nA-->B")).toBe("flowchart");
    expect(
      detectMermaidDiagramKind("%% comment\nsequenceDiagram\nA->>B: hi"),
    ).toBe("sequence");
    expect(detectMermaidDiagramKind("")).toBeNull();
  });

  it("builds embed with escaped source and theme", () => {
    const html = buildMermaidEmbedHtml({
      source: 'flowchart TD\n  A["<script>"] --> B',
      theme: "dark",
      title: 'Demo & "test"',
    });
    expect(html).toContain("theme: \"dark\"");
    expect(html).toContain("&lt;script&gt;");
    expect(html).toContain("Demo &amp; &quot;test&quot;");
    expect(html).toContain("cdn.jsdelivr.net/npm/mermaid@11.16.0");
    expect(html).not.toContain("<script>]");
  });

  it("escapes html and reports stats", () => {
    expect(escapeHtml(`a&b<"x">`)).toBe("a&amp;b&lt;&quot;x&quot;&gt;");
    const stats = mermaidSourceStats("flowchart TD\nA-->B");
    expect(stats.lines).toBe(2);
    expect(stats.kind).toBe("flowchart");
  });
});
