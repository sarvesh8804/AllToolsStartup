import { describe, expect, it } from "vitest";
import { formatJson, minifyJson } from "@/lib/json/format";

describe("formatJson", () => {
  it("pretty-prints compact JSON with 2 spaces", () => {
    expect(formatJson('{"a":1,"b":[true]}', 2)).toBe(
      `{
  "a": 1,
  "b": [
    true
  ]
}`,
    );
  });

  it("supports 4-space indent", () => {
    expect(formatJson('{"x":1}', 4)).toBe(`{
    "x": 1
}`);
  });

  it("minifies when spaces is 0", () => {
    expect(formatJson('{\n  "a": 1\n}', 0)).toBe('{"a":1}');
  });

  it("throws on invalid JSON", () => {
    expect(() => formatJson("{bad}", 2)).toThrow();
  });
});

describe("minifyJson", () => {
  it("removes whitespace", () => {
    expect(minifyJson('{\n  "ok": true\n}')).toBe('{"ok":true}');
  });

  it("throws on invalid JSON", () => {
    expect(() => minifyJson("not-json")).toThrow();
  });
});
