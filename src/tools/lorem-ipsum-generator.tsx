"use client";

import { useCallback, useMemo, useState } from "react";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { EditorPaneHeader } from "@/components/editor/EditorPaneHeader";
import {
  DEFAULT_LOREM_OPTIONS,
  generateLorem,
  type LoremUnit,
} from "@/lib/text/lorem";
import { track } from "@/lib/analytics";

export function LoremIpsumTool() {
  const [count, setCount] = useState(DEFAULT_LOREM_OPTIONS.count);
  const [unit, setUnit] = useState<LoremUnit>(DEFAULT_LOREM_OPTIONS.unit);
  const [startWithLorem, setStartWithLorem] = useState(true);
  const [started, setStarted] = useState(false);

  const output = useMemo(
    () => generateLorem({ count, unit, startWithLorem }),
    [count, unit, startWithLorem],
  );

  const markStart = useCallback(() => {
    if (!started) {
      setStarted(true);
      track({
        name: "tool_start",
        tool: "lorem-ipsum-generator",
        family: "tools",
      });
    }
  }, [started]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-4">
        <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
          Count
          <input
            type="number"
            min={1}
            max={100}
            value={count}
            onChange={(e) => {
              markStart();
              setCount(Number(e.target.value));
            }}
            className="w-24 rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-[var(--foreground)]"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
          Unit
          <select
            value={unit}
            onChange={(e) => {
              markStart();
              setUnit(e.target.value as LoremUnit);
            }}
            className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1.5 text-[var(--foreground)]"
          >
            <option value="paragraphs">Paragraphs</option>
            <option value="sentences">Sentences</option>
            <option value="words">Words</option>
          </select>
        </label>

        <label className="flex items-center gap-2 pb-1.5 text-sm text-[var(--muted)]">
          <input
            type="checkbox"
            checked={startWithLorem}
            onChange={(e) => {
              markStart();
              setStartWithLorem(e.target.checked);
            }}
            className="h-4 w-4 accent-[var(--accent)]"
          />
          Start with “Lorem ipsum”
        </label>
      </div>

      <div>
        <EditorPaneHeader label="Output" getText={() => output} />
        <CodeEditor
          language="text"
          value={output}
          editable={false}
          minHeight="55vh"
        />
      </div>
    </div>
  );
}
