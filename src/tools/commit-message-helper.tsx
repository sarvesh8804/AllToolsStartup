"use client";

import { useCallback, useMemo, useState } from "react";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { EditorPaneHeader } from "@/components/editor/EditorPaneHeader";
import {
  DEFAULT_COMMIT_MESSAGE_INPUT,
  analyzeCommitMessage,
  type CommitMessageInput,
} from "@/lib/dev/commit-message";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/cn";
import Link from "next/link";

export function CommitMessageHelperTool() {
  const [form, setForm] = useState<CommitMessageInput>(
    DEFAULT_COMMIT_MESSAGE_INPUT,
  );
  const [started, setStarted] = useState(false);

  const result = useMemo(() => analyzeCommitMessage(form), [form]);

  const markStart = useCallback(() => {
    if (!started) {
      setStarted(true);
      track({
        name: "tool_start",
        tool: "commit-message-helper",
        family: "tools",
      });
    }
  }, [started]);

  const patch = <K extends keyof CommitMessageInput>(
    key: K,
    value: CommitMessageInput[K],
  ) => {
    markStart();
    setForm((prev) => ({ ...prev, [key]: value }));
    track({
      name: "tool_complete",
      tool: "commit-message-helper",
      family: "tools",
    });
  };

  return (
    <div className="space-y-5">
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-4">
          <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
            Subject line
            <input
              value={form.subject}
              onChange={(e) => patch("subject", e.target.value)}
              placeholder="Fix login redirect when session expires"
              className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[var(--foreground)]"
            />
            <span className="text-xs">
              {result.subjectLength} chars · ideal ≤ 50, max 72
            </span>
          </label>

          <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
            Body (optional)
            <textarea
              value={form.body}
              onChange={(e) => patch("body", e.target.value)}
              rows={6}
              placeholder="Explain what changed and why — wrapped at 72 characters."
              className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[var(--foreground)]"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
            Footer (optional)
            <input
              value={form.footer}
              onChange={(e) => patch("footer", e.target.value)}
              placeholder="Fixes #42"
              className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 font-[family-name:var(--font-mono)] text-sm text-[var(--foreground)]"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
            Co-authors (optional, one per line)
            <textarea
              value={form.coAuthors}
              onChange={(e) => patch("coAuthors", e.target.value)}
              rows={3}
              placeholder={"Ada Lovelace <ada@example.com>"}
              className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 font-[family-name:var(--font-mono)] text-sm text-[var(--foreground)]"
            />
          </label>

          {result.warnings.length > 0 ? (
            <ul className="space-y-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 text-sm">
              {result.warnings.map((w) => (
                <li
                  key={w.id}
                  className={cn(
                    w.severity === "warn"
                      ? "text-[var(--danger)]"
                      : "text-[var(--muted)]",
                  )}
                >
                  {w.message}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-[var(--success)]">
              Subject looks good — imperative mood and length are within guidelines.
            </p>
          )}
        </div>

        <div>
          <EditorPaneHeader
            label="Commit message"
            getText={() => result.message}
          />
          <CodeEditor
            value={result.message}
            editable={false}
            minHeight="24rem"
          />
          <p className="mt-2 text-xs text-[var(--muted)]">
            Copy and paste into{" "}
            <code className="font-[family-name:var(--font-mono)]">git commit</code>{" "}
            or your PR description. For Conventional Commits (type/scope), use the{" "}
            <Link
              href="/tools/conventional-commit-builder"
              className="text-[var(--accent-bright)] underline-offset-2 hover:underline"
            >
              Conventional Commit Builder
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
