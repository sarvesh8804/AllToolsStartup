import { describe, expect, it } from "vitest";
import {
  buildSitemapXml,
  parseSitemapUrlLines,
} from "./sitemap";

describe("buildSitemapXml", () => {
  it("builds a urlset", () => {
    const result = buildSitemapXml({
      urls: ["https://example.com/", "https://example.com/about"],
      lastmod: "2026-07-27",
      changefreq: "weekly",
      priority: "0.8",
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.count).toBe(2);
      expect(result.xml).toContain("<urlset");
      expect(result.xml).toContain("<loc>https://example.com/</loc>");
      expect(result.xml).toContain("<lastmod>2026-07-27</lastmod>");
      expect(result.xml).toContain("<changefreq>weekly</changefreq>");
      expect(result.xml).toContain("<priority>0.8</priority>");
    }
  });

  it("rejects non-http urls", () => {
    expect(
      buildSitemapXml({ urls: ["ftp://example.com/"] }).ok,
    ).toBe(false);
  });

  it("parses lines and ignores comments", () => {
    expect(
      parseSitemapUrlLines("# comment\nhttps://a.com/\n\nhttps://b.com/"),
    ).toEqual(["https://a.com/", "https://b.com/"]);
  });
});
