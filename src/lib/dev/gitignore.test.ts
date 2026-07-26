import { describe, expect, it } from "vitest";
import { GITIGNORE_STACKS, buildGitignore } from "./gitignore";

describe("buildGitignore", () => {
  it("returns a placeholder when nothing is selected", () => {
    expect(buildGitignore([])).toContain("Select stacks");
  });

  it("concatenates selected stacks", () => {
    const out = buildGitignore(["node", "nextjs"]);
    expect(out).toContain("node_modules/");
    expect(out).toContain(".next/");
    expect(out).toContain("# Node");
    expect(out).toContain("# Next.js");
  });

  it("ignores unknown ids", () => {
    const out = buildGitignore(["nope", "macos"]);
    expect(out).toContain(".DS_Store");
    expect(out).not.toContain("nope");
  });

  it("exposes unique stack ids", () => {
    const ids = GITIGNORE_STACKS.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
