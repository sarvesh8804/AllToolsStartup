import { describe, expect, it } from "vitest";
import { convertRgbChannels, parseRgbInput } from "./rgb-hex";

describe("convertRgbChannels", () => {
  it("converts RGB to hex", () => {
    const result = convertRgbChannels(196, 167, 10);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.hex.toLowerCase()).toBe("#c4a70a");
      expect(result.cssRgb).toBe("rgb(196, 167, 10)");
    }
  });
});

describe("parseRgbInput", () => {
  it("accepts bare channels", () => {
    const result = parseRgbInput("255, 0, 128");
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.hex.toLowerCase()).toBe("#ff0080");
  });

  it("accepts rgb()", () => {
    const result = parseRgbInput("rgb(0, 128, 255)");
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.hex.toLowerCase()).toBe("#0080ff");
  });

  it("rejects out-of-range channels", () => {
    expect(parseRgbInput("300, 0, 0").ok).toBe(false);
  });
});
