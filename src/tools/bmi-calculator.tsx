"use client";

import { useCallback, useMemo, useState } from "react";
import { ToolErrorState } from "@/components/tool/ToolShell";
import { calculateBmi, type BmiUnitSystem } from "@/lib/calc/bmi";
import { track } from "@/lib/analytics";

function formatBmi(n: number): string {
  return n.toFixed(1);
}

export function BmiCalculatorTool() {
  const [system, setSystem] = useState<BmiUnitSystem>("metric");
  const [weightKg, setWeightKg] = useState("70");
  const [heightCm, setHeightCm] = useState("175");
  const [weightLb, setWeightLb] = useState("154");
  const [heightFt, setHeightFt] = useState("5");
  const [heightIn, setHeightIn] = useState("9");
  const [started, setStarted] = useState(false);

  const markStart = useCallback(() => {
    if (!started) {
      setStarted(true);
      track({
        name: "tool_start",
        tool: "bmi-calculator",
        family: "calculators",
      });
    }
  }, [started]);

  const result = useMemo(() => {
    if (system === "metric") {
      return calculateBmi({
        system: "metric",
        weightKg: Number(weightKg),
        heightCm: Number(heightCm),
      });
    }
    return calculateBmi({
      system: "imperial",
      weightLb: Number(weightLb),
      heightFt: Number(heightFt),
      heightIn: Number(heightIn),
    });
  }, [system, weightKg, heightCm, weightLb, heightFt, heightIn]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {(
          [
            ["metric", "Metric (kg / cm)"],
            ["imperial", "Imperial (lb / ft)"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => {
              markStart();
              setSystem(value);
            }}
            className={`rounded-md border px-3 py-1.5 text-sm transition ${
              system === value
                ? "border-[var(--accent)] bg-[var(--accent)]/15 text-[var(--foreground)]"
                : "border-[var(--border)] text-[var(--muted)] hover:border-[var(--accent)]/50"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {system === "metric" ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
            Weight (kg)
            <input
              type="number"
              min={0}
              step="0.1"
              value={weightKg}
              onChange={(e) => {
                markStart();
                setWeightKg(e.target.value);
              }}
              className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 font-[family-name:var(--font-mono)] text-[var(--foreground)]"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
            Height (cm)
            <input
              type="number"
              min={0}
              step="0.1"
              value={heightCm}
              onChange={(e) => {
                markStart();
                setHeightCm(e.target.value);
              }}
              className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 font-[family-name:var(--font-mono)] text-[var(--foreground)]"
            />
          </label>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
            Weight (lb)
            <input
              type="number"
              min={0}
              step="0.1"
              value={weightLb}
              onChange={(e) => {
                markStart();
                setWeightLb(e.target.value);
              }}
              className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 font-[family-name:var(--font-mono)] text-[var(--foreground)]"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
            Height (ft)
            <input
              type="number"
              min={0}
              step="1"
              value={heightFt}
              onChange={(e) => {
                markStart();
                setHeightFt(e.target.value);
              }}
              className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 font-[family-name:var(--font-mono)] text-[var(--foreground)]"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
            Height (in)
            <input
              type="number"
              min={0}
              max={11.99}
              step="0.1"
              value={heightIn}
              onChange={(e) => {
                markStart();
                setHeightIn(e.target.value);
              }}
              className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 font-[family-name:var(--font-mono)] text-[var(--foreground)]"
            />
          </label>
        </div>
      )}

      {!result.ok ? (
        <ToolErrorState message={result.error} />
      ) : (
        <dl className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
            <dt className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
              BMI
            </dt>
            <dd className="mt-1 font-[family-name:var(--font-mono)] text-3xl text-[var(--foreground)]">
              {formatBmi(result.value.bmi)}
            </dd>
          </div>
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
            <dt className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
              Category (WHO adult)
            </dt>
            <dd className="mt-1 font-[family-name:var(--font-display)] text-2xl text-[var(--foreground)]">
              {result.value.category}
            </dd>
          </div>
        </dl>
      )}

      <p className="text-xs text-[var(--muted)]">
        BMI is a screening estimate for adults — not a diagnosis. It does not
        account for muscle mass, age, sex, or ethnicity. Not medical advice.
      </p>
    </div>
  );
}
