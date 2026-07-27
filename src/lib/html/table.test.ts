import { describe, expect, it } from "vitest";
import {
  buildHtmlTable,
  parseDelimitedToHtmlTable,
  resizeHtmlTable,
} from "./table";

describe("html table generator", () => {
  it("builds accessible table with sections", () => {
    const html = buildHtmlTable({
      headers: ["A", "B"],
      rows: [["1", "2"]],
      caption: "Demo & co",
      border: true,
      useSections: true,
      accessible: true,
      tableClass: "data",
    });
    expect(html).toContain("<thead>");
    expect(html).toContain('scope="col"');
    expect(html).toContain("<caption>Demo &amp; co</caption>");
    expect(html).toContain('class="data"');
    expect(html).toContain("<td>1</td>");
  });

  it("escapes cell content", () => {
    const html = buildHtmlTable({
      headers: ["<x>"],
      rows: [['a"b']],
      caption: "",
      border: false,
      useSections: false,
      accessible: false,
      tableClass: "",
    });
    expect(html).toContain("&lt;x&gt;");
    expect(html).toContain("a&quot;b");
    expect(html).not.toContain("<thead>");
  });

  it("resizes and parses TSV", () => {
    const resized = resizeHtmlTable(
      {
        headers: ["A"],
        rows: [["1"]],
        caption: "",
        border: true,
        useSections: true,
        accessible: true,
        tableClass: "",
      },
      2,
      2,
    );
    expect(resized.headers).toHaveLength(2);
    expect(resized.rows).toHaveLength(2);

    const parsed = parseDelimitedToHtmlTable("H1\tH2\na\tb", "\t");
    expect(parsed.headers).toEqual(["H1", "H2"]);
    expect(parsed.rows).toEqual([["a", "b"]]);
  });
});
