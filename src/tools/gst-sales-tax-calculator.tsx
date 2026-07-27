"use client";

import { useCallback, useMemo, useState } from "react";
import { ToolErrorState } from "@/components/tool/ToolShell";
import {
  calculateSalesTax,
  GST_RATE_PRESETS,
  type TaxMode,
} from "@/lib/calc/sales-tax";
import { formatMoney } from "@/lib/calc/tip";
import { track } from "@/lib/analytics";

export function GstSalesTaxCalculatorTool() {
  const [amount, setAmount] = useState("1000");
  const [rate, setRate] = useState("18");
  const [mode, setMode] = useState<TaxMode>("exclusive");
  const [started, setStarted] = useState(false);

  const markStart = useCallback(() => {
    if (!started) {
      setStarted(true);
      track({
        name: "tool_start",
        tool: "gst-sales-tax-calculator",
        family: "calculators",
      });
    }
  }, [started]);

  const result = useMemo(
    () =>
      calculateSalesTax({
        amount: Number(amount),
        ratePercent: Number(rate),
        mode,
      }),
    [amount, rate, mode],
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {(
          [
            ["exclusive", "Add tax (exclusive)"],
            ["inclusive", "Extract tax (inclusive)"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => {
              markStart();
              setMode(value);
            }}
            className={`rounded-md border px-3 py-1.5 text-sm transition ${
              mode === value
                ? "border-[var(--accent)] bg-[var(--accent)]/15 text-[var(--foreground)]"
                : "border-[var(--border)] text-[var(--muted)] hover:border-[var(--accent)]/50"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
          {mode === "exclusive" ? "Amount (before tax)" : "Amount (with tax)"}
          <input
            type="number"
            min={0}
            step="0.01"
            value={amount}
            onChange={(e) => {
              markStart();
              setAmount(e.target.value);
            }}
            className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 font-[family-name:var(--font-mono)] text-[var(--foreground)]"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
          Tax / GST rate (%)
          <input
            type="number"
            min={0}
            max={100}
            step="0.01"
            value={rate}
            onChange={(e) => {
              markStart();
              setRate(e.target.value);
            }}
            className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 font-[family-name:var(--font-mono)] text-[var(--foreground)]"
          />
        </label>
      </div>

      <div className="flex flex-wrap gap-2">
        {GST_RATE_PRESETS.map((preset) => (
          <button
            key={preset.value}
            type="button"
            onClick={() => {
              markStart();
              setRate(String(preset.value));
            }}
            className={`rounded-md border px-2.5 py-1 text-xs transition ${
              Number(rate) === preset.value
                ? "border-[var(--accent)] bg-[var(--accent)]/15 text-[var(--foreground)]"
                : "border-[var(--border)] text-[var(--muted)] hover:border-[var(--accent)]/50"
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {!result.ok ? (
        <ToolErrorState message={result.error} />
      ) : (
        <dl className="grid gap-3 sm:grid-cols-3">
          {(
            [
              ["Net (taxable)", formatMoney(result.value.net)],
              ["Tax amount", formatMoney(result.value.tax)],
              ["Gross (total)", formatMoney(result.value.gross)],
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

      <p className="text-xs text-[var(--muted)]">
        Educational estimate only — not tax advice. Use any sales-tax or GST %;
        Indian GST slabs (5 / 12 / 18 / 28) are presets for convenience.
      </p>
    </div>
  );
}
