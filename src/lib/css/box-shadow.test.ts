import { describe, expect, it } from "vitest";
import {
  buildBoxShadowCss,
  createBoxShadowLayer,
  formatBoxShadowLayer,
} from "./box-shadow";

describe("box-shadow", () => {
  it("formats a single layer", () => {
    const layer = createBoxShadowLayer({
      id: "1",
      offsetX: 2,
      offsetY: 4,
      blur: 8,
      spread: 0,
      color: "#000",
      inset: false,
    });
    expect(formatBoxShadowLayer(layer)).toBe("2px 4px 8px 0px #000");
  });

  it("supports inset and multiple layers", () => {
    const result = buildBoxShadowCss({
      layers: [
        createBoxShadowLayer({
          id: "a",
          inset: true,
          offsetX: 0,
          offsetY: 0,
          blur: 10,
          spread: 0,
          color: "rgba(0,0,0,0.2)",
        }),
        createBoxShadowLayer({
          id: "b",
          offsetX: 0,
          offsetY: 8,
          blur: 16,
          spread: -2,
          color: "rgba(0,0,0,0.3)",
          enabled: true,
        }),
      ],
    });
    expect(result.value).toContain("inset");
    expect(result.value).toContain(",");
    expect(result.declaration.startsWith("box-shadow:")).toBe(true);
  });

  it("returns none when all layers disabled", () => {
    const result = buildBoxShadowCss({
      layers: [createBoxShadowLayer({ id: "x", enabled: false })],
    });
    expect(result.value).toBe("none");
  });
});
