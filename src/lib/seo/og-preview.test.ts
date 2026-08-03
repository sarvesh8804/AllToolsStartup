import { describe, expect, it } from "vitest";
import { DEFAULT_OG_INPUT } from "@/lib/seo/open-graph";
import { buildOgPreviewCards, parseOpenGraphHtml } from "./og-preview";

describe("buildOgPreviewCards", () => {
  it("returns cards for each platform", () => {
    const cards = buildOgPreviewCards(DEFAULT_OG_INPUT);
    expect(cards).toHaveLength(4);
    expect(cards[0]?.title).toContain("Forge");
  });
});

describe("parseOpenGraphHtml", () => {
  it("parses og meta tags", () => {
    const html = `<meta property="og:title" content="Hello" />
<meta property="og:description" content="World" />
<meta property="og:image" content="https://example.com/img.png" />`;
    const result = parseOpenGraphHtml(html);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.input.title).toBe("Hello");
    expect(result.input.imageUrl).toBe("https://example.com/img.png");
  });
});
