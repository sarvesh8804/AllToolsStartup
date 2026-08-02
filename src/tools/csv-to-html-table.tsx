"use client";

import { useCallback, useMemo, useState } from "react";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { EditorPaneHeader } from "@/components/editor/EditorPaneHeader";
import { ToolErrorState } from "@/components/tool/ToolShell";
import {
  SAMPLE_CSV_TO_HTML,
  csvToHtmlTable,
} from "@/lib/format/csv-to-html-table";
import type { CellAlign } from "@/lib/html/table";
import { track } from "@/lib/analytics";

export function CsvToHtmlTableTool() {
  const [input, setInput] = useState(SAMPLE_CSV_TO_HTML);
  const [delimiter, setDelimiter] = useState(",");
  const [headers, setHeaders] = useState(true);
  const [trimFields, setTrimFields] = useState(true);
  const [skipEmptyRows, setSkipEmptyRows] = useState(true);
  const [border, setBorder] = useState(true);
  const [useSections, setUseSections] = useState(true);
  const [accessible, setAccessible] = useState(true);
  const [caption, setCaption] = useState("");
  const [align, setAlign] = useState<CellAlign>("left");
  const [started, setStarted] = useState(false);
  const [completed, setCompleted] = useState(false);

  const result = useMemo(
    () =>
      csvToHtmlTable(input, {
        delimiter,
        headers,
        trimFields,
        skipEmptyRows,
        border,
        useSections,
        accessible,
        caption,
        alignment: align,
      }),
    [
      input,
      delimiter,
      headers,
      trimFields,
      skipEmptyRows,
      border,
      useSections,
      accessible,
      caption,
      align,
    ],
  );

  const markStart = useCallback(() => {
    if (!started) {
      setStarted(true);
      track({ name: "tool_start", tool: "csv-to-html-table", family: "tools" });
    }
  }, [started]);

  const markComplete = useCallback(() => {
    if (!completed && result.ok) {
      setCompleted(true);
      track({
        name: "tool_complete",
        tool: "csv-to-html-table",
        family: "tools",
      });
    }
  }, [completed, result.ok]);

  const touch = () => {
    markStart();
    markComplete();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm text-[var(--muted)]">
          Delimiter
          <select
            value={delimiter}
            onChange={(e) => {
              touch();
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
          Column align
          <select
            value={align}
            onChange={(e) => {
              touch();
              setAlign(e.target.value as CellAlign);
            }}
            className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1 text-[var(--foreground)]"
          >
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
          </select>
        </label>
        <label className="flex min-w-[12rem] flex-1 flex-col gap-1 text-sm text-[var(--muted)] sm:max-w-xs">
          Caption
          <input
            type="text"
            value={caption}
            placeholder="Optional table caption"
            onChange={(e) => {
              touch();
              setCaption(e.target.value);
            }}
            className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[var(--foreground)]"
          />
        </label>
        {result.ok ? (
          <p className="text-sm text-[var(--muted)]">
            {result.rowCount} rows · {result.columnCount} columns
          </p>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-3">
        <label className="flex items-center gap-2 text-sm text-[var(--foreground)]">
          <input
            type="checkbox"
            checked={headers}
            onChange={(e) => {
              touch();
              setHeaders(e.target.checked);
            }}
          />
          First row is header
        </label>
        <label className="flex items-center gap-2 text-sm text-[var(--foreground)]">
          <input
            type="checkbox"
            checked={trimFields}
            onChange={(e) => {
              touch();
              setTrimFields(e.target.checked);
            }}
          />
          Trim fields
        </label>
        <label className="flex items-center gap-2 text-sm text-[var(--foreground)]">
          <input
            type="checkbox"
            checked={skipEmptyRows}
            onChange={(e) => {
              touch();
              setSkipEmptyRows(e.target.checked);
            }}
          />
          Skip empty rows
        </label>
        <label className="flex items-center gap-2 text-sm text-[var(--foreground)]">
          <input
            type="checkbox"
            checked={border}
            onChange={(e) => {
              touch();
              setBorder(e.target.checked);
            }}
          />
          Border
        </label>
        <label className="flex items-center gap-2 text-sm text-[var(--foreground)]">
          <input
            type="checkbox"
            checked={useSections}
            onChange={(e) => {
              touch();
              setUseSections(e.target.checked);
            }}
          />
          thead / tbody
        </label>
        <label className="flex items-center gap-2 text-sm text-[var(--foreground)]">
          <input
            type="checkbox"
            checked={accessible}
            onChange={(e) => {
              touch();
              setAccessible(e.target.checked);
            }}
          />
          scope=&quot;col&quot; on headers
        </label>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <EditorPaneHeader label="CSV input" getText={() => input} />
          <CodeEditor
            value={input}
            onChange={(v) => {
              markStart();
              setInput(v);
            }}
            minHeight="16rem"
          />
        </div>
        <div>
          <EditorPaneHeader
            label="HTML table"
            getText={() => (result.ok ? result.html : "")}
          />
          {!result.ok ? (
            <ToolErrorState message={result.error} />
          ) : (
            <CodeEditor
              language="text"
              value={result.html}
              editable={false}
              minHeight="16rem"
            />
          )}
        </div>
      </div>
    </div>
  );
}
