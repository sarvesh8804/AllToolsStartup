"use client";

import { useCallback, useMemo, useState } from "react";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { EditorPaneHeader } from "@/components/editor/EditorPaneHeader";
import {
  GITIGNORE_STACKS,
  buildGitignore,
} from "@/lib/dev/gitignore";
import { track } from "@/lib/analytics";

const DEFAULT_IDS = ["macos", "node", "nextjs", "env"];

export function GitignoreGeneratorTool() {
  const [selected, setSelected] = useState<string[]>(DEFAULT_IDS);
  const [started, setStarted] = useState(false);

  const output = useMemo(() => buildGitignore(selected), [selected]);

  const markStart = useCallback(() => {
    if (!started) {
      setStarted(true);
      track({
        name: "tool_start",
        tool: "gitignore-generator",
        family: "tools",
      });
    }
  }, [started]);

  const toggle = (id: string) => {
    markStart();
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const selectAll = () => {
    markStart();
    setSelected(GITIGNORE_STACKS.map((s) => s.id));
  };

  const clear = () => {
    markStart();
    setSelected([]);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={selectAll}
          className="rounded-md border border-[var(--border)] px-3 py-1.5 text-sm hover:border-[var(--accent)]/50"
        >
          Select all
        </button>
        <button
          type="button"
          onClick={clear}
          className="rounded-md border border-[var(--border)] px-3 py-1.5 text-sm hover:border-[var(--accent)]/50"
        >
          Clear
        </button>
      </div>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {GITIGNORE_STACKS.map((stack) => {
          const on = selected.includes(stack.id);
          return (
            <label
              key={stack.id}
              className={
                on
                  ? "flex cursor-pointer gap-3 rounded-xl border border-[var(--accent)] bg-[var(--surface-2)] px-3 py-3"
                  : "flex cursor-pointer gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-3 hover:border-[var(--accent)]/50"
              }
            >
              <input
                type="checkbox"
                checked={on}
                onChange={() => toggle(stack.id)}
                className="mt-1 h-4 w-4 accent-[var(--accent)]"
              />
              <span>
                <span className="block text-sm font-medium text-[var(--foreground)]">
                  {stack.label}
                </span>
                <span className="mt-0.5 block text-xs text-[var(--muted)]">
                  {stack.description}
                </span>
              </span>
            </label>
          );
        })}
      </div>

      <div>
        <EditorPaneHeader label=".gitignore" getText={() => output} />
        <CodeEditor
          language="text"
          value={output}
          editable={false}
          minHeight="45vh"
        />
      </div>
    </div>
  );
}
