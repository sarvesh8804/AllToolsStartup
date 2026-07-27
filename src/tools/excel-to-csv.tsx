"use client";

import { useCallback, useState } from "react";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { EditorPaneHeader } from "@/components/editor/EditorPaneHeader";
import { ToolErrorState } from "@/components/tool/ToolShell";
import { excelToCsv, listExcelSheets } from "@/lib/format/excel";
import { track } from "@/lib/analytics";

export function ExcelToCsvTool() {
  const [sheetNames, setSheetNames] = useState<string[]>([]);
  const [sheetName, setSheetName] = useState("");
  const [fileBytes, setFileBytes] = useState<Uint8Array | null>(null);
  const [fileLabel, setFileLabel] = useState("");
  const [csv, setCsv] = useState("");
  const [rowCount, setRowCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [started, setStarted] = useState(false);

  const markStart = useCallback(() => {
    if (!started) {
      setStarted(true);
      track({
        name: "tool_start",
        tool: "excel-to-csv",
        family: "tools",
      });
    }
  }, [started]);

  const convert = useCallback(
    (bytes: Uint8Array, preferredSheet?: string) => {
      const result = excelToCsv(bytes, {
        sheetName: preferredSheet || undefined,
      });
      if (!result.ok) {
        setError(result.error);
        setCsv("");
        setRowCount(0);
        return;
      }
      setError(null);
      setCsv(result.csv);
      setRowCount(result.rowCount);
      setSheetNames(result.sheetNames);
      setSheetName(result.sheetName);
      track({
        name: "tool_complete",
        tool: "excel-to-csv",
        family: "tools",
      });
    },
    [],
  );

  const onFile = async (file: File | null) => {
    if (!file) return;
    markStart();
    try {
      const buffer = await file.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      setFileBytes(bytes);
      setFileLabel(file.name);

      const listed = listExcelSheets(bytes);
      if (!listed.ok) {
        setError(listed.error);
        setSheetNames([]);
        setCsv("");
        return;
      }
      setSheetNames(listed.sheetNames);
      convert(bytes, listed.sheetNames[0]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to read file");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)] hover:border-[var(--accent)]/50">
          Choose .xlsx / .xls
          <input
            type="file"
            accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
            className="hidden"
            onChange={(e) => void onFile(e.target.files?.[0] ?? null)}
          />
        </label>
        {fileLabel ? (
          <p className="text-sm text-[var(--muted)]">{fileLabel}</p>
        ) : null}
        {sheetNames.length > 0 ? (
          <label className="flex items-center gap-2 text-sm text-[var(--muted)]">
            Sheet
            <select
              value={sheetName}
              onChange={(e) => {
                markStart();
                const next = e.target.value;
                setSheetName(next);
                if (fileBytes) convert(fileBytes, next);
              }}
              className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1 text-[var(--foreground)]"
            >
              {sheetNames.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        {csv ? (
          <p className="text-sm text-[var(--muted)]">{rowCount} rows</p>
        ) : null}
      </div>

      {error ? <ToolErrorState message={error} /> : null}

      {csv ? (
        <div>
          <EditorPaneHeader label="CSV" getText={() => csv} />
          <CodeEditor
            language="text"
            value={csv}
            editable={false}
            minHeight="50vh"
          />
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-[var(--border)] px-6 py-16 text-center text-sm text-[var(--muted)]">
          Drop or choose an Excel workbook to convert the selected sheet to CSV.
          Processing stays in your browser.
        </div>
      )}
    </div>
  );
}
