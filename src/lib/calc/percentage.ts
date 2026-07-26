export type PercentOfResult = {
  percent: number;
  of: number;
  value: number;
};

export type WhatPercentResult = {
  part: number;
  whole: number;
  percent: number;
};

export type PercentChangeResult = {
  from: number;
  to: number;
  change: number;
  percent: number;
};

export type AdjustByPercentResult = {
  base: number;
  percent: number;
  direction: "increase" | "decrease";
  value: number;
  delta: number;
};

function assertFinite(...nums: number[]): string | null {
  for (const n of nums) {
    if (!Number.isFinite(n)) return "Enter valid numbers.";
  }
  return null;
}

export function percentOf(
  percent: number,
  of: number,
): { ok: true; value: PercentOfResult } | { ok: false; error: string } {
  const err = assertFinite(percent, of);
  if (err) return { ok: false, error: err };
  const value = (percent / 100) * of;
  return { ok: true, value: { percent, of, value } };
}

export function whatPercent(
  part: number,
  whole: number,
): { ok: true; value: WhatPercentResult } | { ok: false; error: string } {
  const err = assertFinite(part, whole);
  if (err) return { ok: false, error: err };
  if (whole === 0) return { ok: false, error: "Whole value cannot be zero." };
  const percent = (part / whole) * 100;
  return { ok: true, value: { part, whole, percent } };
}

export function percentChange(
  from: number,
  to: number,
): { ok: true; value: PercentChangeResult } | { ok: false; error: string } {
  const err = assertFinite(from, to);
  if (err) return { ok: false, error: err };
  if (from === 0) {
    return { ok: false, error: "Starting value cannot be zero for % change." };
  }
  const change = to - from;
  const percent = (change / Math.abs(from)) * 100;
  return { ok: true, value: { from, to, change, percent } };
}

export function adjustByPercent(
  base: number,
  percent: number,
  direction: "increase" | "decrease",
): { ok: true; value: AdjustByPercentResult } | { ok: false; error: string } {
  const err = assertFinite(base, percent);
  if (err) return { ok: false, error: err };
  const delta =
    direction === "increase"
      ? (percent / 100) * base
      : -((percent / 100) * base);
  return {
    ok: true,
    value: { base, percent, direction, delta, value: base + delta },
  };
}

export function formatNumber(n: number, digits = 4): string {
  if (!Number.isFinite(n)) return "—";
  const rounded = Number(n.toPrecision(12));
  if (Number.isInteger(rounded)) return String(rounded);
  return parseFloat(rounded.toFixed(digits)).toString();
}
