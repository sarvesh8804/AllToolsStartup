import { describe, expect, it } from "vitest";
import { DEFAULT_FLEXBOX_OPTIONS, buildFlexboxCss } from "./flexbox";

describe("buildFlexboxCss", () => {
  it("emits flex container declarations", () => {
    const css = buildFlexboxCss(DEFAULT_FLEXBOX_OPTIONS);
    expect(css.declaration).toContain("display: flex;");
    expect(css.declaration).toContain("flex-direction: row;");
    expect(css.declaration).toContain("gap: 12px;");
    expect(css.rule).toContain(".flex-container");
  });

  it("maps options into camelCase style object", () => {
    const css = buildFlexboxCss({
      direction: "column",
      wrap: "wrap",
      justifyContent: "center",
      alignItems: "center",
      alignContent: "center",
      gap: 8,
    });
    expect(css.style.flexDirection).toBe("column");
    expect(css.style.justifyContent).toBe("center");
    expect(css.style.gap).toBe("8px");
  });

  it("clamps gap", () => {
    expect(buildFlexboxCss({ ...DEFAULT_FLEXBOX_OPTIONS, gap: -5 }).style.gap).toBe(
      "0px",
    );
    expect(
      buildFlexboxCss({ ...DEFAULT_FLEXBOX_OPTIONS, gap: 999 }).style.gap,
    ).toBe("120px");
  });
});
