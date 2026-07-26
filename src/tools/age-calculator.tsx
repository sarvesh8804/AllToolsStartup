"use client";

import { useCallback, useMemo, useState } from "react";
import { ToolErrorState } from "@/components/tool/ToolShell";
import {
  calculateAge,
  formatDateParts,
  todayInputValue,
} from "@/lib/time/age";
import { track } from "@/lib/analytics";

export function AgeCalculatorTool() {
  const [birth, setBirth] = useState("2000-01-01");
  const [asOf, setAsOf] = useState(() => todayInputValue());
  const [started, setStarted] = useState(false);

  const markStart = useCallback(() => {
    if (!started) {
      setStarted(true);
      track({ name: "tool_start", tool: "age-calculator", family: "tools" });
    }
  }, [started]);

  const result = useMemo(() => calculateAge(birth, asOf), [birth, asOf]);

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
          Date of birth
          <input
            type="date"
            value={birth}
            onChange={(e) => {
              markStart();
              setBirth(e.target.value);
            }}
            className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 font-[family-name:var(--font-mono)] text-[var(--foreground)]"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
          Age as of
          <div className="flex gap-2">
            <input
              type="date"
              value={asOf}
              onChange={(e) => {
                markStart();
                setAsOf(e.target.value);
              }}
              className="min-w-0 flex-1 rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 font-[family-name:var(--font-mono)] text-[var(--foreground)]"
            />
            <button
              type="button"
              onClick={() => {
                markStart();
                setAsOf(todayInputValue());
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
              Age
            </p>
            <p className="mt-2 font-[family-name:var(--font-display)] text-3xl text-[var(--foreground)]">
              {result.value.years}{" "}
              <span className="text-lg text-[var(--muted)]">years</span>,{" "}
              {result.value.months}{" "}
              <span className="text-lg text-[var(--muted)]">months</span>,{" "}
              {result.value.days}{" "}
              <span className="text-lg text-[var(--muted)]">days</span>
            </p>
          </div>

          <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {(
              [
                ["Total days", String(result.value.totalDays)],
                ["Total weeks", String(result.value.totalWeeks)],
                ["Total months", String(result.value.totalMonths)],
                [
                  "Next birthday",
                  `${formatDateParts(result.value.nextBirthday)} (${result.value.daysUntilBirthday}d)`,
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
                <dd className="mt-1 font-[family-name:var(--font-mono)] text-lg text-[var(--foreground)]">
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        </>
      )}
    </div>
  );
}
