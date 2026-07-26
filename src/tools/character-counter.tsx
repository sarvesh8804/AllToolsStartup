"use client";

import { useCallback, useMemo, useState } from "react";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { EditorPaneHeader } from "@/components/editor/EditorPaneHeader";
import { analyzeText } from "@/lib/text/count";
import { track } from "@/lib/analytics";

const SAMPLE = "Hello, Forge! 👋";

export function CharacterCounterTool() {
  const [input, setInput] = useState(SAMPLE);
  const [started, setStarted] = useState(false);

  const stats = useMemo(() => analyzeText(input), [input]);

  const onChange = useCallback(
    (v: string) => {
      if (!started) {
        setStarted(true);
        track({
          name: "tool_start",
          tool: "character-counter",
          family: "tools",
        });
      }
      setInput(v);
    },
    [started],
  );

  const cards = [
    { label: "Characters", value: stats.characters },
    { label: "No spaces", value: stats.charactersNoSpaces },
    { label: "UTF-8 bytes", value: stats.bytes },
    { label: "Words", value: stats.words },
    { label: "Lines", value: stats.lines },
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
            <dd className="mt-1 font-[family-name:var(--font-mono)] text-2xl text-[var(--foreground)]">
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
          onChange={onChange}
          minHeight="55vh"
        />
      </div>
    </div>
  );
}
