import { describe, expect, it } from "vitest";
import { formatXml, minifyXml } from "./xml";

describe("formatXml", () => {
  it("indents nested elements", () => {
    const out = formatXml("<root><item>Hi</item></root>");
    expect(out).toBe("<root>\n  <item>\n    Hi\n  </item>\n</root>\n");
  });

  it("keeps self-closing tags from increasing depth", () => {
    const out = formatXml("<root><img src=\"x\"/><item>ok</item></root>");
    expect(out).toContain('<img src="x"/>');
    expect(out).toContain("  <item>");
  });

  it("preserves declaration, comments, and CDATA", () => {
    const out = formatXml(
      '<?xml version="1.0"?><!-- c --><root><![CDATA[ a < b ]]></root>',
    );
    expect(out.startsWith('<?xml version="1.0"?>')).toBe(true);
    expect(out).toContain("<!-- c -->");
    expect(out).toContain("<![CDATA[ a < b ]]>");
  });
});

describe("minifyXml", () => {
  it("collapses whitespace between tags", () => {
    expect(minifyXml("<root>  <item> Hi </item>  </root>")).toBe(
      "<root><item>Hi</item></root>",
    );
  });

  it("strips comments by default", () => {
    expect(minifyXml("<root><!--x--><item/></root>")).toBe(
      "<root><item/></root>",
    );
  });

  it("can keep comments", () => {
    expect(
      minifyXml("<root><!--x--><item/></root>", { removeComments: false }),
    ).toContain("<!--x-->");
  });

  it("preserves CDATA content", () => {
    expect(minifyXml("<root><![CDATA[  a  <  b  ]]></root>")).toBe(
      "<root><![CDATA[  a  <  b  ]]></root>",
    );
  });
});
