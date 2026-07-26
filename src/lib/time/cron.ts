/**
 * Standard 5-field cron (minute hour day-of-month month day-of-week).
 * Supports *, lists, ranges, and steps (e.g. star/5, 1-10/2).
 */

export type CronFieldName =
  | "minute"
  | "hour"
  | "dayOfMonth"
  | "month"
  | "dayOfWeek";

export type CronField = {
  name: CronFieldName;
  raw: string;
  values: number[];
  description: string;
};

export type CronExplainResult =
  | {
      ok: true;
      expression: string;
      fields: CronField[];
      summary: string;
      next: string[];
    }
  | { ok: false; error: string };

const FIELD_META: {
  name: CronFieldName;
  min: number;
  max: number;
  label: string;
  names?: Record<number, string>;
}[] = [
  { name: "minute", min: 0, max: 59, label: "minute" },
  { name: "hour", min: 0, max: 23, label: "hour" },
  {
    name: "dayOfMonth",
    min: 1,
    max: 31,
    label: "day of month",
  },
  {
    name: "month",
    min: 1,
    max: 12,
    label: "month",
    names: {
      1: "January",
      2: "February",
      3: "March",
      4: "April",
      5: "May",
      6: "June",
      7: "July",
      8: "August",
      9: "September",
      10: "October",
      11: "November",
      12: "December",
    },
  },
  {
    name: "dayOfWeek",
    min: 0,
    max: 6,
    label: "day of week",
    names: {
      0: "Sunday",
      1: "Monday",
      2: "Tuesday",
      3: "Wednesday",
      4: "Thursday",
      5: "Friday",
      6: "Saturday",
    },
  },
];

const MONTH_ALIASES: Record<string, number> = {
  jan: 1,
  feb: 2,
  mar: 3,
  apr: 4,
  may: 5,
  jun: 6,
  jul: 7,
  aug: 8,
  sep: 9,
  oct: 10,
  nov: 11,
  dec: 12,
};

const DOW_ALIASES: Record<string, number> = {
  sun: 0,
  mon: 1,
  tue: 2,
  wed: 3,
  thu: 4,
  fri: 5,
  sat: 6,
};

function resolveValue(
  raw: string,
  aliases: Record<string, number>,
  min: number,
  max: number,
): number {
  const key = raw.toLowerCase();
  const n = aliases[key] ?? Number(raw);
  if (!Number.isInteger(n) || n < min || n > max) {
    throw new Error(`Value "${raw}" out of range ${min}–${max}`);
  }
  return n;
}

function expandToken(
  token: string,
  min: number,
  max: number,
  aliases: Record<string, number>,
): number[] {
  const [rangePart, stepPart] = token.split("/");
  const step = stepPart ? Number(stepPart) : 1;
  if (!Number.isInteger(step) || step < 1) {
    throw new Error(`Invalid step in "${token}"`);
  }

  let start = min;
  let end = max;

  if (rangePart !== "*") {
    if (rangePart.includes("-")) {
      const [a, b] = rangePart.split("-");
      start = resolveValue(a, aliases, min, max);
      end = resolveValue(b, aliases, min, max);
    } else {
      start = end = resolveValue(rangePart, aliases, min, max);
    }
  }

  if (start > end) throw new Error(`Invalid range in "${token}"`);

  const out: number[] = [];
  for (let i = start; i <= end; i += step) out.push(i);
  return out;
}

function parseField(
  raw: string,
  meta: (typeof FIELD_META)[number],
): CronField {
  const aliases =
    meta.name === "month"
      ? MONTH_ALIASES
      : meta.name === "dayOfWeek"
        ? DOW_ALIASES
        : {};

  // Accept 7 as Sunday for day-of-week, then normalize to 0.
  const max = meta.name === "dayOfWeek" ? 7 : meta.max;
  const parts = raw.split(",");
  const values = new Set<number>();
  for (const part of parts) {
    for (const v of expandToken(part, meta.min, max, aliases)) {
      values.add(meta.name === "dayOfWeek" && v === 7 ? 0 : v);
    }
  }

  const sorted = [...values].sort((a, b) => a - b);
  return {
    name: meta.name,
    raw,
    values: sorted,
    description: describeField(sorted, meta),
  };
}

