import { describe, expect, it } from "vitest";
import { safeFormatJson, safeMinifyJson } from "./safe";

describe("safeMinifyJson", () => {
  it("minifies valid JSON", () => {
    const result = safeMinifyJson('{\n  "a": 1\n}');
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.json).toBe('{"a":1}');
  });

  it("rejects empty input", () => {
    expect(safeMinifyJson("").ok).toBe(false);
  });

  it("rejects invalid JSON", () => {
    const result = safeMinifyJson("{bad}");
    expect(result.ok).toBe(false);
  });
});

describe("safeFormatJson", () => {
  it("pretty-prints", () => {
    const result = safeFormatJson('{"a":1}', 2);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.json).toContain("\n");
  });
});
