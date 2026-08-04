"use client";

import { useCallback, useMemo, useState, type ReactNode } from "react";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { EditorPaneHeader } from "@/components/editor/EditorPaneHeader";
import { ToolErrorState } from "@/components/tool/ToolShell";
import {
  DEFAULT_GREP_FLAGS,
  grepText,
  SAMPLE_GREP_PATTERN,
  SAMPLE_GREP_TEXT,
  type GrepFlags,
} from "@/lib/text/grep";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/cn";

const FLAG_META: { key: keyof GrepFlags; label: string; title: string }[] = [
  { key: "g", label: "g", title: "Global" },
  { key: "i", label: "i", title: "Ignore case" },
  { key: "m", label: "m", title: "Multiline ^ $" },
];

function HighlightedLine({
  line,
  spans,
}: {
  line: string;
  spans: { start: number; end: number }[];
}) {
  if (spans.length === 0) return <>{line}</>;
  const parts: ReactNode[] = [];
  let cursor = 0;
  for (const span of spans) {
    if (span.start > cursor) {
      parts.push(line.slice(cursor, span.start));
    }
    parts.push(
      <mark
        key={`${span.start}-${span.end}`}
        className="rounded bg-[var(--accent)]/30 text-[var(--foreground)]"
      >
        {line.slice(span.start, span.end)}
      </mark>,
    );
    cursor = span.end;
  }
  if (cursor < line.length) parts.push(line.slice(cursor));
  return <>{parts}</>;
}

export function GrepOnlineTool() {
  const [pattern, setPattern] = useState(SAMPLE_GREP_PATTERN);
  const [text, setText] = useState(SAMPLE_GREP_TEXT);
  const [flags, setFlags] = useState<GrepFlags>(DEFAULT_GREP_FLAGS);
  const [started, setStarted] = useState(false);

  const markStart = useCallback(() => {
    if (!started) {
      setStarted(true);
      track({ name: "tool_start", tool: "grep-online", family: "tools" });
    }
  }, [started]);

  const result = useMemo(() => grepText(pattern, text, flags), [pattern, text, flags]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <label className="flex min-w-[16rem] flex-1 flex-col gap-1 text-sm text-[var(--muted)]">
          Pattern
          <input
            value={pattern}
            onChange={(e) => {
              markStart();
              setPattern(e.target.value);
            }}
            className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 font-[family-name:var(--font-mono)]"
            spellCheck={false}
          />
        </label>
        <div className="flex flex-wrap gap-1 pb-0.5">
          {FLAG_META.map((f) => (
            <button
              key={f.key}
              type="button"
              title={f.title}
              aria-pressed={flags[f.key]}
              onClick={() => {
                markStart();
                setFlags((prev) => ({ ...prev, [f.key]: !prev[f.key] }));
              }}
              className={
                flags[f.key]
                  ? "rounded-md bg-[var(--accent)] px-2.5 py-1.5 font-[family-name:var(--font-mono)] text-sm font-medium text-[var(--ink)]"
                  : "rounded-md border border-[var(--border)] px-2.5 py-1.5 font-[family-name:var(--font-mono)] text-sm text-[var(--muted)] hover:border-[var(--accent)]/50"
              }
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {!result.ok ? <ToolErrorState message={result.error} /> : (
        <p className="text-sm text-[var(--muted)]">
          {result.totalMatches} match{result.totalMatches === 1 ? "" : "es"} on{" "}
          {result.lines.length} line{result.lines.length === 1 ? "" : "s"}
        </p>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <EditorPaneHeader label="Text" getText={() => text} />
          <CodeEditor
            language="text"
            value={text}
            onChange={(v) => {
              markStart();
              setText(v);
            }}
            minHeight="50vh"
          />
        </div>
        <div>
          <EditorPaneHeader label="Matches" getText={() => ""} />
          <div
            className={cn(
              "min-h-[50vh] rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 font-[family-name:var(--font-mono)] text-sm",
            )}
          >
            {result.ok && result.lines.length === 0 ? (
              <p className="text-[var(--muted)]">No matches.</p>
            ) : null}
            {result.ok
              ? result.lines.map((row) => (
                  <div key={row.lineNumber} className="flex gap-3 py-0.5">
                    <span className="shrink-0 text-[var(--muted)]">{row.lineNumber}</span>
                    <span className="min-w-0 break-all">
                      <HighlightedLine line={row.line} spans={row.spans} />
                    </span>
                  </div>
                ))
              : null}
          </div>
        </div>
      </div>
    </div>
  );
}
