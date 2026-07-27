"use client";

import { useCallback, useMemo, useState } from "react";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { EditorPaneHeader } from "@/components/editor/EditorPaneHeader";
import { removeDuplicateLines } from "@/lib/text/dedupe-lines";
import { track } from "@/lib/analytics";

const SAMPLE = `apple
banana
apple
Cherry
cherry
  banana
banana

`;

export function RemoveDuplicateLinesTool() {
  const [input, setInput] = useState(SAMPLE);
  const [ignoreCase, setIgnoreCase] = useState(false);
  const [trimCompare, setTrimCompare] = useState(false);
  const [keepEmpty, setKeepEmpty] = useState(false);
  const [keepLast, setKeepLast] = useState(false);
  const [started, setStarted] = useState(false);

  const markStart = useCallback(() => {
    if (!started) {
      setStarted(true);
      track({
        name: "tool_start",
        tool: "remove-duplicate-lines",
        family: "tools",
      });
    }
  }, [started]);

  const result = useMemo(
    () =>
      removeDuplicateLines(input, {
        ignoreCase,
        trimCompare,
        keepEmpty,
        keepLast,
      }),
    [input, ignoreCase, trimCompare, keepEmpty, keepLast],
  );

  const onChange = useCallback(
    (v: string) => {
      markStart();
      setInput(v);
      track({
        name: "tool_complete",
        tool: "remove-duplicate-lines",
        family: "tools",
      });
    },
    [markStart],
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4">
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
            checked={trimCompare}
            onChange={(e) => {
              markStart();
              setTrimCompare(e.target.checked);
            }}
          />
          Trim before compare
        </label>
        <label className="flex items-center gap-2 text-sm text-[var(--foreground)]">
          <input
            type="checkbox"
            checked={keepEmpty}
            onChange={(e) => {
              markStart();
              setKeepEmpty(e.target.checked);
            }}
          />
          Keep blank lines
        </label>
        <label className="flex items-center gap-2 text-sm text-[var(--foreground)]">
          <input
            type="checkbox"
            checked={keepLast}
            onChange={(e) => {
              markStart();
              setKeepLast(e.target.checked);
            }}
          />
          Keep last occurrence
        </label>
        <p className="text-sm text-[var(--muted)]">
          {result.originalCount} lines → {result.uniqueCount} unique
          {result.removedCount > 0
            ? ` (−${result.removedCount} removed)`
            : ""}
        </p>
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
          <EditorPaneHeader label="Output" getText={() => result.text} />
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
