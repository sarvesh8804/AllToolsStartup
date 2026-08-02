import { describe, expect, it } from "vitest";
import {
  SAMPLE_MARKDOWN_TOC,
  extractHeadings,
  generateMarkdownToc,
  slugifyHeading,
} from "./markdown-toc";

describe("slugifyHeading", () => {
  it("creates github-style slugs", () => {
    expect(slugifyHeading("Getting Started")).toBe("getting-started");
    expect(slugifyHeading("FAQ: Common Questions!")).toBe("faq-common-questions");
  });
});

describe("extractHeadings", () => {
  it("skips headings inside fenced code blocks", () => {
    const headings = extractHeadings("```\n# not a heading\n```\n## Real");
    expect(headings).toEqual([{ level: 2, text: "Real" }]);
  });
});

describe("generateMarkdownToc", () => {
  it("builds a bullet list with anchor links", () => {
    const result = generateMarkdownToc(SAMPLE_MARKDOWN_TOC);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.toc).toContain("- [Project Guide](#project-guide)");
    expect(result.toc).toContain("  - [Installation](#installation)");
    expect(result.headings.length).toBeGreaterThan(3);
  });

  it("supports numbered style", () => {
    const result = generateMarkdownToc(SAMPLE_MARKDOWN_TOC, { style: "numbered" });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.toc).toMatch(/^1\. \[Project Guide\]/);
  });

  it("rejects empty input", () => {
    expect(generateMarkdownToc("").ok).toBe(false);
  });

  it("deduplicates slug collisions", () => {
    const result = generateMarkdownToc("# Title\n## Title\n");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.headings.map((h) => h.slug)).toEqual(["title", "title-1"]);
  });
});
