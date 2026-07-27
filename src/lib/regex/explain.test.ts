import { describe, expect, it } from "vitest";
import {
  explainRegex,
  tokensToPlainText,
} from "./explain";

describe("regex explainer", () => {
  it("explains literals, escapes, and anchors", () => {
    const result = explainRegex("^hi\\d+$");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.tokens.map((t) => t.kind)).toEqual([
      "anchor",
      "literal",
      "escape",
      "quantifier",
      "anchor",
    ]);
    expect(result.tokens[2]?.title).toBe("Digit");
  });

  it("explains groups and named groups", () => {
    const result = explainRegex("(?<year>\\d{4})");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.tokens[0]?.title).toBe("Named capturing group");
    expect(result.tokens.some((t) => t.kind === "quantifier")).toBe(true);
    expect(result.tokens.at(-1)?.kind).toBe("group-close");
  });

  it("explains character classes and lookarounds", () => {
    const cls = explainRegex("[A-Za-z]");
    expect(cls.ok).toBe(true);
    if (cls.ok) {
      expect(cls.tokens).toHaveLength(1);
      expect(cls.tokens[0]?.kind).toBe("class");
    }

    const la = explainRegex("a(?=b)");
    expect(la.ok).toBe(true);
    if (la.ok) {
      expect(la.tokens.some((t) => t.title === "Positive lookahead")).toBe(true);
    }
  });

  it("reports invalid patterns but still tokenizes", () => {
    const result = explainRegex("(abc");
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.length).toBeGreaterThan(0);
    expect(result.tokens.length).toBeGreaterThan(0);
  });

  it("renders plain text export", () => {
    const result = explainRegex("a|b");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const plain = tokensToPlainText(result.tokens);
    expect(plain).toContain("Alternation");
    expect(plain).toContain("a");
  });
});
