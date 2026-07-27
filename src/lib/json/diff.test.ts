import { describe, expect, it } from "vitest";
import { diffJson, formatJsonValue, stableStringify } from "./diff";

describe("diffJson", () => {
  it("reports equal when values match ignoring key order", () => {
    const result = diffJson('{"b":1,"a":2}', '{"a":2,"b":1}');
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.equal).toBe(true);
    expect(result.changes).toHaveLength(0);
  });

  it("detects added, removed, and changed paths", () => {
    const result = diffJson(
      JSON.stringify({ name: "Ada", age: 30, city: "London" }),
      JSON.stringify({ name: "Ada", age: 31, country: "UK" }),
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.stats).toEqual({ added: 1, removed: 1, changed: 1 });
    expect(result.changes.find((c) => c.path === "age")?.kind).toBe("changed");
    expect(result.changes.find((c) => c.path === "city")?.kind).toBe("removed");
    expect(result.changes.find((c) => c.path === "country")?.kind).toBe("added");
  });

  it("diffs nested objects and arrays by index", () => {
    const result = diffJson(
      JSON.stringify({ items: [{ id: 1 }, { id: 2 }] }),
      JSON.stringify({ items: [{ id: 1 }, { id: 3 }, { id: 4 }] }),
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.changes.some((c) => c.path === "items[1].id")).toBe(true);
    expect(result.changes.some((c) => c.path === "items[2]")).toBe(true);
  });

  it("rejects invalid JSON", () => {
    const result = diffJson("{bad", '{"a":1}');
    expect(result.ok).toBe(false);
  });

  it("stableStringify sorts keys", () => {
    expect(stableStringify({ b: 1, a: { d: 2, c: 3 } }).trim()).toBe(
      '{\n  "a": {\n    "c": 3,\n    "d": 2\n  },\n  "b": 1\n}',
    );
  });

  it("formatJsonValue stringifies", () => {
    expect(formatJsonValue({ x: 1 })).toBe('{"x":1}');
  });
});
