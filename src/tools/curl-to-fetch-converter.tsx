"use client";

import { useCallback, useMemo, useState } from "react";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { EditorPaneHeader } from "@/components/editor/EditorPaneHeader";
import { ToolErrorState } from "@/components/tool/ToolShell";
import { curlToFetch, SAMPLE_CURL } from "@/lib/network/curl-fetch";
import { track } from "@/lib/analytics";

export function CurlToFetchConverterTool() {
  const [input, setInput] = useState(SAMPLE_CURL);
  const [started, setStarted] = useState(false);

  const markStart = useCallback(() => {
    if (!started) {
      setStarted(true);
      track({ name: "tool_start", tool: "curl-to-fetch-converter", family: "tools" });
    }
  }, [started]);

  const result = useMemo(() => curlToFetch(input), [input]);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <EditorPaneHeader label="curl" getText={() => input} />
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
          <EditorPaneHeader label="fetch()" getText={() => (result.ok ? result.code : "")} />
          {!result.ok ? <ToolErrorState message={result.error} /> : (
            <CodeEditor language="text" value={result.code} editable={false} minHeight="55vh" />
          )}
        </div>
      </div>
      <p className="text-xs text-[var(--muted)]">
        Supports -X, -H, and -d flags. Complex shell quoting may need manual cleanup.
      </p>
    </div>
  );
}
