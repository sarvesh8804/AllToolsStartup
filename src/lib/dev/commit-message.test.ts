import { describe, expect, it } from "vitest";
import {
  analyzeCommitMessage,
  buildCommitMessage,
  wrapCommitBody,
} from "./commit-message";

describe("wrapCommitBody", () => {
  it("wraps long lines at 72 characters", () => {
    const long =
      "This is a very long line that should be wrapped so it fits within the git commit body width limit.";
    const wrapped = wrapCommitBody(long);
    for (const line of wrapped.split("\n")) {
      expect(line.length).toBeLessThanOrEqual(72);
    }
  });

  it("preserves paragraph breaks", () => {
    const text = "First paragraph line.\n\nSecond paragraph.";
    expect(wrapCommitBody(text)).toContain("\n\n");
  });
});

describe("analyzeCommitMessage", () => {
  it("builds subject, body, and footer", () => {
    const result = analyzeCommitMessage({
      subject: "Add CSV export",
      body: "Users can download results as CSV.",
      footer: "Closes #10",
      coAuthors: "",
    });
    expect(result.message).toBe(
      "Add CSV export\n\nUsers can download results as CSV.\n\nCloses #10",
    );
    expect(result.subjectLength).toBe(14);
  });

  it("warns on long subject and trailing period", () => {
    const longSubject = "A".repeat(80) + ".";
    const result = analyzeCommitMessage({
      subject: longSubject,
      body: "",
      footer: "",
      coAuthors: "",
    });
    expect(result.warnings.some((w) => w.id === "subject-too-long")).toBe(true);
    expect(result.warnings.some((w) => w.id === "subject-period")).toBe(true);
  });

  it("warns on past-tense subject", () => {
    const result = analyzeCommitMessage({
      subject: "Fixed login bug",
      body: "",
      footer: "",
      coAuthors: "",
    });
    expect(result.warnings.some((w) => w.id === "imperative-mood")).toBe(true);
  });

  it("formats co-authors", () => {
    const result = analyzeCommitMessage({
      subject: "Pair on feature",
      body: "",
      footer: "",
      coAuthors: "Ada Lovelace <ada@example.com>",
    });
    expect(result.message).toContain(
      "Co-authored-by: Ada Lovelace <ada@example.com>",
    );
  });
});

describe("buildCommitMessage", () => {
  it("returns the full message string", () => {
    expect(
      buildCommitMessage({
        subject: "Update docs",
        body: "",
        footer: "",
        coAuthors: "",
      }),
    ).toBe("Update docs");
  });
});
