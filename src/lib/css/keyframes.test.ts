import { describe, expect, it } from "vitest";
import { buildKeyframesCss, DEFAULT_KEYFRAMES } from "./keyframes";

describe("buildKeyframesCss", () => {
  it("builds keyframes and animation css", () => {
    const result = buildKeyframesCss(DEFAULT_KEYFRAMES);
    expect(result.keyframes).toContain("@keyframes forge-bounce");
    expect(result.animation).toContain("animation:");
  });
});
