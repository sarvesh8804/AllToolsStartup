import { describe, expect, it } from "vitest";
import {
  GITIGNORE_BUILDER_STACKS,
  GITIGNORE_PRESETS,
  buildAdvancedGitignore,
  filterGitignoreStacks,
} from "./gitignore-builder";

describe("buildAdvancedGitignore", () => {
  it("exposes more stacks than the basic generator", () => {
    expect(GITIGNORE_BUILDER_STACKS.length).toBeGreaterThan(9);
    expect(GITIGNORE_PRESETS.length).toBeGreaterThan(0);
  });

  it("concatenates selected stacks", () => {
    const out = buildAdvancedGitignore({
      selectedIds: ["node", "go"],
      customLines: "",
      dedupe: true,
    });
    expect(out).toContain("node_modules/");
    expect(out).toContain("vendor/");
  });

  it("dedupes overlapping patterns", () => {
    const out = buildAdvancedGitignore({
      selectedIds: ["env", "docker"],
      customLines: "",
      dedupe: true,
    });
    const envCount = out.split("\n").filter((l) => l.trim() === ".env").length;
    expect(envCount).toBe(1);
  });

  it("appends custom lines", () => {
    const out = buildAdvancedGitignore({
      selectedIds: [],
      customLines: "*.tmp\n# mine\nlocal.db",
      dedupe: true,
    });
    expect(out).toContain("# Custom");
    expect(out).toContain("*.tmp");
    expect(out).toContain("local.db");
  });

  it("filters stacks by query", () => {
    const hits = filterGitignoreStacks("rust");
    expect(hits.some((s) => s.id === "rust")).toBe(true);
  });
});
