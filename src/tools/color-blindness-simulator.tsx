"use client";

import { useCallback, useMemo, useState } from "react";
import { CopyButton } from "@/components/editor/CopyButton";
import {
  SAMPLE_COLOR,
  simulateAllColorBlindness,
  type ColorBlindnessType,
} from "@/lib/color/color-blindness";
import { track } from "@/lib/analytics";

const LABELS: Record<ColorBlindnessType, string> = {
  protanopia: "Protanopia",
  deuteranopia: "Deuteranopia",
  tritanopia: "Tritanopia",
  achromatopsia: "Achromatopsia",
};

export function ColorBlindnessSimulatorTool() {
  const [color, setColor] = useState(SAMPLE_COLOR);
  const [started, setStarted] = useState(false);

  const simulations = useMemo(() => simulateAllColorBlindness(color), [color]);

  const markStart = useCallback(() => {
    if (!started) {
      setStarted(true);
      track({ name: "tool_start", tool: "color-blindness-simulator", family: "tools" });
    }
  }, [started]);

  return (
    <div className="space-y-6">
      <label className="flex items-center gap-3 text-sm text-[var(--muted)]">
        Color
        <input type="color" value={color} onChange={(e) => { markStart(); setColor(e.target.value); }}
          className="h-10 w-12 rounded border border-[var(--border)]" />
        <input value={color} onChange={(e) => { markStart(); setColor(e.target.value); }}
          className="w-32 rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 font-[family-name:var(--font-mono)] text-sm" />
      </label>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-[var(--border)] p-4">
          <p className="mb-2 text-sm text-[var(--muted)]">Original</p>
          <div className="h-20 rounded-lg border border-[var(--border)]" style={{ background: color }} />
          <code className="mt-2 block text-xs">{color}</code>
        </div>
        {simulations.map((sim) => (
          <div key={sim.type} className="rounded-xl border border-[var(--border)] p-4">
            <p className="mb-2 text-sm text-[var(--muted)]">{LABELS[sim.type]}</p>
            <div className="h-20 rounded-lg border border-[var(--border)]" style={{ background: sim.hex }} />
            <div className="mt-2 flex items-center justify-between gap-2">
              <code className="text-xs">{sim.hex}</code>
              <CopyButton getText={() => sim.hex} label="Copy" className="!py-1 !text-xs" />
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-[var(--muted)]">Approximate simulation using linear RGB matrices — useful for quick accessibility checks, not medical accuracy.</p>
    </div>
  );
}
