import { describe, expect, it } from "vitest";
import {
  REGEX_CHEATSHEET,
  countCheatsheetEntries,
  filterCheatsheet,
} from "./cheatsheet";

describe("regex cheatsheet", () => {
  it("has multiple categories and entries", () => {
    expect(REGEX_CHEATSHEET.length).toBeGreaterThanOrEqual(6);
    expect(countCheatsheetEntries()).toBeGreaterThanOrEqual(30);
  });

  it("filters by token/name/description", () => {
    const look = filterCheatsheet("lookahead");
    expect(look.length).toBeGreaterThan(0);
    expect(
      look.some((c) => c.entries.some((e) => e.token.includes("(?="))),
    ).toBe(true);
  });

  it("returns all when query is empty", () => {
    expect(filterCheatsheet("").length).toBe(REGEX_CHEATSHEET.length);
  });

  it("returns empty list for nonsense query", () => {
    expect(filterCheatsheet("zzzz-not-a-token-zzzz")).toEqual([]);
  });
});
