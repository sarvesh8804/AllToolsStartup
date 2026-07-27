"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { CopyButton } from "@/components/editor/CopyButton";
import {
  GIT_COMMAND_TEMPLATES,
  buildGitCommand,
  defaultFieldValues,
  filterGitCommandTemplates,
  gitCommandCategories,
  type GitCommandTemplate,
} from "@/lib/dev/git-command";
import { track } from "@/lib/analytics";

function initialFieldMap(): Record<string, Record<string, string>> {
  const map: Record<string, Record<string, string>> = {};
  for (const tpl of GIT_COMMAND_TEMPLATES) {
    map[tpl.id] = defaultFieldValues(tpl);
  }
  return map;
}

export function GitCommandExplorerTool() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | "all">("all");
  const [selectedId, setSelectedId] = useState(
    GIT_COMMAND_TEMPLATES[0]?.id ?? "clone",
  );
  const [fieldValues, setFieldValues] = useState(initialFieldMap);
  const [started, setStarted] = useState(false);

  const markStart = useCallback(() => {
    if (!started) {
      setStarted(true);
      track({
        name: "tool_start",
        tool: "git-command-explorer",
        family: "tools",
      });
    }
  }, [started]);

  const categories = useMemo(() => gitCommandCategories(), []);
  const filtered = useMemo(() => {
    const byQuery = filterGitCommandTemplates(query);
    return category === "all"
      ? byQuery
      : byQuery.filter((t) => t.category === category);
  }, [query, category]);

  const selected: GitCommandTemplate =
    filtered.find((t) => t.id === selectedId) ??
    filtered[0] ??
    GIT_COMMAND_TEMPLATES[0]!;

  const values = fieldValues[selected.id] ?? defaultFieldValues(selected);

  const command = useMemo(
    () => buildGitCommand(selected.template, values),
    [selected.template, values],
  );

  const selectTemplate = (tpl: GitCommandTemplate) => {
    markStart();
    setSelectedId(tpl.id);
    track({
      name: "tool_complete",
      tool: "git-command-explorer",
      family: "tools",
    });
  };

  const setField = (key: string, value: string) => {
    markStart();
    setFieldValues((prev) => ({
      ...prev,
      [selected.id]: { ...(prev[selected.id] ?? defaultFieldValues(selected)), [key]: value },
    }));
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex min-w-[220px] flex-1 flex-col gap-1 text-sm text-[var(--muted)]">
          Search
          <input
            type="search"
            value={query}
            placeholder="clone, commit, rebase…"
            onChange={(e) => {
              markStart();
              setQuery(e.target.value);
            }}
            className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[var(--foreground)]"
          />
        </label>
        <Link
          href="/tools/git-cheat-sheet-interactive"
          className="text-sm text-[var(--accent-bright)] underline-offset-2 hover:underline"
        >
          Full cheat sheet →
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => {
            markStart();
            setCategory("all");
          }}
          className={`rounded-md border px-3 py-1.5 text-sm ${
            category === "all"
              ? "border-[var(--accent)] bg-[var(--accent)]/15 text-[var(--foreground)]"
              : "border-[var(--border)] text-[var(--muted)]"
          }`}
        >
          All
        </button>
        {categories.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => {
              markStart();
              setCategory(c);
            }}
            className={`rounded-md border px-3 py-1.5 text-sm ${
              category === c
                ? "border-[var(--accent)] bg-[var(--accent)]/15 text-[var(--foreground)]"
                : "border-[var(--border)] text-[var(--muted)]"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,14rem)_1fr]">
        <ul className="max-h-[28rem] space-y-1 overflow-auto rounded-xl border border-[var(--border)] bg-[var(--surface)] p-2">
          {filtered.length === 0 ? (
            <li className="px-2 py-4 text-sm text-[var(--muted)]">
              No commands match.
            </li>
          ) : (
            filtered.map((tpl) => (
              <li key={tpl.id}>
                <button
                  type="button"
                  onClick={() => selectTemplate(tpl)}
                  className={`w-full rounded-lg px-3 py-2 text-left text-sm transition ${
                    selected.id === tpl.id
                      ? "bg-[var(--accent)]/15 text-[var(--foreground)]"
                      : "text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]"
                  }`}
                >
                  <span className="block font-medium">{tpl.name}</span>
                  <span className="mt-0.5 block text-xs opacity-80">
                    {tpl.category}
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>

        <div className="space-y-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
          <div>
            <h2 className="font-[family-name:var(--font-display)] text-xl text-[var(--foreground)]">
              {selected.name}
            </h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              {selected.description}
            </p>
            {selected.dangerous ? (
              <p className="mt-2 text-sm text-[var(--danger)]">
                Destructive / history-rewriting — review carefully before running.
              </p>
            ) : null}
          </div>

          {selected.fields.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {selected.fields.map((field) => (
                <label
                  key={field.key}
                  className="flex flex-col gap-1 text-sm text-[var(--muted)]"
                >
                  {field.label}
                  <input
                    type="text"
                    value={values[field.key] ?? ""}
                    placeholder={field.placeholder}
                    onChange={(e) => setField(field.key, e.target.value)}
                    className="rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 font-[family-name:var(--font-mono)] text-sm text-[var(--foreground)]"
                  />
                </label>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[var(--muted)]">
              No parameters — copy and run as-is.
            </p>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <code className="flex-1 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-3 font-[family-name:var(--font-mono)] text-sm text-[var(--foreground)]">
              {command}
            </code>
            <CopyButton getText={() => command} label="Copy command" />
          </div>
        </div>
      </div>
    </div>
  );
}
