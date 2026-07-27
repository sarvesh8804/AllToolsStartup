"use client";

import { useCallback, useMemo, useState } from "react";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { EditorPaneHeader } from "@/components/editor/EditorPaneHeader";
import { ToolErrorState } from "@/components/tool/ToolShell";
import {
  SAMPLE_FIND_REPLACE_RULES,
  SAMPLE_FIND_REPLACE_TEXT,
  applyFindReplaceBatch,
  createFindReplaceRule,
  type FindReplaceRule,
} from "@/lib/text/find-replace-batch";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/cn";

export function FindAndReplaceBatchTool() {
  const [input, setInput] = useState(SAMPLE_FIND_REPLACE_TEXT);
  const [rules, setRules] = useState<FindReplaceRule[]>(SAMPLE_FIND_REPLACE_RULES);
  const [started, setStarted] = useState(false);
  const [completed, setCompleted] = useState(false);

  const markStart = useCallback(() => {
    if (!started) {
      setStarted(true);
      track({
        name: "tool_start",
        tool: "find-and-replace-batch",
        family: "tools",
      });
    }
  }, [started]);

  const markComplete = useCallback(() => {
    if (!completed) {
      setCompleted(true);
      track({
        name: "tool_complete",
        tool: "find-and-replace-batch",
        family: "tools",
      });
    }
  }, [completed]);

  const result = useMemo(() => applyFindReplaceBatch(input, rules), [input, rules]);

  const updateRule = useCallback(
    (id: string, patch: Partial<FindReplaceRule>) => {
      markStart();
      markComplete();
      setRules((prev) =>
        prev.map((r) => (r.id === id ? { ...r, ...patch } : r)),
      );
    },
    [markComplete, markStart],
  );

  const addRule = () => {
    markStart();
    setRules((prev) => [...prev, createFindReplaceRule()]);
  };

  const removeRule = (id: string) => {
    markStart();
    setRules((prev) => (prev.length <= 1 ? prev : prev.filter((r) => r.id !== id)));
  };

  const moveRule = (id: string, dir: -1 | 1) => {
    markStart();
    setRules((prev) => {
      const i = prev.findIndex((r) => r.id === id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      const [item] = next.splice(i, 1);
      next.splice(j, 0, item!);
      return next;
    });
  };

  const firstError = result.perRule.find((r) => r.error)?.error ?? null;

  return (
    <div className="space-y-5">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-medium text-[var(--foreground)]">
            Rules (applied top → bottom)
          </h3>
          <button
            type="button"
            onClick={addRule}
            className="rounded-md border border-[var(--border)] px-2.5 py-1 text-sm text-[var(--muted)] hover:border-[var(--accent)]/50 hover:text-[var(--foreground)]"
          >
            Add rule
          </button>
        </div>

        <ul className="space-y-3">
          {rules.map((rule, index) => {
            const stats = result.perRule.find((r) => r.id === rule.id);
            return (
              <li
                key={rule.id}
                className={cn(
                  "rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3",
                  !rule.enabled && "opacity-60",
                )}
              >
                <div className="mb-2 flex flex-wrap items-center gap-2 text-sm">
                  <span className="font-[family-name:var(--font-mono)] text-[var(--muted)]">
                    #{index + 1}
                  </span>
                  <label className="flex items-center gap-1.5 text-[var(--foreground)]">
                    <input
                      type="checkbox"
                      checked={rule.enabled}
                      onChange={(e) =>
                        updateRule(rule.id, { enabled: e.target.checked })
                      }
                    />
                    On
                  </label>
                  <label className="flex items-center gap-1.5 text-[var(--muted)]">
                    <input
                      type="checkbox"
                      checked={rule.useRegex}
                      onChange={(e) =>
                        updateRule(rule.id, { useRegex: e.target.checked })
                      }
                    />
                    Regex
                  </label>
                  <label className="flex items-center gap-1.5 text-[var(--muted)]">
                    <input
                      type="checkbox"
                      checked={rule.caseSensitive}
                      onChange={(e) =>
                        updateRule(rule.id, { caseSensitive: e.target.checked })
                      }
                    />
                    Case
                  </label>
                  <label className="flex items-center gap-1.5 text-[var(--muted)]">
                    <input
                      type="checkbox"
                      checked={rule.wholeWord}
                      onChange={(e) =>
                        updateRule(rule.id, { wholeWord: e.target.checked })
                      }
                    />
                    Whole word
                  </label>
                  <span className="text-[var(--muted)]">
                    {stats?.error
                      ? "error"
                      : `${stats?.count ?? 0} replace${stats?.count === 1 ? "" : "s"}`}
                  </span>
                  <div className="ml-auto flex gap-1">
                    <button
                      type="button"
                      aria-label="Move up"
                      onClick={() => moveRule(rule.id, -1)}
                      className="rounded border border-[var(--border)] px-2 py-0.5 text-[var(--muted)] hover:text-[var(--foreground)]"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      aria-label="Move down"
                      onClick={() => moveRule(rule.id, 1)}
                      className="rounded border border-[var(--border)] px-2 py-0.5 text-[var(--muted)] hover:text-[var(--foreground)]"
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      onClick={() => removeRule(rule.id)}
                      className="rounded border border-[var(--border)] px-2 py-0.5 text-[var(--muted)] hover:text-[var(--foreground)]"
                    >
                      Remove
                    </button>
                  </div>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <label className="block text-xs text-[var(--muted)]">
                    Find
                    <input
                      value={rule.find}
                      onChange={(e) => updateRule(rule.id, { find: e.target.value })}
                      className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-2 py-1.5 font-[family-name:var(--font-mono)] text-sm text-[var(--foreground)]"
                      spellCheck={false}
                    />
                  </label>
                  <label className="block text-xs text-[var(--muted)]">
                    Replace with
                    <input
                      value={rule.replace}
                      onChange={(e) =>
                        updateRule(rule.id, { replace: e.target.value })
                      }
                      className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-2 py-1.5 font-[family-name:var(--font-mono)] text-sm text-[var(--foreground)]"
                      spellCheck={false}
                    />
                  </label>
                </div>
                {stats?.error ? (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                    {stats.error}
                  </p>
                ) : null}
              </li>
            );
          })}
        </ul>

        <p className="text-sm text-[var(--muted)]">
          {result.totalReplacements} total replacement
          {result.totalReplacements === 1 ? "" : "s"} across enabled rules.
        </p>
        {firstError ? <ToolErrorState message={firstError} /> : null}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <EditorPaneHeader label="Input" getText={() => input} />
          <CodeEditor
            language="text"
            value={input}
            onChange={(v) => {
              markStart();
              markComplete();
              setInput(v);
            }}
            minHeight="36vh"
          />
        </div>
        <div>
          <EditorPaneHeader label="Output" getText={() => result.text} />
          <CodeEditor
            language="text"
            value={result.text}
            editable={false}
            minHeight="36vh"
          />
        </div>
      </div>
    </div>
  );
}
