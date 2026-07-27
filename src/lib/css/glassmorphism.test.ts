import { describe, expect, it } from "vitest";
import {
  DEFAULT_GLASS_OPTIONS,
  buildGlassmorphismCss,
} from "./glassmorphism";

describe("buildGlassmorphismCss", () => {
  it("emits frosted glass declarations", () => {
    const css = buildGlassmorphismCss(DEFAULT_GLASS_OPTIONS);
    expect(css.declaration).toContain("backdrop-filter: blur(16px);");
    expect(css.declaration).toContain("-webkit-backdrop-filter: blur(16px);");
    expect(css.declaration).toContain("background: rgba(255, 255, 255, 0.25);");
    expect(css.rule).toContain(".glass");
    expect(css.style.backdropFilter).toBe("blur(16px)");
  });

  it("can omit box-shadow", () => {
    const css = buildGlassmorphismCss({
      ...DEFAULT_GLASS_OPTIONS,
      shadow: false,
    });
    expect(css.declaration.includes("box-shadow")).toBe(false);
  });

  it("clamps blur and opacity", () => {
    const css = buildGlassmorphismCss({
      ...DEFAULT_GLASS_OPTIONS,
      blur: 999,
      opacity: -10,
    });
    expect(css.declaration).toContain("blur(80px)");
    expect(css.declaration).toContain("rgba(255, 255, 255, 0)");
  });
});
