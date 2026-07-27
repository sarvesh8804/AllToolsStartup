import { describe, expect, it } from "vitest";
import { generateFakeNames } from "./fake-name";

describe("generateFakeNames", () => {
  it("is deterministic with a seed", () => {
    const a = generateFakeNames({
      count: 4,
      style: "western",
      includeUsername: true,
      seed: 11,
    });
    const b = generateFakeNames({
      count: 4,
      style: "western",
      includeUsername: true,
      seed: 11,
    });
    expect(a.ok && b.ok).toBe(true);
    if (a.ok && b.ok) {
      expect(a.json).toBe(b.json);
      expect(a.names[0].full).toContain(" ");
      expect(a.names[0].username).toContain(".");
      expect(a.plain.split("\n").filter(Boolean)).toHaveLength(4);
    }
  });

  it("can omit usernames from JSON", () => {
    const result = generateFakeNames({
      count: 2,
      style: "mixed",
      includeUsername: false,
      seed: 3,
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.json).not.toContain("username");
      expect(result.names[0].username).toBe("");
    }
  });

  it("rejects invalid counts", () => {
    expect(
      generateFakeNames({ count: 0, style: "western", includeUsername: true })
        .ok,
    ).toBe(false);
  });
});
