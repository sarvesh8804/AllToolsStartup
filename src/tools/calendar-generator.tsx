"use client";

import { useCallback, useMemo, useState } from "react";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { EditorPaneHeader } from "@/components/editor/EditorPaneHeader";
import { ToolErrorState } from "@/components/tool/ToolShell";
import { buildMonthCalendar, DEFAULT_CALENDAR } from "@/lib/time/calendar";
import { downloadBlob } from "@/lib/image/canvas";
import { track } from "@/lib/analytics";

export function CalendarGeneratorTool() {
  const [year, setYear] = useState<number>(DEFAULT_CALENDAR.year);
  const [month, setMonth] = useState<number>(DEFAULT_CALENDAR.month);
  const [weekStartsOn, setWeekStartsOn] = useState<0 | 1>(1);
  const [title, setTitle] = useState("");
  const [started, setStarted] = useState(false);

  const result = useMemo(
    () => buildMonthCalendar({ year, month, weekStartsOn, title: title || undefined }),
    [year, month, weekStartsOn, title],
  );

  const markStart = useCallback(() => {
    if (!started) {
      setStarted(true);
      track({ name: "tool_start", tool: "calendar-generator", family: "tools" });
    }
  }, [started]);

  const downloadHtml = () => {
    if (!result.ok) return;
    markStart();
    downloadBlob(
      new Blob([result.html], { type: "text/html;charset=utf-8" }),
      `calendar-${result.year}-${String(result.month).padStart(2, "0")}.html`,
    );
    track({ name: "tool_complete", tool: "calendar-generator", family: "tools" });
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end gap-4">
        <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
          Year
          <input type="number" min={1} max={9999} value={year} onChange={(e) => { markStart(); setYear(Number(e.target.value)); }}
            className="w-28 rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1.5" />
        </label>
        <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
          Month
          <input type="number" min={1} max={12} value={month} onChange={(e) => { markStart(); setMonth(Number(e.target.value)); }}
            className="w-24 rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1.5" />
        </label>
        <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
          Week starts on
          <select value={weekStartsOn} onChange={(e) => { markStart(); setWeekStartsOn(Number(e.target.value) as 0 | 1); }}
            className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1.5 text-[var(--foreground)]">
            <option value={1}>Monday</option>
            <option value={0}>Sunday</option>
          </select>
        </label>
        <label className="flex min-w-[12rem] flex-1 flex-col gap-1 text-sm text-[var(--muted)]">
          Title (optional)
          <input value={title} onChange={(e) => { markStart(); setTitle(e.target.value); }}
            className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2" />
        </label>
        <button type="button" onClick={downloadHtml}
          className="rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-medium text-[var(--ink)]">Download HTML</button>
      </div>
      {!result.ok ? <ToolErrorState message={result.error} /> : (
        <>
          <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-white p-4 text-[#111827]">
            <iframe title="Calendar preview" srcDoc={result.html} className="h-[520px] w-full bg-white" />
          </div>
          <EditorPaneHeader label="HTML" getText={() => result.html} />
          <CodeEditor value={result.html} language="text" editable={false} minHeight="220px" />
        </>
      )}
    </div>
  );
}
