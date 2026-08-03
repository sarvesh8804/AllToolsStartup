import { describe, expect, it } from "vitest";
import {
  SAMPLE_COLOR,
  simulateAllColorBlindness,
  simulateColorBlindness,
} from "./color-blindness";

describe("simulateColorBlindness", () => {
  it("returns a simulated hex", () => {
    const result = simulateColorBlindness(SAMPLE_COLOR, "protanopia");
    expect("hex" in result).toBe(true);
    if (!("hex" in result)) return;
    expect(result.hex).toMatch(/^#[0-9a-f]{6}$/i);
  });
});

describe("simulateAllColorBlindness", () => {
  it("returns four simulations", () => {
    expect(simulateAllColorBlindness(SAMPLE_COLOR)).toHaveLength(4);
  });
});
