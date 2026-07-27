import { describe, expect, it } from "vitest";
import { generateFakeAddresses } from "./fake-address";

describe("generateFakeAddresses", () => {
  it("generates seeded US addresses", () => {
    const a = generateFakeAddresses({ count: 3, country: "US", seed: 99 });
    const b = generateFakeAddresses({ count: 3, country: "US", seed: 99 });
    expect(a.ok && b.ok).toBe(true);
    if (a.ok && b.ok) {
      expect(a.json).toBe(b.json);
      expect(a.addresses[0].countryCode).toBe("US");
      expect(a.addresses[0].formatted).toContain("United States");
      expect(a.addresses[0].postalCode).toMatch(/^\d{5}$/);
    }
  });

  it("supports other countries", () => {
    const gb = generateFakeAddresses({ count: 1, country: "GB", seed: 1 });
    expect(gb.ok).toBe(true);
    if (gb.ok) expect(gb.addresses[0].countryCode).toBe("GB");

    const de = generateFakeAddresses({ count: 1, country: "DE", seed: 2 });
    expect(de.ok).toBe(true);
    if (de.ok) expect(de.addresses[0].formatted).toContain("Germany");
  });

  it("rejects invalid counts", () => {
    expect(generateFakeAddresses({ count: 0, country: "US" }).ok).toBe(false);
  });
});
