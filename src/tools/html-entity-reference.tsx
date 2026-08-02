"use client";

import { useCallback, useMemo, useState } from "react";
import {
  HTML_ENTITY_REFERENCE,
  countHtmlEntityEntries,
  filterHtmlEntities,
} from "@/lib/encoding/html-entity-reference";
import { track } from "@/lib/analytics";

export function HtmlEntityReferenceTool() {
  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState<string | "all">("all");
  const [copied, setCopied] = useState<string | null>(null);
  const [started, setStarted] = useState(false);

  const markStart = useCallback(() => {
    if (!started) {
      setStarted(true);
      track({
        name: "tool_start",
        tool: "html-entity-reference",
        family: "tools",
      });
    }
  }, [started]);

  const filtered = useMemo(() => filterHtmlEntities(query), [query]);
  const visible =
    activeId === "all"
      ? filtered
      : filtered.filter((c) => c.id === activeId);

  const total = countHtmlEntityEntries(visible);

  const copyEntity = async (name: string, value: string) => {
    markStart();
    try {
      await navigator.clipboard.writeText(value);
      setCopied(name);
      track({
        name: "tool_complete",
        tool: "html-entity-reference",
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
            placeholder="nbsp, euro, arrow, copyright…"
            onChange={(e) => {
              markStart();
              setQuery(e.target.value);
            }}
            className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[var(--foreground)]"
          />
        </label>
        <p className="text-sm text-[var(--muted)]">
          {total} entities · named, decimal, and hex forms
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
        {HTML_ENTITY_REFERENCE.map((cat) => (
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
          No entities match “{query}”.
        </p>
      ) : (
        visible.map((cat) => (
          <section key={cat.id} className="space-y-3">
            <h2 className="font-[family-name:var(--font-display)] text-xl text-[var(--foreground)]">
              {cat.title}
            </h2>
            <ul className="divide-y divide-[var(--border)] overflow-hidden rounded-xl border border-[var(--border)]">
              {cat.entries.map((entry) => (
                <li key={entry.name}>
                  <div className="flex flex-col gap-3 px-4 py-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-2xl leading-none text-[var(--foreground)]">
                        {entry.character}
                      </span>
                      <span className="font-mono text-sm font-semibold text-[var(--accent-bright)]">
                        &amp;{entry.name};
                      </span>
                      {copied === entry.name ? (
                        <span className="text-xs text-[var(--muted)]">
                          Copied
                        </span>
                      ) : null}
                    </div>
                    <p className="text-sm text-[var(--muted)]">
                      {entry.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {[
                        ["Named", entry.named],
                        ["Decimal", entry.decimal],
                        ["Hex", entry.hex],
                      ].map(([label, value]) => (
                        <button
                          key={label}
                          type="button"
                          onClick={() => copyEntity(entry.name, value)}
                          className="rounded-md border border-[var(--border)] bg-[var(--background)] px-2 py-1 font-[family-name:var(--font-mono)] text-xs text-[var(--foreground)] hover:border-[var(--accent)]/50"
                        >
                          {label}: {value}
                        </button>
                      ))}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ))
      )}
    </div>
  );
}
