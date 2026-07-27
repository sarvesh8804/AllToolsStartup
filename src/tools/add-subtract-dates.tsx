"use client";

import { useCallback, useMemo, useState } from "react";
import { CopyButton } from "@/components/editor/CopyButton";
import { ToolErrorState } from "@/components/tool/ToolShell";
import { todayInputValue } from "@/lib/time/age";
import {
  shiftDate,
  type DateShiftUnit,
} from "@/lib/time/date-shift";
import { track } from "@/lib/analytics";
import Link from "next/link";

const UNITS: { id: DateShiftUnit; label: string }[] = [
  { id: "days", label: "Days" },
  { id: "weeks", label: "Weeks" },
  { id: "months", label: "Months" },
  { id: "years", label: "Years" },
];

export function AddSubtractDatesTool() {
  const [date, setDate] = useState(() => todayInputValue());
  const [operation, setOperation] = useState<"add" | "subtract">("add");
  const [amount, setAmount] = useState(7);
  const [unit, setUnit] = useState<DateShiftUnit>("days");
  const [started, setStarted] = useState(false);

  const markStart = useCallback(() => {
    if (!started) {
      setStarted(true);
      track({
        name: "tool_start",
        tool: "add-subtract-dates",
        family: "tools",
      });
    }
  }, [started]);

  const result = useMemo(
    () => shiftDate({ date, amount, unit, operation }),
    [date, amount, unit, operation],
  );

  return (
    <div className="space-y-5">
      <p className="text-sm text-[var(--muted)]">
        Need the span between two dates? Use the{" "}
        <Link
          href="/tools/date-difference-calculator"
          className="text-[var(--accent-bright)] underline-offset-2 hover:underline"
        >
          Date Difference Calculator
        </Link>
        .
      </p>

      <div className="flex flex-wrap items-end gap-4">
        <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
          Start date
          <input
            type="date"
            value={date}
            onChange={(e) => {
              markStart();
              setDate(e.target.value);
            }}
            className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 font-[family-name:var(--font-mono)] text-[var(--foreground)]"
          />
        </label>

        <div className="flex gap-2 pb-0.5">
          {(
            [
              ["add", "Add"],
              ["subtract", "Subtract"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => {
                markStart();
                setOperation(id);
              }}
              className={`rounded-md border px-3 py-2 text-sm ${
                operation === id
                  ? "border-[var(--accent)] bg-[var(--accent)]/15 text-[var(--foreground)]"
                  : "border-[var(--border)] text-[var(--muted)]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
          Amount
          <input
            type="number"
            min={0}
            max={100000}
            value={amount}
            onChange={(e) => {
              markStart();
              setAmount(Number(e.target.value));
            }}
            className="w-28 rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[var(--foreground)]"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
          Unit
          <select
            value={unit}
            onChange={(e) => {
              markStart();
              setUnit(e.target.value as DateShiftUnit);
            }}
            className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-2 text-[var(--foreground)]"
          >
            {UNITS.map((u) => (
              <option key={u.id} value={u.id}>
                {u.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {!result.ok ? (
        <ToolErrorState message={result.error} />
      ) : (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-5 py-6">
          <p className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
            Result
          </p>
          <p className="mt-2 font-[family-name:var(--font-mono)] text-3xl text-[var(--foreground)]">
            {result.iso}
          </p>
          <p className="mt-1 text-sm text-[var(--muted)]">{result.display}</p>
          <p className="mt-3 text-sm text-[var(--muted)]">
            {operation === "add" ? "Added" : "Subtracted"} {amount} {unit}{" "}
            {operation === "add" ? "to" : "from"} {date}
          </p>
          <div className="mt-4">
            <CopyButton getText={() => result.iso} label="Copy date" />
          </div>
        </div>
      )}
    </div>
  );
}
