"use client";

import { useCallback, useMemo, useState } from "react";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { EditorPaneHeader } from "@/components/editor/EditorPaneHeader";
import { ToolErrorState } from "@/components/tool/ToolShell";
import {
  csvToSqlInsert,
  type SqlDialect,
} from "@/lib/format/csv-to-sql";
import { track } from "@/lib/analytics";

const SAMPLE = `name,age,email,active
Ada Lovelace,36,ada@example.com,true
Grace Hopper,40,grace@example.com,true
"O'Brien",29,,false
`;

export function CsvToSqlInsertTool() {
  const [input, setInput] = useState(SAMPLE);
  const [tableName, setTableName] = useState("people");
  const [delimiter, setDelimiter] = useState(",");
  const [dialect, setDialect] = useState<SqlDialect>("postgres");
  const [batchSize, setBatchSize] = useState(1);
  const [headers, setHeaders] = useState(true);
  const [inferTypes, setInferTypes] = useState(true);
  const [emptyAsNull, setEmptyAsNull] = useState(true);
  const [started, setStarted] = useState(false);

  const markStart = useCallback(() => {
    if (!started) {
      setStarted(true);
      track({
        name: "tool_start",
        tool: "csv-to-sql-insert",
        family: "tools",
      });
    }
  }, [started]);

  const result = useMemo(
    () =>
      csvToSqlInsert(input, {
        tableName,
        delimiter,
        dialect,
        batchSize,
        headers,
        inferTypes,
        emptyAsNull,
      }),
    [
      input,
      tableName,
      delimiter,
      dialect,
      batchSize,
      headers,
      inferTypes,
      emptyAsNull,
    ],
  );

  const onChange = useCallback(
    (v: string) => {
      markStart();
      setInput(v);
      track({
        name: "tool_complete",
        tool: "csv-to-sql-insert",
        family: "tools",
      });
    },
    [markStart],
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
          Table name
          <input
            value={tableName}
            onChange={(e) => {
              markStart();
              setTableName(e.target.value);
            }}
            className="w-40 rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1.5 font-[family-name:var(--font-mono)] text-[var(--foreground)]"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
          Dialect
          <select
            value={dialect}
            onChange={(e) => {
              markStart();
              setDialect(e.target.value as SqlDialect);
            }}
            className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1.5 text-[var(--foreground)]"
          >
            <option value="postgres">PostgreSQL / SQLite quotes</option>
            <option value="mysql">MySQL backticks</option>
            <option value="mssql">SQL Server brackets</option>
            <option value="sqlite">SQLite (double quotes)</option>
            <option value="none">Unquoted (sanitized)</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
          Delimiter
          <select
            value={delimiter}
            onChange={(e) => {
              markStart();
              setDelimiter(e.target.value);
            }}
            className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1.5 text-[var(--foreground)]"
          >
            <option value=",">Comma</option>
            <option value=";">Semicolon</option>
            <option value={"\t"}>Tab</option>
            <option value="|">Pipe</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
          Rows per INSERT
          <input
            type="number"
            min={1}
            max={500}
            value={batchSize}
            onChange={(e) => {
              markStart();
              setBatchSize(Number(e.target.value));
            }}
            className="w-24 rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1.5 text-[var(--foreground)]"
          />
        </label>
      </div>

      <div className="flex flex-wrap gap-4">
        <label className="flex items-center gap-2 text-sm text-[var(--foreground)]">
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
        <label className="flex items-center gap-2 text-sm text-[var(--foreground)]">
          <input
            type="checkbox"
            checked={inferTypes}
            onChange={(e) => {
              markStart();
              setInferTypes(e.target.checked);
            }}
          />
          Infer numbers / booleans / null
        </label>
        <label className="flex items-center gap-2 text-sm text-[var(--foreground)]">
          <input
            type="checkbox"
            checked={emptyAsNull}
            onChange={(e) => {
              markStart();
              setEmptyAsNull(e.target.checked);
            }}
          />
          Empty cells → NULL
        </label>
      </div>

      {!result.ok ? <ToolErrorState message={result.error} /> : null}
      {result.ok ? (
        <p className="text-sm text-[var(--muted)]">
          {result.rowCount} rows · {result.columnCount} columns ·{" "}
          {result.statementCount} statement
          {result.statementCount === 1 ? "" : "s"}
        </p>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <EditorPaneHeader label="CSV" getText={() => input} />
          <CodeEditor
            language="text"
            value={input}
            onChange={onChange}
            minHeight="55vh"
          />
        </div>
        <div>
          <EditorPaneHeader
            label="SQL"
            getText={() => (result.ok ? result.sql : "")}
          />
          <CodeEditor
            language="text"
            value={result.ok ? result.sql : ""}
            editable={false}
            minHeight="55vh"
          />
        </div>
      </div>
    </div>
  );
}
