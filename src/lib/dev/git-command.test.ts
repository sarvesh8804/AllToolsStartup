import { describe, expect, it } from "vitest";
import {
  GIT_COMMAND_TEMPLATES,
  buildGitCommand,
  defaultFieldValues,
  filterGitCommandTemplates,
} from "./git-command";

describe("buildGitCommand", () => {
  it("fills placeholders", () => {
    const tpl = GIT_COMMAND_TEMPLATES.find((t) => t.id === "commit")!;
    const cmd = buildGitCommand(tpl.template, { message: "Add feature" });
    expect(cmd).toBe('git commit -m "Add feature"');
  });

  it("omits empty clone directory", () => {
    const tpl = GIT_COMMAND_TEMPLATES.find((t) => t.id === "clone")!;
    const cmd = buildGitCommand(tpl.template, {
      url: "https://example.com/r.git",
      directory: "",
    });
    expect(cmd).toBe("git clone https://example.com/r.git");
  });

  it("includes directory when set", () => {
    const cmd = buildGitCommand("git clone <url> <directory>", {
      url: "https://example.com/r.git",
      directory: "repo",
    });
    expect(cmd).toBe("git clone https://example.com/r.git repo");
  });
});

describe("filterGitCommandTemplates", () => {
  it("filters by query", () => {
    const hits = filterGitCommandTemplates("rebase");
    expect(hits.some((t) => t.id === "rebase")).toBe(true);
  });

  it("provides defaults", () => {
    const tpl = GIT_COMMAND_TEMPLATES.find((t) => t.id === "push-upstream")!;
    expect(defaultFieldValues(tpl)).toEqual({
      remote: "origin",
      branch: "main",
    });
  });
});
