import { describe, expect, it } from "vitest";
import {
  DEFAULT_GRID_OPTIONS,
  buildGridCss,
  buildGridTemplate,
} from "./grid";

describe("buildGridTemplate", () => {
  it("builds fr / px / auto tracks", () => {
    expect(buildGridTemplate(3, "fr", 100)).toBe("repeat(3, 1fr)");
    expect(buildGridTemplate(2, "px", 120)).toBe("repeat(2, 120px)");
    expect(buildGridTemplate(4, "auto", 0)).toBe("repeat(4, auto)");
  });
});

describe("buildGridCss", () => {
  it("emits grid container declarations", () => {
    const css = buildGridCss(DEFAULT_GRID_OPTIONS);
    expect(css.declaration).toContain("display: grid;");
    expect(css.declaration).toContain("grid-template-columns: repeat(3, 1fr);");
    expect(css.cellCount).toBe(9);
    expect(css.rule).toContain(".grid-container");
  });

  it("maps options into style object", () => {
    const css = buildGridCss({
      ...DEFAULT_GRID_OPTIONS,
      columns: 4,
      rows: 2,
      justifyItems: "center",
      columnGap: 8,
    });
    expect(css.style.gridTemplateColumns).toBe("repeat(4, 1fr)");
    expect(css.style.justifyItems).toBe("center");
    expect(css.style.columnGap).toBe("8px");
    expect(css.cellCount).toBe(8);
  });
});
