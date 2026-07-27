"use client";

import { useCallback, useMemo, useState } from "react";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { EditorPaneHeader } from "@/components/editor/EditorPaneHeader";
import {
  DEFAULT_MARKDOWN_TABLE,
  buildMarkdownTable,
  resizeTable,
  type CellAlign,
  type MarkdownTableOptions,
} from "@/lib/text/markdown-table";
import { track } from "@/lib/analytics";

export function MarkdownTableGeneratorTool() {
  const [table, setTable] = useState<MarkdownTableOptions>(
    DEFAULT_MARKDOWN_TABLE,
  );
  const [started, setStarted] = useState(false);

  const markStart = useCallback(() => {
    if (!started) {
      setStarted(true);
      track({
        name: "tool_start",
        tool: "markdown-table-generator",
        family: "tools",
      });
    }
  }, [started]);

  const markdown = useMemo(() => buildMarkdownTable(table), [table]);

  const cols = table.headers.length;
  const rows = table.rows.length;

  const updateSize = (nextCols: number, nextRows: number) => {
    markStart();
    setTable((prev) => resizeTable(prev, nextCols, nextRows));
    track({
      name: "tool_complete",
      tool: "markdown-table-generator",
      family: "tools",
    });
  };

  const setHeader = (ci: number, value: string) => {
    markStart();
    setTable((prev) => {
      const headers = [...prev.headers];
      headers[ci] = value;
      return { ...prev, headers };
    });
  };

  const setCell = (ri: number, ci: number, value: string) => {
    markStart();
    setTable((prev) => {
      const rowsCopy = prev.rows.map((r) => [...r]);
      rowsCopy[ri]![ci] = value;
      return { ...prev, rows: rowsCopy };
    });
  };

  const setAlign = (ci: number, align: CellAlign) => {
    markStart();
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
            className="w-24 rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[var(--foreground)]"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
          Data rows
          <input
            type="number"
            min={0}
            max={50}
            value={rows}
            onChange={(e) => updateSize(cols, Number(e.target.value))}
            className="w-24 rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[var(--foreground)]"
          />
        </label>
        <label className="flex items-center gap-2 pb-2 text-sm text-[var(--foreground)]">
          <input
            type="checkbox"
            checked={table.pretty !== false}
            onChange={(e) => {
              markStart();
              setTable((prev) => ({ ...prev, pretty: e.target.checked }));
            }}
            className="accent-[var(--accent)]"
          />
          Pretty align columns
        </label>
      </div>

      <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-[var(--surface-2)]">
              {table.headers.map((h, ci) => (
                <th key={`h-${ci}`} className="p-2 align-top">
                  <input
                    value={h}
                    onChange={(e) => setHeader(ci, e.target.value)}
                    className="mb-2 w-full min-w-[7rem] rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1.5 font-medium text-[var(--foreground)]"
                    aria-label={`Header ${ci + 1}`}
                  />
                  <select
                    value={table.alignments?.[ci] ?? "left"}
                    onChange={(e) =>
                      setAlign(ci, e.target.value as CellAlign)
                    }
                    className="w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1 text-xs text-[var(--muted)]"
                    aria-label={`Align column ${ci + 1}`}
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
              <tr key={`r-${ri}`} className="border-t border-[var(--border)]">
                {row.map((cell, ci) => (
                  <td key={`c-${ri}-${ci}`} className="p-2">
                    <input
                      value={cell}
                      onChange={(e) => setCell(ri, ci, e.target.value)}
                      className="w-full min-w-[7rem] rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1.5 text-[var(--foreground)]"
                      aria-label={`Row ${ri + 1} column ${ci + 1}`}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div>
        <EditorPaneHeader label="Markdown" getText={() => markdown} />
        <CodeEditor
          language="markdown"
          value={markdown}
          editable={false}
          minHeight="28vh"
        />
      </div>
    </div>
  );
}
