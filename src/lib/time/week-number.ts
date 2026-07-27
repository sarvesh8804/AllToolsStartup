import {
  daysInMonth,
  parseDateInput,
  toUtcDate,
  type DateParts,
} from "@/lib/time/age";

export type WeekSystem = "iso" | "us";

export type WeekNumberInfo = {
  system: WeekSystem;
  /** Calendar year of the input date. */
  calendarYear: number;
  /** Week-numbering year (ISO may differ near year boundaries). */
  weekYear: number;
  week: number;
  /** 1=Monday … 7=Sunday for ISO; 0=Sunday … 6=Saturday for US. */
  weekday: number;
  weekdayName: string;
  /** Inclusive week start (UTC date parts). */
  weekStart: DateParts;
  /** Inclusive week end. */
  weekEnd: DateParts;
  isoLabel: string;
};

export type WeekNumberResult =
  | { ok: true; value: WeekNumberInfo }
  | { ok: false; error: string };

export type WeekLookupResult =
  | {
      ok: true;
      weekYear: number;
      week: number;
      system: WeekSystem;
      weekStart: DateParts;
      weekEnd: DateParts;
    }
  | { ok: false; error: string };

const ISO_DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const US_DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function utcParts(d: Date): DateParts {
  return {
    year: d.getUTCFullYear(),
    month: d.getUTCMonth() + 1,
    day: d.getUTCDate(),
  };
}

/** ISO weekday: Monday=1 … Sunday=7 */
function isoWeekday(d: Date): number {
  const day = d.getUTCDay(); // Sun=0
  return day === 0 ? 7 : day;
}

/**
 * ISO 8601 week date.
 * Week 1 is the week with the year's first Thursday.
 */
export function isoWeekNumber(parts: DateParts): {
  weekYear: number;
  week: number;
  weekday: number;
} {
  const date = toUtcDate(parts);
  const weekday = isoWeekday(date);

  // Thursday of this week
  const thursday = new Date(date);
  thursday.setUTCDate(date.getUTCDate() + (4 - weekday));

  const weekYear = thursday.getUTCFullYear();
  const jan4 = new Date(Date.UTC(weekYear, 0, 4));
  const jan4Weekday = isoWeekday(jan4);
  const week1Monday = new Date(jan4);
  week1Monday.setUTCDate(jan4.getUTCDate() - (jan4Weekday - 1));

  const diffDays = Math.round(
    (date.getTime() - week1Monday.getTime()) / 86_400_000,
  );
  const week = Math.floor(diffDays / 7) + 1;

  return { weekYear, week, weekday };
}

/** US week: Sunday start; week 1 contains January 1. */
export function usWeekNumber(parts: DateParts): {
  weekYear: number;
  week: number;
  weekday: number;
} {
  const date = toUtcDate(parts);
  const weekYear = date.getUTCFullYear();
  const weekday = date.getUTCDay(); // Sun=0
  const jan1 = new Date(Date.UTC(weekYear, 0, 1));
  const start = new Date(jan1);
  start.setUTCDate(jan1.getUTCDate() - jan1.getUTCDay()); // Sunday on/before Jan 1

  const diffDays = Math.round(
    (date.getTime() - start.getTime()) / 86_400_000,
  );
  const week = Math.floor(diffDays / 7) + 1;
  return { weekYear, week, weekday };
}

