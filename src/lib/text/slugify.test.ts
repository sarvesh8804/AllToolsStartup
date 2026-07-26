import { describe, expect, it } from "vitest";
import { slugify } from "./slugify";

describe("slugify", () => {
  it("lowercases and hyphenates", () => {
    expect(slugify("Hello World")).toBe("hello-world");
  });

  it("strips punctuation and collapses spaces", () => {
    expect(slugify("  Forge: Tools & Utilities!  ")).toBe(
      "forge-tools-utilities",
    );
  });

  it("removes diacritics by default", () => {
    expect(slugify("Crème Brûlée")).toBe("creme-brulee");
  });

  it("supports a custom separator", () => {
    expect(slugify("hello world", { separator: "_" })).toBe("hello_world");
  });

  it("keeps case when lowercase is off", () => {
    expect(slugify("Hello World", { lowercase: false })).toBe("Hello-World");
  });

  it("keeps unicode letters when not strict", () => {
    expect(slugify("日本語 テスト", { strict: false })).toBe("日本語-テスト");
  });

  it("returns empty for symbol-only input", () => {
    expect(slugify("!!! ??? ...")).toBe("");
  });
});
