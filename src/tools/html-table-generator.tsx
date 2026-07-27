"use client";

import { useCallback, useMemo, useState } from "react";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { EditorPaneHeader } from "@/components/editor/EditorPaneHeader";
import {
  DEFAULT_HTML_TABLE,
  buildHtmlTable,
  parseDelimitedToHtmlTable,
  resizeHtmlTable,
  type CellAlign,
  type HtmlTableOptions,
} from "@/lib/html/table";
import { track } from "@/lib/analytics";

export function HtmlTableGeneratorTool() {
  const [table, setTable] = useState<HtmlTableOptions>(DEFAULT_HTML_TABLE);
  const [started, setStarted] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [pasteOpen, setPasteOpen] = useState(false);
  const [pasteText, setPasteText] = useState("Name\tRole\nAda\tEngineer");

  const markStart = useCallback(() => {
    if (!started) {
      setStarted(true);
      track({
        name: "tool_start",
        tool: "html-table-generator",
        family: "tools",
      });
    }
  }, [started]);

  const markComplete = useCallback(() => {
    if (!completed) {
      setCompleted(true);
      track({
        name: "tool_complete",
        tool: "html-table-generator",
        family: "tools",
      });
    }
  }, [completed]);

  const touch = () => {
    markStart();
    markComplete();
  };

  const html = useMemo(() => buildHtmlTable(table), [table]);
  const cols = table.headers.length;
  const rows = table.rows.length;

  const updateSize = (nextCols: number, nextRows: number) => {
    touch();
    setTable((prev) => resizeHtmlTable(prev, nextCols, nextRows));
  };

  const setHeader = (ci: number, value: string) => {
    touch();
    setTable((prev) => {
      const headers = [...prev.headers];
      headers[ci] = value;
      return { ...prev, headers };
    });
  };

  const setCell = (ri: number, ci: number, value: string) => {
    touch();
    setTable((prev) => {
      const rowsCopy = prev.rows.map((r) => [...r]);
      rowsCopy[ri]![ci] = value;
      return { ...prev, rows: rowsCopy };
    });
  };

  const setAlign = (ci: number, align: CellAlign) => {
    touch();
    setTable((prev) => {
      const alignments = [...(prev.alignments ?? [])];
      while (alignments.length < prev.headers.length) alignments.push("left");
      alignments[ci] = align;
      return { ...prev, alignments };
    });
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end gap-4">
        <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
          Columns
          <input
            type="number"
            min={1}
            max={20}
            value={cols}
            onChange={(e) => updateSize(Number(e.target.value), rows)}
            className="w-24 rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1.5 text-[var(--foreground)]"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
          Rows
          <input
            type="number"
            min={0}
            max={50}
            value={rows}
            onChange={(e) => updateSize(cols, Number(e.target.value))}
            className="w-24 rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1.5 text-[var(--foreground)]"
          />
        </label>
        <label className="flex min-w-[12rem] flex-1 flex-col gap-1 text-sm text-[var(--muted)]">
          Caption
          <input
            value={table.caption}
            onChange={(e) => {
              touch();
              setTable((prev) => ({ ...prev, caption: e.target.value }));
            }}
            className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1.5 text-[var(--foreground)]"
          />
        </label>
        <label className="flex min-w-[10rem] flex-col gap-1 text-sm text-[var(--muted)]">
          CSS class
          <input
            value={table.tableClass}
            onChange={(e) => {
              touch();
              setTable((prev) => ({ ...prev, tableClass: e.target.value }));
            }}
            className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1.5 font-[family-name:var(--font-mono)] text-[var(--foreground)]"
          />
        </label>
      </div>

      <div className="flex flex-wrap gap-4 text-sm text-[var(--muted)]">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={table.border}
            onChange={(e) => {
              touch();
              setTable((prev) => ({ ...prev, border: e.target.checked }));
            }}
          />
          Border
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={table.useSections}
            onChange={(e) => {
              touch();
              setTable((prev) => ({ ...prev, useSections: e.target.checked }));
            }}
          />
          thead / tbody
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={table.accessible}
            onChange={(e) => {
              touch();
              setTable((prev) => ({ ...prev, accessible: e.target.checked }));
            }}
          />
          scope=&quot;col&quot;
        </label>
        <button
          type="button"
          onClick={() => setPasteOpen((v) => !v)}
          className="rounded-md border border-[var(--border)] px-2.5 py-1 text-[var(--muted)] hover:border-[var(--accent)]/50 hover:text-[var(--foreground)]"
        >
          {pasteOpen ? "Hide paste" : "Paste TSV"}
        </button>
      </div>

      {pasteOpen ? (
        <div className="space-y-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3">
          <p className="text-sm text-[var(--muted)]">
            First row = headers. Tab-separated by default.
          </p>
          <textarea
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            rows={4}
            className="w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-2 py-1.5 font-[family-name:var(--font-mono)] text-sm text-[var(--foreground)]"
          />
          <button
            type="button"
            onClick={() => {
              touch();
              const parsed = parseDelimitedToHtmlTable(pasteText, "\t");
              setTable((prev) => ({
                ...prev,
                headers: parsed.headers,
                rows: parsed.rows,
                alignments: parsed.headers.map(
                  (_, i) => prev.alignments?.[i] ?? "left",
                ),
              }));
            }}
            className="rounded-md bg-[var(--accent)] px-3 py-1.5 text-sm font-medium text-[var(--ink)]"
          >
            Import TSV
          </button>
        </div>
      ) : null}

      <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
        <table className="w-full min-w-[320px] text-sm">
          <thead>
            <tr className="bg-[var(--surface)]">
              {table.headers.map((h, ci) => (
                <th key={`h-${ci}`} className="border-b border-[var(--border)] p-2">
                  <input
                    value={h}
                    onChange={(e) => setHeader(ci, e.target.value)}
                    className="mb-1 w-full rounded border border-[var(--border)] bg-[var(--background)] px-1.5 py-1 font-medium text-[var(--foreground)]"
                    aria-label={`Header ${ci + 1}`}
                  />
                  <select
                    value={table.alignments?.[ci] ?? "left"}
                    onChange={(e) =>
                      setAlign(ci, e.target.value as CellAlign)
                    }
                    className="w-full rounded border border-[var(--border)] bg-[var(--background)] px-1 py-0.5 text-xs text-[var(--muted)]"
                  >
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                  </select>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row, ri) => (
              <tr key={`r-${ri}`}>
                {row.map((cell, ci) => (
                  <td
                    key={`c-${ri}-${ci}`}
                    className="border-t border-[var(--border)] p-2"
                  >
                    <input
                      value={cell}
                      onChange={(e) => setCell(ri, ci, e.target.value)}
                      className="w-full rounded border border-[var(--border)] bg-[var(--background)] px-1.5 py-1 text-[var(--foreground)]"
                      aria-label={`Row ${ri + 1} column ${ci + 1}`}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <EditorPaneHeader label="HTML" getText={() => html} />
          <CodeEditor
            language="text"
            value={html}
            editable={false}
            minHeight="32vh"
          />
        </div>
        <div>
          <p className="mb-2 text-sm font-medium text-[var(--foreground)]">
            Preview
          </p>
          <div
            className="min-h-[32vh] overflow-auto rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 text-[var(--foreground)]"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      </div>
    </div>
  );
}
