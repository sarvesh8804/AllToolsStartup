import { describe, expect, it } from "vitest";
import { reverseText, SAMPLE_REVERSE_TEXT } from "./reverse";

describe("reverseText", () => {
  it("reverses characters", () => {
    const result = reverseText(SAMPLE_REVERSE_TEXT, "characters");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.text).toBe("sloot egroF");
  });

  it("reverses word order", () => {
    const result = reverseText("one two three", "words");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.text).toBe("three two one");
  });

  it("reverses lines", () => {
    const result = reverseText("a\nb\nc", "lines");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.text).toBe("c\nb\na");
  });
});
