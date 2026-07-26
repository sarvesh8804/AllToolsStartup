"use client";

import { useCallback, useMemo, useState } from "react";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { EditorPaneHeader } from "@/components/editor/EditorPaneHeader";
import { ToolErrorState } from "@/components/tool/ToolShell";
import { jsonToCsv } from "@/lib/format/csv";
import { track } from "@/lib/analytics";

const SAMPLE = `[
  { "name": "Forge", "category": "platform", "local": true },
  { "name": "JSON Formatter", "category": "tools", "local": true },
  { "name": "CSV to JSON", "category": "tools", "local": true }
]`;

export function JsonToCsvTool() {
  const [input, setInput] = useState(SAMPLE);
  const [started, setStarted] = useState(false);

  const result = useMemo(() => jsonToCsv(input), [input]);

  const onChange = useCallback(
    (v: string) => {
      if (!started) {
        setStarted(true);
        track({ name: "tool_start", tool: "json-to-csv", family: "tools" });
      }
      setInput(v);
    },
    [started],
  );

  return (
    <div className="space-y-4">
      {result.ok ? (
        <p className="text-sm text-[var(--muted)]">
          {result.rowCount} rows · {result.columns.length} columns
        </p>
      ) : (
        <ToolErrorState message={result.error} />
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <EditorPaneHeader label="JSON" getText={() => input} />
          <CodeEditor
            language="json"
            value={input}
            onChange={onChange}
            minHeight="60vh"
          />
        </div>
        <div>
          <EditorPaneHeader
            label="CSV"
            getText={() => (result.ok ? result.csv : "")}
          />
          <CodeEditor
            language="text"
            value={result.ok ? result.csv : ""}
            editable={false}
            minHeight="60vh"
          />
        </div>
      </div>
    </div>
  );
}
