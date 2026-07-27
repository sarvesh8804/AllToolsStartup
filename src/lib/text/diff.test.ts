import { describe, expect, it } from "vitest";
import { diffInline, diffLines, unifiedDiff, wordDiffSegments } from "./diff";

describe("diffLines", () => {
  it("marks identical texts as unchanged", () => {
    const result = diffLines("a\nb", "a\nb");
    expect(result.stats).toEqual({
      additions: 0,
      deletions: 0,
      unchanged: 2,
    });
    expect(result.rows).toHaveLength(2);
  });

  it("detects additions", () => {
    const result = diffLines("a", "a\nb");
    expect(result.stats.additions).toBe(1);
    expect(result.stats.deletions).toBe(0);
    expect(result.rows.some((r) => r.right.type === "add")).toBe(true);
  });

  it("detects deletions", () => {
    const result = diffLines("a\nb", "a");
    expect(result.stats.deletions).toBe(1);
    expect(result.stats.additions).toBe(0);
  });

  it("pairs replace lines side-by-side", () => {
    const result = diffLines("hello", "hallo");
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0].left.type).toBe("remove");
    expect(result.rows[0].right.type).toBe("add");
  });

  it("handles empty vs content", () => {
    const result = diffLines("", "x");
    expect(result.stats.additions).toBe(1);
    expect(result.rows[0].right.text).toBe("x");
  });

  it("preserves line numbers independently", () => {
    const result = diffLines("a\nb\nc", "a\nc");
    const leftNums = result.rows
      .map((r) => r.left.lineNumber)
      .filter((n) => n != null);
    const rightNums = result.rows
      .map((r) => r.right.lineNumber)
      .filter((n) => n != null);
    expect(leftNums).toEqual([1, 2, 3]);
    expect(rightNums).toEqual([1, 2]);
  });
});

describe("unifiedDiff", () => {
  it("formats with +/- prefixes", () => {
    const text = unifiedDiff("one\ntwo", "one\nthree");
    expect(text).toContain("  one");
    expect(text).toContain("- two");
    expect(text).toContain("+ three");
  });
});

describe("diffInline / wordDiffSegments", () => {
  it("marks replace lines with word segments", () => {
    const { lines } = diffInline("hello world", "hello forge");
    expect(lines).toHaveLength(1);
    expect(lines[0].kind).toBe("replace");
    expect(lines[0].segments?.some((s) => s.type === "remove")).toBe(true);
    expect(lines[0].segments?.some((s) => s.type === "add")).toBe(true);
  });

  it("diffs words inside a line", () => {
    const segs = wordDiffSegments("one two three", "one TWO three");
    expect(segs.some((s) => s.text === "two" && s.type === "remove")).toBe(
      true,
    );
    expect(segs.some((s) => s.text === "TWO" && s.type === "add")).toBe(true);
  });
});
