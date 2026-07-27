import { describe, expect, it } from "vitest";
import { analyzePassword } from "./password-strength";

describe("analyzePassword", () => {
  it("scores empty as very weak", () => {
    const a = analyzePassword("");
    expect(a.score).toBe(0);
    expect(a.label).toBe("Very weak");
  });

  it("flags common passwords", () => {
    const a = analyzePassword("password");
    expect(a.checks.noCommon).toBe(false);
    expect(a.score).toBeLessThanOrEqual(25);
  });

  it("rates a long mixed password highly", () => {
    const a = analyzePassword("Tr0ub4dor&3!xK9qm");
    expect(a.checks.length).toBe(true);
    expect(a.checks.symbol).toBe(true);
    expect(a.score).toBeGreaterThanOrEqual(70);
    expect(["Strong", "Very strong"]).toContain(a.label);
  });

  it("detects character classes", () => {
    const a = analyzePassword("Abcdef12!");
    expect(a.checks.lowercase).toBe(true);
    expect(a.checks.uppercase).toBe(true);
    expect(a.checks.number).toBe(true);
    expect(a.checks.symbol).toBe(true);
  });

  it("flags repeated runs", () => {
    expect(analyzePassword("aaaBBB111!!!").checks.noRepeat).toBe(false);
  });
});
