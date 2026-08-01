"use client";

import { useCallback, useMemo, useState } from "react";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { EditorPaneHeader } from "@/components/editor/EditorPaneHeader";
import { ToolErrorState } from "@/components/tool/ToolShell";
import {
  SAMPLE_CSV_TO_MARKDOWN,
  csvToMarkdown,
} from "@/lib/format/csv-to-markdown";
import type { CellAlign } from "@/lib/text/markdown-table";
import { track } from "@/lib/analytics";

export function CsvToMarkdownTool() {
  const [input, setInput] = useState(SAMPLE_CSV_TO_MARKDOWN);
  const [delimiter, setDelimiter] = useState(",");
  const [headers, setHeaders] = useState(true);
  const [trimFields, setTrimFields] = useState(true);
  const [skipEmptyRows, setSkipEmptyRows] = useState(true);
  const [pretty, setPretty] = useState(true);
  const [align, setAlign] = useState<CellAlign>("left");
  const [started, setStarted] = useState(false);
  const [completed, setCompleted] = useState(false);

  const result = useMemo(
    () =>
      csvToMarkdown(input, {
        delimiter,
        headers,
        trimFields,
        skipEmptyRows,
        pretty,
        alignment: align,
      }),
    [input, delimiter, headers, trimFields, skipEmptyRows, pretty, align],
  );

  const markStart = useCallback(() => {
    if (!started) {
      setStarted(true);
      track({ name: "tool_start", tool: "csv-to-markdown", family: "tools" });
    }
  }, [started]);

  const markComplete = useCallback(() => {
    if (!completed && result.ok) {
      setCompleted(true);
      track({
        name: "tool_complete",
        tool: "csv-to-markdown",
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
            checked={pretty}
            onChange={(e) => {
              touch();
              setPretty(e.target.checked);
            }}
          />
          Pretty columns
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
            label="Markdown table"
            getText={() => (result.ok ? result.markdown : "")}
            extra={
              result.ok ? (
                <span className="text-xs text-[var(--muted)]">GFM pipe table</span>
              ) : null
            }
          />
          {!result.ok ? (
            <ToolErrorState message={result.error} />
          ) : (
            <CodeEditor
              language="markdown"
              value={result.markdown}
              editable={false}
              minHeight="16rem"
            />
          )}
        </div>
      </div>
    </div>
  );
}
