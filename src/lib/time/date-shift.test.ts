import { describe, expect, it } from "vitest";
import { addMonths, shiftDate } from "./date-shift";

describe("shiftDate", () => {
  it("adds days", () => {
    const result = shiftDate({
      date: "2024-01-15",
      amount: 10,
      unit: "days",
      operation: "add",
    });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.iso).toBe("2024-01-25");
  });

  it("subtracts weeks", () => {
    const result = shiftDate({
      date: "2024-02-14",
      amount: 2,
      unit: "weeks",
      operation: "subtract",
    });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.iso).toBe("2024-01-31");
  });

  it("clamps month overflow", () => {
    expect(addMonths({ year: 2024, month: 1, day: 31 }, 1)).toEqual({
      year: 2024,
      month: 2,
      day: 29,
    });
    const result = shiftDate({
      date: "2023-01-31",
      amount: 1,
      unit: "months",
      operation: "add",
    });
    expect(result.ok && result.iso).toBe("2023-02-28");
  });

  it("adds years across leap day", () => {
    const result = shiftDate({
      date: "2024-02-29",
      amount: 1,
      unit: "years",
      operation: "add",
    });
    expect(result.ok && result.iso).toBe("2025-02-28");
  });

  it("rejects bad dates", () => {
    expect(
      shiftDate({
        date: "nope",
        amount: 1,
        unit: "days",
        operation: "add",
      }).ok,
    ).toBe(false);
  });
});
