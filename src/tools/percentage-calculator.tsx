"use client";

import { useCallback, useMemo, useState } from "react";
import { ToolErrorState } from "@/components/tool/ToolShell";
import {
  adjustByPercent,
  formatNumber,
  percentChange,
  percentOf,
  whatPercent,
} from "@/lib/calc/percentage";
import { track } from "@/lib/analytics";

type Mode = "of" | "what" | "change" | "adjust";

export function PercentageCalculatorTool() {
  const [mode, setMode] = useState<Mode>("of");
  const [a, setA] = useState("20");
  const [b, setB] = useState("150");
  const [direction, setDirection] = useState<"increase" | "decrease">(
    "increase",
  );
  const [started, setStarted] = useState(false);

  const markStart = useCallback(() => {
    if (!started) {
      setStarted(true);
      track({
        name: "tool_start",
        tool: "percentage-calculator",
        family: "calculators",
      });
    }
  }, [started]);

  const result = useMemo(() => {
    const x = Number(a);
    const y = Number(b);
    if (mode === "of") {
      const r = percentOf(x, y);
      if (!r.ok) return r;
      return { ok: true as const, display: formatNumber(r.value.value) };
    }
    if (mode === "what") {
      const r = whatPercent(x, y);
      if (!r.ok) return r;
      return {
        ok: true as const,
        display: `${formatNumber(r.value.percent)}%`,
      };
    }
    if (mode === "change") {
      const r = percentChange(x, y);
      if (!r.ok) return r;
      return {
        ok: true as const,
        display: `${formatNumber(r.value.percent)}% (${formatNumber(r.value.change)})`,
      };
    }
    const r = adjustByPercent(x, y, direction);
    if (!r.ok) return r;
    return { ok: true as const, display: formatNumber(r.value.value) };
  }, [mode, a, b, direction]);

  const labels =
    mode === "of"
      ? { a: "Percent (%)", b: "Of value" }
      : mode === "what"
        ? { a: "Part", b: "Whole" }
        : mode === "change"
          ? { a: "From", b: "To" }
          : { a: "Base value", b: "Percent (%)" };

  return (
    <div className="space-y-4">
      <div
        role="tablist"
        aria-label="Percentage mode"
        className="flex flex-wrap gap-2"
      >
        {(
          [
            ["of", "X% of Y"],
            ["what", "X is what % of Y"],
            ["change", "% change"],
            ["adjust", "Increase / decrease"],
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
        <NumField
          label={labels.a}
          value={a}
          onChange={(v) => {
            markStart();
            setA(v);
          }}
        />
        <NumField
          label={labels.b}
          value={b}
          onChange={(v) => {
            markStart();
            setB(v);
          }}
        />
      </div>

      {mode === "adjust" ? (
        <div
          role="tablist"
          className="inline-flex rounded-lg border border-[var(--border)] bg-[var(--surface)] p-1 text-sm"
        >
          {(["increase", "decrease"] as const).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => {
                markStart();
                setDirection(d);
              }}
              className={
                direction === d
                  ? "rounded-md bg-[var(--accent)] px-3 py-1.5 font-medium text-[var(--ink)]"
                  : "rounded-md px-3 py-1.5 text-[var(--muted)]"
              }
            >
              {d === "increase" ? "Increase" : "Decrease"}
            </button>
          ))}
        </div>
      ) : null}

      {!result.ok ? (
        <ToolErrorState message={result.error} />
      ) : (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-5 py-4">
          <p className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
            Result
          </p>
          <p className="mt-2 font-[family-name:var(--font-mono)] text-3xl text-[var(--foreground)]">
            {result.display}
          </p>
        </div>
      )}
    </div>
  );
}

function NumField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
      {label}
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 font-[family-name:var(--font-mono)] text-[var(--foreground)]"
      />
    </label>
  );
}
