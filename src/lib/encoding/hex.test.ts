import { describe, expect, it } from "vitest";
import {
  SAMPLE_HEX_ENCODED,
  SAMPLE_HEX_TEXT,
  convertHex,
  decodeHex,
  encodeHex,
} from "./hex";

describe("encodeHex", () => {
  it("encodes utf-8 text", () => {
    expect(encodeHex(SAMPLE_HEX_TEXT)).toEqual({
      ok: true,
      hex: SAMPLE_HEX_ENCODED,
    });
  });

  it("supports spaced uppercase output", () => {
    const result = encodeHex("A", {
      separator: "space",
      uppercase: true,
    });
    expect(result).toEqual({ ok: true, hex: "41" });
  });
});

describe("decodeHex", () => {
  it("decodes continuous hex", () => {
    expect(decodeHex(SAMPLE_HEX_ENCODED)).toEqual({
      ok: true,
      text: SAMPLE_HEX_TEXT,
    });
  });

  it("accepts 0x prefixes and spaces", () => {
    expect(decodeHex("0x46 6f 72 67 65")).toEqual({
      ok: true,
      text: SAMPLE_HEX_TEXT,
    });
  });

  it("rejects odd-length hex", () => {
    expect(decodeHex("abc").ok).toBe(false);
  });
});

describe("convertHex", () => {
  it("round-trips", () => {
    const encoded = convertHex(SAMPLE_HEX_TEXT, "encode");
    expect(encoded.ok).toBe(true);
    if (!encoded.ok) return;
    expect(convertHex(encoded.output, "decode")).toEqual({
      ok: true,
      output: SAMPLE_HEX_TEXT,
    });
  });
});
