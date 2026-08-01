import { describe, expect, it } from "vitest";
import {
  SAMPLE_CSV_TO_MARKDOWN,
  csvToMarkdown,
} from "./csv-to-markdown";

describe("csvToMarkdown", () => {
  it("converts CSV with headers to a GFM table", () => {
    const result = csvToMarkdown(SAMPLE_CSV_TO_MARKDOWN);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.columns).toEqual(["name", "category", "local"]);
    expect(result.rowCount).toBe(3);
    expect(result.markdown).toContain("| name");
    expect(result.markdown).toContain("| JSON Formatter");
    expect(result.markdown).toContain("Pipe \\| test");
  });

  it("supports custom delimiter and no headers", () => {
    const result = csvToMarkdown("a;b\nc;d", {
      delimiter: ";",
      headers: false,
      pretty: false,
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.markdown).toBe(
      "| Column 1 | Column 2 |\n| :--- | :--- |\n| a | b |\n| c | d |\n",
    );
  });

  it("rejects empty input", () => {
    expect(csvToMarkdown("").ok).toBe(false);
  });

  it("respects alignment options", () => {
    const result = csvToMarkdown("a,b\n1,2", {
      pretty: false,
      alignment: "center",
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.markdown).toContain(":---:");
  });
});
