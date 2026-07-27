import { describe, expect, it } from "vitest";
import { analyzeLines, detectLineEnding } from "./line-counter";

describe("line counter", () => {
  it("counts empty input as zero", () => {
    expect(analyzeLines("").total).toBe(0);
  });

  it("counts blank and non-empty lines", () => {
    const stats = analyzeLines("a\n\nb\n");
    expect(stats.total).toBe(4);
    expect(stats.nonEmpty).toBe(2);
    expect(stats.blank).toBe(2);
    expect(stats.trailingNewline).toBe(true);
    expect(stats.longestLine).toBe(1);
  });

  it("detects endings", () => {
    expect(detectLineEnding("a\nb")).toBe("lf");
    expect(detectLineEnding("a\r\nb")).toBe("crlf");
    expect(detectLineEnding("a\rb")).toBe("cr");
    expect(detectLineEnding("a\nb\r\nc")).toBe("mixed");
  });

  it("tracks whitespace-only lines", () => {
    const stats = analyzeLines("hi\n   \nok");
    expect(stats.whitespaceOnly).toBe(1);
    expect(stats.nonEmpty).toBe(3);
  });
});
