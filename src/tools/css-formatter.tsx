"use client";

import { useCallback, useMemo, useState } from "react";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { EditorPaneHeader } from "@/components/editor/EditorPaneHeader";
import { formatCss, minifyCss } from "@/lib/format/css";
import { track } from "@/lib/analytics";

const SAMPLE = `body{margin:0;font-family:system-ui,sans-serif;background:#fffceb;color:#243018}
.card{padding:1rem;border:1px solid #e4dc9e;border-radius:12px}
@media (max-width:600px){.card{padding:.75rem}}`;

export function CssFormatterTool() {
  const [input, setInput] = useState(SAMPLE);
  const [indent, setIndent] = useState(2);
  const [started, setStarted] = useState(false);

  const output = useMemo(() => formatCss(input, indent), [input, indent]);

  const onChange = useCallback(
    (v: string) => {
      if (!started) {
        setStarted(true);
        track({ name: "tool_start", tool: "css-formatter", family: "tools" });
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
          onClick={() => setInput(minifyCss(input))}
          className="rounded-md border border-[var(--border)] px-3 py-1.5 text-sm hover:border-[var(--accent)]/50"
        >
          Minify into input
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <EditorPaneHeader label="CSS" getText={() => input} />
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
    </div>
  );
}
