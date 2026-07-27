"use client";

import { useCallback, useMemo, useState } from "react";
import {
  HTTP_STATUS_CODES,
  countHttpStatusEntries,
  filterHttpStatusCodes,
} from "@/lib/http/status-codes";
import { track } from "@/lib/analytics";

export function HttpStatusCodeReferenceTool() {
  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState<string | "all">("all");
  const [copied, setCopied] = useState<string | null>(null);
  const [started, setStarted] = useState(false);

  const markStart = useCallback(() => {
    if (!started) {
      setStarted(true);
      track({
        name: "tool_start",
        tool: "http-status-code-reference",
        family: "tools",
      });
    }
  }, [started]);

  const filtered = useMemo(() => filterHttpStatusCodes(query), [query]);
  const visible =
    activeId === "all"
      ? filtered
      : filtered.filter((c) => c.id === activeId);

  const total = countHttpStatusEntries(visible);

  const copyCode = async (code: number, name: string) => {
    markStart();
    const text = `${code} ${name}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(text);
      track({
        name: "tool_complete",
        tool: "http-status-code-reference",
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
            placeholder="404, unauthorized, rate limit…"
            onChange={(e) => {
              markStart();
              setQuery(e.target.value);
            }}
            className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[var(--foreground)]"
          />
        </label>
        <p className="text-sm text-[var(--muted)]">
          {total} status codes · RFC 9110 + common extensions
        </p>
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
        {HTTP_STATUS_CODES.map((cat) => (
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
            {cat.range} {cat.title}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="rounded-xl border border-dashed border-[var(--border)] px-4 py-10 text-center text-sm text-[var(--muted)]">
          No status codes match “{query}”.
        </p>
      ) : (
        visible.map((cat) => (
          <section key={cat.id} className="space-y-3">
            <h2 className="font-[family-name:var(--font-display)] text-xl text-[var(--foreground)]">
              {cat.range} — {cat.title}
            </h2>
            <ul className="divide-y divide-[var(--border)] overflow-hidden rounded-xl border border-[var(--border)]">
              {cat.entries.map((entry) => {
                const label = `${entry.code} ${entry.name}`;
                return (
                  <li key={entry.code}>
                    <button
                      type="button"
                      onClick={() => copyCode(entry.code, entry.name)}
                      className="flex w-full flex-col gap-1 px-4 py-3 text-left transition hover:bg-[var(--surface)] sm:flex-row sm:items-baseline sm:gap-4"
                    >
                      <span className="shrink-0 font-mono text-sm font-medium text-[var(--accent-bright)]">
                        {entry.code}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-medium text-[var(--foreground)]">
                          {entry.name}
                          {copied === label ? (
                            <span className="ml-2 text-xs font-normal text-[var(--muted)]">
                              Copied
                            </span>
                          ) : null}
                        </span>
                        <span className="mt-0.5 block text-sm text-[var(--muted)]">
                          {entry.description}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        ))
      )}
    </div>
  );
}
