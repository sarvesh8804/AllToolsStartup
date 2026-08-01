import {
  type CommitMessageWarning,
  wrapCommitBody,
} from "@/lib/dev/commit-message";

export const CONVENTIONAL_COMMIT_TYPES = [
  { id: "feat", label: "feat", description: "A new feature" },
  { id: "fix", label: "fix", description: "A bug fix" },
  { id: "docs", label: "docs", description: "Documentation only" },
  { id: "style", label: "style", description: "Formatting, no code change" },
  { id: "refactor", label: "refactor", description: "Code change without fix or feature" },
  { id: "perf", label: "perf", description: "Performance improvement" },
  { id: "test", label: "test", description: "Adding or updating tests" },
  { id: "build", label: "build", description: "Build system or dependencies" },
  { id: "ci", label: "ci", description: "CI configuration" },
  { id: "chore", label: "chore", description: "Other maintenance" },
  { id: "revert", label: "revert", description: "Revert a prior commit" },
] as const;

export type ConventionalCommitType =
  (typeof CONVENTIONAL_COMMIT_TYPES)[number]["id"];

export type ConventionalCommitInput = {
  type: ConventionalCommitType | string;
  scope: string;
  description: string;
  breaking: boolean;
  breakingDescription: string;
  body: string;
  footer: string;
};

export type ConventionalCommitResult = {
  message: string;
  header: string;
  warnings: CommitMessageWarning[];
  headerLength: number;
};

export const DEFAULT_CONVENTIONAL_COMMIT_INPUT: ConventionalCommitInput = {
  type: "feat",
  scope: "auth",
  description: "add session refresh endpoint",
  breaking: false,
  breakingDescription: "",
  body: "Clients can exchange a refresh token without re-entering credentials.",
  footer: "Closes #128",
};

const HEADER_SOFT_MAX = 50;
const HEADER_HARD_MAX = 72;

export function buildConventionalHeader(
  input: ConventionalCommitInput,
): string {
  const type = input.type.trim() || "chore";
  const scope = input.scope.trim();
  const description = input.description.trim();
  const bang = input.breaking ? "!" : "";

  const prefix = scope ? `${type}(${scope})${bang}` : `${type}${bang}`;
  if (!description) return prefix;
  return `${prefix}: ${description}`;
}

export function analyzeConventionalCommit(
  input: ConventionalCommitInput,
): ConventionalCommitResult {
  const header = buildConventionalHeader(input);
  const body = input.body.trim();
  const footer = input.footer.trim();
  const breakingDescription = input.breakingDescription.trim();

  const warnings: CommitMessageWarning[] = [];

  if (!input.description.trim()) {
    warnings.push({
      id: "empty-description",
      message: "Add a short description after the type/scope prefix.",
      severity: "warn",
    });
  }

  if (header.length > HEADER_HARD_MAX) {
    warnings.push({
      id: "header-too-long",
      message: `Header is ${header.length} characters (max recommended ${HEADER_HARD_MAX}).`,
      severity: "warn",
    });
  } else if (header.length > HEADER_SOFT_MAX) {
    warnings.push({
      id: "header-soft-long",
      message: `Header is ${header.length} characters (ideal ≤ ${HEADER_SOFT_MAX}).`,
      severity: "info",
    });
  }

  if (input.description.trim().endsWith(".")) {
    warnings.push({
      id: "description-period",
      message: "Drop the trailing period on the description.",
      severity: "info",
    });
  }

  if (input.breaking && !breakingDescription) {
    warnings.push({
      id: "breaking-missing",
      message:
        "Add a BREAKING CHANGE description when the breaking toggle is on.",
      severity: "info",
    });
  }

  const wrappedBody = body ? wrapCommitBody(body) : "";
  const footers: string[] = [];
  if (input.breaking && breakingDescription) {
    footers.push(`BREAKING CHANGE: ${breakingDescription}`);
  }
  if (footer) footers.push(footer);

  const parts: string[] = [header];
  if (wrappedBody) parts.push(wrappedBody);
  if (footers.length) parts.push(footers.join("\n"));

  return {
    message: parts.join("\n\n"),
    header,
    warnings,
    headerLength: header.length,
  };
}
