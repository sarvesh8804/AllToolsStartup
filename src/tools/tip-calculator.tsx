"use client";

import { useCallback, useMemo, useState } from "react";
import { ToolErrorState } from "@/components/tool/ToolShell";
import { calculateTip, formatMoney } from "@/lib/calc/tip";
import { track } from "@/lib/analytics";

const PRESETS = [10, 15, 18, 20, 25];

export function TipCalculatorTool() {
  const [bill, setBill] = useState("86.50");
  const [tipPercent, setTipPercent] = useState("18");
  const [people, setPeople] = useState("2");
  const [started, setStarted] = useState(false);

  const markStart = useCallback(() => {
    if (!started) {
      setStarted(true);
      track({
        name: "tool_start",
        tool: "tip-calculator",
        family: "calculators",
      });
    }
  }, [started]);

  const result = useMemo(
    () =>
      calculateTip({
        bill: Number(bill),
        tipPercent: Number(tipPercent),
        people: Number(people),
      }),
    [bill, tipPercent, people],
  );

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-3">
        <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
          Bill amount
          <input
            type="number"
            min={0}
            step="0.01"
            value={bill}
            onChange={(e) => {
              markStart();
              setBill(e.target.value);
            }}
            className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 font-[family-name:var(--font-mono)] text-[var(--foreground)]"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
          Tip %
          <input
            type="number"
            min={0}
            step="0.1"
            value={tipPercent}
            onChange={(e) => {
              markStart();
              setTipPercent(e.target.value);
            }}
            className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 font-[family-name:var(--font-mono)] text-[var(--foreground)]"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
          People
          <input
            type="number"
            min={1}
            step={1}
            value={people}
            onChange={(e) => {
              markStart();
              setPeople(e.target.value);
            }}
            className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 font-[family-name:var(--font-mono)] text-[var(--foreground)]"
          />
        </label>
      </div>

      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => {
              markStart();
              setTipPercent(String(p));
            }}
            className={
              Number(tipPercent) === p
                ? "rounded-md bg-[var(--accent)] px-3 py-1.5 text-sm font-medium text-[var(--ink)]"
                : "rounded-md border border-[var(--border)] px-3 py-1.5 text-sm text-[var(--muted)] hover:border-[var(--accent)]/50"
            }
          >
            {p}%
          </button>
        ))}
      </div>

      {!result.ok ? (
        <ToolErrorState message={result.error} />
      ) : (
        <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {(
            [
              ["Tip", formatMoney(result.value.tipAmount)],
              ["Total", formatMoney(result.value.total)],
              ["Per person", formatMoney(result.value.perPerson)],
              ["Tip / person", formatMoney(result.value.tipPerPerson)],
            ] as const
          ).map(([label, value]) => (
            <div
              key={label}
              className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3"
            >
              <dt className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
                {label}
              </dt>
              <dd className="mt-1 font-[family-name:var(--font-mono)] text-2xl text-[var(--foreground)]">
                {value}
              </dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}