function describeField(
  values: number[],
  meta: (typeof FIELD_META)[number],
): string {
  const span = meta.max - meta.min + 1;
  if (values.length === span) return `every ${meta.label}`;
  if (values.length === 1) {
    const v = values[0];
    const named = meta.names?.[v];
    return named ?? String(v);
  }

  // Detect step of every N
  if (values.length > 1) {
    const step = values[1] - values[0];
    const isUniform =
      values.every((v, i) => i === 0 || v - values[i - 1] === step) &&
      values[0] === meta.min &&
      values[values.length - 1] + step > meta.max;
    if (isUniform && step > 1) {
      return `every ${step} ${meta.label}s`;
    }
  }

  const labels = values.map((v) => meta.names?.[v] ?? String(v));
  if (labels.length <= 6) return labels.join(", ");
  return `${labels.slice(0, 5).join(", ")}… (${labels.length} values)`;
}

function summarize(fields: CronField[]): string {
  const [minute, hour, dom, month, dow] = fields;
  const everyMin = minute.values.length === 60;
  const everyHour = hour.values.length === 24;
  const everyDom = dom.values.length === 31;
  const everyMonth = month.values.length === 12;
  const everyDow = dow.values.length === 7;

  if (everyMin && everyHour && everyDom && everyMonth && everyDow) {
    return "Every minute";
  }
  if (
    minute.values.length === 1 &&
    minute.values[0] === 0 &&
    everyHour &&
    everyDom &&
    everyMonth &&
    everyDow
  ) {
    return "At the start of every hour";
  }
  if (
    minute.values.length === 1 &&
    hour.values.length === 1 &&
    everyDom &&
    everyMonth &&
    everyDow
  ) {
    return `Every day at ${pad(hour.values[0])}:${pad(minute.values[0])}`;
  }
  if (
    minute.values.length === 1 &&
    hour.values.length === 1 &&
    everyDom &&
    everyMonth &&
    !everyDow
  ) {
    return `At ${pad(hour.values[0])}:${pad(minute.values[0])} on ${dow.description}`;
  }

  const parts: string[] = [];
  if (!everyMin) parts.push(`at minute ${minute.description}`);
  else parts.push("every minute");
  if (!everyHour) parts.push(`past hour ${hour.description}`);
  if (!everyDom) parts.push(`on day-of-month ${dom.description}`);
  if (!everyMonth) parts.push(`in ${month.description}`);
  if (!everyDow) parts.push(`on ${dow.description}`);
  return parts.join(", ");
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function matches(date: Date, fields: CronField[]): boolean {
  const [minute, hour, dom, month, dow] = fields;
  if (!minute.values.includes(date.getUTCMinutes())) return false;
  if (!hour.values.includes(date.getUTCHours())) return false;
  if (!month.values.includes(date.getUTCMonth() + 1)) return false;

  const domMatch = dom.values.includes(date.getUTCDate());
  const dowMatch = dow.values.includes(date.getUTCDay());
  const everyDom = dom.values.length === 31;
  const everyDow = dow.values.length === 7;

  // Standard cron: if both DOM and DOW are restricted, either may match (OR).
  if (!everyDom && !everyDow) return domMatch || dowMatch;
  if (!everyDom) return domMatch;
  if (!everyDow) return dowMatch;
  return true;
}

/** Next UTC occurrences, starting after `from`. */
export function nextOccurrences(
  fields: CronField[],
  count: number,
  from: Date = new Date(),
): Date[] {
  const out: Date[] = [];
  const cursor = new Date(from.getTime());
  cursor.setUTCSeconds(0, 0);
  cursor.setUTCMinutes(cursor.getUTCMinutes() + 1);

  // Cap search to ~2 years of minutes
  const limit = 2 * 365 * 24 * 60;
  for (let i = 0; i < limit && out.length < count; i += 1) {
    if (matches(cursor, fields)) {
      out.push(new Date(cursor.getTime()));
    }
    cursor.setUTCMinutes(cursor.getUTCMinutes() + 1);
  }
  return out;
}

export function explainCron(
  expression: string,
  options: { from?: Date; nextCount?: number } = {},
): CronExplainResult {
  const trimmed = expression.trim().replace(/\s+/g, " ");
  if (!trimmed) {
    return { ok: false, error: "Enter a cron expression (5 fields)." };
  }

  const parts = trimmed.split(" ");
  if (parts.length !== 5) {
    return {
      ok: false,
      error: "Expected 5 fields: minute hour day-of-month month day-of-week.",
    };
  }

  try {
    const fields = FIELD_META.map((meta, i) => parseField(parts[i], meta));
    const next = nextOccurrences(
      fields,
      options.nextCount ?? 5,
      options.from ?? new Date(),
    ).map((d) => d.toISOString());

    return {
      ok: true,
      expression: trimmed,
      fields,
      summary: summarize(fields),
      next,
    };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Invalid cron expression",
    };
  }
}
