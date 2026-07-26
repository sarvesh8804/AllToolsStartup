import { describe, expect, it } from "vitest";
import { generateLorem } from "./lorem";

describe("generateLorem", () => {
  it("starts with Lorem ipsum by default for paragraphs", () => {
    const text = generateLorem({
      count: 1,
      unit: "paragraphs",
      startWithLorem: true,
    });
    expect(text.startsWith("Lorem ipsum")).toBe(true);
  });

  it("generates the requested word count", () => {
    const text = generateLorem({
      count: 5,
      unit: "words",
      startWithLorem: false,
    });
    expect(text.split(/\s+/)).toHaveLength(5);
  });

  it("generates the requested sentence count", () => {
    const text = generateLorem({
      count: 3,
      unit: "sentences",
      startWithLorem: false,
    });
    expect((text.match(/\./g) ?? []).length).toBe(3);
  });

  it("separates paragraphs with blank lines", () => {
    const text = generateLorem({
      count: 2,
      unit: "paragraphs",
      startWithLorem: true,
    });
    expect(text.split("\n\n")).toHaveLength(2);
  });

  it("clamps count to at least 1", () => {
    const text = generateLorem({
      count: 0,
      unit: "words",
      startWithLorem: false,
    });
    expect(text.split(/\s+/)).toHaveLength(1);
  });
});
