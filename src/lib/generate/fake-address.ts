export type FakeAddress = {
  line1: string;
  line2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  countryCode: string;
  formatted: string;
};

export type FakeAddressCountry = "US" | "GB" | "IN" | "DE" | "CA";

export type FakeAddressOptions = {
  count: number;
  country: FakeAddressCountry | "random";
  seed?: number;
};

const STREETS = [
  "Oak",
  "Maple",
  "Cedar",
  "Pine",
  "Willow",
  "Harbor",
  "Market",
  "Summit",
  "River",
  "Park",
];

const STREET_TYPES = ["St", "Ave", "Rd", "Blvd", "Ln", "Way"];

const US_CITIES: { city: string; state: string }[] = [
  { city: "Austin", state: "TX" },
  { city: "Seattle", state: "WA" },
  { city: "Denver", state: "CO" },
  { city: "Boston", state: "MA" },
  { city: "Portland", state: "OR" },
];

const CA_CITIES: { city: string; state: string }[] = [
  { city: "Toronto", state: "ON" },
  { city: "Vancouver", state: "BC" },
  { city: "Montreal", state: "QC" },
  { city: "Calgary", state: "AB" },
];

const GB_CITIES = ["London", "Manchester", "Bristol", "Edinburgh", "Leeds"];

const IN_CITIES: { city: string; state: string }[] = [
  { city: "Bengaluru", state: "KA" },
  { city: "Mumbai", state: "MH" },
  { city: "Hyderabad", state: "TS" },
  { city: "Pune", state: "MH" },
];

const DE_CITIES = ["Berlin", "Munich", "Hamburg", "Cologne", "Frankfurt"];

const COUNTRIES: FakeAddressCountry[] = ["US", "GB", "IN", "DE", "CA"];

function mulberry32(seed: number) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(rng: () => number, list: T[]): T {
  return list[Math.floor(rng() * list.length)]!;
}

function digits(rng: () => number, n: number): string {
  return Array.from({ length: n }, () => Math.floor(rng() * 10)).join("");
}

function letter(rng: () => number): string {
  return String.fromCharCode(65 + Math.floor(rng() * 26));
}

function streetLine(rng: () => number): string {
  const num = 10 + Math.floor(rng() * 9890);
  return `${num} ${pick(rng, STREETS)} ${pick(rng, STREET_TYPES)}`;
}

function buildOne(
  rng: () => number,
  country: FakeAddressCountry,
): FakeAddress {
  const line1 = streetLine(rng);
  const line2 = rng() > 0.7 ? `Apt ${10 + Math.floor(rng() * 890)}` : "";

  switch (country) {
    case "US": {
      const { city, state } = pick(rng, US_CITIES);
      const postalCode = digits(rng, 5);
      const formatted = [line1, line2, `${city}, ${state} ${postalCode}`, "United States"]
        .filter(Boolean)
        .join("\n");
      return {
        line1,
        line2,
        city,
        state,
        postalCode,
        country: "United States",
        countryCode: "US",
        formatted,
      };
    }
    case "CA": {
      const { city, state } = pick(rng, CA_CITIES);
      const postalCode = `${letter(rng)}${Math.floor(rng() * 10)}${letter(rng)} ${Math.floor(rng() * 10)}${letter(rng)}${Math.floor(rng() * 10)}`;
      const formatted = [line1, line2, `${city}, ${state} ${postalCode}`, "Canada"]
        .filter(Boolean)
        .join("\n");
      return {
        line1,
        line2,
        city,
        state,
        postalCode,
        country: "Canada",
        countryCode: "CA",
        formatted,
      };
    }
    case "GB": {
      const city = pick(rng, GB_CITIES);
      const postalCode = `${letter(rng)}${letter(rng)}${Math.floor(rng() * 10)} ${Math.floor(rng() * 10)}${letter(rng)}${letter(rng)}`;
      const formatted = [line1, line2, city, postalCode, "United Kingdom"]
        .filter(Boolean)
        .join("\n");
      return {
        line1,
        line2,
        city,
        state: "",
        postalCode,
        country: "United Kingdom",
        countryCode: "GB",
        formatted,
      };
    }
    case "IN": {
      const { city, state } = pick(rng, IN_CITIES);
      const postalCode = digits(rng, 6);
      const formatted = [line1, line2, `${city}, ${state} ${postalCode}`, "India"]
        .filter(Boolean)
        .join("\n");
      return {
        line1,
        line2,
        city,
        state,
        postalCode,
        country: "India",
        countryCode: "IN",
        formatted,
      };
    }
    case "DE": {
      const city = pick(rng, DE_CITIES);
      const postalCode = digits(rng, 5);
      const formatted = [line1, line2, `${postalCode} ${city}`, "Germany"]
        .filter(Boolean)
        .join("\n");
      return {
        line1,
        line2,
        city,
        state: "",
        postalCode,
        country: "Germany",
        countryCode: "DE",
        formatted,
      };
    }
  }
}

export function generateFakeAddresses(
  options: FakeAddressOptions,
):
  | { ok: true; addresses: FakeAddress[]; json: string }
  | { ok: false; error: string } {
  const count = Math.floor(options.count);
  if (!Number.isFinite(count) || count < 1 || count > 100) {
    return { ok: false, error: "Count must be between 1 and 100." };
  }

  const seed =
    options.seed ??
    (typeof globalThis.crypto?.getRandomValues === "function"
      ? globalThis.crypto.getRandomValues(new Uint32Array(1))[0]!
      : Date.now());
  const rng = mulberry32(seed >>> 0);

  const addresses: FakeAddress[] = [];
  for (let i = 0; i < count; i += 1) {
    const country =
      options.country === "random" ? pick(rng, COUNTRIES) : options.country;
    addresses.push(buildOne(rng, country));
  }

  return {
    ok: true,
    addresses,
    json: JSON.stringify(addresses, null, 2) + "\n",
  };
}
