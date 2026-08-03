"use client";

import { useCallback, useMemo, useState } from "react";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { EditorPaneHeader } from "@/components/editor/EditorPaneHeader";
import { ToolErrorState } from "@/components/tool/ToolShell";
import { csvToSqlInsertBulk, DEFAULT_BULK_BATCH_SIZE } from "@/lib/format/csv-to-sql-bulk";
import { type SqlDialect } from "@/lib/format/csv-to-sql";
import { track } from "@/lib/analytics";

const SAMPLE = `id,name,email\n${Array.from({ length: 12 }, (_, i) => `${i + 1},User ${i + 1},user${i + 1}@example.com`).join("\n")}\n`;

export function CsvToSqlInsertBulkTool() {
  const [input, setInput] = useState(SAMPLE);
  const [tableName, setTableName] = useState("users");
  const [dialect, setDialect] = useState<SqlDialect>("postgres");
  const [batchSize, setBatchSize] = useState(DEFAULT_BULK_BATCH_SIZE);
  const [wrapTransaction, setWrapTransaction] = useState(true);
  const [truncateFirst, setTruncateFirst] = useState(false);
  const [started, setStarted] = useState(false);

  const markStart = useCallback(() => {
    if (!started) {
      setStarted(true);
      track({ name: "tool_start", tool: "csv-to-sql-insert-bulk", family: "tools" });
    }
  }, [started]);

  const result = useMemo(
    () => csvToSqlInsertBulk(input, { tableName, dialect, batchSize, wrapTransaction, truncateFirst }),
    [input, tableName, dialect, batchSize, wrapTransaction, truncateFirst],
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
          Table
          <input value={tableName} onChange={(e) => { markStart(); setTableName(e.target.value); }}
            className="w-40 rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1.5 font-[family-name:var(--font-mono)] text-[var(--foreground)]" />
        </label>
        <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
          Dialect
          <select value={dialect} onChange={(e) => { markStart(); setDialect(e.target.value as SqlDialect); }}
            className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1.5 text-[var(--foreground)]">
            <option value="postgres">PostgreSQL</option>
            <option value="mysql">MySQL</option>
            <option value="sqlite">SQLite</option>
            <option value="mssql">SQL Server</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
          Rows per INSERT
          <input type="number" min={1} max={500} value={batchSize} onChange={(e) => { markStart(); setBatchSize(Number(e.target.value)); }}
            className="w-24 rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1.5 text-[var(--foreground)]" />
        </label>
      </div>
      <div className="flex flex-wrap gap-4">
        <label className="flex items-center gap-2 text-sm text-[var(--foreground)]">
          <input type="checkbox" checked={wrapTransaction} onChange={(e) => { markStart(); setWrapTransaction(e.target.checked); }} />
          Wrap in BEGIN/COMMIT
        </label>
        <label className="flex items-center gap-2 text-sm text-[var(--foreground)]">
          <input type="checkbox" checked={truncateFirst} onChange={(e) => { markStart(); setTruncateFirst(e.target.checked); }} />
          TRUNCATE before insert
        </label>
      </div>
      {!result.ok ? <ToolErrorState message={result.error} /> : (
        <p className="text-sm text-[var(--muted)]">{result.rowCount} rows · {result.statementCount} statement{result.statementCount === 1 ? "" : "s"}</p>
      )}
      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <EditorPaneHeader label="CSV" getText={() => input} />
          <CodeEditor language="text" value={input} onChange={(v) => { markStart(); setInput(v); }} minHeight="55vh" />
        </div>
        <div>
          <EditorPaneHeader label="Bulk SQL" getText={() => (result.ok ? result.sql : "")} />
          <CodeEditor language="text" value={result.ok ? result.sql : ""} editable={false} minHeight="55vh" />
        </div>
      </div>
    </div>
  );
}
