import { describe, expect, it } from "vitest";
import { markdownToHtml } from "./markdown-html";

describe("markdownToHtml", () => {
  it("converts headings and paragraphs", () => {
    const html = markdownToHtml("# Hello\n\nWorld **bold** and *em*");
    expect(html).toContain("<h1>Hello</h1>");
    expect(html).toContain("<strong>bold</strong>");
    expect(html).toContain("<em>em</em>");
    expect(html).toContain("<p>");
  });

  it("converts fenced code blocks", () => {
    const html = markdownToHtml("```js\nconst a = 1;\n```");
    expect(html).toContain('<pre><code class="language-js">');
    expect(html).toContain("const a = 1;");
  });

  it("converts lists and links", () => {
    const html = markdownToHtml("- [Forge](/tools)\n- Two");
    expect(html).toContain("<ul>");
    expect(html).toContain('<a href="/tools">Forge</a>');
    expect(html).toContain("<li>Two</li>");
  });

  it("converts tables", () => {
    const html = markdownToHtml("| A | B |\n| --- | --- |\n| 1 | 2 |");
    expect(html).toContain("<table>");
    expect(html).toContain("<th>A</th>");
    expect(html).toContain("<td>1</td>");
  });

  it("escapes raw HTML in text", () => {
    const html = markdownToHtml("Use <script> carefully");
    expect(html).toContain("&lt;script&gt;");
  });
});
