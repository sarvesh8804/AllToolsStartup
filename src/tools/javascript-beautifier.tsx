"use client";

import { useCallback, useMemo, useState } from "react";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { EditorPaneHeader } from "@/components/editor/EditorPaneHeader";
import { formatJavascript, minifyJavascript } from "@/lib/format/javascript";
import { track } from "@/lib/analytics";

const SAMPLE = `function greet(name){if(!name){return"hi";}return"Hello, "+name+"!";}const forge={ship(){return true;}};`;

export function JavascriptBeautifierTool() {
  const [input, setInput] = useState(SAMPLE);
  const [indent, setIndent] = useState(2);
  const [started, setStarted] = useState(false);

  const output = useMemo(
    () => formatJavascript(input, indent),
    [input, indent],
  );

  const onChange = useCallback(
    (v: string) => {
      if (!started) {
        setStarted(true);
        track({
          name: "tool_start",
          tool: "javascript-beautifier",
          family: "tools",
        });
      }
      setInput(v);
    },
    [started],
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <label className="flex items-center gap-2 text-sm text-[var(--muted)]">
          Indent
          <select
            value={indent}
            onChange={(e) => setIndent(Number(e.target.value))}
            className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1 text-[var(--foreground)]"
          >
            <option value={2}>2 spaces</option>
            <option value={4}>4 spaces</option>
          </select>
        </label>
        <button
          type="button"
          onClick={() => setInput(minifyJavascript(input))}
          className="rounded-md border border-[var(--border)] px-3 py-1.5 text-sm hover:border-[var(--accent)]/50"
        >
          Minify into input
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <EditorPaneHeader label="JavaScript" getText={() => input} />
          <CodeEditor
            language="text"
            value={input}
            onChange={onChange}
            minHeight="60vh"
          />
        </div>
        <div>
          <EditorPaneHeader label="Formatted" getText={() => output} />
          <CodeEditor
            language="text"
            value={output}
            editable={false}
            minHeight="60vh"
          />
        </div>
      </div>

      <p className="text-xs text-[var(--muted)]">
        Lightweight beautifier — preserves strings and comments. Not a full
        Prettier / ESTree formatter.
      </p>
    </div>
  );
}
