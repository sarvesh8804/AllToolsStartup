import { describe, expect, it } from "vitest";
import {
  computeResizeSize,
  roundPx,
} from "@/lib/image/resize";

describe("roundPx", () => {
  it("rounds and clamps to at least 1", () => {
    expect(roundPx(10.4)).toBe(10);
    expect(roundPx(10.6)).toBe(11);
    expect(roundPx(0.2)).toBe(1);
  });
});

describe("computeResizeSize", () => {
  it("rejects invalid source", () => {
    expect(
      computeResizeSize({
        sourceWidth: 0,
        sourceHeight: 100,
        mode: "exact",
        width: 50,
      }).ok,
    ).toBe(false);
  });

  it("exact with width only keeps aspect", () => {
    const r = computeResizeSize({
      sourceWidth: 2000,
      sourceHeight: 1000,
      mode: "exact",
      width: 800,
    });
    expect(r).toEqual({ ok: true, width: 800, height: 400 });
  });

  it("exact with height only keeps aspect", () => {
    const r = computeResizeSize({
      sourceWidth: 2000,
      sourceHeight: 1000,
      mode: "exact",
      height: 250,
    });
    expect(r).toEqual({ ok: true, width: 500, height: 250 });
  });

  it("exact unlocked uses both dimensions", () => {
    const r = computeResizeSize({
      sourceWidth: 2000,
      sourceHeight: 1000,
      mode: "exact",
      width: 100,
      height: 100,
      lockAspect: false,
    });
    expect(r).toEqual({ ok: true, width: 100, height: 100 });
  });

  it("exact locked prefers width when both set", () => {
    const r = computeResizeSize({
      sourceWidth: 1000,
      sourceHeight: 500,
      mode: "exact",
      width: 200,
      height: 999,
      lockAspect: true,
    });
    expect(r).toEqual({ ok: true, width: 200, height: 100 });
  });

  it("percent scales both sides", () => {
    const r = computeResizeSize({
      sourceWidth: 800,
      sourceHeight: 600,
      mode: "percent",
      percent: 50,
    });
    expect(r).toEqual({ ok: true, width: 400, height: 300 });
  });

  it("percent rejects zero and huge values", () => {
    expect(
      computeResizeSize({
        sourceWidth: 100,
        sourceHeight: 100,
        mode: "percent",
        percent: 0,
      }).ok,
    ).toBe(false);
    expect(
      computeResizeSize({
        sourceWidth: 100,
        sourceHeight: 100,
        mode: "percent",
        percent: 1001,
      }).ok,
    ).toBe(false);
  });

  it("fit contains inside bounding box", () => {
    const r = computeResizeSize({
      sourceWidth: 1600,
      sourceHeight: 900,
      mode: "fit",
      width: 800,
      height: 800,
    });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.width).toBe(800);
      expect(r.height).toBe(450);
    }
  });

  it("fit with width only", () => {
    const r = computeResizeSize({
      sourceWidth: 1000,
      sourceHeight: 500,
      mode: "fit",
      width: 400,
    });
    expect(r).toEqual({ ok: true, width: 400, height: 200 });
  });

  it("requires dimensions for exact/fit", () => {
    expect(
      computeResizeSize({
        sourceWidth: 100,
        sourceHeight: 100,
        mode: "exact",
      }).ok,
    ).toBe(false);
    expect(
      computeResizeSize({
        sourceWidth: 100,
        sourceHeight: 100,
        mode: "fit",
      }).ok,
    ).toBe(false);
  });
});
