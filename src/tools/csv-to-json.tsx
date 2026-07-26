"use client";

import { useCallback, useMemo, useState } from "react";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { EditorPaneHeader } from "@/components/editor/EditorPaneHeader";
import { ToolErrorState } from "@/components/tool/ToolShell";
import { csvToJson } from "@/lib/format/csv";
import { track } from "@/lib/analytics";

const SAMPLE = `name,category,local
JSON Formatter,JSON & Data Formats,true
CSV to JSON,JSON & Data Formats,true
"Word Counter","Text Tools",true
`;

export function CsvToJsonTool() {
  const [input, setInput] = useState(SAMPLE);
  const [indent, setIndent] = useState(2);
  const [started, setStarted] = useState(false);

  const result = useMemo(
    () => csvToJson(input, { spaces: indent }),
    [input, indent],
  );

  const onChange = useCallback(
    (v: string) => {
      if (!started) {
        setStarted(true);
        track({ name: "tool_start", tool: "csv-to-json", family: "tools" });
      }
      setInput(v);
    },
    [started],
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm text-[var(--muted)]">
          JSON indent
          <select
            value={indent}
            onChange={(e) => setIndent(Number(e.target.value))}
            className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1 text-[var(--foreground)]"
          >
            <option value={2}>2 spaces</option>
            <option value={4}>4 spaces</option>
            <option value={0}>Minified</option>
          </select>
        </label>
        {result.ok ? (
          <p className="text-sm text-[var(--muted)]">
            {result.rows.length} rows · {result.columns.length} columns
          </p>
        ) : null}
      </div>

      {!result.ok ? <ToolErrorState message={result.error} /> : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <EditorPaneHeader label="CSV" getText={() => input} />
          <CodeEditor
            language="text"
            value={input}
            onChange={onChange}
            minHeight="60vh"
          />
        </div>
        <div>
          <EditorPaneHeader
            label="JSON"
            getText={() => (result.ok ? result.json : "")}
          />
          <CodeEditor
            language="json"
            value={result.ok ? result.json : ""}
            editable={false}
            minHeight="60vh"
          />
        </div>
      </div>
    </div>
  );
}
