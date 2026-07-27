"use client";

import { useCallback, useMemo, useState } from "react";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { EditorPaneHeader } from "@/components/editor/EditorPaneHeader";
import {
  sortLines,
  type SortLinesDirection,
} from "@/lib/text/sort-lines";
import { track } from "@/lib/analytics";

const SAMPLE = `zebra
10
apple
Banana
2
apple
`;

export function SortLinesTool() {
  const [input, setInput] = useState(SAMPLE);
  const [direction, setDirection] = useState<SortLinesDirection>("asc");
  const [ignoreCase, setIgnoreCase] = useState(false);
  const [trimLines, setTrimLines] = useState(false);
  const [removeEmpty, setRemoveEmpty] = useState(false);
  const [numeric, setNumeric] = useState(false);
  const [started, setStarted] = useState(false);

  const markStart = useCallback(() => {
    if (!started) {
      setStarted(true);
      track({ name: "tool_start", tool: "sort-lines", family: "tools" });
    }
  }, [started]);

  const result = useMemo(
    () =>
      sortLines(input, {
        direction,
        ignoreCase,
        trimLines,
        removeEmpty,
        numeric,
      }),
    [input, direction, ignoreCase, trimLines, removeEmpty, numeric],
  );

  const onChange = useCallback(
    (v: string) => {
      markStart();
      setInput(v);
      track({ name: "tool_complete", tool: "sort-lines", family: "tools" });
    },
    [markStart],
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 text-sm text-[var(--muted)]">
          Order
          <select
            value={direction}
            onChange={(e) => {
              markStart();
              setDirection(e.target.value as SortLinesDirection);
            }}
            className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1 text-[var(--foreground)]"
          >
            <option value="asc">A → Z</option>
            <option value="desc">Z → A</option>
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm text-[var(--foreground)]">
          <input
            type="checkbox"
            checked={ignoreCase}
            onChange={(e) => {
              markStart();
              setIgnoreCase(e.target.checked);
            }}
          />
          Ignore case
        </label>
        <label className="flex items-center gap-2 text-sm text-[var(--foreground)]">
          <input
            type="checkbox"
            checked={trimLines}
            onChange={(e) => {
              markStart();
              setTrimLines(e.target.checked);
            }}
          />
          Trim lines
        </label>
        <label className="flex items-center gap-2 text-sm text-[var(--foreground)]">
          <input
            type="checkbox"
            checked={removeEmpty}
            onChange={(e) => {
              markStart();
              setRemoveEmpty(e.target.checked);
            }}
          />
          Remove empty
        </label>
        <label className="flex items-center gap-2 text-sm text-[var(--foreground)]">
          <input
            type="checkbox"
            checked={numeric}
            onChange={(e) => {
              markStart();
              setNumeric(e.target.checked);
            }}
          />
          Numeric sort
        </label>
        <p className="text-sm text-[var(--muted)]">{result.lineCount} lines</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <EditorPaneHeader label="Input" getText={() => input} />
          <CodeEditor
            language="text"
            value={input}
            onChange={onChange}
            minHeight="55vh"
          />
        </div>
        <div>
          <EditorPaneHeader label="Sorted" getText={() => result.text} />
          <CodeEditor
            language="text"
            value={result.text}
            editable={false}
            minHeight="55vh"
          />
        </div>
      </div>
    </div>
  );
}
