"use client";

import { useCallback, useMemo, useState } from "react";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { EditorPaneHeader } from "@/components/editor/EditorPaneHeader";
import { ToolErrorState } from "@/components/tool/ToolShell";
import {
  filterCsvRows,
  parseCsvTable,
  sortCsvRows,
} from "@/lib/format/csv-table";
import { track } from "@/lib/analytics";

const SAMPLE = `name,category,shipped
JSON Formatter,JSON & Data Formats,true
CSV to JSON,CSV & Spreadsheets,true
Meta Tags Preview,Web & HTML,true
"Word Counter","Text Tools",true
PDF Merge,PDF Tools,true
`;

export function CsvViewerTableTool() {
  const [input, setInput] = useState(SAMPLE);
  const [delimiter, setDelimiter] = useState(",");
  const [headers, setHeaders] = useState(true);
  const [query, setQuery] = useState("");
  const [sortCol, setSortCol] = useState<number | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [started, setStarted] = useState(false);

  const markStart = useCallback(() => {
    if (!started) {
      setStarted(true);
      track({
        name: "tool_start",
        tool: "csv-viewer-table",
        family: "tools",
      });
    }
  }, [started]);

  const parsed = useMemo(
    () => parseCsvTable(input, { delimiter, headers }),
    [input, delimiter, headers],
  );

  const viewRows = useMemo(() => {
    if (!parsed.ok) return [];
    let rows = filterCsvRows(parsed.value.rows, query);
    if (sortCol != null) {
      rows = sortCsvRows(rows, sortCol, sortDir);
    }
    return rows;
  }, [parsed, query, sortCol, sortDir]);

  const onSort = (index: number) => {
    markStart();
    if (sortCol === index) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortCol(index);
      setSortDir("asc");
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
          <input
            type="checkbox"
            checked={headers}
            onChange={(e) => {
              markStart();
              setHeaders(e.target.checked);
            }}
          />
          First row is header
        </label>
        <label className="flex items-center gap-2 text-sm text-[var(--muted)]">
          Filter
          <input
            type="search"
            value={query}
            placeholder="Search cells…"
            onChange={(e) => {
              markStart();
              setQuery(e.target.value);
            }}
            className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1 text-[var(--foreground)]"
          />
        </label>
        {parsed.ok ? (
          <p className="text-sm text-[var(--muted)]">
            {viewRows.length}
            {query.trim() ? ` / ${parsed.value.rowCount}` : ""} rows ·{" "}
            {parsed.value.columnCount} columns
          </p>
        ) : null}
      </div>

      {!parsed.ok ? <ToolErrorState message={parsed.error} /> : null}

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        <div>
          <EditorPaneHeader label="CSV" getText={() => input} />
          <CodeEditor
            language="text"
            value={input}
            onChange={(v) => {
              markStart();
              setInput(v);
            }}
            minHeight="40vh"
          />
        </div>

        <div>
          <p className="mb-2 text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
            Table
          </p>
          {parsed.ok ? (
            <div className="max-h-[60vh] overflow-auto rounded-xl border border-[var(--border)]">
              <table className="w-full min-w-max text-sm">
                <thead className="sticky top-0 bg-[var(--surface)] text-left text-xs uppercase tracking-[0.08em] text-[var(--muted)]">
                  <tr>
                    <th className="px-3 py-2 font-medium">#</th>
                    {parsed.value.columns.map((col, i) => (
                      <th key={`${col}-${i}`} className="px-3 py-2">
                        <button
                          type="button"
                          onClick={() => onSort(i)}
                          className="font-medium hover:text-[var(--copper-bright)]"
                        >
                          {col}
                          {sortCol === i
                            ? sortDir === "asc"
                              ? " ↑"
                              : " ↓"
                            : ""}
                        </button>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {viewRows.map((row, rIdx) => (
                    <tr
                      key={rIdx}
                      className="border-t border-[var(--border)] font-[family-name:var(--font-mono)]"
                    >
                      <td className="px-3 py-1.5 text-[var(--muted)]">
                        {rIdx + 1}
                      </td>
                      {parsed.value.columns.map((_, cIdx) => (
                        <td
                          key={cIdx}
                          className="max-w-[280px] truncate px-3 py-1.5 text-[var(--foreground)]"
                          title={row[cIdx] ?? ""}
                        >
                          {row[cIdx] ?? ""}
                        </td>
                      ))}
                    </tr>
                  ))}
                  {viewRows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={parsed.value.columnCount + 1}
                        className="px-3 py-8 text-center text-[var(--muted)]"
                      >
                        No rows match the filter.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-[var(--border)] px-4 py-12 text-center text-sm text-[var(--muted)]">
              Fix CSV errors to see the table.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
