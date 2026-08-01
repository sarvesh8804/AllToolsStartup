"use client";

import { useCallback, useMemo, useState } from "react";
import {
  PORT_NUMBERS,
  countPortEntries,
  filterPortNumbers,
} from "@/lib/network/ports";
import { track } from "@/lib/analytics";

export function PortNumberReferenceTool() {
  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState<string | "all">("all");
  const [copied, setCopied] = useState<number | null>(null);
  const [started, setStarted] = useState(false);

  const markStart = useCallback(() => {
    if (!started) {
      setStarted(true);
      track({
        name: "tool_start",
        tool: "port-number-reference",
        family: "tools",
      });
    }
  }, [started]);

  const filtered = useMemo(() => filterPortNumbers(query), [query]);
  const visible =
    activeId === "all"
      ? filtered
      : filtered.filter((c) => c.id === activeId);

  const total = countPortEntries(visible);

  const copyPort = async (port: number) => {
    markStart();
    try {
      await navigator.clipboard.writeText(String(port));
      setCopied(port);
      track({
        name: "tool_complete",
        tool: "port-number-reference",
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
            placeholder="443, postgres, ssh…"
            onChange={(e) => {
              markStart();
              setQuery(e.target.value);
            }}
            className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[var(--foreground)]"
          />
        </label>
        <p className="text-sm text-[var(--muted)]">
          {total} ports · TCP/UDP common defaults
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
        {PORT_NUMBERS.map((cat) => (
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
          No ports match “{query}”.
        </p>
      ) : (
        visible.map((cat) => (
          <section key={cat.id} className="space-y-3">
            <h2 className="font-[family-name:var(--font-display)] text-xl text-[var(--foreground)]">
              {cat.title}
            </h2>
            <ul className="divide-y divide-[var(--border)] overflow-hidden rounded-xl border border-[var(--border)]">
              {cat.entries.map((entry) => (
                <li key={`${entry.port}-${entry.service}`}>
                  <button
                    type="button"
                    onClick={() => copyPort(entry.port)}
                    className="flex w-full flex-col gap-1 px-4 py-3 text-left transition hover:bg-[var(--surface)] sm:flex-row sm:items-baseline sm:gap-4"
                  >
                    <span className="shrink-0 font-mono text-sm font-medium text-[var(--accent-bright)]">
                      {entry.port}
                      {copied === entry.port ? (
                        <span className="ml-2 text-xs font-normal text-[var(--muted)]">
                          Copied
                        </span>
                      ) : null}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium text-[var(--foreground)]">
                        {entry.service}{" "}
                        <span className="font-normal text-[var(--muted)]">
                          ({entry.protocol})
                        </span>
                      </span>
                      <span className="mt-0.5 block text-sm text-[var(--muted)]">
                        {entry.description}
                      </span>
                    </span>
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
