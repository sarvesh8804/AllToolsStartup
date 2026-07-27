import { describe, expect, it } from "vitest";
import {
  base64UrlDecode,
  base64UrlEncode,
  runBase64Url,
  standardToUrlSafe,
  urlSafeToStandard,
} from "./base64-url";

describe("base64-url", () => {
  it("encodes without + / =", () => {
    const result = base64UrlEncode("<<???>>");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.output).not.toMatch(/[+/=]/);
  });

  it("round-trips encode/decode", () => {
    const input = "hello/world+test=";
    const enc = base64UrlEncode(input);
    expect(enc.ok).toBe(true);
    if (!enc.ok) return;
    const dec = base64UrlDecode(enc.output);
    expect(dec.ok).toBe(true);
    if (!dec.ok) return;
    expect(dec.output).toBe(input);
  });

  it("converts standard to url-safe", () => {
    const result = standardToUrlSafe("Pj8/Pz4+");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.output).toBe("Pj8_Pz4-");
  });

  it("converts url-safe to standard with padding", () => {
    const result = urlSafeToStandard("aGVsbG8");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.output).toBe("aGVsbG8=");
  });

  it("runBase64Url dispatches modes", () => {
    expect(runBase64Url("encode", "hi").ok).toBe(true);
    expect(runBase64Url("decode", "   ").ok).toBe(false);
  });
});
