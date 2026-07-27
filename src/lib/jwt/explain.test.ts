import { describe, expect, it } from "vitest";
import { encodeBase64Url } from "@/lib/encoding/base64";
import { explainJwt } from "./explain";

function makeJwt(header: object, payload: object): string {
  return `${encodeBase64Url(JSON.stringify(header))}.${encodeBase64Url(
    JSON.stringify(payload),
  )}.sig`;
}

describe("explainJwt", () => {
  it("explains registered claims and alg", () => {
    const token = makeJwt(
      { alg: "HS256", typ: "JWT" },
      { sub: "user-1", iss: "forge", iat: 1_700_000_000 },
    );
    const result = explainJwt(token, 1_700_000_000_000);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.headerClaims.find((c) => c.name === "alg")?.severity).toBe(
      "info",
    );
    expect(
      result.payloadClaims.find((c) => c.name === "sub")?.explanation,
    ).toMatch(/Subject/i);
    expect(result.summary[0]).toMatch(/not verified/i);
  });

  it("flags alg=none as danger", () => {
    const token = makeJwt({ alg: "none", typ: "JWT" }, { sub: "x" });
    const result = explainJwt(token);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.headerClaims.find((c) => c.name === "alg")?.severity).toBe(
      "danger",
    );
  });

  it("marks expired tokens", () => {
    const token = makeJwt(
      { alg: "RS256" },
      { exp: 1_000, sub: "x" },
    );
    const result = explainJwt(token, 2_000_000);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const exp = result.payloadClaims.find((c) => c.name === "exp");
    expect(exp?.severity).toBe("danger");
    expect(exp?.isoDate).toBeTruthy();
  });

  it("warns when nbf is in the future", () => {
    const token = makeJwt({ alg: "ES256" }, { nbf: 9_999_999_999 });
    const result = explainJwt(token, 1_700_000_000_000);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.payloadClaims.find((c) => c.name === "nbf")?.severity).toBe(
      "warn",
    );
  });

  it("propagates decode errors", () => {
    expect(explainJwt("not.a.jwt").ok).toBe(false);
  });
});
