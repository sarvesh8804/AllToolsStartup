"use client";

import { useCallback, useMemo, useState } from "react";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { EditorPaneHeader } from "@/components/editor/EditorPaneHeader";
import { ToolErrorState } from "@/components/tool/ToolShell";
import { cleanCsv, SAMPLE_CSV_DIRTY } from "@/lib/format/csv-cleaner";
import { track } from "@/lib/analytics";

export function CsvCleanerTool() {
  const [input, setInput] = useState(SAMPLE_CSV_DIRTY);
  const [dedupeRows, setDedupeRows] = useState(true);
  const [removeEmptyRows, setRemoveEmptyRows] = useState(true);
  const [trimFields, setTrimFields] = useState(true);
  const [dedupeKey, setDedupeKey] = useState("");
  const [started, setStarted] = useState(false);

  const result = useMemo(
    () => cleanCsv(input, { dedupeRows, removeEmptyRows, trimFields, dedupeKey: dedupeKey || undefined }),
    [input, dedupeRows, removeEmptyRows, trimFields, dedupeKey],
  );

  const markStart = useCallback(() => {
    if (!started) {
      setStarted(true);
      track({ name: "tool_start", tool: "csv-cleaner", family: "tools" });
    }
  }, [started]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4">
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={trimFields} onChange={(e) => { markStart(); setTrimFields(e.target.checked); }} />Trim fields</label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={removeEmptyRows} onChange={(e) => { markStart(); setRemoveEmptyRows(e.target.checked); }} />Remove empty rows</label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={dedupeRows} onChange={(e) => { markStart(); setDedupeRows(e.target.checked); }} />Dedupe rows</label>
        <label className="flex items-center gap-2 text-sm text-[var(--muted)]">
          Dedupe key
          <input value={dedupeKey} onChange={(e) => { markStart(); setDedupeKey(e.target.value); }} placeholder="optional column"
            className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1 text-sm" />
        </label>
      </div>
      {!result.ok ? <ToolErrorState message={result.error} /> : (
        <p className="text-sm text-[var(--muted)]">{result.inputRows} → {result.outputRows} rows ({result.removedRows} removed)</p>
      )}
      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <EditorPaneHeader label="Input CSV" getText={() => input} />
          <CodeEditor language="text" value={input} onChange={(v) => { markStart(); setInput(v); }} minHeight="55vh" />
        </div>
        <div>
          <EditorPaneHeader label="Cleaned CSV" getText={() => (result.ok ? result.csv : "")} />
          <CodeEditor language="text" value={result.ok ? result.csv : ""} editable={false} minHeight="55vh" />
        </div>
      </div>
    </div>
  );
}
