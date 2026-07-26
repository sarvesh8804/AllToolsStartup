import { describe, expect, it } from "vitest";
import {
  analyzeText,
  countCharacters,
  countLines,
  countParagraphs,
  countSentences,
  countWords,
} from "./count";

describe("countWords", () => {
  it("counts whitespace-separated words", () => {
    expect(countWords("one two three")).toBe(3);
  });

  it("returns 0 for empty", () => {
    expect(countWords("")).toBe(0);
    expect(countWords("   ")).toBe(0);
  });

  it("collapses multiple spaces", () => {
    expect(countWords("a   b\nc")).toBe(3);
  });
});

describe("countCharacters", () => {
  it("counts unicode code points", () => {
    expect(countCharacters("café").characters).toBe(4);
    expect(countCharacters("hi 👋").characters).toBe(4);
  });

  it("excludes whitespace when asked", () => {
    expect(countCharacters("a b").charactersNoSpaces).toBe(2);
  });

  it("reports UTF-8 byte length", () => {
    expect(countCharacters("é").bytes).toBe(2);
  });
});

describe("sentences paragraphs lines", () => {
  it("counts sentences", () => {
    expect(countSentences("Hi. There! Really?")).toBe(3);
    expect(countSentences("No terminator")).toBe(1);
  });

  it("counts paragraphs", () => {
    expect(countParagraphs("a\n\nb\n\nc")).toBe(3);
  });

  it("counts lines including trailing", () => {
    expect(countLines("a\nb\nc")).toBe(3);
    expect(countLines("")).toBe(0);
  });
});

describe("analyzeText", () => {
  it("aggregates stats and reading time", () => {
    const stats = analyzeText("Hello world. Another sentence.");
    expect(stats.words).toBe(4);
    expect(stats.sentences).toBe(2);
    expect(stats.readingTimeMinutes).toBe(1);
  });
});
