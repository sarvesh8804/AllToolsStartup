"use client";

import { useCallback, useMemo, useState } from "react";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { EditorPaneHeader } from "@/components/editor/EditorPaneHeader";
import { ToolErrorState } from "@/components/tool/ToolShell";
import {
  listCsvHeaders,
  splitCsvColumn,
  type ColumnSplitMode,
} from "@/lib/format/csv-column-split";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/cn";

const SAMPLE = `name,tags,city
Ada,"ml|ai|math",London
Grace,"navy|cobol",New York
Lin,"os|kernel",Helsinki
`;

export function CsvColumnSplitterTool() {
  const [input, setInput] = useState(SAMPLE);
  const [delimiter, setDelimiter] = useState(",");
  const [column, setColumn] = useState("tags");
  const [splitOn, setSplitOn] = useState("|");
  const [mode, setMode] = useState<ColumnSplitMode>("columns");
  const [keepOriginal, setKeepOriginal] = useState(false);
  const [maxParts, setMaxParts] = useState(0);
  const [started, setStarted] = useState(false);

  const headers = useMemo(
    () => listCsvHeaders(input, delimiter),
    [input, delimiter],
  );

  const result = useMemo(
    () =>
      splitCsvColumn(input, {
        delimiter,
        column,
        splitOn,
        mode,
        keepOriginal,
        maxParts,
      }),
    [input, delimiter, column, splitOn, mode, keepOriginal, maxParts],
  );

  const markStart = useCallback(() => {
    if (!started) {
      setStarted(true);
      track({
        name: "tool_start",
        tool: "csv-column-splitter",
        family: "tools",
      });
    }
  }, [started]);

  const onChange = (v: string) => {
    markStart();
    setInput(v);
    track({
      name: "tool_complete",
      tool: "csv-column-splitter",
      family: "tools",
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm text-[var(--muted)]">
          Column
          <select
            value={column}
            onChange={(e) => {
              markStart();
              setColumn(e.target.value);
            }}
            className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1 text-[var(--foreground)]"
          >
            {headers.length === 0 ? (
              <option value={column}>{column || "—"}</option>
            ) : (
              headers.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))
            )}
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm text-[var(--muted)]">
          Split on
          <input
            value={splitOn}
            onChange={(e) => {
              markStart();
              setSplitOn(e.target.value);
            }}
            className="w-16 rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1 font-[family-name:var(--font-mono)] text-[var(--foreground)]"
            spellCheck={false}
          />
        </label>
        <label className="flex items-center gap-2 text-sm text-[var(--muted)]">
          CSV delimiter
          <select
            value={delimiter}
            onChange={(e) => {
              markStart();
              setDelimiter(e.target.value);
            }}
            className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1 text-[var(--foreground)]"
          >
            <option value=",">,</option>
            <option value=";">;</option>
            <option value={"\t"}>Tab</option>
            <option value="|">|</option>
          </select>
        </label>
        <div className="flex gap-1">
          {(
            [
              ["columns", "New columns"],
              ["rows", "Explode rows"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => {
                markStart();
                setMode(value);
              }}
              className={cn(
                "rounded-md border px-2.5 py-1 text-sm",
                mode === value
                  ? "border-[var(--accent)] bg-[var(--accent)]/15 text-[var(--foreground)]"
                  : "border-[var(--border)] text-[var(--muted)] hover:border-[var(--accent)]/50",
              )}
            >
              {label}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 text-sm text-[var(--muted)]">
          <input
            type="checkbox"
            checked={keepOriginal}
            onChange={(e) => {
              markStart();
              setKeepOriginal(e.target.checked);
            }}
          />
          Keep original
        </label>
        {mode === "columns" ? (
          <label className="flex items-center gap-2 text-sm text-[var(--muted)]">
            Max parts
            <input
              type="number"
              min={0}
              max={50}
              value={maxParts}
              onChange={(e) => {
                markStart();
                setMaxParts(Number(e.target.value));
              }}
              className="w-16 rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1 text-[var(--foreground)]"
            />
            <span className="text-xs">(0 = all)</span>
          </label>
        ) : null}
        {result.ok ? (
          <span className="text-sm text-[var(--muted)]">
            {result.rowCount} rows · {result.partCount} parts
          </span>
        ) : null}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <EditorPaneHeader label="CSV input" getText={() => input} />
          <CodeEditor
            language="text"
            value={input}
            onChange={onChange}
            minHeight="50vh"
          />
        </div>
        <div>
          <EditorPaneHeader
            label="Result"
            getText={() => (result.ok ? result.csv : "")}
          />
          {result.ok ? (
            <CodeEditor
              language="text"
              value={result.csv}
              editable={false}
              minHeight="50vh"
            />
          ) : (
            <ToolErrorState message={result.error} />
          )}
        </div>
      </div>
    </div>
  );
}
