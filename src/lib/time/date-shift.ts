import {
  daysInMonth,
  parseDateInput,
  toUtcDate,
  type DateParts,
} from "@/lib/time/age";

export type DateShiftUnit = "days" | "weeks" | "months" | "years";

export type DateShiftInput = {
  date: string;
  /** Magnitude; direction comes from operation. */
  amount: number;
  unit: DateShiftUnit;
  operation: "add" | "subtract";
};

export type DateShiftResult =
  | {
      ok: true;
      start: DateParts;
      result: DateParts;
      iso: string;
      display: string;
      signedAmount: number;
      unit: DateShiftUnit;
    }
  | { ok: false; error: string };

export function formatDatePartsIso(parts: DateParts): string {
  return `${parts.year}-${String(parts.month).padStart(2, "0")}-${String(parts.day).padStart(2, "0")}`;
}

function clampDay(year: number, month: number, day: number): number {
  return Math.min(day, daysInMonth(year, month));
}

/** Add calendar months, clamping day into the target month (Jan 31 + 1 month → Feb 28/29). */
export function addMonths(parts: DateParts, months: number): DateParts {
  const totalMonths = parts.year * 12 + (parts.month - 1) + months;
  const year = Math.floor(totalMonths / 12);
  const month = ((totalMonths % 12) + 12) % 12 + 1;
  const day = clampDay(year, month, parts.day);
  return { year, month, day };
}

export function addYears(parts: DateParts, years: number): DateParts {
  const year = parts.year + years;
  const day = clampDay(year, parts.month, parts.day);
  return { year, month: parts.month, day };
}

export function addDays(parts: DateParts, days: number): DateParts {
  const d = toUtcDate(parts);
  d.setUTCDate(d.getUTCDate() + days);
  return {
    year: d.getUTCFullYear(),
    month: d.getUTCMonth() + 1,
    day: d.getUTCDate(),
  };
}

export function shiftDate(input: DateShiftInput): DateShiftResult {
  const start = parseDateInput(input.date);
  if (!start) {
    return { ok: false, error: "Enter a valid date (YYYY-MM-DD)." };
  }

  const amount = Math.trunc(input.amount);
  if (!Number.isFinite(amount) || amount < 0) {
    return { ok: false, error: "Enter a non-negative whole number amount." };
  }
  if (amount > 100000) {
    return { ok: false, error: "Amount is too large." };
  }

  const signedAmount = input.operation === "subtract" ? -amount : amount;

  let result: DateParts;
  switch (input.unit) {
    case "days":
      result = addDays(start, signedAmount);
      break;
    case "weeks":
      result = addDays(start, signedAmount * 7);
      break;
    case "months":
      result = addMonths(start, signedAmount);
      break;
    case "years":
      result = addYears(start, signedAmount);
      break;
  }

  const iso = formatDatePartsIso(result);
  const display = new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(toUtcDate(result));

  return {
    ok: true,
    start,
    result,
    iso,
    display,
    signedAmount,
    unit: input.unit,
  };
}
