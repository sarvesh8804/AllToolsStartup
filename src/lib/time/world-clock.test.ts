import { describe, expect, it } from "vitest";
import {
  DEFAULT_WORLD_CLOCK_ZONES,
  buildWorldClock,
} from "./world-clock";

describe("buildWorldClock", () => {
  it("returns a row per zone", () => {
    const now = new Date("2024-06-15T12:00:00.000Z");
    const rows = buildWorldClock(["UTC", "Asia/Tokyo"], now);
    expect(rows).toHaveLength(2);
    expect(rows[0].zone.id).toBe("UTC");
    expect(rows[0].isoLocal).toContain("2024-06-15T12:00");
    expect(rows[1].zone.id).toBe("Asia/Tokyo");
    expect(rows[1].isoLocal).toMatch(/T21:00/);
  });

  it("has sensible defaults", () => {
    expect(DEFAULT_WORLD_CLOCK_ZONES.length).toBeGreaterThan(5);
    expect(DEFAULT_WORLD_CLOCK_ZONES).toContain("UTC");
  });
});
