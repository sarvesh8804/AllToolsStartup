import { describe, expect, it } from "vitest";
import { networkFromIpAndMask, parseCidr, SAMPLE_CIDR } from "./ip";

describe("parseCidr", () => {
  it("parses a standard cidr block", () => {
    const result = parseCidr(SAMPLE_CIDR);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.info.prefix).toBe(24);
    expect(result.info.usableHosts).toBe(254);
  });
});

describe("networkFromIpAndMask", () => {
  it("accepts dotted mask", () => {
    const result = networkFromIpAndMask("10.0.0.5", "255.255.255.0");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.info.network).toBe("10.0.0.0");
  });
});
