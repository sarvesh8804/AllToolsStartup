import { describe, expect, it } from "vitest";
import {
  calculateAge,
  daysInMonth,
  diffYmd,
  isLeapYear,
  nextBirthday,
  parseDateInput,
} from "./age";

describe("leap / month length", () => {
  it("detects leap years", () => {
    expect(isLeapYear(2024)).toBe(true);
    expect(isLeapYear(1900)).toBe(false);
    expect(isLeapYear(2000)).toBe(true);
  });

  it("returns days in month", () => {
    expect(daysInMonth(2023, 2)).toBe(28);
    expect(daysInMonth(2024, 2)).toBe(29);
  });
});

describe("parseDateInput", () => {
  it("parses ISO dates", () => {
    expect(parseDateInput("2000-02-29")).toEqual({
      year: 2000,
      month: 2,
      day: 29,
    });
  });

  it("rejects invalid calendar dates", () => {
    expect(parseDateInput("2023-02-29")).toBeNull();
    expect(parseDateInput("2023-13-01")).toBeNull();
  });
});

describe("diffYmd", () => {
  it("computes exact age components", () => {
    expect(
      diffYmd(
        { year: 2000, month: 1, day: 15 },
        { year: 2025, month: 3, day: 20 },
      ),
    ).toEqual({ years: 25, months: 2, days: 5 });
  });

  it("borrows months when day underflows", () => {
    expect(
      diffYmd(
        { year: 2000, month: 5, day: 20 },
        { year: 2001, month: 5, day: 10 },
      ),
    ).toEqual({ years: 0, months: 11, days: 20 });
  });
});

describe("nextBirthday", () => {
  it("rolls to next year when birthday already passed", () => {
    const result = nextBirthday(
      { year: 1990, month: 3, day: 1 },
      { year: 2025, month: 6, day: 1 },
    );
    expect(result.next).toEqual({ year: 2026, month: 3, day: 1 });
    expect(result.daysUntil).toBeGreaterThan(0);
  });
});

describe("calculateAge", () => {
  it("returns a full age breakdown", () => {
    const result = calculateAge("1990-06-15", "2020-06-15");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.years).toBe(30);
      expect(result.value.months).toBe(0);
      expect(result.value.days).toBe(0);
      expect(result.value.totalDays).toBeGreaterThan(10000);
    }
  });

  it("rejects future birth dates", () => {
    expect(calculateAge("2099-01-01", "2020-01-01").ok).toBe(false);
  });
});
