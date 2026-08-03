"use client";

import { useCallback, useMemo, useState } from "react";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { EditorPaneHeader } from "@/components/editor/EditorPaneHeader";
import { ToolErrorState } from "@/components/tool/ToolShell";
import { reverseText, SAMPLE_REVERSE_TEXT, type ReverseTextMode } from "@/lib/text/reverse";
import { track } from "@/lib/analytics";

export function ReverseTextTool() {
  const [input, setInput] = useState(SAMPLE_REVERSE_TEXT);
  const [mode, setMode] = useState<ReverseTextMode>("characters");
  const [started, setStarted] = useState(false);

  const result = useMemo(() => reverseText(input, mode), [input, mode]);

  const markStart = useCallback(() => {
    if (!started) {
      setStarted(true);
      track({ name: "tool_start", tool: "reverse-text", family: "tools" });
    }
  }, [started]);

  return (
    <div className="space-y-4">
      <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
        Reverse by
        <select value={mode} onChange={(e) => { markStart(); setMode(e.target.value as ReverseTextMode); }}
          className="w-56 rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1.5 text-[var(--foreground)]">
          <option value="characters">Characters</option>
          <option value="words">Words</option>
          <option value="lines">Lines</option>
        </select>
      </label>
      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <EditorPaneHeader label="Input" getText={() => input} />
          <CodeEditor value={input} onChange={(v) => { markStart(); setInput(v); }} minHeight="55vh" />
        </div>
        <div>
          <EditorPaneHeader label="Reversed" getText={() => (result.ok ? result.text : "")} />
          {!result.ok ? <ToolErrorState message={result.error} /> : <CodeEditor value={result.text} editable={false} minHeight="55vh" />}
        </div>
      </div>
    </div>
  );
}
