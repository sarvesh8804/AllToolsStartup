import { describe, expect, it } from "vitest";
import {
  DEFAULT_MARKDOWN_TABLE,
  buildMarkdownTable,
  resizeTable,
} from "./markdown-table";

describe("buildMarkdownTable", () => {
  it("builds a GFM table with alignment row", () => {
    const md = buildMarkdownTable(DEFAULT_MARKDOWN_TABLE);
    expect(md).toContain("| Name");
    expect(md).toContain("| Ada");
    expect(md).toMatch(/\| :-+:? \|/);
    expect(md).toMatch(/\| :-+: \|/);
  });

  it("escapes pipes in cells", () => {
    const md = buildMarkdownTable({
      headers: ["A"],
      rows: [["a|b"]],
      pretty: false,
    });
    expect(md).toContain("a\\|b");
  });

  it("supports compact output", () => {
    const md = buildMarkdownTable({
      headers: ["A", "B"],
      rows: [["1", "2"]],
      pretty: false,
      alignments: ["right", "center"],
    });
    expect(md).toBe("| A | B |\n| ---: | :---: |\n| 1 | 2 |\n");
  });
});

describe("resizeTable", () => {
  it("grows and shrinks the grid", () => {
    const grown = resizeTable(DEFAULT_MARKDOWN_TABLE, 4, 2);
    expect(grown.headers).toHaveLength(4);
    expect(grown.rows).toHaveLength(2);
    expect(grown.headers[3]).toBe("Column 4");

    const shrunk = resizeTable(DEFAULT_MARKDOWN_TABLE, 1, 1);
    expect(shrunk.headers).toEqual(["Name"]);
    expect(shrunk.rows).toEqual([["Ada"]]);
  });
});