export function weekRange(
  weekYear: number,
  week: number,
  system: WeekSystem,
): { start: DateParts; end: DateParts } | null {
  if (!Number.isFinite(weekYear) || weekYear < 1 || weekYear > 9999) {
    return null;
  }
  if (!Number.isFinite(week) || week < 1 || week > 53) return null;

  if (system === "iso") {
    const jan4 = new Date(Date.UTC(weekYear, 0, 4));
    const jan4Weekday = isoWeekday(jan4);
    const week1Monday = new Date(jan4);
    week1Monday.setUTCDate(jan4.getUTCDate() - (jan4Weekday - 1));
    const start = new Date(week1Monday);
    start.setUTCDate(week1Monday.getUTCDate() + (week - 1) * 7);
    const end = new Date(start);
    end.setUTCDate(start.getUTCDate() + 6);
    // Validate week exists in this week-year (week 53 edge)
    const check = isoWeekNumber(utcParts(start));
    if (check.weekYear !== weekYear || check.week !== week) return null;
    return { start: utcParts(start), end: utcParts(end) };
  }

  const jan1 = new Date(Date.UTC(weekYear, 0, 1));
  const start = new Date(jan1);
  start.setUTCDate(jan1.getUTCDate() - jan1.getUTCDay() + (week - 1) * 7);
  const end = new Date(start);
  end.setUTCDate(start.getUTCDate() + 6);

  // Week is valid if any day in the range belongs to this US week-year numbering
  let valid = false;
  for (let i = 0; i < 7; i += 1) {
    const d = new Date(start);
    d.setUTCDate(start.getUTCDate() + i);
    const check = usWeekNumber(utcParts(d));
    if (check.weekYear === weekYear && check.week === week) {
      valid = true;
      break;
    }
  }
  if (!valid) return null;
  return { start: utcParts(start), end: utcParts(end) };
}

export function formatDateParts(parts: DateParts): string {
  return `${parts.year}-${String(parts.month).padStart(2, "0")}-${String(parts.day).padStart(2, "0")}`;
}

/** Compute week number info for a YYYY-MM-DD date. */
export function calculateWeekNumber(
  dateInput: string,
  system: WeekSystem = "iso",
): WeekNumberResult {
  const parts = parseDateInput(dateInput);
  if (!parts) {
    return { ok: false, error: "Enter a valid date (YYYY-MM-DD)." };
  }

  if (system === "iso") {
    const { weekYear, week, weekday } = isoWeekNumber(parts);
    const range = weekRange(weekYear, week, "iso");
    if (!range) {
      return { ok: false, error: "Could not resolve ISO week range." };
    }
    return {
      ok: true,
      value: {
        system,
        calendarYear: parts.year,
        weekYear,
        week,
        weekday,
        weekdayName: ISO_DAYS[weekday - 1]!,
        weekStart: range.start,
        weekEnd: range.end,
        isoLabel: `${weekYear}-W${String(week).padStart(2, "0")}`,
      },
    };
  }

  const { weekYear, week, weekday } = usWeekNumber(parts);
  const range = weekRange(weekYear, week, "us");
  if (!range) {
    return { ok: false, error: "Could not resolve US week range." };
  }
  return {
    ok: true,
    value: {
      system,
      calendarYear: parts.year,
      weekYear,
      week,
      weekday,
      weekdayName: US_DAYS[weekday]!,
      weekStart: range.start,
      weekEnd: range.end,
      isoLabel: `${weekYear}-W${String(week).padStart(2, "0")} (US)`,
    },
  };
}

/** Look up the date range for a week-year + week number. */
export function lookupWeek(
  weekYearInput: string | number,
  weekInput: string | number,
  system: WeekSystem = "iso",
): WeekLookupResult {
  const weekYear = Number(weekYearInput);
  const week = Number(weekInput);
  if (!Number.isInteger(weekYear) || weekYear < 1 || weekYear > 9999) {
    return { ok: false, error: "Enter a valid week year." };
  }
  if (!Number.isInteger(week) || week < 1 || week > 53) {
    return { ok: false, error: "Week must be an integer from 1 to 53." };
  }
  const range = weekRange(weekYear, week, system);
  if (!range) {
    return {
      ok: false,
      error: `Week ${week} does not exist in ${weekYear} for this system.`,
    };
  }
  return {
    ok: true,
    weekYear,
    week,
    system,
    weekStart: range.start,
    weekEnd: range.end,
  };
}

export function todayInputValue(now = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// re-export for callers that need month length checks
export { daysInMonth };
