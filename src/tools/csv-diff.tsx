"use client";

import { useCallback, useMemo, useState } from "react";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { EditorPaneHeader } from "@/components/editor/EditorPaneHeader";
import { ToolErrorState } from "@/components/tool/ToolShell";
import {
  diffCsv,
  SAMPLE_CSV_LEFT,
  SAMPLE_CSV_RIGHT,
} from "@/lib/format/csv-diff";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/cn";

export function CsvDiffTool() {
  const [left, setLeft] = useState(SAMPLE_CSV_LEFT);
  const [right, setRight] = useState(SAMPLE_CSV_RIGHT);
  const [keyColumn, setKeyColumn] = useState("id");
  const [started, setStarted] = useState(false);

  const result = useMemo(
    () => diffCsv(left, right, { keyColumn: keyColumn || undefined }),
    [left, right, keyColumn],
  );

  const markStart = useCallback(() => {
    if (!started) {
      setStarted(true);
      track({ name: "tool_start", tool: "csv-diff", family: "tools" });
    }
  }, [started]);

  return (
    <div className="space-y-4">
      <label className="flex items-center gap-2 text-sm text-[var(--muted)]">
        Key column
        <input value={keyColumn} onChange={(e) => { markStart(); setKeyColumn(e.target.value); }}
          className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1.5 font-[family-name:var(--font-mono)] text-sm" />
      </label>
      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <EditorPaneHeader label="CSV A" getText={() => left} />
          <CodeEditor language="text" value={left} onChange={(v) => { markStart(); setLeft(v); }} minHeight="40vh" />
        </div>
        <div>
          <EditorPaneHeader label="CSV B" getText={() => right} />
          <CodeEditor language="text" value={right} onChange={(v) => { markStart(); setRight(v); }} minHeight="40vh" />
        </div>
      </div>
      {!result.ok ? <ToolErrorState message={result.error} /> : (
        <>
          <p className="text-sm text-[var(--muted)]">
            {result.stats.equal} equal · {result.stats.changed} changed · {result.stats.added} added · {result.stats.removed} removed
          </p>
          <div className="overflow-hidden rounded-xl border border-[var(--border)]">
            <table className="w-full text-sm">
              <thead className="bg-[var(--surface)] text-left text-[var(--muted)]">
                <tr>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Key</th>
                  <th className="px-3 py-2">Details</th>
                </tr>
              </thead>
              <tbody>
                {result.rows.map((row) => (
                  <tr key={row.key} className="border-t border-[var(--border)]">
                    <td className={cn("px-3 py-2 font-medium", row.status === "added" && "text-green-600", row.status === "removed" && "text-red-600", row.status === "changed" && "text-amber-600")}>{row.status}</td>
                    <td className="px-3 py-2 font-[family-name:var(--font-mono)]">{row.key}</td>
                    <td className="px-3 py-2 text-[var(--muted)]">
                      {row.status === "changed" ? row.changedColumns?.join(", ") : row.status === "added" ? JSON.stringify(row.right) : row.status === "removed" ? JSON.stringify(row.left) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
