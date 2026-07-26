import { describe, expect, it } from "vitest";
import {
  detectUnit,
  fromIso,
  fromUnix,
  parseTimestampInput,
} from "./timestamp";

describe("detectUnit", () => {
  it("treats 10-digit values as seconds", () => {
    expect(detectUnit(1700000000)).toBe("s");
  });

  it("treats 13-digit values as milliseconds", () => {
    expect(detectUnit(1700000000123)).toBe("ms");
  });
});

describe("fromUnix", () => {
  it("converts seconds to ISO", () => {
    const parts = fromUnix(0, "s");
    expect(parts.iso).toBe("1970-01-01T00:00:00.000Z");
    expect(parts.seconds).toBe(0);
    expect(parts.milliseconds).toBe(0);
  });

  it("converts milliseconds", () => {
    const parts = fromUnix(1_000, "ms");
    expect(parts.seconds).toBe(1);
    expect(parts.iso).toBe("1970-01-01T00:00:01.000Z");
  });
});

describe("parseTimestampInput", () => {
  it("parses a known seconds timestamp", () => {
    const result = parseTimestampInput("1609459200");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.unit).toBe("s");
      expect(result.value.iso).toBe("2021-01-01T00:00:00.000Z");
    }
  });

  it("rejects non-numeric input", () => {
    expect(parseTimestampInput("abc").ok).toBe(false);
  });

  it("rejects empty input", () => {
    expect(parseTimestampInput("  ").ok).toBe(false);
  });
});

describe("fromIso", () => {
  it("parses ISO dates to unix parts", () => {
    const result = fromIso("2021-01-01T00:00:00.000Z");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.seconds).toBe(1609459200);
      expect(result.value.milliseconds).toBe(1609459200000);
    }
  });

  it("rejects garbage dates", () => {
    expect(fromIso("not-a-date").ok).toBe(false);
  });
});
