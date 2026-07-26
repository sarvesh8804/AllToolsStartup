import { describe, expect, it } from "vitest";
import { formatHtml, minifyHtml } from "./html";

describe("formatHtml", () => {
  it("indents nested tags", () => {
    const out = formatHtml("<div><p>Hi</p></div>");
    expect(out).toBe("<div>\n  <p>\n    Hi\n  </p>\n</div>\n");
  });

  it("keeps void tags from increasing depth", () => {
    const out = formatHtml("<div><img src=x><span>ok</span></div>");
    expect(out).toContain("<img src=x>");
    expect(out).toContain("  <span>");
  });

  it("preserves doctype and comments", () => {
    const out = formatHtml("<!DOCTYPE html><!-- c --><html></html>");
    expect(out.startsWith("<!DOCTYPE html>")).toBe(true);
    expect(out).toContain("<!-- c -->");
  });
});

describe("minifyHtml", () => {
  it("collapses whitespace between tags", () => {
    expect(minifyHtml("<div>  <p> Hi </p>  </div>")).toBe(
      "<div><p> Hi </p></div>",
    );
  });

  it("strips comments", () => {
    expect(minifyHtml("<div><!--x--><span></span></div>")).toBe(
      "<div><span></span></div>",
    );
  });
});
