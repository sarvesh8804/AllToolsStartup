import { describe, expect, it } from "vitest";
import {
  DEFAULT_INVISIBLE_CATEGORIES,
  removeInvisibleCharacters,
} from "./invisible-remove";

describe("invisible character remover", () => {
  it("strips zero-width and converts nbsp", () => {
    const input = `Hello\u200B\u00A0world\uFEFF`;
    const result = removeInvisibleCharacters(input);
    expect(result.cleaned).toBe("Hello world");
    expect(result.removed).toBe(3);
  });

  it("can delete nbsp instead of replacing", () => {
    const result = removeInvisibleCharacters(
      "a\u00A0b",
      DEFAULT_INVISIBLE_CATEGORIES,
      false,
    );
    expect(result.cleaned).toBe("ab");
  });

  it("respects category toggles", () => {
    const input = "a\u200Bb\u00A0c";
    const result = removeInvisibleCharacters(input, {
      ...DEFAULT_INVISIBLE_CATEGORIES,
      "zero-width": false,
      nbsp: true,
    });
    expect(result.cleaned).toBe("a\u200Bb c");
    expect(result.removed).toBe(1);
  });
});
