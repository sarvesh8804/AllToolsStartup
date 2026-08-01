"use client";

import { useCallback, useMemo, useState } from "react";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { EditorPaneHeader } from "@/components/editor/EditorPaneHeader";
import { ToolErrorState } from "@/components/tool/ToolShell";
import {
  DEFAULT_JOIN_INPUT,
  SAMPLE_JOIN_TABLES,
  visualizeJoin,
  type JoinType,
  type JoinVisualizerInput,
  type JoinVisualizerResult,
} from "@/lib/sql/join-visualizer";
import { track } from "@/lib/analytics";

function isJoinError(
  result: JoinVisualizerResult | { ok: false; error: string },
): result is { ok: false; error: string } {
  return "ok" in result && result.ok === false;
}

function TablePreview({ table }: { table: (typeof SAMPLE_JOIN_TABLES)[number] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
      <p className="border-b border-[var(--border)] bg-[var(--surface)] px-3 py-2 font-[family-name:var(--font-mono)] text-sm font-medium text-[var(--foreground)]">
        {table.name}
      </p>
      <table className="w-full min-w-[16rem] text-left text-sm">
        <thead className="border-b border-[var(--border)] text-xs uppercase text-[var(--muted)]">
          <tr>
            {table.columns.map((col) => (
              <th key={col} className="px-3 py-2">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row, i) => (
            <tr key={i} className="border-b border-[var(--border)] last:border-0">
              {table.columns.map((col) => (
                <td key={col} className="px-3 py-2 font-[family-name:var(--font-mono)]">
                  {row[col] === null ? "NULL" : String(row[col])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function SqlJoinVisualizerTool() {
  const [form, setForm] = useState<JoinVisualizerInput>(DEFAULT_JOIN_INPUT);
  const [started, setStarted] = useState(false);

  const leftTable = SAMPLE_JOIN_TABLES.find((t) => t.name === form.leftTable);
  const rightTable = SAMPLE_JOIN_TABLES.find((t) => t.name === form.rightTable);

  const result = useMemo(
    () => visualizeJoin(SAMPLE_JOIN_TABLES, form),
    [form],
  );

  const markStart = useCallback(() => {
    if (!started) {
      setStarted(true);
      track({
        name: "tool_start",
        tool: "sql-join-visualizer",
        family: "tools",
      });
    }
  }, [started]);

  const patch = <K extends keyof JoinVisualizerInput>(
    key: K,
    value: JoinVisualizerInput[K],
  ) => {
    markStart();
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "leftTable" && leftTable && !leftTable.columns.includes(next.leftKey)) {
        next.leftKey = SAMPLE_JOIN_TABLES.find((t) => t.name === next.leftTable)?.columns[0] ?? next.leftKey;
      }
      if (key === "rightTable" && rightTable && !rightTable.columns.includes(next.rightKey)) {
        next.rightKey = SAMPLE_JOIN_TABLES.find((t) => t.name === next.rightTable)?.columns[0] ?? next.rightKey;
      }
      return next;
    });
    track({
      name: "tool_complete",
      tool: "sql-join-visualizer",
      family: "tools",
    });
  };

  const ok = !isJoinError(result);
  const data = ok ? result : null;

  return (
    <div className="space-y-5">
      <div className="grid gap-4 lg:grid-cols-2">
        {SAMPLE_JOIN_TABLES.filter((t) =>
          ["users", "orders"].includes(t.name),
        ).map((table) => (
          <TablePreview key={table.name} table={table} />
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
          Left table
          <select
            value={form.leftTable}
            onChange={(e) => patch("leftTable", e.target.value)}
            className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[var(--foreground)]"
          >
            {SAMPLE_JOIN_TABLES.map((t) => (
              <option key={t.name} value={t.name}>
                {t.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
          Left key
          <select
            value={form.leftKey}
            onChange={(e) => patch("leftKey", e.target.value)}
            className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 font-[family-name:var(--font-mono)] text-sm"
          >
            {(leftTable?.columns ?? []).map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
          Join type
          <select
            value={form.joinType}
            onChange={(e) => patch("joinType", e.target.value as JoinType)}
            className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[var(--foreground)]"
          >
            <option value="INNER">INNER JOIN</option>
            <option value="LEFT">LEFT JOIN</option>
            <option value="RIGHT">RIGHT JOIN</option>
            <option value="FULL">FULL OUTER JOIN</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
          Right table
          <select
            value={form.rightTable}
            onChange={(e) => patch("rightTable", e.target.value)}
            className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[var(--foreground)]"
          >
            {SAMPLE_JOIN_TABLES.map((t) => (
              <option key={t.name} value={t.name}>
                {t.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
          Right key
          <select
            value={form.rightKey}
            onChange={(e) => patch("rightKey", e.target.value)}
            className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 font-[family-name:var(--font-mono)] text-sm"
          >
            {(rightTable?.columns ?? []).map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div>
        <EditorPaneHeader
          label="Generated SQL"
          getText={() => data?.sql ?? ""}
        />
        {!ok && isJoinError(result) ? (
          <ToolErrorState message={result.error} />
        ) : data ? (
          <CodeEditor value={data.sql} editable={false} minHeight="8rem" />
        ) : null}
      </div>

      {data ? (
        <div>
          <p className="mb-2 text-sm text-[var(--muted)]">
            Result preview — {data.rowCount} rows
          </p>
          <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
            <table className="w-full min-w-[32rem] text-left text-sm">
              <thead className="border-b border-[var(--border)] bg-[var(--surface)] text-xs uppercase text-[var(--muted)]">
                <tr>
                  {data.columns.map((col) => (
                    <th key={col} className="px-3 py-2">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.rows.map((row, i) => (
                  <tr
                    key={i}
                    className="border-b border-[var(--border)] last:border-0"
                  >
                    {data.columns.map((col) => (
                      <td
                        key={col}
                        className="px-3 py-2 font-[family-name:var(--font-mono)] text-[var(--foreground)]"
                      >
                        {row[col] === null ? (
                          <span className="text-[var(--muted)]">NULL</span>
                        ) : (
                          String(row[col])
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </div>
  );
}
