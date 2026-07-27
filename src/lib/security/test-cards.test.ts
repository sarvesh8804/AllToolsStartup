import { describe, expect, it } from "vitest";
import {
  KNOWN_TEST_CARDS,
  generateTestCard,
  isLuhnValid,
  knownTestCard,
  luhnCheckDigit,
} from "./test-cards";

describe("test cards", () => {
  it("validates known Stripe-style numbers", () => {
    for (const number of Object.values(KNOWN_TEST_CARDS)) {
      expect(isLuhnValid(number)).toBe(true);
    }
  });

  it("computes Luhn check digits", () => {
    expect(luhnCheckDigit("7992739871")).toBe("3");
  });

  it("generates Luhn-valid cards per brand", () => {
    for (const brand of ["visa", "mastercard", "amex", "discover"] as const) {
      const card = generateTestCard(brand);
      expect(card.testOnly).toBe(true);
      expect(isLuhnValid(card.number)).toBe(true);
      expect(card.brand).toBe(brand);
      expect(card.cvv.length).toBe(brand === "amex" ? 4 : 3);
    }
  });

  it("returns known fixtures", () => {
    expect(knownTestCard("visa").number).toBe(KNOWN_TEST_CARDS.visa);
  });
});
