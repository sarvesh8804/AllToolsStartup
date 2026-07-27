import { describe, expect, it } from "vitest";
import {
  calculateWeekNumber,
  isoWeekNumber,
  lookupWeek,
  usWeekNumber,
} from "./week-number";

describe("isoWeekNumber", () => {
  it("matches known ISO weeks", () => {
    // 2024-01-01 is Monday → ISO week 1 of 2024
    expect(isoWeekNumber({ year: 2024, month: 1, day: 1 })).toEqual({
      weekYear: 2024,
      week: 1,
      weekday: 1,
    });
    // 2021-01-01 is Friday → ISO week 53 of 2020
    expect(isoWeekNumber({ year: 2021, month: 1, day: 1 })).toEqual({
      weekYear: 2020,
      week: 53,
      weekday: 5,
    });
  });
});

describe("usWeekNumber", () => {
  it("puts Jan 1 in week 1", () => {
    const r = usWeekNumber({ year: 2024, month: 1, day: 1 });
    expect(r.weekYear).toBe(2024);
    expect(r.week).toBe(1);
  });
});

describe("calculateWeekNumber", () => {
  it("returns ISO label and range", () => {
    const result = calculateWeekNumber("2024-03-15", "iso");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.week).toBe(11);
    expect(result.value.isoLabel).toBe("2024-W11");
    expect(result.value.weekdayName).toBe("Friday");
  });

  it("rejects bad dates", () => {
    expect(calculateWeekNumber("nope").ok).toBe(false);
  });
});

describe("lookupWeek", () => {
  it("resolves ISO week range", () => {
    const result = lookupWeek(2024, 1, "iso");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.weekStart).toEqual({ year: 2024, month: 1, day: 1 });
    expect(result.weekEnd).toEqual({ year: 2024, month: 1, day: 7 });
  });

  it("rejects impossible week 53", () => {
    // 2024 has 52 ISO weeks (no W53)
    const result = lookupWeek(2024, 53, "iso");
    expect(result.ok).toBe(false);
  });
});
