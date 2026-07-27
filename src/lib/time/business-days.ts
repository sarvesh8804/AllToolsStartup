import {
  formatDateParts,
  parseDateInput,
  toUtcDate,
  type DateParts,
} from "@/lib/time/age";
import { formatDatePartsIso } from "@/lib/time/date-shift";

export type WeekendDays = {
  /** Sunday = 0 … Saturday = 6 (UTC getUTCDay). */
  days: ReadonlySet<number>;
};

export const DEFAULT_WEEKEND: WeekendDays = {
  days: new Set([0, 6]),
};

export type BusinessDaysOptions = {
  /** Extra non-working dates as YYYY-MM-DD (holidays). */
  holidays?: string[];
  weekend?: WeekendDays;
  /**
   * When counting between dates:
   * - exclusive: count weekdays strictly after start and on/before end (common “network days”)
   * - inclusive: count weekdays on start and end if they are business days
   * Default: exclusive (Excel NETWORKDAYS-style when start≠end).
   */
  inclusive?: boolean;
};

function holidaySet(holidays: string[] | undefined): Set<string> {
  const set = new Set<string>();
  for (const h of holidays ?? []) {
    const p = parseDateInput(h);
    if (p) set.add(formatDatePartsIso(p));
  }
  return set;
}

export function isBusinessDay(
  parts: DateParts,
  options: BusinessDaysOptions = {},
): boolean {
  const weekend = options.weekend ?? DEFAULT_WEEKEND;
  const dow = toUtcDate(parts).getUTCDay();
  if (weekend.days.has(dow)) return false;
  if (holidaySet(options.holidays).has(formatDatePartsIso(parts))) return false;
  return true;
}

function addCalendarDays(parts: DateParts, delta: number): DateParts {
  const d = toUtcDate(parts);
  d.setUTCDate(d.getUTCDate() + delta);
  return {
    year: d.getUTCFullYear(),
    month: d.getUTCMonth() + 1,
    day: d.getUTCDate(),
  };
}

export type CountBusinessDaysResult =
  | {
      ok: true;
      start: DateParts;
      end: DateParts;
      businessDays: number;
      calendarDays: number;
      weekendDays: number;
      holidayDays: number;
      inclusive: boolean;
    }
  | { ok: false; error: string };

/**
 * Count business days between two dates.
 * Default exclusive: days after `start` through `end` (Excel NETWORKDAYS).
 */
export function countBusinessDays(
  startInput: string,
  endInput: string,
  options: BusinessDaysOptions = {},
): CountBusinessDaysResult {
  const start = parseDateInput(startInput);
  const end = parseDateInput(endInput);
  if (!start) {
    return { ok: false, error: "Enter a valid start date (YYYY-MM-DD)." };
  }
  if (!end) {
    return { ok: false, error: "Enter a valid end date (YYYY-MM-DD)." };
  }

  const inclusive = options.inclusive ?? false;
  const weekend = options.weekend ?? DEFAULT_WEEKEND;
  const holidays = holidaySet(options.holidays);

  const startMs = toUtcDate(start).getTime();
  const endMs = toUtcDate(end).getTime();
  const earlier = startMs <= endMs ? start : end;
  const later = startMs <= endMs ? end : start;
  const sign = startMs <= endMs ? 1 : -1;

  let businessDays = 0;
  let weekendDays = 0;
  let holidayDays = 0;
  let calendarDays = 0;

  let cursor = inclusive ? earlier : addCalendarDays(earlier, 1);
  const last = later;

  while (
    toUtcDate(cursor).getTime() <= toUtcDate(last).getTime()
  ) {
    calendarDays += 1;
    const iso = formatDatePartsIso(cursor);
    const dow = toUtcDate(cursor).getUTCDay();
    if (weekend.days.has(dow)) {
      weekendDays += 1;
    } else if (holidays.has(iso)) {
      holidayDays += 1;
    } else {
      businessDays += 1;
    }
    cursor = addCalendarDays(cursor, 1);
  }

  return {
    ok: true,
    start,
    end,
    businessDays: businessDays * sign,
    calendarDays,
    weekendDays,
    holidayDays,
    inclusive,
  };
}

export type AddBusinessDaysResult =
  | {
      ok: true;
      start: DateParts;
      result: DateParts;
      iso: string;
      display: string;
      businessDaysAdded: number;
      calendarDaysSpanned: number;
    }
  | { ok: false; error: string };

/**
 * Add (or subtract with negative n) N business days to a start date.
 * The start date itself is not counted; the result is the Nth following business day.
 */
export function addBusinessDays(
  startInput: string,
  amount: number,
  options: BusinessDaysOptions = {},
): AddBusinessDaysResult {
  const start = parseDateInput(startInput);
  if (!start) {
    return { ok: false, error: "Enter a valid start date (YYYY-MM-DD)." };
  }
  if (!Number.isFinite(amount) || !Number.isInteger(amount)) {
    return { ok: false, error: "Enter a whole number of business days." };
  }
  if (amount === 0) {
    return {
      ok: true,
      start,
      result: start,
      iso: formatDatePartsIso(start),
      display: formatDateParts(start),
      businessDaysAdded: 0,
      calendarDaysSpanned: 0,
    };
  }

  const step = amount > 0 ? 1 : -1;
  let remaining = Math.abs(amount);
  let cursor = start;
  let spanned = 0;

  while (remaining > 0) {
    cursor = addCalendarDays(cursor, step);
    spanned += 1;
    if (isBusinessDay(cursor, options)) remaining -= 1;
  }

  return {
    ok: true,
    start,
    result: cursor,
    iso: formatDatePartsIso(cursor),
    display: formatDateParts(cursor),
    businessDaysAdded: amount,
    calendarDaysSpanned: spanned,
  };
}
