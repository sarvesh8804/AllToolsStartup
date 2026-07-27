import { describe, expect, it } from "vitest";
import {
  convertLinear,
  convertTemperature,
  convertLinearTable,
  formatUnitValue,
  DATA_STORAGE_UNITS,
  LENGTH_UNITS,
  WEIGHT_UNITS,
} from "@/lib/convert/units";

describe("formatUnitValue", () => {
  it("trims float noise", () => {
    expect(formatUnitValue(0.1 + 0.2)).toBe("0.3");
    expect(formatUnitValue(0)).toBe("0");
  });
});

describe("convertLinear length", () => {
  it("meters to feet", () => {
    const r = convertLinear("1", "m", "ft", LENGTH_UNITS);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.value).toBeCloseTo(3.280839895, 8);
  });

  it("miles to kilometers", () => {
    const r = convertLinear("1", "mi", "km", LENGTH_UNITS);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.value).toBeCloseTo(1.609344, 6);
  });

  it("rejects empty", () => {
    expect(convertLinear("", "m", "cm", LENGTH_UNITS).ok).toBe(false);
  });
});

describe("convertLinear weight", () => {
  it("lb to kg", () => {
    const r = convertLinear("1", "lb", "kg", WEIGHT_UNITS);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.value).toBeCloseTo(0.45359237, 8);
  });
});

describe("convertTemperature", () => {
  it("freezing point", () => {
    expect(convertTemperature("0", "c", "f")).toMatchObject({
      ok: true,
      value: 32,
    });
    expect(convertTemperature("32", "f", "c")).toMatchObject({
      ok: true,
      value: 0,
    });
    expect(convertTemperature("0", "c", "k")).toMatchObject({
      ok: true,
      value: 273.15,
    });
  });

  it("boiling point", () => {
    const r = convertTemperature("100", "c", "f");
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.value).toBeCloseTo(212, 8);
  });

  it("rejects negative kelvin", () => {
    expect(convertTemperature("-1", "k", "c").ok).toBe(false);
  });
});

describe("convertLinearTable", () => {
  it("returns all length units", () => {
    const r = convertLinearTable("1", "m", LENGTH_UNITS);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.rows).toHaveLength(LENGTH_UNITS.length);
    expect(r.rows.find((x) => x.id === "cm")?.formatted).toBe("100");
  });
});

describe("data storage", () => {
  it("converts MB to bytes (SI)", () => {
    const r = convertLinear("1", "MB", "B", DATA_STORAGE_UNITS);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.value).toBe(1_000_000);
  });

  it("converts MiB to bytes (IEC)", () => {
    const r = convertLinear("1", "MiB", "B", DATA_STORAGE_UNITS);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.value).toBe(1_048_576);
  });

  it("converts bits to bytes", () => {
    const r = convertLinear("8", "bit", "B", DATA_STORAGE_UNITS);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.value).toBe(1);
  });

  it("rejects negative when requested", () => {
    expect(
      convertLinearTable("-1", "MB", DATA_STORAGE_UNITS, {
        rejectNegative: true,
      }).ok,
    ).toBe(false);
  });
});
