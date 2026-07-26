import { describe, expect, it } from "vitest";
import { markdownStats } from "./markdown";

describe("markdownStats", () => {
  it("counts headings links and words", () => {
    const md = `# Title

Hello [Forge](https://forge.tools) world.

## Section
`;
    const stats = markdownStats(md);
    expect(stats.headings).toBe(2);
    expect(stats.links).toBe(1);
    expect(stats.words).toBeGreaterThan(0);
  });

  it("counts fenced code blocks", () => {
    const md = "```js\nconsole.log(1)\n```\n\n```\nx\n```";
    expect(markdownStats(md).codeBlocks).toBe(2);
  });

  it("handles empty input", () => {
    expect(markdownStats("")).toEqual({
      characters: 0,
      words: 0,
      headings: 0,
      links: 0,
      codeBlocks: 0,
    });
  });
});
