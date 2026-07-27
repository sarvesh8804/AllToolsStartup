"use client";

import { useCallback, useMemo, useState } from "react";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { DownloadButton } from "@/components/editor/DownloadButton";
import { EditorPaneHeader } from "@/components/editor/EditorPaneHeader";
import { ToolErrorState } from "@/components/tool/ToolShell";
import { csvToExcel } from "@/lib/format/excel";
import { track } from "@/lib/analytics";

const SAMPLE = `name,category,shipped
JSON Formatter,JSON & Data Formats,true
CSV to JSON,CSV & Spreadsheets,true
"Word Counter","Text Tools",true
`;

export function CsvToExcelClientSideTool() {
  const [input, setInput] = useState(SAMPLE);
  const [delimiter, setDelimiter] = useState(",");
  const [sheetName, setSheetName] = useState("Sheet1");
  const [started, setStarted] = useState(false);

  const result = useMemo(
    () => csvToExcel(input, { delimiter, sheetName }),
    [input, delimiter, sheetName],
  );

  const onChange = useCallback(
    (v: string) => {
      if (!started) {
        setStarted(true);
        track({
          name: "tool_start",
          tool: "csv-to-excel-client-side",
          family: "tools",
        });
      }
      setInput(v);
    },
    [started],
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm text-[var(--muted)]">
          Delimiter
          <select
            value={delimiter}
            onChange={(e) => setDelimiter(e.target.value)}
            className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1 text-[var(--foreground)]"
          >
            <option value=",">Comma</option>
            <option value=";">Semicolon</option>
            <option value={"\t"}>Tab</option>
            <option value="|">Pipe</option>
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm text-[var(--muted)]">
          Sheet name
          <input
            type="text"
            value={sheetName}
            maxLength={31}
            onChange={(e) => setSheetName(e.target.value)}
            className="w-36 rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1 text-[var(--foreground)]"
          />
        </label>
        {result.ok ? (
          <>
            <p className="text-sm text-[var(--muted)]">
              {result.rowCount} rows · {result.columnCount} columns ·{" "}
              {result.bytes.byteLength.toLocaleString()} bytes
            </p>
            <DownloadButton
              filename="forge-export.xlsx"
              label="Download .xlsx"
              getBlob={() =>
                new Blob([new Uint8Array(result.bytes)], {
                  type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                })
              }
            />
          </>
        ) : null}
      </div>

      {!result.ok ? <ToolErrorState message={result.error} /> : null}

      <div>
        <EditorPaneHeader label="CSV" getText={() => input} />
        <CodeEditor
          language="text"
          value={input}
          onChange={onChange}
          minHeight="50vh"
        />
      </div>

      <p className="text-xs text-[var(--muted)]">
        Builds a real .xlsx workbook in your browser (SheetJS). Nothing is
        uploaded.
      </p>
    </div>
  );
}
