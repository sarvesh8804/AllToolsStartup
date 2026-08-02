"use client";

import { useCallback, useMemo, useState } from "react";
import { CopyButton } from "@/components/editor/CopyButton";
import { ToolErrorState } from "@/components/tool/ToolShell";
import {
  findDayOfWeek,
  todayInputValue,
} from "@/lib/time/day-of-week";
import { track } from "@/lib/analytics";

export function DayOfWeekFinderTool() {
  const [date, setDate] = useState(() => todayInputValue());
  const [started, setStarted] = useState(false);

  const result = useMemo(() => findDayOfWeek(date), [date]);

  const markStart = useCallback(() => {
    if (!started) {
      setStarted(true);
      track({
        name: "tool_start",
        tool: "day-of-week-finder",
        family: "tools",
      });
    }
  }, [started]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end gap-3">
        <label className="flex min-w-[12rem] flex-1 flex-col gap-1 text-sm text-[var(--muted)]">
          Date
          <div className="flex gap-2">
            <input
              type="date"
              value={date}
              onChange={(e) => {
                markStart();
                setDate(e.target.value);
              }}
              className="min-w-0 flex-1 rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 font-[family-name:var(--font-mono)] text-[var(--foreground)]"
            />
            <button
              type="button"
              onClick={() => {
                markStart();
                setDate(todayInputValue());
              }}
              className="rounded-md border border-[var(--border)] px-3 py-2 text-sm hover:border-[var(--accent)]/50"
            >
              Today
            </button>
          </div>
        </label>
      </div>

      {!result.ok ? (
        <ToolErrorState message={result.error} />
      ) : (
        <>
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-6 py-8 text-center">
            <p className="text-sm uppercase tracking-[0.14em] text-[var(--muted)]">
              {result.value.formatted}
            </p>
            <p className="mt-2 font-[family-name:var(--font-display)] text-4xl text-[var(--foreground)]">
              {result.value.name}
            </p>
            <p className="mt-1 text-sm text-[var(--muted)]">
              {result.value.shortName} · ISO weekday {result.value.isoWeekday}
            </p>
          </div>

          <dl className="divide-y divide-[var(--border)] overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]">
            {(
              [
                ["Day of year", String(result.value.dayOfYear)],
                ["Leap year", result.value.isLeapYear ? "Yes" : "No"],
                ["JavaScript getDay()", String(result.value.weekday)],
                ["ISO weekday", String(result.value.isoWeekday)],
              ] as const
            ).map(([label, value]) => (
              <div
                key={label}
                className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <dt className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
                  {label}
                </dt>
                <dd className="flex items-center gap-2">
                  <span className="font-[family-name:var(--font-mono)] text-sm text-[var(--foreground)]">
                    {value}
                  </span>
                  <CopyButton
                    getText={() => value}
                    label="Copy"
                    className="!py-1 !text-xs"
                  />
                </dd>
              </div>
            ))}
          </dl>
        </>
      )}
    </div>
  );
}
