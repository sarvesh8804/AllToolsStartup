import { describe, expect, it } from "vitest";
import {
  DEFAULT_CONVENTIONAL_COMMIT_INPUT,
  analyzeConventionalCommit,
  buildConventionalHeader,
} from "./conventional-commit";

describe("buildConventionalHeader", () => {
  it("formats type, scope, and description", () => {
    expect(
      buildConventionalHeader({
        ...DEFAULT_CONVENTIONAL_COMMIT_INPUT,
        breaking: false,
      }),
    ).toBe("feat(auth): add session refresh endpoint");
  });

  it("adds bang for breaking changes", () => {
    expect(
      buildConventionalHeader({
        ...DEFAULT_CONVENTIONAL_COMMIT_INPUT,
        scope: "",
        breaking: true,
      }),
    ).toBe("feat!: add session refresh endpoint");
  });

  it("supports scope with breaking bang", () => {
    expect(
      buildConventionalHeader({
        ...DEFAULT_CONVENTIONAL_COMMIT_INPUT,
        breaking: true,
      }),
    ).toBe("feat(auth)!: add session refresh endpoint");
  });
});

describe("analyzeConventionalCommit", () => {
  it("builds full message with body and footer", () => {
    const result = analyzeConventionalCommit(DEFAULT_CONVENTIONAL_COMMIT_INPUT);
    expect(result.message).toContain("feat(auth): add session refresh endpoint");
    expect(result.message).toContain("Clients can exchange");
    expect(result.message).toContain("Closes #128");
  });

  it("appends BREAKING CHANGE footer", () => {
    const result = analyzeConventionalCommit({
      ...DEFAULT_CONVENTIONAL_COMMIT_INPUT,
      breaking: true,
      breakingDescription: "Refresh tokens now expire after 7 days.",
      footer: "",
    });
    expect(result.message).toContain("feat(auth)!:");
    expect(result.message).toContain(
      "BREAKING CHANGE: Refresh tokens now expire after 7 days.",
    );
  });

  it("warns on empty description", () => {
    const result = analyzeConventionalCommit({
      ...DEFAULT_CONVENTIONAL_COMMIT_INPUT,
      description: "",
    });
    expect(result.warnings.some((w) => w.id === "empty-description")).toBe(
      true,
    );
  });
});
