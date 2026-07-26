import { describe, expect, it } from "vitest";
import {
  decodeBase64,
  decodeBase64Url,
  encodeBase64,
  encodeBase64Url,
} from "./base64";

describe("base64", () => {
  it("encodes ASCII", () => {
    expect(encodeBase64("hello")).toBe("aGVsbG8=");
  });

  it("round-trips ASCII", () => {
    expect(decodeBase64(encodeBase64("Forge tools"))).toBe("Forge tools");
  });

  it("handles UTF-8 (emoji and accents)", () => {
    const input = "héllo 🌍 café";
    expect(decodeBase64(encodeBase64(input))).toBe(input);
  });

  it("encodes empty string", () => {
    expect(encodeBase64("")).toBe("");
    expect(decodeBase64("")).toBe("");
  });

  it("url-safe encoding strips padding and uses -_", () => {
    const encoded = encodeBase64Url("<<???>>");
    expect(encoded).not.toContain("=");
    expect(encoded).not.toContain("+");
    expect(encoded).not.toContain("/");
  });

  it("round-trips url-safe base64", () => {
    const input = "subject/claim+data==";
    expect(decodeBase64Url(encodeBase64Url(input))).toBe(input);
  });
});
