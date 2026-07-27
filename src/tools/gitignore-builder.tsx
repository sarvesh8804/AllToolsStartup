"use client";

import { useCallback, useMemo, useState } from "react";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { EditorPaneHeader } from "@/components/editor/EditorPaneHeader";
import {
  DEFAULT_GITIGNORE_BUILDER_OPTIONS,
  GITIGNORE_BUILDER_STACKS,
  GITIGNORE_CATEGORIES,
  GITIGNORE_PRESETS,
  buildAdvancedGitignore,
  filterGitignoreStacks,
  type GitignoreBuilderOptions,
} from "@/lib/dev/gitignore-builder";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/cn";
import Link from "next/link";

export function GitignoreBuilderTool() {
  const [options, setOptions] = useState<GitignoreBuilderOptions>(
    DEFAULT_GITIGNORE_BUILDER_OPTIONS,
  );
  const [query, setQuery] = useState("");
  const [started, setStarted] = useState(false);

  const markStart = useCallback(() => {
    if (!started) {
      setStarted(true);
      track({
        name: "tool_start",
        tool: "gitignore-builder",
        family: "tools",
      });
    }
  }, [started]);

  const complete = () => {
    track({
      name: "tool_complete",
      tool: "gitignore-builder",
      family: "tools",
    });
  };

  const output = useMemo(() => buildAdvancedGitignore(options), [options]);
  const filtered = useMemo(() => filterGitignoreStacks(query), [query]);

  const toggle = (id: string) => {
    markStart();
    setOptions((prev) => {
      const on = prev.selectedIds.includes(id);
      return {
        ...prev,
        selectedIds: on
          ? prev.selectedIds.filter((x) => x !== id)
          : [...prev.selectedIds, id],
      };
    });
    complete();
  };

  const applyPreset = (stackIds: string[]) => {
    markStart();
    setOptions((prev) => ({ ...prev, selectedIds: [...stackIds] }));
    complete();
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {GITIGNORE_PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            title={p.description}
            onClick={() => applyPreset(p.stackIds)}
            className="rounded-md border border-[var(--border)] px-3 py-1.5 text-sm text-[var(--muted)] hover:border-[var(--accent)]/50"
          >
            {p.label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => {
            markStart();
            setOptions((prev) => ({
              ...prev,
              selectedIds: GITIGNORE_BUILDER_STACKS.map((s) => s.id),
            }));
            complete();
          }}
          className="rounded-md border border-[var(--border)] px-3 py-1.5 text-sm hover:border-[var(--accent)]/50"
        >
          Select all
        </button>
        <button
          type="button"
          onClick={() => {
            markStart();
            setOptions((prev) => ({ ...prev, selectedIds: [] }));
            complete();
          }}
          className="rounded-md border border-[var(--border)] px-3 py-1.5 text-sm hover:border-[var(--accent)]/50"
        >
          Clear
        </button>
        <label className="flex items-center gap-2 text-sm text-[var(--muted)]">
          <input
            type="checkbox"
            checked={options.dedupe}
            onChange={(e) => {
              markStart();
              setOptions((prev) => ({ ...prev, dedupe: e.target.checked }));
              complete();
            }}
          />
          Dedupe patterns
        </label>
      </div>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search stacks…"
        className="w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)]"
      />

      <div className="space-y-4">
        {GITIGNORE_CATEGORIES.map((cat) => {
          const stacks = filtered.filter((s) => s.category === cat.id);
          if (stacks.length === 0) return null;
          return (
            <div key={cat.id}>
              <p className="mb-2 text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
                {cat.label}
              </p>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {stacks.map((stack) => {
                  const on = options.selectedIds.includes(stack.id);
                  return (
                    <label
                      key={stack.id}
                      className={cn(
                        "flex cursor-pointer gap-3 rounded-xl border px-3 py-3",
                        on
                          ? "border-[var(--accent)] bg-[var(--surface-2)]"
                          : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--accent)]/50",
                      )}
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
            </div>
          );
        })}
      </div>

      <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
        Custom patterns (one per line)
        <textarea
          rows={4}
          value={options.customLines}
          onChange={(e) => {
            markStart();
            setOptions((prev) => ({ ...prev, customLines: e.target.value }));
            complete();
          }}
          placeholder={"*.tmp\n.local/\n# team notes"}
          className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 font-[family-name:var(--font-mono)] text-sm text-[var(--foreground)]"
          spellCheck={false}
        />
      </label>

      <div>
        <EditorPaneHeader label=".gitignore" getText={() => output} />
        <CodeEditor
          language="text"
          value={output}
          editable={false}
          minHeight="40vh"
        />
      </div>

      <p className="text-sm text-[var(--muted)]">
        Prefer a simpler picker?{" "}
        <Link
          href="/tools/gitignore-generator"
          className="text-[var(--accent-bright)] underline-offset-2 hover:underline"
        >
          Gitignore Generator
        </Link>
        .
      </p>
    </div>
  );
}
