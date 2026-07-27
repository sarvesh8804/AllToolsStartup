"use client";

import { useCallback, useMemo, useState } from "react";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { EditorPaneHeader } from "@/components/editor/EditorPaneHeader";
import { analyzeLines } from "@/lib/text/line-counter";
import { track } from "@/lib/analytics";

const SAMPLE = `Line one
Line two is a bit longer

Trailing blank above
`;

export function LineCounterTool() {
  const [input, setInput] = useState(SAMPLE);
  const [started, setStarted] = useState(false);
  const [completed, setCompleted] = useState(false);

  const markStart = useCallback(() => {
    if (!started) {
      setStarted(true);
      track({ name: "tool_start", tool: "line-counter", family: "tools" });
    }
  }, [started]);

  const stats = useMemo(() => analyzeLines(input), [input]);

  const cards: { label: string; value: string | number }[] = [
    { label: "Total lines", value: stats.total },
    { label: "Non-empty", value: stats.nonEmpty },
    { label: "Blank", value: stats.blank },
    { label: "Whitespace only", value: stats.whitespaceOnly },
    { label: "Longest line", value: stats.longestLine },
    {
      label: "Shortest non-empty",
      value: stats.shortestNonEmpty ?? "—",
    },
    { label: "Avg length", value: stats.averageLength },
    { label: "Line ending", value: stats.ending.toUpperCase() },
    {
      label: "Trailing newline",
      value: stats.trailingNewline ? "Yes" : "No",
    },
    { label: "Characters", value: stats.characters },
  ];

  return (
    <div className="space-y-4">
      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {cards.map((c) => (
          <div
            key={c.label}
            className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3"
          >
            <dt className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
              {c.label}
            </dt>
            <dd className="mt-1 font-[family-name:var(--font-mono)] text-xl text-[var(--foreground)]">
              {c.value}
            </dd>
          </div>
        ))}
      </dl>

      <div>
        <EditorPaneHeader label="Text" getText={() => input} />
        <CodeEditor
          language="text"
          value={input}
          onChange={(v) => {
            markStart();
            if (!completed) {
              setCompleted(true);
              track({
                name: "tool_complete",
                tool: "line-counter",
                family: "tools",
              });
            }
            setInput(v);
          }}
          minHeight="50vh"
        />
      </div>
    </div>
  );
}
