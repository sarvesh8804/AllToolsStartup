export type DurationBreakdown = {
  totalMs: number;
  signedMs: number;
  absMs: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  milliseconds: number;
  /** Human-ish summary, e.g. "2d 3h 4m 5s" */
  label: string;
  endIsBeforeStart: boolean;
};

export type DurationBetweenResult =
  | { ok: true; value: DurationBreakdown }
  | { ok: false; error: string };

export type DurationUnitsInput = {
  days?: number;
  hours?: number;
  minutes?: number;
  seconds?: number;
  milliseconds?: number;
};

function truncNonNeg(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.trunc(n));
}

export function formatDurationLabel(ms: number): string {
  const abs = Math.abs(Math.trunc(ms));
  const days = Math.floor(abs / 86_400_000);
  const hours = Math.floor((abs % 86_400_000) / 3_600_000);
  const minutes = Math.floor((abs % 3_600_000) / 60_000);
  const seconds = Math.floor((abs % 60_000) / 1000);
  const millis = abs % 1000;

  const parts: string[] = [];
  if (days) parts.push(`${days}d`);
  if (hours) parts.push(`${hours}h`);
  if (minutes) parts.push(`${minutes}m`);
  if (seconds || parts.length === 0) parts.push(`${seconds}s`);
  if (millis && abs < 60_000) parts.push(`${millis}ms`);
  const body = parts.join(" ");
  return ms < 0 ? `−${body}` : body;
}

export function breakdownMs(signedMs: number): DurationBreakdown {
  const absMs = Math.abs(Math.trunc(signedMs));
  const days = Math.floor(absMs / 86_400_000);
  const hours = Math.floor((absMs % 86_400_000) / 3_600_000);
  const minutes = Math.floor((absMs % 3_600_000) / 60_000);
  const seconds = Math.floor((absMs % 60_000) / 1000);
  const milliseconds = absMs % 1000;
  return {
    totalMs: Math.trunc(signedMs),
    signedMs: Math.trunc(signedMs),
    absMs,
    days,
    hours,
    minutes,
    seconds,
    milliseconds,
    label: formatDurationLabel(signedMs),
    endIsBeforeStart: signedMs < 0,
  };
}

/** Parse HTML datetime-local (with optional seconds) as local wall time. */
export function parseLocalDateTime(value: string): Date | null {
  const m = value
    .trim()
    .match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/);
  if (!m) return null;
  const year = Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);
  const hour = Number(m[4]);
  const minute = Number(m[5]);
  const second = Number(m[6] ?? "0");
  const d = new Date(year, month - 1, day, hour, minute, second);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

export function durationBetween(
  startLocal: string,
  endLocal: string,
): DurationBetweenResult {
  const start = parseLocalDateTime(startLocal);
  const end = parseLocalDateTime(endLocal);
  if (!start) {
    return { ok: false, error: "Enter a valid start date and time." };
  }
  if (!end) {
    return { ok: false, error: "Enter a valid end date and time." };
  }
  return {
    ok: true,
    value: breakdownMs(end.getTime() - start.getTime()),
  };
}

export function unitsToMs(input: DurationUnitsInput): number {
  return (
    truncNonNeg(input.days ?? 0) * 86_400_000 +
    truncNonNeg(input.hours ?? 0) * 3_600_000 +
    truncNonNeg(input.minutes ?? 0) * 60_000 +
    truncNonNeg(input.seconds ?? 0) * 1000 +
    truncNonNeg(input.milliseconds ?? 0)
  );
}

export type DurationUnitKey =
  | "milliseconds"
  | "seconds"
  | "minutes"
  | "hours"
  | "days"
  | "weeks";

export function msToUnit(ms: number, unit: DurationUnitKey): number {
  const abs = Math.abs(ms);
  const sign = ms < 0 ? -1 : 1;
  switch (unit) {
    case "milliseconds":
      return sign * abs;
    case "seconds":
      return sign * (abs / 1000);
    case "minutes":
      return sign * (abs / 60_000);
    case "hours":
      return sign * (abs / 3_600_000);
    case "days":
      return sign * (abs / 86_400_000);
    case "weeks":
      return sign * (abs / 604_800_000);
  }
}

export function formatUnitValue(n: number): string {
  if (!Number.isFinite(n)) return "—";
  if (Math.abs(n) >= 1000) return n.toLocaleString(undefined, { maximumFractionDigits: 3 });
  if (Number.isInteger(n)) return String(n);
  return n.toLocaleString(undefined, { maximumFractionDigits: 6 });
}
