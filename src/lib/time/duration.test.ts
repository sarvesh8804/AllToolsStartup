import { describe, expect, it } from "vitest";
import {
  breakdownMs,
  durationBetween,
  formatDurationLabel,
  msToUnit,
  unitsToMs,
} from "./duration";

describe("duration", () => {
  it("breaks down milliseconds", () => {
    const d = breakdownMs(90_061_000);
    expect(d.days).toBe(1);
    expect(d.hours).toBe(1);
    expect(d.minutes).toBe(1);
    expect(d.seconds).toBe(1);
    expect(d.label).toContain("1d");
  });

  it("computes between local datetimes", () => {
    const result = durationBetween("2024-01-01T10:00", "2024-01-01T12:30");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.hours).toBe(2);
      expect(result.value.minutes).toBe(30);
      expect(result.value.absMs).toBe(2.5 * 3_600_000);
    }
  });

  it("flags reversed range", () => {
    const result = durationBetween("2024-01-02T00:00", "2024-01-01T00:00");
    expect(result.ok && result.value.endIsBeforeStart).toBe(true);
    expect(result.ok && result.value.label.startsWith("−")).toBe(true);
  });

  it("converts units", () => {
    expect(unitsToMs({ hours: 1, minutes: 30 })).toBe(5_400_000);
    expect(msToUnit(3_600_000, "hours")).toBe(1);
    expect(msToUnit(604_800_000, "weeks")).toBe(1);
  });

  it("formats labels", () => {
    expect(formatDurationLabel(0)).toBe("0s");
    expect(formatDurationLabel(500)).toBe("0s 500ms");
  });
});
