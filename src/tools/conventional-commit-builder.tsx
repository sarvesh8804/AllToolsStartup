"use client";

import { useCallback, useMemo, useState } from "react";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { EditorPaneHeader } from "@/components/editor/EditorPaneHeader";
import {
  CONVENTIONAL_COMMIT_TYPES,
  DEFAULT_CONVENTIONAL_COMMIT_INPUT,
  analyzeConventionalCommit,
  type ConventionalCommitInput,
  type ConventionalCommitType,
} from "@/lib/dev/conventional-commit";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/cn";
import Link from "next/link";

export function ConventionalCommitBuilderTool() {
  const [form, setForm] = useState<ConventionalCommitInput>(
    DEFAULT_CONVENTIONAL_COMMIT_INPUT,
  );
  const [started, setStarted] = useState(false);

  const result = useMemo(() => analyzeConventionalCommit(form), [form]);

  const markStart = useCallback(() => {
    if (!started) {
      setStarted(true);
      track({
        name: "tool_start",
        tool: "conventional-commit-builder",
        family: "tools",
      });
    }
  }, [started]);

  const patch = <K extends keyof ConventionalCommitInput>(
    key: K,
    value: ConventionalCommitInput[K],
  ) => {
    markStart();
    setForm((prev) => ({ ...prev, [key]: value }));
    track({
      name: "tool_complete",
      tool: "conventional-commit-builder",
      family: "tools",
    });
  };

  return (
    <div className="space-y-5">
      <p className="text-sm text-[var(--muted)]">
        Need a plain subject/body template? Try the{" "}
        <Link
          href="/tools/commit-message-helper"
          className="text-[var(--accent-bright)] underline-offset-2 hover:underline"
        >
          Commit Message Helper
        </Link>
        .
      </p>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
              Type
              <select
                value={form.type}
                onChange={(e) =>
                  patch("type", e.target.value as ConventionalCommitType)
                }
                className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[var(--foreground)]"
              >
                {CONVENTIONAL_COMMIT_TYPES.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label} — {t.description}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
              Scope (optional)
              <input
                value={form.scope}
                onChange={(e) => patch("scope", e.target.value)}
                placeholder="auth"
                className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 font-[family-name:var(--font-mono)] text-sm text-[var(--foreground)]"
              />
            </label>
          </div>

          <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
            Description
            <input
              value={form.description}
              onChange={(e) => patch("description", e.target.value)}
              placeholder="add session refresh endpoint"
              className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[var(--foreground)]"
            />
            <span className="text-xs">
              Header preview:{" "}
              <code className="font-[family-name:var(--font-mono)] text-[var(--foreground)]">
                {result.header}
              </code>{" "}
              ({result.headerLength} chars)
            </span>
          </label>

          <label className="flex items-center gap-2 text-sm text-[var(--foreground)]">
            <input
              type="checkbox"
              checked={form.breaking}
              onChange={(e) => patch("breaking", e.target.checked)}
            />
            Breaking change (adds <code>!</code> after type/scope)
          </label>

          {form.breaking ? (
            <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
              BREAKING CHANGE description
              <textarea
                value={form.breakingDescription}
                onChange={(e) => patch("breakingDescription", e.target.value)}
                rows={2}
                placeholder="Describe what breaks and how to migrate."
                className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[var(--foreground)]"
              />
            </label>
          ) : null}

          <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
            Body (optional)
            <textarea
              value={form.body}
              onChange={(e) => patch("body", e.target.value)}
              rows={5}
              placeholder="Longer explanation — wrapped at 72 characters."
              className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[var(--foreground)]"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
            Footer (optional)
            <input
              value={form.footer}
              onChange={(e) => patch("footer", e.target.value)}
              placeholder="Closes #128"
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
              Header follows Conventional Commits format.
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
        </div>
      </div>
    </div>
  );
}
