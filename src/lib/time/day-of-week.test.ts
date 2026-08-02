import { describe, expect, it } from "vitest";
import { findDayOfWeek } from "./day-of-week";

describe("findDayOfWeek", () => {
  it("returns the correct weekday name", () => {
    const result = findDayOfWeek("2026-08-02");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.name).toBe("Sunday");
    expect(result.value.isoWeekday).toBe(7);
    expect(result.value.weekday).toBe(0);
  });

  it("reports day of year", () => {
    const result = findDayOfWeek("2026-01-01");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.dayOfYear).toBe(1);
  });

  it("rejects invalid dates", () => {
    expect(findDayOfWeek("2026-02-30").ok).toBe(false);
    expect(findDayOfWeek("bad").ok).toBe(false);
  });
});
