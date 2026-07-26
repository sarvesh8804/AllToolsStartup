import { describe, expect, it } from "vitest";
import { claimToDate, decodeJwt } from "./decode";
import { encodeBase64Url } from "@/lib/encoding/base64";

function makeJwt(header: object, payload: object): string {
  return `${encodeBase64Url(JSON.stringify(header))}.${encodeBase64Url(
    JSON.stringify(payload),
  )}.sig`;
}

describe("decodeJwt", () => {
  it("decodes header and payload", () => {
    const token = makeJwt(
      { alg: "HS256", typ: "JWT" },
      { sub: "123", name: "Ada", iat: 1516239022 },
    );
    const result = decodeJwt(token);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.header.alg).toBe("HS256");
      expect(result.value.payload.name).toBe("Ada");
      expect(result.value.signature).toBe("sig");
    }
  });

  it("rejects tokens without three segments", () => {
    const result = decodeJwt("a.b");
    expect(result.ok).toBe(false);
  });

  it("rejects empty input", () => {
    expect(decodeJwt("   ").ok).toBe(false);
  });

  it("rejects non-JSON segments", () => {
    const result = decodeJwt("bm90anNvbg.bm90anNvbg.sig");
    expect(result.ok).toBe(false);
  });

  it("converts epoch claims to ISO dates", () => {
    expect(claimToDate(1516239022)).toBe("2018-01-18T01:30:22.000Z");
    expect(claimToDate("nope")).toBeNull();
  });
});
