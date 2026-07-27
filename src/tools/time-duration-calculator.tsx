"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { CopyButton } from "@/components/editor/CopyButton";
import { ToolErrorState } from "@/components/tool/ToolShell";
import { nowInLocalInput } from "@/lib/time/timezone";
import {
  breakdownMs,
  durationBetween,
  formatUnitValue,
  msToUnit,
  unitsToMs,
  type DurationUnitKey,
} from "@/lib/time/duration";
import { track } from "@/lib/analytics";

type Mode = "between" | "convert";

const UNIT_ROWS: { key: DurationUnitKey; label: string }[] = [
  { key: "weeks", label: "Weeks" },
  { key: "days", label: "Days" },
  { key: "hours", label: "Hours" },
  { key: "minutes", label: "Minutes" },
  { key: "seconds", label: "Seconds" },
  { key: "milliseconds", label: "Milliseconds" },
];

export function TimeDurationCalculatorTool() {
  const [mode, setMode] = useState<Mode>("between");
  const [start, setStart] = useState(() => nowInLocalInput());
  const [end, setEnd] = useState(() => {
    const d = new Date();
    d.setHours(d.getHours() + 2);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  });
  const [days, setDays] = useState(0);
  const [hours, setHours] = useState(2);
  const [minutes, setMinutes] = useState(30);
  const [seconds, setSeconds] = useState(0);
  const [started, setStarted] = useState(false);

  const markStart = useCallback(() => {
    if (!started) {
      setStarted(true);
      track({
        name: "tool_start",
        tool: "time-duration-calculator",
        family: "tools",
      });
    }
  }, [started]);

  const between = useMemo(() => durationBetween(start, end), [start, end]);
  const convertMs = useMemo(
    () => unitsToMs({ days, hours, minutes, seconds }),
    [days, hours, minutes, seconds],
  );
  const convertBreakdown = useMemo(() => breakdownMs(convertMs), [convertMs]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <div
          role="tablist"
          className="inline-flex rounded-lg border border-[var(--border)] bg-[var(--surface)] p-1 text-sm"
        >
          {(
            [
              ["between", "Between datetimes"],
              ["convert", "Unit converter"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={mode === id}
              onClick={() => {
                markStart();
                setMode(id);
              }}
              className={`rounded-md px-3 py-1.5 ${
                mode === id
                  ? "bg-[var(--accent)]/15 text-[var(--foreground)]"
                  : "text-[var(--muted)]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <Link
          href="/tools/date-difference-calculator"
          className="text-sm text-[var(--accent-bright)] underline-offset-2 hover:underline"
        >
          Date-only difference →
        </Link>
      </div>

      {mode === "between" ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
              Start
              <input
                type="datetime-local"
                value={start}
                onChange={(e) => {
                  markStart();
                  setStart(e.target.value);
                }}
                className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 font-[family-name:var(--font-mono)] text-sm text-[var(--foreground)]"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
              End
              <input
                type="datetime-local"
                value={end}
                onChange={(e) => {
                  markStart();
                  setEnd(e.target.value);
                }}
                className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 font-[family-name:var(--font-mono)] text-sm text-[var(--foreground)]"
              />
            </label>
          </div>

          {!between.ok ? (
            <ToolErrorState message={between.error} />
          ) : (
            <DurationPanel
              label={between.value.label}
              days={between.value.days}
              hours={between.value.hours}
              minutes={between.value.minutes}
              seconds={between.value.seconds}
              milliseconds={between.value.milliseconds}
              absMs={between.value.absMs}
              note={
                between.value.endIsBeforeStart
                  ? "End is before start — duration shown as negative."
                  : undefined
              }
            />
          )}
        </>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-4">
            {(
              [
                ["Days", days, setDays],
                ["Hours", hours, setHours],
                ["Minutes", minutes, setMinutes],
                ["Seconds", seconds, setSeconds],
              ] as const
            ).map(([label, value, set]) => (
              <label
                key={label}
                className="flex flex-col gap-1 text-sm text-[var(--muted)]"
              >
                {label}
                <input
                  type="number"
                  min={0}
                  value={value}
                  onChange={(e) => {
                    markStart();
                    set(Number(e.target.value));
                  }}
                  className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[var(--foreground)]"
                />
              </label>
            ))}
          </div>

          <DurationPanel
            label={convertBreakdown.label}
            days={convertBreakdown.days}
            hours={convertBreakdown.hours}
            minutes={convertBreakdown.minutes}
            seconds={convertBreakdown.seconds}
            milliseconds={convertBreakdown.milliseconds}
            absMs={convertBreakdown.absMs}
          />

          <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-[var(--surface-2)] text-xs uppercase tracking-[0.12em] text-[var(--muted)]">
                <tr>
                  <th className="px-3 py-2 font-medium">Unit</th>
                  <th className="px-3 py-2 font-medium">Value</th>
                </tr>
              </thead>
              <tbody>
                {UNIT_ROWS.map((row) => (
                  <tr key={row.key} className="border-t border-[var(--border)]">
                    <td className="px-3 py-2 text-[var(--foreground)]">
                      {row.label}
                    </td>
                    <td className="px-3 py-2 font-[family-name:var(--font-mono)] text-[var(--foreground)]">
                      {formatUnitValue(msToUnit(convertMs, row.key))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

function DurationPanel({
  label,
  days,
  hours,
  minutes,
  seconds,
  milliseconds,
  absMs,
  note,
}: {
  label: string;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  milliseconds: number;
  absMs: number;
  note?: string;
}) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-5 py-6">
      <p className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
        Duration
      </p>
      <p className="mt-2 font-[family-name:var(--font-mono)] text-3xl text-[var(--foreground)]">
        {label}
      </p>
      {note ? <p className="mt-2 text-sm text-[var(--muted)]">{note}</p> : null}
      <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {(
          [
            ["Days", days],
            ["Hours", hours],
            ["Minutes", minutes],
            ["Seconds", seconds],
            ["ms", milliseconds],
          ] as const
        ).map(([k, v]) => (
          <div key={k}>
            <dt className="text-xs text-[var(--muted)]">{k}</dt>
            <dd className="font-[family-name:var(--font-mono)] text-lg text-[var(--foreground)]">
              {v}
            </dd>
          </div>
        ))}
      </dl>
      <div className="mt-4 flex flex-wrap gap-2">
        <CopyButton getText={() => label} label="Copy label" />
        <CopyButton getText={() => String(absMs)} label="Copy ms" />
      </div>
    </div>
  );
}
