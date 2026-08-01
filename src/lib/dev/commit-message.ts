export type CommitMessageInput = {
  subject: string;
  body: string;
  footer: string;
  coAuthors: string;
};

export type CommitMessageWarning = {
  id: string;
  message: string;
  severity: "info" | "warn";
};

export type CommitMessageResult = {
  message: string;
  subjectLine: string;
  warnings: CommitMessageWarning[];
  subjectLength: number;
  bodyLines: number;
};

export const DEFAULT_COMMIT_MESSAGE_INPUT: CommitMessageInput = {
  subject: "Fix login redirect when session expires",
  body:
    "Previously users were sent to the home page after token expiry.\nNow they return to the page they attempted to open.",
  footer: "Fixes #42",
  coAuthors: "",
};

const SUBJECT_SOFT_MAX = 50;
const SUBJECT_HARD_MAX = 72;
const BODY_WRAP = 72;

const PAST_TENSE_START =
  /^(added|fixed|updated|changed|removed|deleted|merged|created|implemented)\b/i;

export function wrapCommitBody(text: string, width = BODY_WRAP): string {
  const paragraphs = text.replace(/\r\n/g, "\n").split(/\n\n+/);
  const wrapped: string[] = [];

  for (const paragraph of paragraphs) {
    const lines = paragraph.split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      wrapped.push(...wrapLine(trimmed, width));
    }
    wrapped.push("");
  }

  while (wrapped.length > 0 && wrapped[wrapped.length - 1] === "") {
    wrapped.pop();
  }

  return wrapped.join("\n");
}

function wrapLine(line: string, width: number): string[] {
  if (line.length <= width) return [line];

  const words = line.split(/\s+/);
  const out: string[] = [];
  let current = "";

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length <= width) {
      current = next;
    } else {
      if (current) out.push(current);
      current = word.length > width ? word.slice(0, width) : word;
    }
  }
  if (current) out.push(current);
  return out;
}

function parseCoAuthors(raw: string): string[] {
  return raw
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line) => {
      if (/^co-authored-by:/i.test(line)) return line;
      if (/<[^>]+@[^>]+>/.test(line)) {
        return `Co-authored-by: ${line}`;
      }
      return `Co-authored-by: ${line}`;
    });
}

export function analyzeCommitMessage(
  input: CommitMessageInput,
): CommitMessageResult {
  const subject = input.subject.trim();
  const body = input.body.trim();
  const footer = input.footer.trim();
  const coAuthors = parseCoAuthors(input.coAuthors);

  const warnings: CommitMessageWarning[] = [];

  if (!subject) {
    warnings.push({
      id: "empty-subject",
      message: "Add a subject line — it is required for every commit.",
      severity: "warn",
    });
  }

  if (subject.length > SUBJECT_HARD_MAX) {
    warnings.push({
      id: "subject-too-long",
      message: `Subject is ${subject.length} characters (max recommended ${SUBJECT_HARD_MAX}).`,
      severity: "warn",
    });
  } else if (subject.length > SUBJECT_SOFT_MAX) {
    warnings.push({
      id: "subject-soft-long",
      message: `Subject is ${subject.length} characters (ideal ≤ ${SUBJECT_SOFT_MAX}).`,
      severity: "info",
    });
  }

  if (subject.endsWith(".")) {
    warnings.push({
      id: "subject-period",
      message: "Drop the trailing period on the subject line.",
      severity: "info",
    });
  }

  if (PAST_TENSE_START.test(subject)) {
    warnings.push({
      id: "imperative-mood",
      message:
        "Use imperative mood in the subject (e.g. “Fix bug” not “Fixed bug”).",
      severity: "info",
    });
  }

  const wrappedBody = body ? wrapCommitBody(body) : "";
  const bodyLines = wrappedBody ? wrappedBody.split("\n").length : 0;

  const parts: string[] = [];
  if (subject) parts.push(subject);
  if (wrappedBody) parts.push(wrappedBody);
  if (footer) parts.push(footer);
  if (coAuthors.length) parts.push(coAuthors.join("\n"));

  const message = parts.join("\n\n");

  return {
    message,
    subjectLine: subject,
    warnings,
    subjectLength: subject.length,
    bodyLines,
  };
}

export function buildCommitMessage(input: CommitMessageInput): string {
  return analyzeCommitMessage(input).message;
}
