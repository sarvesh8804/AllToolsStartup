import { describe, expect, it } from "vitest";
import { removeDuplicateLines } from "./dedupe-lines";

describe("removeDuplicateLines", () => {
  it("keeps first occurrence by default", () => {
    const result = removeDuplicateLines("a\nb\na\nc");
    expect(result.text).toBe("a\nb\nc");
    expect(result.originalCount).toBe(4);
    expect(result.uniqueCount).toBe(3);
    expect(result.removedCount).toBe(1);
  });

  it("keeps last occurrence when requested", () => {
    const result = removeDuplicateLines("a\nb\na\nc", { keepLast: true });
    expect(result.text).toBe("b\na\nc");
  });

  it("ignores case when comparing", () => {
    const result = removeDuplicateLines("Hello\nhello\nHELLO", {
      ignoreCase: true,
    });
    expect(result.text).toBe("Hello");
    expect(result.removedCount).toBe(2);
  });

  it("trims before comparing but preserves original kept text", () => {
    const result = removeDuplicateLines("  a  \na\n  a", { trimCompare: true });
    expect(result.text).toBe("  a  ");
    expect(result.removedCount).toBe(2);
  });

  it("can keep all blank lines", () => {
    const result = removeDuplicateLines("a\n\n\nb\n", { keepEmpty: true });
    expect(result.text).toBe("a\n\n\nb\n");
    expect(result.removedCount).toBe(0);
  });

  it("dedupes blank lines when keepEmpty is false", () => {
    const result = removeDuplicateLines("a\n\n\nb");
    expect(result.text).toBe("a\n\nb");
  });

  it("handles empty input", () => {
    const result = removeDuplicateLines("");
    expect(result).toEqual({
      text: "",
      originalCount: 0,
      uniqueCount: 0,
      removedCount: 0,
    });
  });

  it("normalizes CRLF", () => {
    const result = removeDuplicateLines("a\r\nb\r\na");
    expect(result.text).toBe("a\nb");
  });
});
