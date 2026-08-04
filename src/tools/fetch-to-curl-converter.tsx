"use client";

import { useCallback, useMemo, useState } from "react";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { EditorPaneHeader } from "@/components/editor/EditorPaneHeader";
import { ToolErrorState } from "@/components/tool/ToolShell";
import { fetchToCurl, SAMPLE_FETCH } from "@/lib/network/fetch-curl";
import { track } from "@/lib/analytics";

export function FetchToCurlConverterTool() {
  const [input, setInput] = useState(SAMPLE_FETCH);
  const [started, setStarted] = useState(false);

  const markStart = useCallback(() => {
    if (!started) {
      setStarted(true);
      track({ name: "tool_start", tool: "fetch-to-curl-converter", family: "tools" });
    }
  }, [started]);

  const result = useMemo(() => fetchToCurl(input), [input]);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <EditorPaneHeader label="fetch()" getText={() => input} />
          <CodeEditor
            language="text"
            value={input}
            onChange={(v) => {
              markStart();
              setInput(v);
            }}
            minHeight="55vh"
          />
        </div>
        <div>
          <EditorPaneHeader label="curl" getText={() => (result.ok ? result.curl : "")} />
          {!result.ok ? <ToolErrorState message={result.error} /> : (
            <CodeEditor language="text" value={result.curl} editable={false} minHeight="55vh" />
          )}
        </div>
      </div>
      <p className="text-xs text-[var(--muted)]">
        Paste a fetch(url, options) call. Options are evaluated locally in your browser.
      </p>
    </div>
  );
}
