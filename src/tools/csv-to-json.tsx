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
  const [delimiter, setDelimiter] = useState(",");
  const [headers, setHeaders] = useState(true);
  const [inferTypes, setInferTypes] = useState(true);
  const [trimFields, setTrimFields] = useState(true);
  const [skipEmptyRows, setSkipEmptyRows] = useState(true);
  const [output, setOutput] = useState<"objects" | "arrays">("objects");
  const [started, setStarted] = useState(false);

  const result = useMemo(
    () =>
      csvToJson(input, {
        spaces: indent,
        delimiter,
        headers,
        inferTypes,
        trimFields,
        skipEmptyRows,
        output,
      }),
    [
      input,
      indent,
      delimiter,
      headers,
      inferTypes,
      trimFields,
      skipEmptyRows,
      output,
    ],
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

  const markStart = () => {
    if (!started) {
      setStarted(true);
      track({ name: "tool_start", tool: "csv-to-json", family: "tools" });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm text-[var(--muted)]">
          Delimiter
          <select
            value={delimiter}
            onChange={(e) => {
              markStart();
              setDelimiter(e.target.value);
            }}
            className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1 text-[var(--foreground)]"
          >
            <option value=",">Comma</option>
            <option value=";">Semicolon</option>
            <option value={"\t"}>Tab</option>
            <option value="|">Pipe</option>
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm text-[var(--muted)]">
          Output
          <select
            value={output}
            onChange={(e) => {
              markStart();
              setOutput(e.target.value as "objects" | "arrays");
            }}
            className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1 text-[var(--foreground)]"
          >
            <option value="objects">Objects</option>
            <option value="arrays">Arrays</option>
          </select>
        </label>
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

      <div className="flex flex-wrap gap-3">
        {(
          [
            ["headers", headers, setHeaders, "First row is header"],
            ["infer", inferTypes, setInferTypes, "Infer types"],
            ["trim", trimFields, setTrimFields, "Trim fields"],
            ["skip", skipEmptyRows, setSkipEmptyRows, "Skip empty rows"],
          ] as const
        ).map(([key, value, setter, label]) => (
          <label
            key={key}
            className="flex items-center gap-2 text-sm text-[var(--muted)]"
          >
            <input
              type="checkbox"
              checked={value}
              onChange={(e) => {
                markStart();
                setter(e.target.checked);
              }}
            />
            {label}
          </label>
        ))}
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
