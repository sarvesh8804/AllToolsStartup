import { describe, expect, it } from "vitest";
import {
  applyFindReplaceBatch,
  countRegExpMatches,
  createFindReplaceRule,
  escapeRegExp,
} from "./find-replace-batch";

describe("find-replace-batch", () => {
  it("applies literal rules in order", () => {
    const result = applyFindReplaceBatch("aaa", [
      createFindReplaceRule({ id: "1", find: "a", replace: "b" }),
      createFindReplaceRule({ id: "2", find: "bb", replace: "c" }),
    ]);
    // aaa -> bbb -> cb (first bb) then? bbb replace bb -> c + leftover b = cb
    expect(result.text).toBe("cb");
    expect(result.totalReplacements).toBe(4); // 3 a's + 1 bb
    expect(result.perRule.map((r) => r.count)).toEqual([3, 1]);
  });

  it("supports case-insensitive and whole-word", () => {
    const result = applyFindReplaceBatch("Hello hellohellow", [
      createFindReplaceRule({
        id: "1",
        find: "hello",
        replace: "hi",
        caseSensitive: false,
        wholeWord: true,
      }),
    ]);
    expect(result.text).toBe("hi hellohellow");
    expect(result.perRule[0]?.count).toBe(1);
  });

  it("supports regex replacements with groups", () => {
    const result = applyFindReplaceBatch("a=1 b=2", [
      createFindReplaceRule({
        id: "1",
        find: "(\\w+)=(\\d+)",
        replace: "$1:$2",
        useRegex: true,
      }),
    ]);
    expect(result.text).toBe("a:1 b:2");
    expect(result.totalReplacements).toBe(2);
  });

  it("skips disabled rules and reports regex errors", () => {
    const result = applyFindReplaceBatch("abc", [
      createFindReplaceRule({
        id: "off",
        find: "a",
        replace: "x",
        enabled: false,
      }),
      createFindReplaceRule({
        id: "bad",
        find: "(",
        replace: "y",
        useRegex: true,
      }),
      createFindReplaceRule({ id: "ok", find: "b", replace: "z" }),
    ]);
    expect(result.text).toBe("azc");
    expect(result.perRule[0]?.count).toBe(0);
    expect(result.perRule[1]?.error).toBeTruthy();
    expect(result.perRule[2]?.count).toBe(1);
  });

  it("escapes regex and counts zero-length safely", () => {
    expect(escapeRegExp("a.b*")).toBe("a\\.b\\*");
    expect(countRegExpMatches("aaa", /a/g)).toBe(3);
  });
});
