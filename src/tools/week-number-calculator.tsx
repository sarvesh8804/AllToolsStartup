"use client";

import { useCallback, useMemo, useState } from "react";
import { ToolErrorState } from "@/components/tool/ToolShell";
import {
  calculateWeekNumber,
  formatDateParts,
  lookupWeek,
  todayInputValue,
  type WeekSystem,
} from "@/lib/time/week-number";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/cn";

export function WeekNumberCalculatorTool() {
  const [date, setDate] = useState(() => todayInputValue());
  const [system, setSystem] = useState<WeekSystem>("iso");
  const [lookupYear, setLookupYear] = useState("2024");
  const [lookupWeekNum, setLookupWeekNum] = useState("1");
  const [started, setStarted] = useState(false);

  const markStart = useCallback(() => {
    if (!started) {
      setStarted(true);
      track({
        name: "tool_start",
        tool: "week-number-calculator",
        family: "tools",
      });
    }
  }, [started]);

  const result = useMemo(
    () => calculateWeekNumber(date, system),
    [date, system],
  );

  const lookup = useMemo(
    () => lookupWeek(lookupYear, lookupWeekNum, system),
    [lookupYear, lookupWeekNum, system],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {(
          [
            ["iso", "ISO 8601 (Mon)"],
            ["us", "US (Sun)"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => {
              markStart();
              setSystem(value);
              track({
                name: "tool_complete",
                tool: "week-number-calculator",
                family: "tools",
              });
            }}
            className={cn(
              "rounded-md border px-3 py-1.5 text-sm",
              system === value
                ? "border-[var(--accent)] bg-[var(--accent)]/15 text-[var(--foreground)]"
                : "border-[var(--border)] text-[var(--muted)] hover:border-[var(--accent)]/50",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
        <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
          Date
          <div className="flex gap-2">
            <input
              type="date"
              value={date}
              onChange={(e) => {
                markStart();
                setDate(e.target.value);
                track({
                  name: "tool_complete",
                  tool: "week-number-calculator",
                  family: "tools",
                });
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
        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {(
            [
              ["Week", String(result.value.week)],
              ["Week year", String(result.value.weekYear)],
              ["Weekday", result.value.weekdayName],
              ["Label", result.value.isoLabel],
              [
                "Range",
                `${formatDateParts(result.value.weekStart)} → ${formatDateParts(result.value.weekEnd)}`,
              ],
            ] as const
          ).map(([label, value]) => (
            <div
              key={label}
              className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3"
            >
              <dt className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
                {label}
              </dt>
              <dd className="mt-1 font-[family-name:var(--font-mono)] text-lg text-[var(--foreground)] sm:text-xl">
                {value}
              </dd>
            </div>
          ))}
        </dl>
      )}

      <div className="space-y-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
        <p className="text-sm font-medium text-[var(--foreground)]">
          Look up week → dates
        </p>
        <div className="flex flex-wrap gap-3">
          <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
            Week year
            <input
              type="number"
              value={lookupYear}
              onChange={(e) => {
                markStart();
                setLookupYear(e.target.value);
              }}
              className="w-28 rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 font-[family-name:var(--font-mono)] text-[var(--foreground)]"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
            Week
            <input
              type="number"
              min={1}
              max={53}
              value={lookupWeekNum}
              onChange={(e) => {
                markStart();
                setLookupWeekNum(e.target.value);
              }}
              className="w-24 rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 font-[family-name:var(--font-mono)] text-[var(--foreground)]"
            />
          </label>
        </div>
        {!lookup.ok ? (
          <ToolErrorState message={lookup.error} />
        ) : (
          <p className="font-[family-name:var(--font-mono)] text-sm text-[var(--foreground)]">
            {formatDateParts(lookup.weekStart)} →{" "}
            {formatDateParts(lookup.weekEnd)}
          </p>
        )}
      </div>
    </div>
  );
}
