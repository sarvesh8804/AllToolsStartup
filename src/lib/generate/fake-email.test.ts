import { describe, expect, it } from "vitest";
import { generateFakeEmails } from "./fake-email";

describe("generateFakeEmails", () => {
  it("is deterministic with a seed", () => {
    const a = generateFakeEmails({
      count: 3,
      domain: "example.com",
      randomDomain: false,
      seed: 7,
    });
    const b = generateFakeEmails({
      count: 3,
      domain: "example.com",
      randomDomain: false,
      seed: 7,
    });
    expect(a.ok && b.ok).toBe(true);
    if (a.ok && b.ok) {
      expect(a.json).toBe(b.json);
      expect(a.emails[0]).toMatch(/@example\.com$/);
    }
  });

  it("rejects bad domains", () => {
    expect(
      generateFakeEmails({
        count: 1,
        domain: "nodot",
        randomDomain: false,
      }).ok,
    ).toBe(false);
  });

  it("supports random domains", () => {
    const result = generateFakeEmails({
      count: 5,
      domain: "",
      randomDomain: true,
      seed: 1,
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.emails.every((e) => e.includes("@"))).toBe(true);
    }
  });
});
