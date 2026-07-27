import { describe, expect, it } from "vitest";
import { DEFAULT_OG_INPUT, buildOpenGraphHtml } from "./open-graph";

describe("buildOpenGraphHtml", () => {
  it("emits core og and twitter tags", () => {
    const { html, warnings } = buildOpenGraphHtml(DEFAULT_OG_INPUT);
    expect(html).toContain('property="og:title"');
    expect(html).toContain('property="og:image"');
    expect(html).toContain('name="twitter:card"');
    expect(html).toContain("summary_large_image");
    expect(warnings.length).toBe(0);
  });

  it("warns on missing image and escapes attributes", () => {
    const { html, warnings } = buildOpenGraphHtml({
      ...DEFAULT_OG_INPUT,
      title: 'Hello "world"',
      imageUrl: "",
    });
    expect(html).toContain("Hello &quot;world&quot;");
    expect(warnings.some((w) => w.toLowerCase().includes("image"))).toBe(true);
  });
});
