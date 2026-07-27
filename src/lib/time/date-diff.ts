import {
  diffYmd,
  parseDateInput,
  toUtcDate,
  type DateParts,
} from "@/lib/time/age";

export type DateDifference = {
  start: DateParts;
  end: DateParts;
  earlier: DateParts;
  later: DateParts;
  /** end − start in whole days (negative if end is before start). */
  signedDays: number;
  absoluteDays: number;
  years: number;
  months: number;
  days: number;
  weeks: number;
  weekRemainderDays: number;
  hours: number;
  minutes: number;
  seconds: number;
  endIsBeforeStart: boolean;
};

export type DateDifferenceResult =
  | { ok: true; value: DateDifference }
  | { ok: false; error: string };

/**
 * Calendar + absolute duration between two YYYY-MM-DD dates (UTC midnight).
 */
export function calculateDateDifference(
  startInput: string,
  endInput: string,
): DateDifferenceResult {
  const start = parseDateInput(startInput);
  const end = parseDateInput(endInput);

  if (!start) {
    return { ok: false, error: "Enter a valid start date (YYYY-MM-DD)." };
  }
  if (!end) {
    return { ok: false, error: "Enter a valid end date (YYYY-MM-DD)." };
  }

  const startMs = toUtcDate(start).getTime();
  const endMs = toUtcDate(end).getTime();
  const signedDays = Math.round((endMs - startMs) / (24 * 60 * 60 * 1000));
  const absoluteDays = Math.abs(signedDays);
  const endIsBeforeStart = signedDays < 0;

  const earlier = endIsBeforeStart ? end : start;
  const later = endIsBeforeStart ? start : end;
  const { years, months, days } = diffYmd(earlier, later);

  const weeks = Math.floor(absoluteDays / 7);
  const weekRemainderDays = absoluteDays % 7;

  return {
    ok: true,
    value: {
      start,
      end,
      earlier,
      later,
      signedDays,
      absoluteDays,
      years,
      months,
      days,
      weeks,
      weekRemainderDays,
      hours: absoluteDays * 24,
      minutes: absoluteDays * 24 * 60,
      seconds: absoluteDays * 24 * 60 * 60,
      endIsBeforeStart,
    },
  };
}
