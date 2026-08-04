import { describe, expect, it } from "vitest";
import { decodeSslCertificates } from "./ssl-cert";

describe("decodeSslCertificates", () => {
  it("rejects empty input", async () => {
    const result = await decodeSslCertificates("");
    expect(result.ok).toBe(false);
  });

  it("rejects text without PEM blocks", async () => {
    const result = await decodeSslCertificates("not a certificate");
    expect(result.ok).toBe(false);
  });
});
