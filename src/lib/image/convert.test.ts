import { describe, expect, it } from "vitest";
import {
  defaultWebpTarget,
  needsBackgroundFill,
  qualityApplies,
} from "@/lib/image/convert";

describe("convert helpers", () => {
  it("needs background only for JPEG", () => {
    expect(needsBackgroundFill("image/jpeg")).toBe(true);
    expect(needsBackgroundFill("image/png")).toBe(false);
    expect(needsBackgroundFill("image/webp")).toBe(false);
  });

  it("quality for jpeg/webp", () => {
    expect(qualityApplies("image/jpeg")).toBe(true);
    expect(qualityApplies("image/webp")).toBe(true);
    expect(qualityApplies("image/png")).toBe(false);
  });

  it("default target avoids no-op WebP→WebP", () => {
    expect(defaultWebpTarget("image/png")).toBe("image/webp");
    expect(defaultWebpTarget("image/jpeg")).toBe("image/webp");
    expect(defaultWebpTarget("image/webp")).toBe("image/png");
    expect(defaultWebpTarget(null)).toBe("image/webp");
  });
});
