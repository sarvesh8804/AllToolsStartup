import { describe, expect, it } from "vitest";
import { planMeeting, suggestMeetingSlots } from "./meeting-planner";

describe("planMeeting", () => {
  it("converts a host time across zones", () => {
    const result = planMeeting({
      dateTimeLocal: "2024-06-15T10:00",
      hostTimeZone: "America/New_York",
      durationMinutes: 60,
      participants: [
        { id: "1", label: "NY", timeZone: "America/New_York" },
        { id: "2", label: "London", timeZone: "Europe/London" },
        { id: "3", label: "Tokyo", timeZone: "Asia/Tokyo" },
      ],
      workStartHour: 9,
      workEndHour: 17,
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.rows).toHaveLength(3);
      expect(result.rows[0].startIsoLocal).toContain("2024-06-15T10:00");
      expect(result.rows[1].startIsoLocal).toMatch(/T15:00/);
    }
  });

  it("rejects short duration", () => {
    expect(
      planMeeting({
        dateTimeLocal: "2024-06-15T10:00",
        hostTimeZone: "UTC",
        durationMinutes: 5,
        participants: [{ id: "1", label: "UTC", timeZone: "UTC" }],
      }).ok,
    ).toBe(false);
  });
});

describe("suggestMeetingSlots", () => {
  it("returns overlapping work-hour candidates", () => {
    const slots = suggestMeetingSlots({
      date: "2024-06-18",
      hostTimeZone: "UTC",
      durationMinutes: 30,
      stepMinutes: 60,
      participants: [
        { id: "1", label: "London", timeZone: "Europe/London" },
        { id: "2", label: "New York", timeZone: "America/New_York" },
      ],
      workStartHour: 9,
      workEndHour: 17,
    });
    expect(slots.length).toBeGreaterThan(0);
    expect(slots.some((s) => s.allWithinWorkHours)).toBe(true);
  });
});
