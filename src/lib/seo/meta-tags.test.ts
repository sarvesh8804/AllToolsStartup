import { describe, expect, it } from "vitest";
import {
  DESCRIPTION_SOFT_MAX,
  TITLE_SOFT_MAX,
  buildMetaTagsPreview,
  formatDisplayUrl,
  truncateSerp,
} from "./meta-tags";

describe("truncateSerp", () => {
  it("leaves short text alone", () => {
    expect(truncateSerp("Hello", 60)).toEqual({
      text: "Hello",
      truncated: false,
    });
  });

  it("truncates long text with ellipsis", () => {
    const long = "a ".repeat(50);
    const result = truncateSerp(long, 20);
    expect(result.truncated).toBe(true);
    expect(result.text.endsWith("…")).toBe(true);
    expect(result.text.length).toBeLessThanOrEqual(21);
  });
});

describe("formatDisplayUrl", () => {
  it("formats breadcrumb-style display URL", () => {
    expect(formatDisplayUrl("https://www.forge.tools/tools/json-formatter")).toBe(
      "forge.tools › tools › json-formatter",
    );
  });
});

describe("buildMetaTagsPreview", () => {
  it("builds preview and HTML snippet", () => {
    const preview = buildMetaTagsPreview({
      title: "JSON Formatter Online | Forge",
      description:
        "Format and validate JSON in your browser. Free, private, no upload.",
      url: "https://forge.tools/tools/json-formatter",
    });
    expect(preview.titleChars).toBeLessThanOrEqual(TITLE_SOFT_MAX);
    expect(preview.descriptionChars).toBeLessThanOrEqual(DESCRIPTION_SOFT_MAX);
    expect(preview.titleOk).toBe(true);
    expect(preview.descriptionOk).toBe(true);
    expect(preview.htmlSnippet).toContain("<title>");
    expect(preview.htmlSnippet).toContain('name="description"');
    expect(preview.displayUrl).toContain("forge.tools");
  });

  it("warns on oversized title", () => {
    const preview = buildMetaTagsPreview({
      title: "x".repeat(80),
      description: "ok description that is long enough to pass the short check here",
      url: "https://example.com",
    });
    expect(preview.titleTruncated).toBe(true);
    expect(preview.titleOk).toBe(false);
    expect(preview.warnings.length).toBeGreaterThan(0);
  });
});
