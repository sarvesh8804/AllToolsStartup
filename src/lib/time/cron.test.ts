import { describe, expect, it } from "vitest";
import { explainCron } from "./cron";

describe("explainCron", () => {
  it("explains every minute", () => {
    const result = explainCron("* * * * *");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.summary).toBe("Every minute");
      expect(result.fields).toHaveLength(5);
    }
  });

  it("explains daily at a fixed time", () => {
    const result = explainCron("30 9 * * *");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.summary).toBe("Every day at 09:30");
    }
  });

  it("explains weekdays at noon", () => {
    const result = explainCron("0 12 * * 1-5");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.summary).toContain("12:00");
      expect(result.fields[4].description).toContain("Monday");
    }
  });

  it("supports steps and aliases", () => {
    const result = explainCron("*/15 * * JAN MON");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.fields[0].description).toMatch(/every 15/i);
      expect(result.fields[3].values).toEqual([1]);
      expect(result.fields[4].values).toEqual([1]);
    }
  });

  it("returns next UTC occurrences", () => {
    const from = new Date("2024-01-01T00:00:00.000Z");
    const result = explainCron("0 * * * *", { from, nextCount: 3 });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.next).toEqual([
        "2024-01-01T01:00:00.000Z",
        "2024-01-01T02:00:00.000Z",
        "2024-01-01T03:00:00.000Z",
      ]);
    }
  });

  it("rejects wrong field count", () => {
    expect(explainCron("* * *").ok).toBe(false);
  });

  it("rejects out-of-range values", () => {
    expect(explainCron("99 * * * *").ok).toBe(false);
  });
});
