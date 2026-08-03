"use client";

import { useCallback, useMemo, useState } from "react";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { EditorPaneHeader } from "@/components/editor/EditorPaneHeader";
import { ToolErrorState } from "@/components/tool/ToolShell";
import { removeExtraSpaces, SAMPLE_SPACES_TEXT, type RemoveSpacesMode } from "@/lib/text/spaces";
import { track } from "@/lib/analytics";

export function RemoveExtraSpacesTool() {
  const [input, setInput] = useState(SAMPLE_SPACES_TEXT);
  const [mode, setMode] = useState<RemoveSpacesMode>("collapse");
  const [started, setStarted] = useState(false);

  const result = useMemo(() => removeExtraSpaces(input, { mode }), [input, mode]);

  const markStart = useCallback(() => {
    if (!started) {
      setStarted(true);
      track({ name: "tool_start", tool: "remove-extra-spaces", family: "tools" });
    }
  }, [started]);

  return (
    <div className="space-y-4">
      <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
        Mode
        <select value={mode} onChange={(e) => { markStart(); setMode(e.target.value as RemoveSpacesMode); }}
          className="w-56 rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1.5 text-[var(--foreground)]">
          <option value="collapse">Collapse spaces per line</option>
          <option value="trim-lines">Trim line edges only</option>
          <option value="all">Collapse all whitespace</option>
        </select>
      </label>
      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <EditorPaneHeader label="Input" getText={() => input} />
          <CodeEditor value={input} onChange={(v) => { markStart(); setInput(v); }} minHeight="55vh" />
        </div>
        <div>
          <EditorPaneHeader label="Cleaned text" getText={() => (result.ok ? result.text : "")} />
          {!result.ok ? <ToolErrorState message={result.error} /> : <CodeEditor value={result.text} editable={false} minHeight="55vh" />}
        </div>
      </div>
    </div>
  );
}
