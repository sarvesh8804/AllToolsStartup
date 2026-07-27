import { describe, expect, it } from "vitest";
import { buildVCard, escapeVCardValue } from "./vcard";

describe("escapeVCardValue", () => {
  it("escapes special characters", () => {
    expect(escapeVCardValue("a;b,c\\d\ne")).toBe("a\\;b\\,c\\\\d\\ne");
  });
});

describe("buildVCard", () => {
  it("builds a minimal vCard", () => {
    const card = buildVCard({ firstName: "Ada", lastName: "Lovelace" });
    expect(card).toContain("BEGIN:VCARD");
    expect(card).toContain("VERSION:3.0");
    expect(card).toContain("N:Lovelace;Ada;;;");
    expect(card).toContain("FN:Ada Lovelace");
    expect(card).toContain("END:VCARD");
  });

  it("includes optional fields", () => {
    const card = buildVCard({
      firstName: "Ada",
      lastName: "",
      organization: "Analytical Engines",
      title: "Mathematician",
      phone: "+1 555 0100",
      email: "ada@example.com",
      url: "https://example.com",
      city: "London",
      country: "UK",
      note: "Hello; world",
    });
    expect(card).toContain("FN:Ada");
    expect(card).toContain("ORG:Analytical Engines");
    expect(card).toContain("TITLE:Mathematician");
    expect(card).toContain("TEL;TYPE=CELL:+1 555 0100");
    expect(card).toContain("EMAIL;TYPE=INTERNET:ada@example.com");
    expect(card).toContain("URL:https://example.com");
    expect(card).toContain("ADR;TYPE=HOME:;;");
    expect(card).toContain("London");
    expect(card).toContain("NOTE:Hello\\; world");
  });

  it("rejects empty names", () => {
    expect(() => buildVCard({ firstName: "  ", lastName: "" })).toThrow(
      /name/,
    );
  });
});
