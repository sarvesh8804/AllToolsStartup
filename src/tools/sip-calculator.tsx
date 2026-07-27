"use client";

import { useCallback, useMemo, useState } from "react";
import { ToolErrorState } from "@/components/tool/ToolShell";
import { calculateSip } from "@/lib/calc/sip";
import { formatMoney } from "@/lib/calc/tip";
import { track } from "@/lib/analytics";

export function SipCalculatorTool() {
  const [monthly, setMonthly] = useState("10000");
  const [rate, setRate] = useState("12");
  const [years, setYears] = useState("10");
  const [showSchedule, setShowSchedule] = useState(false);
  const [started, setStarted] = useState(false);

  const markStart = useCallback(() => {
    if (!started) {
      setStarted(true);
      track({
        name: "tool_start",
        tool: "sip-calculator",
        family: "calculators",
      });
    }
  }, [started]);

  const result = useMemo(
    () =>
      calculateSip({
        monthlyInvestment: Number(monthly),
        annualRatePercent: Number(rate),
        years: Number(years),
      }),
    [monthly, rate, years],
  );

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-3">
        <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
          Monthly investment
          <input
            type="number"
            min={0}
            step="100"
            value={monthly}
            onChange={(e) => {
              markStart();
              setMonthly(e.target.value);
            }}
            className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 font-[family-name:var(--font-mono)] text-[var(--foreground)]"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
          Expected annual return (%)
          <input
            type="number"
            min={0}
            step="0.1"
            value={rate}
            onChange={(e) => {
              markStart();
              setRate(e.target.value);
            }}
            className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 font-[family-name:var(--font-mono)] text-[var(--foreground)]"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
          Tenure (years)
          <input
            type="number"
            min={0.083}
            step="0.5"
            value={years}
            onChange={(e) => {
              markStart();
              setYears(e.target.value);
            }}
            className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 font-[family-name:var(--font-mono)] text-[var(--foreground)]"
          />
        </label>
      </div>

      {!result.ok ? (
        <ToolErrorState message={result.error} />
      ) : (
        <>
          <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {(
              [
                ["Maturity value", formatMoney(result.value.maturityValue)],
                ["Total invested", formatMoney(result.value.totalInvested)],
                [
                  "Estimated returns",
                  formatMoney(result.value.estimatedReturns),
                ],
                ["Months", String(result.value.months)],
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

          <button
            type="button"
            onClick={() => setShowSchedule((v) => !v)}
            className="rounded-md border border-[var(--border)] px-3 py-1.5 text-sm hover:border-[var(--accent)]/50"
          >
            {showSchedule ? "Hide" : "Show"} year-by-year projection
          </button>

          {showSchedule ? (
            <div className="max-h-[50vh] overflow-auto rounded-xl border border-[var(--border)]">
              <table className="w-full min-w-[520px] text-sm">
                <thead className="sticky top-0 bg-[var(--surface)] text-left text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
                  <tr>
                    <th className="px-3 py-2">Year</th>
                    <th className="px-3 py-2">Invested</th>
                    <th className="px-3 py-2">Value</th>
                    <th className="px-3 py-2">Returns</th>
                  </tr>
                </thead>
                <tbody>
                  {result.value.schedule.map((row) => (
                    <tr
                      key={row.year}
                      className="border-t border-[var(--border)] font-[family-name:var(--font-mono)]"
                    >
                      <td className="px-3 py-1.5">{row.year}</td>
                      <td className="px-3 py-1.5">
                        {formatMoney(row.invested)}
                      </td>
                      <td className="px-3 py-1.5">{formatMoney(row.value)}</td>
                      <td className="px-3 py-1.5">
                        {formatMoney(row.returns)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </>
      )}

      <p className="text-xs text-[var(--muted)]">
        Educational estimate using the common SIP (annuity-due) formula. Not
        investment advice — actual mutual fund returns vary.
      </p>
    </div>
  );
}
