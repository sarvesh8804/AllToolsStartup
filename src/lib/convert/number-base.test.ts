import { describe, expect, it } from "vitest";
import {
  bigintToBase,
  convertFromBase,
  parseToBigInt,
} from "./number-base";

describe("parseToBigInt", () => {
  it("parses decimal", () => {
    expect(parseToBigInt("255", 10)).toEqual({
      ok: true,
      value: BigInt(255),
    });
  });

  it("parses hex with 0x prefix", () => {
    expect(parseToBigInt("0xFF", 16)).toEqual({
      ok: true,
      value: BigInt(255),
    });
  });

  it("parses binary with 0b prefix", () => {
    expect(parseToBigInt("0b1010", 2)).toEqual({
      ok: true,
      value: BigInt(10),
    });
  });

  it("rejects invalid digits for base", () => {
    expect(parseToBigInt("2", 2).ok).toBe(false);
    expect(parseToBigInt("8", 8).ok).toBe(false);
    expect(parseToBigInt("G", 16).ok).toBe(false);
  });

  it("supports negatives", () => {
    expect(parseToBigInt("-10", 10)).toEqual({
      ok: true,
      value: BigInt(-10),
    });
  });
});

describe("bigintToBase", () => {
  it("formats known values", () => {
    expect(bigintToBase(BigInt(255), 16)).toBe("FF");
    expect(bigintToBase(BigInt(255), 2)).toBe("11111111");
    expect(bigintToBase(BigInt(255), 8)).toBe("377");
    expect(bigintToBase(BigInt(0), 10)).toBe("0");
  });
});

describe("convertFromBase", () => {
  it("fills all representations", () => {
    const result = convertFromBase("FF", 16);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.representations[10]).toBe("255");
      expect(result.representations[2]).toBe("11111111");
      expect(result.representations[8]).toBe("377");
      expect(result.representations[16]).toBe("FF");
    }
  });

  it("round-trips across bases", () => {
    const fromDec = convertFromBase("42", 10);
    expect(fromDec.ok).toBe(true);
    if (!fromDec.ok) return;
    const fromBin = convertFromBase(fromDec.representations[2], 2);
    expect(fromBin.ok).toBe(true);
    if (fromBin.ok) expect(fromBin.representations[10]).toBe("42");
  });
});
