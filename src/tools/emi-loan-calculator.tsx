"use client";

import { useCallback, useMemo, useState } from "react";
import { ToolErrorState } from "@/components/tool/ToolShell";
import { calculateLoan } from "@/lib/calc/loan";
import { formatMoney } from "@/lib/calc/tip";
import { track } from "@/lib/analytics";

export function EmiLoanCalculatorTool() {
  const [principal, setPrincipal] = useState("500000");
  const [rate, setRate] = useState("8.5");
  const [years, setYears] = useState("5");
  const [showSchedule, setShowSchedule] = useState(false);
  const [started, setStarted] = useState(false);

  const markStart = useCallback(() => {
    if (!started) {
      setStarted(true);
      track({
        name: "tool_start",
        tool: "emi-loan-calculator",
        family: "calculators",
      });
    }
  }, [started]);

  const result = useMemo(
    () =>
      calculateLoan({
        principal: Number(principal),
        annualRatePercent: Number(rate),
        years: Number(years),
      }),
    [principal, rate, years],
  );

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-3">
        <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
          Loan amount
          <input
            type="number"
            min={0}
            step="1000"
            value={principal}
            onChange={(e) => {
              markStart();
              setPrincipal(e.target.value);
            }}
            className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 font-[family-name:var(--font-mono)] text-[var(--foreground)]"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
          Annual interest rate (%)
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
                ["Monthly EMI", formatMoney(result.value.emi)],
                ["Total payment", formatMoney(result.value.totalPayment)],
                ["Total interest", formatMoney(result.value.totalInterest)],
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
            {showSchedule ? "Hide" : "Show"} amortization schedule
          </button>

          {showSchedule ? (
            <div className="max-h-[50vh] overflow-auto rounded-xl border border-[var(--border)]">
              <table className="w-full min-w-[640px] text-sm">
                <thead className="sticky top-0 bg-[var(--surface)] text-left text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
                  <tr>
                    <th className="px-3 py-2">#</th>
                    <th className="px-3 py-2">Payment</th>
                    <th className="px-3 py-2">Principal</th>
                    <th className="px-3 py-2">Interest</th>
                    <th className="px-3 py-2">Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {result.value.schedule.map((row) => (
                    <tr
                      key={row.month}
                      className="border-t border-[var(--border)] font-[family-name:var(--font-mono)]"
                    >
                      <td className="px-3 py-1.5">{row.month}</td>
                      <td className="px-3 py-1.5">
                        {formatMoney(row.payment)}
                      </td>
                      <td className="px-3 py-1.5">
                        {formatMoney(row.principal)}
                      </td>
                      <td className="px-3 py-1.5">
                        {formatMoney(row.interest)}
                      </td>
                      <td className="px-3 py-1.5">
                        {formatMoney(row.balance)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
