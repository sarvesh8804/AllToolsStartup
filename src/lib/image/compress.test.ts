import { describe, expect, it } from "vitest";
import {
  compressionStats,
  fitWithinMaxSide,
} from "@/lib/image/compress";

describe("fitWithinMaxSide", () => {
  it("rejects bad source", () => {
    expect(fitWithinMaxSide(0, 100, 800).ok).toBe(false);
  });

  it("returns original when under max", () => {
    expect(fitWithinMaxSide(800, 600, 1920)).toEqual({
      ok: true,
      width: 800,
      height: 600,
      scaled: false,
    });
  });

  it("scales landscape by width", () => {
    expect(fitWithinMaxSide(4000, 2000, 1000)).toEqual({
      ok: true,
      width: 1000,
      height: 500,
      scaled: true,
    });
  });

  it("scales portrait by height", () => {
    expect(fitWithinMaxSide(1000, 4000, 800)).toEqual({
      ok: true,
      width: 200,
      height: 800,
      scaled: true,
    });
  });

  it("treats null max as no scale", () => {
    expect(fitWithinMaxSide(2000, 1000, null)).toEqual({
      ok: true,
      width: 2000,
      height: 1000,
      scaled: false,
    });
  });
});

describe("compressionStats", () => {
  it("computes savings", () => {
    expect(compressionStats(1000, 400)).toEqual({
      ok: true,
      originalBytes: 1000,
      compressedBytes: 400,
      savedBytes: 600,
      savedPercent: 60,
      ratio: 0.4,
    });
  });

  it("handles growth (negative savings)", () => {
    expect(compressionStats(100, 150)).toMatchObject({
      ok: true,
      savedBytes: -50,
      savedPercent: -50,
      ratio: 1.5,
    });
  });
});
