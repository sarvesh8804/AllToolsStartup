import { describe, expect, it } from "vitest";
import {
  GIT_CHEATSHEET,
  countGitCheatsheetEntries,
  filterGitCheatsheet,
} from "./git-cheatsheet";

describe("git cheatsheet", () => {
  it("has multiple categories", () => {
    expect(GIT_CHEATSHEET.length).toBeGreaterThan(4);
    expect(countGitCheatsheetEntries(GIT_CHEATSHEET)).toBeGreaterThan(20);
  });

  it("filters by query", () => {
    const filtered = filterGitCheatsheet("rebase");
    expect(filtered.some((c) => c.id === "merge-rebase")).toBe(true);
    expect(
      filtered.every((c) =>
        c.entries.some((e) =>
          `${e.command} ${e.name} ${e.description}`
            .toLowerCase()
            .includes("rebase"),
        ),
      ),
    ).toBe(true);
  });

  it("returns all when query empty", () => {
    expect(filterGitCheatsheet("")).toBe(GIT_CHEATSHEET);
  });
});
