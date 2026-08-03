import { describe, expect, it } from "vitest";
import { removeExtraSpaces, SAMPLE_SPACES_TEXT } from "./spaces";

describe("removeExtraSpaces", () => {
  it("collapses repeated spaces per line", () => {
    const result = removeExtraSpaces(SAMPLE_SPACES_TEXT);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.text).toBe("Hello world\nextra line");
  });

  it("can collapse all whitespace", () => {
    const result = removeExtraSpaces("a\n\n  b   c", { mode: "all" });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.text).toBe("a b c");
  });
});
