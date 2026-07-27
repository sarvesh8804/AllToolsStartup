import { describe, expect, it } from "vitest";
import { htmlToMarkdown } from "./html-markdown";

describe("htmlToMarkdown", () => {
  it("converts headings, paragraphs, and emphasis", () => {
    const result = htmlToMarkdown(
      "<h1>Title</h1><p>Hello <strong>world</strong> and <em>friends</em>.</p>",
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.markdown).toContain("# Title");
    expect(result.markdown).toContain("**world**");
    expect(result.markdown).toContain("*friends*");
  });

  it("converts links and images", () => {
    const result = htmlToMarkdown(
      '<p><a href="/tools">Tools</a> <img src="/x.png" alt="X" /></p>',
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.markdown).toContain("[Tools](/tools)");
    expect(result.markdown).toContain("![X](/x.png)");
  });

  it("converts lists and blockquotes", () => {
    const result = htmlToMarkdown(
      "<ul><li>One</li><li>Two</li></ul><blockquote><p>Quote</p></blockquote>",
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.markdown).toContain("- One");
    expect(result.markdown).toContain("- Two");
    expect(result.markdown).toContain("> Quote");
  });

  it("converts fenced code and tables", () => {
    const result = htmlToMarkdown(
      '<pre><code class="language-js">const x = 1;</code></pre>' +
        "<table><tr><th>A</th><th>B</th></tr><tr><td>1</td><td>2</td></tr></table>",
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.markdown).toContain("```js");
    expect(result.markdown).toContain("const x = 1;");
    expect(result.markdown).toContain("| A | B |");
    expect(result.markdown).toContain("| 1 | 2 |");
  });

  it("rejects empty input", () => {
    expect(htmlToMarkdown("   ").ok).toBe(false);
  });

  it("strips script tags", () => {
    const result = htmlToMarkdown("<p>Hi</p><script>alert(1)</script>");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.markdown).not.toContain("alert");
    expect(result.markdown).toContain("Hi");
  });
});
