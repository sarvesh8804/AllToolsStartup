import {
  parseDateInput,
  toUtcDate,
  type DateParts,
} from "@/lib/time/age";

export type DayOfWeekInfo = {
  date: DateParts;
  formatted: string;
  /** Sunday = 0 … Saturday = 6 (JavaScript convention). */
  weekday: number;
  /** Monday = 1 … Sunday = 7 (ISO 8601). */
  isoWeekday: number;
  name: string;
  shortName: string;
  dayOfYear: number;
  isLeapYear: boolean;
};

export type DayOfWeekResult =
  | { ok: true; value: DayOfWeekInfo }
  | { ok: false; error: string };

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

const DAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

function formatDateParts(parts: DateParts): string {
  return `${parts.year}-${String(parts.month).padStart(2, "0")}-${String(parts.day).padStart(2, "0")}`;
}

function dayOfYear(parts: DateParts): number {
  const date = toUtcDate(parts);
  const start = Date.UTC(parts.year, 0, 0);
  const diff = date.getTime() - start;
  return Math.floor(diff / 86_400_000);
}

function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/** Return the day of week for a YYYY-MM-DD date. */
export function findDayOfWeek(dateInput: string): DayOfWeekResult {
  const parts = parseDateInput(dateInput);
  if (!parts) {
    return { ok: false, error: "Enter a valid date (YYYY-MM-DD)." };
  }

  const date = toUtcDate(parts);
  const weekday = date.getUTCDay();
  const isoWeekday = weekday === 0 ? 7 : weekday;

  return {
    ok: true,
    value: {
      date: parts,
      formatted: formatDateParts(parts),
      weekday,
      isoWeekday,
      name: DAY_NAMES[weekday]!,
      shortName: DAY_SHORT[weekday]!,
      dayOfYear: dayOfYear(parts),
      isLeapYear: isLeapYear(parts.year),
    },
  };
}

export function todayInputValue(now = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
