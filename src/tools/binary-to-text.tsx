"use client";

import { useCallback, useMemo, useState } from "react";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { EditorPaneHeader } from "@/components/editor/EditorPaneHeader";
import { ToolErrorState } from "@/components/tool/ToolShell";
import { decodeBinary, SAMPLE_BINARY_ENCODED } from "@/lib/encoding/binary";
import { track } from "@/lib/analytics";

export function BinaryToTextTool() {
  const [input, setInput] = useState(SAMPLE_BINARY_ENCODED);
  const [started, setStarted] = useState(false);

  const result = useMemo(() => decodeBinary(input), [input]);

  const markStart = useCallback(() => {
    if (!started) {
      setStarted(true);
      track({ name: "tool_start", tool: "binary-to-text", family: "tools" });
    }
  }, [started]);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <EditorPaneHeader label="Binary input" getText={() => input} />
          <CodeEditor value={input} onChange={(v) => { markStart(); setInput(v); }} minHeight="55vh" />
        </div>
        <div>
          <EditorPaneHeader label="Decoded text" getText={() => (result.ok ? result.text : "")} />
          {!result.ok ? <ToolErrorState message={result.error} /> : <CodeEditor value={result.text} editable={false} minHeight="55vh" />}
        </div>
      </div>
      <p className="text-xs text-[var(--muted)]">Paste 8-bit binary bytes separated by spaces. For encoding, use Text to Binary.</p>
    </div>
  );
}
