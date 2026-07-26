export type DateParts = { year: number; month: number; day: number };

export type AgeResult = {
  years: number;
  months: number;
  days: number;
  totalDays: number;
  totalWeeks: number;
  totalMonths: number;
  nextBirthday: DateParts;
  daysUntilBirthday: number;
};

export type AgeCalcResult =
  | { ok: true; value: AgeResult }
  | { ok: false; error: string };

const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

export function daysInMonth(year: number, month: number): number {
  if (month === 2 && isLeapYear(year)) return 29;
  return DAYS_IN_MONTH[month - 1] ?? 30;
}

export function parseDateInput(raw: string): DateParts | null {
  const trimmed = raw.trim();
  const m = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  const year = Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);
  if (month < 1 || month > 12) return null;
  if (day < 1 || day > daysInMonth(year, month)) return null;
  return { year, month, day };
}

export function toUtcDate({ year, month, day }: DateParts): Date {
  return new Date(Date.UTC(year, month - 1, day));
}

function compare(a: DateParts, b: DateParts): number {
  if (a.year !== b.year) return a.year - b.year;
  if (a.month !== b.month) return a.month - b.month;
  return a.day - b.day;
}

export function diffYmd(from: DateParts, to: DateParts): {
  years: number;
  months: number;
  days: number;
} {
  let years = to.year - from.year;
  let months = to.month - from.month;
  let days = to.day - from.day;

  if (days < 0) {
    months -= 1;
    const prevMonth = to.month === 1 ? 12 : to.month - 1;
    const prevYear = to.month === 1 ? to.year - 1 : to.year;
    days += daysInMonth(prevYear, prevMonth);
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }

  return { years, months, days };
}

export function nextBirthday(
  birth: DateParts,
  asOf: DateParts,
): { next: DateParts; daysUntil: number } {
  let next: DateParts = {
    year: asOf.year,
    month: birth.month,
    day: Math.min(birth.day, daysInMonth(asOf.year, birth.month)),
  };

  if (compare(next, asOf) <= 0) {
    next = {
      year: asOf.year + 1,
      month: birth.month,
      day: Math.min(birth.day, daysInMonth(asOf.year + 1, birth.month)),
    };
  }

  const ms =
    toUtcDate(next).getTime() - toUtcDate(asOf).getTime();
  const daysUntil = Math.round(ms / (24 * 60 * 60 * 1000));
  return { next, daysUntil };
}

export function calculateAge(
  birthInput: string,
  asOfInput?: string,
): AgeCalcResult {
  const birth = parseDateInput(birthInput);
  if (!birth) {
    return { ok: false, error: "Enter a valid birth date (YYYY-MM-DD)." };
  }

  const asOf =
    asOfInput && asOfInput.trim()
      ? parseDateInput(asOfInput)
      : (() => {
          const now = new Date();
          return {
            year: now.getFullYear(),
            month: now.getMonth() + 1,
            day: now.getDate(),
          };
        })();

  if (!asOf) {
    return { ok: false, error: "Enter a valid “as of” date (YYYY-MM-DD)." };
  }

  if (compare(birth, asOf) > 0) {
    return { ok: false, error: "Birth date cannot be after the as-of date." };
  }

  const { years, months, days } = diffYmd(birth, asOf);
  const totalDays = Math.round(
    (toUtcDate(asOf).getTime() - toUtcDate(birth).getTime()) /
      (24 * 60 * 60 * 1000),
  );
  const { next, daysUntil } = nextBirthday(birth, asOf);

  return {
    ok: true,
    value: {
      years,
      months,
      days,
      totalDays,
      totalWeeks: Math.floor(totalDays / 7),
      totalMonths: years * 12 + months,
      nextBirthday: next,
      daysUntilBirthday: daysUntil,
    },
  };
}

export function formatDateParts(d: DateParts): string {
  return `${d.year}-${String(d.month).padStart(2, "0")}-${String(d.day).padStart(2, "0")}`;
}

export function todayInputValue(): string {
  const now = new Date();
  return formatDateParts({
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    day: now.getDate(),
  });
}
