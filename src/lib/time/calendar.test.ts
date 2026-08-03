import { describe, expect, it } from "vitest";
import { buildMonthCalendar, DEFAULT_CALENDAR } from "./calendar";

describe("buildMonthCalendar", () => {
  it("builds a month grid", () => {
    const result = buildMonthCalendar({
      year: DEFAULT_CALENDAR.year,
      month: DEFAULT_CALENDAR.month,
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.weeks.length).toBeGreaterThan(4);
    expect(result.html).toContain("<table>");
  });
});
