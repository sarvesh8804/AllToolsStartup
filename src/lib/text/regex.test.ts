import { describe, expect, it } from "vitest";
import {
  DEFAULT_REGEX_FLAGS,
  buildRegExp,
  highlightMatches,
  testRegex,
} from "./regex";

describe("buildRegExp", () => {
  it("builds a valid regex", () => {
    const result = buildRegExp("a+", { ...DEFAULT_REGEX_FLAGS, g: true });
    expect(result.ok).toBe(true);
  });

  it("rejects invalid patterns", () => {
    expect(buildRegExp("(", DEFAULT_REGEX_FLAGS).ok).toBe(false);
  });
});

describe("testRegex", () => {
  it("finds global matches", () => {
    const result = testRegex("\\d+", "a12 b34", {
      ...DEFAULT_REGEX_FLAGS,
      g: true,
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.matches.map((m) => m.match)).toEqual(["12", "34"]);
      expect(result.matches[0].index).toBe(1);
    }
  });

  it("captures groups", () => {
    const result = testRegex(
      "(\\w+)@(\\w+)",
      "hi ada@forge.io",
      { ...DEFAULT_REGEX_FLAGS, g: false },
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.matches).toHaveLength(1);
      expect(result.matches[0].groups).toEqual(["ada", "forge"]);
    }
  });

  it("supports named groups", () => {
    const result = testRegex(
      "(?<num>\\d+)",
      "x42",
      { ...DEFAULT_REGEX_FLAGS, g: false },
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.matches[0].namedGroups.num).toBe("42");
    }
  });

  it("applies replacement", () => {
    const result = testRegex(
      "cat",
      "cat and cat",
      { ...DEFAULT_REGEX_FLAGS, g: true },
      "dog",
    );
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.replaced).toBe("dog and dog");
  });

  it("handles zero-length matches without hanging", () => {
    const result = testRegex(
      "",
      "ab",
      DEFAULT_REGEX_FLAGS,
    );
    // empty pattern is rejected
    expect(result.ok).toBe(false);
  });

  it("handles \\b zero-width style safely with empty alternation edge", () => {
    const result = testRegex(
      "x*",
      "aaa",
      { ...DEFAULT_REGEX_FLAGS, g: true },
    );
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.matches.length).toBeGreaterThan(0);
  });
});

describe("highlightMatches", () => {
  it("splits text into match segments", () => {
    const result = testRegex("b+", "abbba", {
      ...DEFAULT_REGEX_FLAGS,
      g: true,
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const segments = highlightMatches("abbba", result.matches);
    expect(segments).toEqual([
      { text: "a", isMatch: false },
      { text: "bbb", isMatch: true },
      { text: "a", isMatch: false },
    ]);
  });
});
