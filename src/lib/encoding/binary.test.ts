import { describe, expect, it } from "vitest";
import {
  SAMPLE_BINARY_ENCODED,
  SAMPLE_BINARY_TEXT,
  convertBinary,
  decodeBinary,
  encodeBinary,
} from "./binary";

describe("encodeBinary", () => {
  it("encodes text to spaced bytes", () => {
    const result = encodeBinary(SAMPLE_BINARY_TEXT);
    expect(result).toEqual({ ok: true, binary: SAMPLE_BINARY_ENCODED });
  });

  it("supports no separator", () => {
    const result = encodeBinary("A", { separator: "none" });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.binary).toBe("01000001");
  });
});

describe("decodeBinary", () => {
  it("decodes spaced binary to text", () => {
    const result = decodeBinary(SAMPLE_BINARY_ENCODED);
    expect(result).toEqual({ ok: true, text: SAMPLE_BINARY_TEXT });
  });

  it("rejects non-binary characters", () => {
    expect(decodeBinary("0102").ok).toBe(false);
  });
});

describe("convertBinary", () => {
  it("round-trips in encode then decode mode", () => {
    const encoded = convertBinary(SAMPLE_BINARY_TEXT, "encode");
    expect(encoded.ok).toBe(true);
    if (!encoded.ok) return;
    const decoded = convertBinary(encoded.output, "decode");
    expect(decoded).toEqual({ ok: true, output: SAMPLE_BINARY_TEXT });
  });
});
