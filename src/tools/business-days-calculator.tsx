"use client";

import { useCallback, useMemo, useState } from "react";
import { ToolErrorState } from "@/components/tool/ToolShell";
import { todayInputValue } from "@/lib/time/age";
import {
  addBusinessDays,
  countBusinessDays,
} from "@/lib/time/business-days";
import { track } from "@/lib/analytics";

type Mode = "count" | "add";

function formatInt(n: number): string {
  return new Intl.NumberFormat(undefined).format(n);
}

export function BusinessDaysCalculatorTool() {
  const [mode, setMode] = useState<Mode>("count");
  const [start, setStart] = useState("2024-01-08");
  const [end, setEnd] = useState("2024-01-19");
  const [amount, setAmount] = useState(5);
  const [inclusive, setInclusive] = useState(true);
  const [holidayText, setHolidayText] = useState("2024-01-15");
  const [started, setStarted] = useState(false);

  const markStart = useCallback(() => {
    if (!started) {
      setStarted(true);
      track({
        name: "tool_start",
        tool: "business-days-calculator",
        family: "tools",
      });
    }
  }, [started]);

  const holidays = useMemo(
    () =>
      holidayText
        .split(/[\n,]+/)
        .map((s) => s.trim())
        .filter(Boolean),
    [holidayText],
  );

  const countResult = useMemo(
    () => countBusinessDays(start, end, { inclusive, holidays }),
    [start, end, inclusive, holidays],
  );

  const addResult = useMemo(
    () => addBusinessDays(start, amount, { holidays }),
    [start, amount, holidays],
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {(
          [
            ["count", "Count between dates"],
            ["add", "Add business days"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => {
              markStart();
              setMode(id);
            }}
            className={
              mode === id
                ? "rounded-md bg-[var(--accent)] px-3 py-1.5 text-sm font-medium text-[var(--ink)]"
                : "rounded-md border border-[var(--border)] px-3 py-1.5 text-sm text-[var(--muted)] hover:border-[var(--accent)]/50"
            }
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
          {mode === "count" ? "Start date" : "From date"}
          <div className="flex gap-2">
            <input
              type="date"
              value={start}
              onChange={(e) => {
                markStart();
                setStart(e.target.value);
              }}
              className="min-w-0 flex-1 rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 font-[family-name:var(--font-mono)] text-[var(--foreground)]"
            />
            <button
              type="button"
              onClick={() => {
                markStart();
                setStart(todayInputValue());
              }}
              className="rounded-md border border-[var(--border)] px-3 py-2 text-sm hover:border-[var(--accent)]/50"
            >
              Today
            </button>
          </div>
        </label>

        {mode === "count" ? (
          <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
            End date
            <input
              type="date"
              value={end}
              onChange={(e) => {
                markStart();
                setEnd(e.target.value);
              }}
              className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 font-[family-name:var(--font-mono)] text-[var(--foreground)]"
            />
          </label>
        ) : (
          <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
            Business days to add
            <input
              type="number"
              value={amount}
              onChange={(e) => {
                markStart();
                setAmount(Number(e.target.value));
              }}
              className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[var(--foreground)]"
            />
          </label>
        )}
      </div>

      {mode === "count" ? (
        <label className="flex items-center gap-2 text-sm text-[var(--foreground)]">
          <input
            type="checkbox"
            checked={inclusive}
            onChange={(e) => {
              markStart();
              setInclusive(e.target.checked);
            }}
          />
          Inclusive (count start and end if they are business days)
        </label>
      ) : null}

      <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
        Holidays (YYYY-MM-DD, one per line or comma-separated)
        <textarea
          value={holidayText}
          onChange={(e) => {
            markStart();
            setHolidayText(e.target.value);
          }}
          rows={3}
          className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 font-[family-name:var(--font-mono)] text-sm text-[var(--foreground)]"
          placeholder="2024-12-25"
        />
      </label>

      {mode === "count" ? (
        !countResult.ok ? (
          <ToolErrorState message={countResult.error} />
        ) : (
          <div className="space-y-3">
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-5 py-4">
              <p className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
                Business days
              </p>
              <p className="mt-2 font-[family-name:var(--font-display)] text-4xl text-[var(--foreground)]">
                {formatInt(countResult.businessDays)}
              </p>
            </div>
            <dl className="grid gap-3 sm:grid-cols-3">
              {(
                [
                  ["Calendar days spanned", countResult.calendarDays],
                  ["Weekend days", countResult.weekendDays],
                  ["Holiday weekdays", countResult.holidayDays],
                ] as const
              ).map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-xl border border-[var(--border)] px-4 py-3"
                >
                  <dt className="text-xs uppercase tracking-[0.12em] text-[var(--muted)]">
                    {label}
                  </dt>
                  <dd className="mt-1 font-[family-name:var(--font-mono)] text-lg text-[var(--foreground)]">
                    {formatInt(value)}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        )
      ) : !addResult.ok ? (
        <ToolErrorState message={addResult.error} />
      ) : (
        <div className="space-y-3">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-5 py-4">
            <p className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
              Result date
            </p>
            <p className="mt-2 font-[family-name:var(--font-display)] text-3xl text-[var(--foreground)]">
              {addResult.display}
            </p>
            <p className="mt-1 font-[family-name:var(--font-mono)] text-sm text-[var(--muted)]">
              {addResult.iso}
            </p>
          </div>
          <p className="text-sm text-[var(--muted)]">
            Spanned {formatInt(addResult.calendarDaysSpanned)} calendar day
            {addResult.calendarDaysSpanned === 1 ? "" : "s"} to add{" "}
            {formatInt(addResult.businessDaysAdded)} business day
            {Math.abs(addResult.businessDaysAdded) === 1 ? "" : "s"}.
          </p>
        </div>
      )}
    </div>
  );
}
