import { describe, expect, it } from "vitest";
import { generateFakeUsers } from "./fake-user";

describe("generateFakeUsers", () => {
  it("generates a stable seeded list", () => {
    const a = generateFakeUsers({ count: 3, rich: true, seed: 42 });
    const b = generateFakeUsers({ count: 3, rich: true, seed: 42 });
    expect(a.ok && b.ok).toBe(true);
    if (a.ok && b.ok) {
      expect(a.json).toBe(b.json);
      expect(a.users).toHaveLength(3);
      expect(a.users[0].email).toContain("@");
      expect(a.users[0].address.city.length).toBeGreaterThan(0);
    }
  });

  it("supports lean mode", () => {
    const result = generateFakeUsers({ count: 2, rich: false, seed: 7 });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.users[0]).not.toHaveProperty("company");
      // lean cast still may have empty company if we push FakeUser - check keys
      const keys = Object.keys(result.users[0]);
      expect(keys).toContain("email");
      expect(keys).not.toContain("company");
    }
  });

  it("rejects invalid counts", () => {
    expect(generateFakeUsers({ count: 0, rich: true }).ok).toBe(false);
    expect(generateFakeUsers({ count: 101, rich: true }).ok).toBe(false);
  });
});
