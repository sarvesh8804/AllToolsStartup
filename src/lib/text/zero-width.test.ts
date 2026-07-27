import { describe, expect, it } from "vitest";
import { scanZeroWidth, stripZeroWidth } from "./zero-width";

describe("scanZeroWidth", () => {
  it("finds zero-width spaces and strips them", () => {
    const input = `hello\u200Bworld\uFEFF`;
    const result = scanZeroWidth(input);
    expect(result.count).toBe(2);
    expect(result.cleaned).toBe("helloworld");
    expect(result.highlighted).toContain("⟨ZWSP⟩");
    expect(result.highlighted).toContain("⟨BOM⟩");
    expect(result.uniqueCodes).toEqual(
      expect.arrayContaining(["U+200B", "U+FEFF"]),
    );
  });

  it("returns empty match list for clean text", () => {
    const result = scanZeroWidth("plain text");
    expect(result.count).toBe(0);
    expect(result.cleaned).toBe("plain text");
    expect(result.highlighted).toBe("plain text");
  });

  it("detects ZWJ and soft hyphen", () => {
    const result = scanZeroWidth(`a\u200Db\u00ADc`);
    expect(result.count).toBe(2);
    expect(stripZeroWidth(`a\u200Db\u00ADc`)).toBe("abc");
  });

  it("reports indexes into the original string", () => {
    const result = scanZeroWidth(`ab\u200Ccd`);
    expect(result.matches[0]?.index).toBe(2);
    expect(result.matches[0]?.label).toBe("ZWNJ");
  });
});
