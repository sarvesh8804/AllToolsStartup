import { describe, expect, it } from "vitest";
import {
  centerCropForAspect,
  defaultCropRect,
  validateCropRect,
} from "./crop";

describe("validateCropRect", () => {
  it("clamps crop inside bounds", () => {
    const result = validateCropRect(800, 600, { x: 10, y: 20, width: 400, height: 300 });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.rect.width).toBe(400);
  });
});

describe("centerCropForAspect", () => {
  it("centers 16:9 crop", () => {
    const rect = centerCropForAspect(1920, 1080, 16 / 9);
    expect(rect.width).toBe(1920);
    expect(rect.height).toBe(1080);
  });
});

describe("defaultCropRect", () => {
  it("covers full image", () => {
    expect(defaultCropRect(100, 50)).toEqual({ x: 0, y: 0, width: 100, height: 50 });
  });
});
