import { describe, expect, it } from "vitest";
import { sortLines } from "./sort-lines";

describe("sortLines", () => {
  it("sorts ascending by default", () => {
    expect(sortLines("c\na\nb").text).toBe("a\nb\nc");
  });

  it("sorts descending", () => {
    expect(sortLines("a\nc\nb", { direction: "desc" }).text).toBe("c\nb\na");
  });

  it("ignores case when requested", () => {
    expect(sortLines("b\nA\nc", { ignoreCase: true }).text).toBe("A\nb\nc");
  });

  it("trims lines when requested", () => {
    expect(sortLines("  b \n a", { trimLines: true }).text).toBe("a\nb");
  });

  it("removes empty lines", () => {
    expect(sortLines("b\n\na\n  ", { removeEmpty: true }).text).toBe("a\nb");
  });

  it("supports numeric-aware sort", () => {
    expect(sortLines("10\n2\n1", { numeric: true }).text).toBe("1\n2\n10");
  });

  it("handles empty input", () => {
    expect(sortLines("")).toEqual({ text: "", lineCount: 0 });
  });

  it("normalizes CRLF", () => {
    expect(sortLines("b\r\na").text).toBe("a\nb");
  });
});
