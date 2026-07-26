import { describe, expect, it } from "vitest";
import { validateJson } from "@/lib/json/validate";

describe("validateJson", () => {
  it("accepts valid objects and arrays", () => {
    expect(validateJson('{"a":1}')).toEqual({
      ok: true,
      message: "Valid JSON.",
    });
    expect(validateJson("[1,2,3]").ok).toBe(true);
  });

  it("rejects empty input", () => {
    expect(validateJson("   ")).toEqual({
      ok: false,
      message: "Paste JSON to validate.",
    });
  });

  it("rejects invalid JSON with a message", () => {
    const result = validateJson("{");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message.length).toBeGreaterThan(0);
    }
  });

  it("includes line/column when position is available", () => {
    const result = validateJson('{"a": }');
    expect(result.ok).toBe(false);
    if (!result.ok && result.line != null) {
      expect(result.line).toBeGreaterThanOrEqual(1);
      expect(result.column).toBeGreaterThanOrEqual(1);
    }
  });
});
