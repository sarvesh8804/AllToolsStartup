import { describe, expect, it } from "vitest";
import { buildRobotsTxt } from "./robots";

describe("buildRobotsTxt", () => {
  it("builds allow/disallow and sitemap", () => {
    const result = buildRobotsTxt({
      blocks: [
        {
          id: "1",
          userAgent: "*",
          allow: ["/"],
          disallow: ["/private/"],
        },
      ],
      sitemaps: ["https://example.com/sitemap.xml"],
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.text).toContain("User-agent: *");
      expect(result.text).toContain("Disallow: /private/");
      expect(result.text).toContain("Allow: /");
      expect(result.text).toContain(
        "Sitemap: https://example.com/sitemap.xml",
      );
    }
  });

  it("rejects empty paths", () => {
    expect(
      buildRobotsTxt({
        blocks: [
          { id: "1", userAgent: "*", allow: [], disallow: [] },
        ],
        sitemaps: [],
      }).ok,
    ).toBe(false);
  });
});
