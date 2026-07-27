export type CardBrand = "visa" | "mastercard" | "amex" | "discover";

export type TestCard = {
  brand: CardBrand;
  number: string;
  formatted: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  /** Always true for generated output — test/sandbox only. */
  testOnly: true;
};

export const CARD_BRAND_LABELS: Record<CardBrand, string> = {
  visa: "Visa",
  mastercard: "Mastercard",
  amex: "American Express",
  discover: "Discover",
};

/** Well-known Stripe-style sandbox numbers (always available). */
export const KNOWN_TEST_CARDS: Record<CardBrand, string> = {
  visa: "4242424242424242",
  mastercard: "5555555555554444",
  amex: "378282246310005",
  discover: "6011111111111117",
};

const BRAND_LENGTH: Record<CardBrand, number> = {
  visa: 16,
  mastercard: 16,
  amex: 15,
  discover: 16,
};

const BRAND_CVV_LENGTH: Record<CardBrand, number> = {
  visa: 3,
  mastercard: 3,
  amex: 4,
  discover: 3,
};

export function luhnChecksum(digits: string): number {
  let sum = 0;
  let alternate = false;
  for (let i = digits.length - 1; i >= 0; i -= 1) {
    let n = Number(digits[i]);
    if (!Number.isInteger(n)) return -1;
    if (alternate) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alternate = !alternate;
  }
  return sum % 10;
}

export function isLuhnValid(number: string): boolean {
  const digits = number.replace(/\D/g, "");
  if (digits.length < 12) return false;
  return luhnChecksum(digits) === 0;
}

function randomInt(maxExclusive: number): number {
  if (maxExclusive <= 0) return 0;
  const buf = new Uint32Array(1);
  globalThis.crypto.getRandomValues(buf);
  return buf[0]! % maxExclusive;
}

function randomDigits(count: number): string {
  let out = "";
  for (let i = 0; i < count; i += 1) out += String(randomInt(10));
  return out;
}

function brandPrefix(brand: CardBrand): string {
  switch (brand) {
    case "visa":
      return "4";
    case "mastercard": {
      // 51–55
      return String(51 + randomInt(5));
    }
    case "amex":
      return randomInt(2) === 0 ? "34" : "37";
    case "discover":
      return "6011";
    default:
      return "4";
  }
}

/** Compute check digit so full number passes Luhn. */
export function luhnCheckDigit(partialWithoutCheck: string): string {
  const probe = `${partialWithoutCheck}0`;
  const mod = luhnChecksum(probe);
  if (mod < 0) return "0";
  return String((10 - mod) % 10);
}

export function formatCardNumber(number: string, brand: CardBrand): string {
  const d = number.replace(/\D/g, "");
  if (brand === "amex") {
    // 4-6-5
    return [d.slice(0, 4), d.slice(4, 10), d.slice(10)].filter(Boolean).join(" ");
  }
  return d.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
}

export function generateTestCard(brand: CardBrand): TestCard {
  const length = BRAND_LENGTH[brand];
  const prefix = brandPrefix(brand);
  const bodyLen = length - prefix.length - 1;
  const partial = `${prefix}${randomDigits(Math.max(0, bodyLen))}`;
  const number = `${partial}${luhnCheckDigit(partial)}`;

  const now = new Date();
  const month = String(1 + randomInt(12)).padStart(2, "0");
  const year = String((now.getFullYear() + 1 + randomInt(4)) % 100).padStart(
    2,
    "0",
  );
  const cvv = randomDigits(BRAND_CVV_LENGTH[brand]);

  return {
    brand,
    number,
    formatted: formatCardNumber(number, brand),
    expiryMonth: month,
    expiryYear: year,
    cvv,
    testOnly: true,
  };
}

export function knownTestCard(brand: CardBrand): TestCard {
  const number = KNOWN_TEST_CARDS[brand];
  const now = new Date();
  return {
    brand,
    number,
    formatted: formatCardNumber(number, brand),
    expiryMonth: "12",
    expiryYear: String((now.getFullYear() + 2) % 100).padStart(2, "0"),
    cvv: brand === "amex" ? "1234" : "123",
    testOnly: true,
  };
}
