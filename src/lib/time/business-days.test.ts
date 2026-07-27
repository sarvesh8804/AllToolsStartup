import { describe, expect, it } from "vitest";
import {
  addBusinessDays,
  countBusinessDays,
  isBusinessDay,
} from "./business-days";

describe("isBusinessDay", () => {
  it("treats weekends as non-business", () => {
    // 2024-01-06 Saturday, 2024-01-07 Sunday, 2024-01-08 Monday
    expect(isBusinessDay({ year: 2024, month: 1, day: 6 })).toBe(false);
    expect(isBusinessDay({ year: 2024, month: 1, day: 7 })).toBe(false);
    expect(isBusinessDay({ year: 2024, month: 1, day: 8 })).toBe(true);
  });

  it("respects holidays", () => {
    expect(
      isBusinessDay(
        { year: 2024, month: 1, day: 1 },
        { holidays: ["2024-01-01"] },
      ),
    ).toBe(false);
  });
});

describe("countBusinessDays", () => {
  it("counts exclusive network days Mon→Fri", () => {
    // Mon Jan 8 → Fri Jan 12 exclusive → Tue–Fri = 4? 
    // Excel NETWORKDAYS(Jan8, Jan12) = 5 (Mon–Fri inclusive of both)
    // Our exclusive: after start through end = Tue Wed Thu Fri = 4 when start is Mon end Fri
    // For UX, default exclusive with Mon-Fri same week:
    // start Mon end Fri exclusive: Tue-Fri = 4
    const r = countBusinessDays("2024-01-08", "2024-01-12");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.businessDays).toBe(4);
  });

  it("counts inclusive Mon→Fri as 5", () => {
    const r = countBusinessDays("2024-01-08", "2024-01-12", {
      inclusive: true,
    });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.businessDays).toBe(5);
  });

  it("skips holidays", () => {
    const r = countBusinessDays("2024-01-01", "2024-01-05", {
      inclusive: true,
      holidays: ["2024-01-01"],
    });
    // Jan 1 Mon holiday, 2 Tue, 3 Wed, 4 Thu, 5 Fri → 4
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.businessDays).toBe(4);
  });

  it("returns negative when end is before start", () => {
    const r = countBusinessDays("2024-01-12", "2024-01-08", {
      inclusive: true,
    });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.businessDays).toBe(-5);
  });
});

describe("addBusinessDays", () => {
  it("adds business days skipping weekend", () => {
    // Fri Jan 5 + 1 = Mon Jan 8
    const r = addBusinessDays("2024-01-05", 1);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.iso).toBe("2024-01-08");
  });

  it("subtracts business days", () => {
    const r = addBusinessDays("2024-01-08", -1);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.iso).toBe("2024-01-05");
  });

  it("skips holidays when adding", () => {
    // Fri Jan 5 + 1 with Mon holiday → Tue Jan 9
    const r = addBusinessDays("2024-01-05", 1, {
      holidays: ["2024-01-08"],
    });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.iso).toBe("2024-01-09");
  });
});
