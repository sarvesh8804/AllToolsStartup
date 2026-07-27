import { describe, expect, it } from "vitest";
import {
  buildGradientCss,
  createGradientStop,
  formatGradientStops,
} from "./gradient";

describe("gradient", () => {
  it("sorts stops by position", () => {
    expect(
      formatGradientStops([
        createGradientStop({ id: "b", color: "#fff", position: 100 }),
        createGradientStop({ id: "a", color: "#000", position: 0 }),
      ]),
    ).toBe("#000 0%, #fff 100%");
  });

  it("builds linear gradient CSS", () => {
    const result = buildGradientCss({
      type: "linear",
      angle: 135,
      shape: "circle",
      stops: [
        createGradientStop({ id: "1", color: "#fff6b8", position: 0 }),
        createGradientStop({ id: "2", color: "#c4a70a", position: 100 }),
      ],
    });
    expect(result.value).toBe(
      "linear-gradient(135deg, #fff6b8 0%, #c4a70a 100%)",
    );
    expect(result.declaration).toContain("background:");
  });

  it("builds radial and conic", () => {
    const stops = [
      createGradientStop({ id: "1", color: "red", position: 0 }),
      createGradientStop({ id: "2", color: "blue", position: 100 }),
    ];
    expect(
      buildGradientCss({
        type: "radial",
        angle: 0,
        shape: "ellipse",
        stops,
      }).value,
    ).toContain("radial-gradient(ellipse");
    expect(
      buildGradientCss({
        type: "conic",
        angle: 45,
        shape: "circle",
        stops,
      }).value,
    ).toContain("conic-gradient(from 45deg");
  });
});
