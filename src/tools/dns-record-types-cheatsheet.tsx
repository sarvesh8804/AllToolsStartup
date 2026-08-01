"use client";

import { useCallback, useMemo, useState } from "react";
import {
  DNS_RECORD_TYPES,
  countDnsRecordEntries,
  filterDnsRecords,
} from "@/lib/network/dns-records";
import { track } from "@/lib/analytics";

export function DnsRecordTypesCheatsheetTool() {
  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState<string | "all">("all");
  const [copied, setCopied] = useState<string | null>(null);
  const [started, setStarted] = useState(false);

  const markStart = useCallback(() => {
    if (!started) {
      setStarted(true);
      track({
        name: "tool_start",
        tool: "dns-record-types-cheatsheet",
        family: "tools",
      });
    }
  }, [started]);

  const filtered = useMemo(() => filterDnsRecords(query), [query]);
  const visible =
    activeId === "all"
      ? filtered
      : filtered.filter((c) => c.id === activeId);

  const total = countDnsRecordEntries(visible);

  const copyExample = async (type: string, example: string) => {
    markStart();
    try {
      await navigator.clipboard.writeText(example);
      setCopied(type);
      track({
        name: "tool_complete",
        tool: "dns-record-types-cheatsheet",
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
            placeholder="MX, CNAME, DNSSEC…"
            onChange={(e) => {
              markStart();
              setQuery(e.target.value);
            }}
            className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[var(--foreground)]"
          />
        </label>
        <p className="text-sm text-[var(--muted)]">
          {total} record types
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
        {DNS_RECORD_TYPES.map((cat) => (
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
          No record types match “{query}”.
        </p>
      ) : (
        visible.map((cat) => (
          <section key={cat.id} className="space-y-3">
            <h2 className="font-[family-name:var(--font-display)] text-xl text-[var(--foreground)]">
              {cat.title}
            </h2>
            <ul className="divide-y divide-[var(--border)] overflow-hidden rounded-xl border border-[var(--border)]">
              {cat.entries.map((entry) => (
                <li key={entry.type}>
                  <button
                    type="button"
                    onClick={() => copyExample(entry.type, entry.example)}
                    className="flex w-full flex-col gap-2 px-4 py-3 text-left transition hover:bg-[var(--surface)]"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-sm font-semibold text-[var(--accent-bright)]">
                        {entry.type}
                      </span>
                      <span className="text-sm font-medium text-[var(--foreground)]">
                        {entry.name}
                      </span>
                      {copied === entry.type ? (
                        <span className="text-xs text-[var(--muted)]">
                          Example copied
                        </span>
                      ) : null}
                    </div>
                    <p className="text-sm text-[var(--muted)]">
                      {entry.description}
                    </p>
                    <code className="block overflow-x-auto rounded-md bg-[var(--background)] px-2 py-1 font-[family-name:var(--font-mono)] text-xs text-[var(--foreground)]">
                      {entry.example}
                    </code>
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
