import { describe, expect, it } from "vitest";
import { grepText, SAMPLE_GREP_PATTERN, SAMPLE_GREP_TEXT } from "./grep";

describe("grepText", () => {
  it("finds matches with line numbers", () => {
    const result = grepText(SAMPLE_GREP_PATTERN, SAMPLE_GREP_TEXT);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.totalMatches).toBe(1);
    expect(result.lines[0]?.lineNumber).toBe(1);
  });
});
