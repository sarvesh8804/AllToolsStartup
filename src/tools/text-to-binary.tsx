"use client";

import { useCallback, useMemo, useState } from "react";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { EditorPaneHeader } from "@/components/editor/EditorPaneHeader";
import { ToolErrorState } from "@/components/tool/ToolShell";
import { encodeBinary, SAMPLE_BINARY_TEXT } from "@/lib/encoding/binary";
import { track } from "@/lib/analytics";

export function TextToBinaryTool() {
  const [input, setInput] = useState(SAMPLE_BINARY_TEXT);
  const [started, setStarted] = useState(false);

  const result = useMemo(() => encodeBinary(input), [input]);

  const markStart = useCallback(() => {
    if (!started) {
      setStarted(true);
      track({ name: "tool_start", tool: "text-to-binary", family: "tools" });
    }
  }, [started]);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <EditorPaneHeader label="Plain text" getText={() => input} />
          <CodeEditor value={input} onChange={(v) => { markStart(); setInput(v); }} minHeight="55vh" />
        </div>
        <div>
          <EditorPaneHeader label="Binary output" getText={() => (result.ok ? result.binary : "")} />
          {!result.ok ? <ToolErrorState message={result.error} /> : <CodeEditor value={result.binary} editable={false} minHeight="55vh" />}
        </div>
      </div>
      <p className="text-xs text-[var(--muted)]">UTF-8 bytes as 8-bit binary groups separated by spaces.</p>
    </div>
  );
}
