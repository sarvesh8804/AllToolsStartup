import { describe, expect, it } from "vitest";
import {
  SAMPLE_OTP_INPUT,
  buildOtpAuthUri,
  isValidBase32Secret,
  normalizeBase32Secret,
} from "./otp";

describe("buildOtpAuthUri", () => {
  it("builds a totp uri", () => {
    const result = buildOtpAuthUri(SAMPLE_OTP_INPUT);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.uri).toMatch(/^otpauth:\/\/totp\//);
    expect(result.uri).toContain("secret=JBSWY3DPEHPK3PXP");
    expect(result.uri).toContain("issuer=Forge");
  });

  it("rejects invalid secrets", () => {
    expect(
      buildOtpAuthUri({ ...SAMPLE_OTP_INPUT, secret: "not-valid!" }).ok,
    ).toBe(false);
  });
});

describe("normalizeBase32Secret", () => {
  it("strips spaces and uppercases", () => {
    expect(normalizeBase32Secret("jbsw y3dp")).toBe("JBSWY3DP");
    expect(isValidBase32Secret("JBSWY3DPEHPK3PXP")).toBe(true);
  });
});
