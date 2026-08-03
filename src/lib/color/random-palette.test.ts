import { describe, expect, it } from "vitest";
import { generateRandomPalette } from "./random-palette";

describe("generateRandomPalette", () => {
  it("is deterministic for the same seed", () => {
    const a = generateRandomPalette({ seed: 7, count: 5 });
    const b = generateRandomPalette({ seed: 7, count: 5 });
    expect(a.ok).toBe(true);
    expect(b.ok).toBe(true);
    if (!a.ok || !b.ok) return;
    expect(a.colors).toEqual(b.colors);
  });
});
