"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import {
  GIT_CHEATSHEET,
  countGitCheatsheetEntries,
  filterGitCheatsheet,
} from "@/lib/dev/git-cheatsheet";
import { track } from "@/lib/analytics";

export function GitCheatSheetInteractiveTool() {
  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState<string | "all">("all");
  const [copied, setCopied] = useState<string | null>(null);
  const [started, setStarted] = useState(false);

  const markStart = useCallback(() => {
    if (!started) {
      setStarted(true);
      track({
        name: "tool_start",
        tool: "git-cheat-sheet-interactive",
        family: "tools",
      });
    }
  }, [started]);

  const filtered = useMemo(() => filterGitCheatsheet(query), [query]);
  const visible =
    activeId === "all"
      ? filtered
      : filtered.filter((c) => c.id === activeId);

  const total = countGitCheatsheetEntries(visible);

  const copyCommand = async (command: string) => {
    markStart();
    try {
      await navigator.clipboard.writeText(command);
      setCopied(command);
      track({
        name: "tool_complete",
        tool: "git-cheat-sheet-interactive",
        family: "tools",
      });
      window.setTimeout(() => setCopied(null), 1200);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex min-w-[220px] flex-1 flex-col gap-1 text-sm text-[var(--muted)]">
          Search
          <input
            type="search"
            value={query}
            placeholder="rebase, stash, push…"
            onChange={(e) => {
              markStart();
              setQuery(e.target.value);
            }}
            className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[var(--foreground)]"
          />
        </label>
        <p className="text-sm text-[var(--muted)]">{total} commands</p>
        <Link
          href="/tools/gitignore-generator"
          className="text-sm text-[var(--accent-bright)] underline-offset-2 hover:underline"
        >
          Gitignore Generator →
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => {
            markStart();
            setActiveId("all");
          }}
          className={`rounded-md border px-3 py-1.5 text-sm transition ${
            activeId === "all"
              ? "border-[var(--accent)] bg-[var(--accent)]/15 text-[var(--foreground)]"
              : "border-[var(--border)] text-[var(--muted)] hover:border-[var(--accent)]/50"
          }`}
        >
          All
        </button>
        {GIT_CHEATSHEET.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => {
              markStart();
              setActiveId(cat.id);
            }}
            className={`rounded-md border px-3 py-1.5 text-sm transition ${
              activeId === cat.id
                ? "border-[var(--accent)] bg-[var(--accent)]/15 text-[var(--foreground)]"
                : "border-[var(--border)] text-[var(--muted)] hover:border-[var(--accent)]/50"
            }`}
          >
            {cat.title}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="rounded-xl border border-dashed border-[var(--border)] px-4 py-10 text-center text-sm text-[var(--muted)]">
          No commands match “{query}”.
        </p>
      ) : (
        visible.map((cat) => (
          <section key={cat.id} className="space-y-3">
            <h2 className="font-[family-name:var(--font-display)] text-xl text-[var(--foreground)]">
              {cat.title}
            </h2>
            <ul className="grid gap-2 sm:grid-cols-2">
              {cat.entries.map((entry) => (
                <li key={`${cat.id}-${entry.command}`}>
                  <button
                    type="button"
                    onClick={() => copyCommand(entry.command)}
                    className="flex h-full w-full flex-col rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-left transition hover:border-[var(--accent)]/45"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <code className="font-[family-name:var(--font-mono)] text-sm text-[var(--accent-bright)]">
                        {entry.command}
                      </code>
                      <span className="shrink-0 text-xs text-[var(--muted)]">
                        {copied === entry.command ? "Copied" : "Copy"}
                      </span>
                    </div>
                    <p className="mt-1 text-sm font-medium text-[var(--foreground)]">
                      {entry.name}
                    </p>
                    <p className="mt-1 text-sm text-[var(--muted)]">
                      {entry.description}
                    </p>
                    {entry.example ? (
                      <p className="mt-2 font-[family-name:var(--font-mono)] text-xs text-[var(--muted)]">
                        e.g. {entry.example}
                      </p>
                    ) : null}
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))
      )}
    </div>
  );
}
