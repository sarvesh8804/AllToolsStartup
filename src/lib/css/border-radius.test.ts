import { describe, expect, it } from "vitest";
import {
  DEFAULT_BORDER_RADIUS_OPTIONS,
  buildBorderRadiusCss,
} from "./border-radius";

describe("buildBorderRadiusCss", () => {
  it("emits a single value when linked", () => {
    const css = buildBorderRadiusCss({
      ...DEFAULT_BORDER_RADIUS_OPTIONS,
      linked: true,
      all: 12,
      unit: "px",
    });
    expect(css.value).toBe("12px");
    expect(css.declaration).toBe("border-radius: 12px;");
  });

  it("emits four values when corners differ", () => {
    const css = buildBorderRadiusCss({
      ...DEFAULT_BORDER_RADIUS_OPTIONS,
      linked: false,
      corners: {
        topLeft: 8,
        topRight: 16,
        bottomRight: 24,
        bottomLeft: 32,
      },
    });
    expect(css.value).toBe("8px 16px 24px 32px");
  });

  it("emits two values for opposite-corner shorthand", () => {
    const css = buildBorderRadiusCss({
      ...DEFAULT_BORDER_RADIUS_OPTIONS,
      linked: false,
      corners: {
        topLeft: 10,
        topRight: 20,
        bottomRight: 10,
        bottomLeft: 20,
      },
    });
    expect(css.value).toBe("10px 20px");
  });

  it("supports elliptical radii", () => {
    const css = buildBorderRadiusCss({
      ...DEFAULT_BORDER_RADIUS_OPTIONS,
      linked: true,
      all: 50,
      unit: "%",
      elliptical: true,
    });
    expect(css.value).toBe("50% 50% 50% 50% / 50% 50% 50% 50%");
  });

  it("supports rem units", () => {
    const css = buildBorderRadiusCss({
      ...DEFAULT_BORDER_RADIUS_OPTIONS,
      linked: true,
      all: 1.5,
      unit: "rem",
    });
    expect(css.value).toBe("1.5rem");
  });
});
