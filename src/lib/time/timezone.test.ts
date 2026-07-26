import { describe, expect, it } from "vitest";
import {
  convertTimezones,
  formatInTimeZone,
  getTimeZoneOffsetMs,
  parseDateTimeLocal,
  zonedTimeToUtc,
} from "./timezone";

describe("parseDateTimeLocal", () => {
  it("parses datetime-local values", () => {
    expect(parseDateTimeLocal("2024-01-15T14:30")).toEqual({
      year: 2024,
      month: 1,
      day: 15,
      hour: 14,
      minute: 30,
      second: 0,
    });
  });

  it("rejects garbage", () => {
    expect(parseDateTimeLocal("nope")).toBeNull();
  });
});

describe("zonedTimeToUtc + formatInTimeZone", () => {
  it("round-trips a UTC wall time", () => {
    const utc = zonedTimeToUtc(
      { year: 2024, month: 6, day: 1, hour: 12, minute: 0, second: 0 },
      "UTC",
    );
    expect(utc.toISOString()).toBe("2024-06-01T12:00:00.000Z");
    expect(formatInTimeZone(utc, "UTC").isoLocal).toBe("2024-06-01T12:00:00");
  });

  it("converts New York winter time to UTC", () => {
    // 2024-01-15 12:00 EST = UTC-5 → 17:00 UTC
    const utc = zonedTimeToUtc(
      { year: 2024, month: 1, day: 15, hour: 12, minute: 0, second: 0 },
      "America/New_York",
    );
    expect(utc.toISOString()).toBe("2024-01-15T17:00:00.000Z");
  });

  it("converts New York summer time to UTC", () => {
    // 2024-07-15 12:00 EDT = UTC-4 → 16:00 UTC
    const utc = zonedTimeToUtc(
      { year: 2024, month: 7, day: 15, hour: 12, minute: 0, second: 0 },
      "America/New_York",
    );
    expect(utc.toISOString()).toBe("2024-07-15T16:00:00.000Z");
  });
});

describe("getTimeZoneOffsetMs", () => {
  it("is zero for UTC", () => {
    expect(getTimeZoneOffsetMs(new Date("2024-01-01T00:00:00Z"), "UTC")).toBe(
      0,
    );
  });
});

describe("convertTimezones", () => {
  it("builds rows for target zones", () => {
    const result = convertTimezones("2024-01-15T12:00", "UTC", [
      "UTC",
      "Asia/Kolkata",
    ]);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.rows).toHaveLength(2);
      expect(result.rows[0].isoLocal).toBe("2024-01-15T12:00:00");
      // IST is UTC+5:30
      expect(result.rows[1].isoLocal).toBe("2024-01-15T17:30:00");
    }
  });

  it("rejects bad input", () => {
    expect(convertTimezones("bad", "UTC").ok).toBe(false);
  });
});
