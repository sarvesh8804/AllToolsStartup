import { describe, expect, it } from "vitest";
import {
  SAMPLE_JSON_TO_MARKDOWN_TABLE,
  jsonToMarkdownTable,
} from "./json-to-markdown-table";

describe("jsonToMarkdownTable", () => {
  it("converts an array of objects to markdown", () => {
    const result = jsonToMarkdownTable(SAMPLE_JSON_TO_MARKDOWN_TABLE);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.columns).toEqual(["name", "category", "local"]);
    expect(result.rowCount).toBe(3);
    expect(result.markdown).toContain("| name");
    expect(result.markdown).toContain("| JSON Formatter");
    expect(result.markdown).toContain("| true  |");
  });

  it("stringifies nested values", () => {
    const result = jsonToMarkdownTable(
      JSON.stringify([{ a: 1, b: { x: 2 } }]),
      { pretty: false },
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.markdown).toContain('{"x":2}');
  });

  it("sorts keys when requested", () => {
    const result = jsonToMarkdownTable(
      JSON.stringify([{ zebra: 1, alpha: 2 }]),
      { sortKeys: true, pretty: false },
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.columns).toEqual(["alpha", "zebra"]);
  });

  it("rejects invalid input", () => {
    expect(jsonToMarkdownTable("").ok).toBe(false);
    expect(jsonToMarkdownTable("{}").ok).toBe(false);
    expect(jsonToMarkdownTable("[1,2]").ok).toBe(false);
  });
});
