"use client";

import { useCallback, useMemo, useState } from "react";
import { ToolErrorState } from "@/components/tool/ToolShell";
import { calculateDateDifference } from "@/lib/time/date-diff";
import { formatDateParts, todayInputValue } from "@/lib/time/age";
import { track } from "@/lib/analytics";

function formatInt(n: number): string {
  return new Intl.NumberFormat(undefined).format(n);
}

export function DateDifferenceCalculatorTool() {
  const [start, setStart] = useState("2024-01-01");
  const [end, setEnd] = useState(() => todayInputValue());
  const [started, setStarted] = useState(false);

  const markStart = useCallback(() => {
    if (!started) {
      setStarted(true);
      track({
        name: "tool_start",
        tool: "date-difference-calculator",
        family: "tools",
      });
    }
  }, [started]);

  const result = useMemo(
    () => calculateDateDifference(start, end),
    [start, end],
  );

  const swap = () => {
    markStart();
    setStart(end);
    setEnd(start);
  };

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-[1fr_auto_1fr] sm:items-end">
        <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
          Start date
          <input
            type="date"
            value={start}
            onChange={(e) => {
              markStart();
              setStart(e.target.value);
            }}
            className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 font-[family-name:var(--font-mono)] text-[var(--foreground)]"
          />
        </label>
        <button
          type="button"
          onClick={swap}
          className="rounded-md border border-[var(--border)] px-3 py-2 text-sm hover:border-[var(--accent)]/50"
        >
          Swap
        </button>
        <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
          End date
          <div className="flex gap-2">
            <input
              type="date"
              value={end}
              onChange={(e) => {
                markStart();
                setEnd(e.target.value);
              }}
              className="min-w-0 flex-1 rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 font-[family-name:var(--font-mono)] text-[var(--foreground)]"
            />
            <button
              type="button"
              onClick={() => {
                markStart();
                setEnd(todayInputValue());
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
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-5 py-4">
            <p className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
              Calendar difference
            </p>
            <p className="mt-2 font-[family-name:var(--font-display)] text-3xl text-[var(--foreground)]">
              {result.value.years}{" "}
              <span className="text-lg text-[var(--muted)]">years</span>,{" "}
              {result.value.months}{" "}
              <span className="text-lg text-[var(--muted)]">months</span>,{" "}
              {result.value.days}{" "}
              <span className="text-lg text-[var(--muted)]">days</span>
            </p>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Between {formatDateParts(result.value.earlier)} and{" "}
              {formatDateParts(result.value.later)}
              {result.value.endIsBeforeStart
                ? " (end is before start — showing absolute span)"
                : ""}
            </p>
          </div>

          <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {(
              [
                ["Total days", formatInt(result.value.absoluteDays)],
                [
                  "Weeks",
                  `${formatInt(result.value.weeks)}w ${result.value.weekRemainderDays}d`,
                ],
                ["Hours", formatInt(result.value.hours)],
                ["Signed days", formatInt(result.value.signedDays)],
              ] as const
            ).map(([label, value]) => (
              <div
                key={label}
                className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3"
              >
                <dt className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
                  {label}
                </dt>
                <dd className="mt-1 font-[family-name:var(--font-mono)] text-xl text-[var(--foreground)]">
                  {value}
                </dd>
              </div>
            ))}
          </dl>

          <dl className="grid gap-3 sm:grid-cols-2">
            {(
              [
                ["Minutes", formatInt(result.value.minutes)],
                ["Seconds", formatInt(result.value.seconds)],
              ] as const
            ).map(([label, value]) => (
              <div
                key={label}
                className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3"
              >
                <dt className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
                  {label}
                </dt>
                <dd className="mt-1 font-[family-name:var(--font-mono)] text-xl text-[var(--foreground)]">
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        </>
      )}

      <p className="text-xs text-[var(--muted)]">
        Durations use whole calendar days at UTC midnight. Hours/minutes/seconds
        are derived from total days (not clock times).
      </p>
    </div>
  );
}
