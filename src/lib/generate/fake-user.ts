export type FakeUser = {
  id: string;
  username: string;
  email: string;
  name: { first: string; last: string; full: string };
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  company: string;
  jobTitle: string;
  avatarSeed: string;
  createdAt: string;
};

export type FakeUserOptions = {
  count: number;
  /** Include nested address / company fields. */
  rich: boolean;
  seed?: number;
};

const FIRST = [
  "Ada",
  "Grace",
  "Alan",
  "Katherine",
  "Linus",
  "Margaret",
  "Edsger",
  "Barbara",
  "Donald",
  "Radia",
  "Tim",
  "Sophie",
  "Niklaus",
  "Anita",
  "Ken",
  "Hedy",
];

const LAST = [
  "Lovelace",
  "Hopper",
  "Turing",
  "Johnson",
  "Torvalds",
  "Hamilton",
  "Dijkstra",
  "Liskov",
  "Knuth",
  "Perlman",
  "Berners-Lee",
  "Wilson",
  "Wirth",
  "Borg",
  "Thompson",
  "Lamarr",
];

const CITIES = [
  "Austin",
  "Berlin",
  "Bengaluru",
  "Toronto",
  "Lisbon",
  "Seoul",
  "Nairobi",
  "Santiago",
];

const STATES = ["TX", "CA", "NY", "WA", "ON", "BL", "KA", "LG"];

const COMPANIES = [
  "Northwind Labs",
  "Forgeworks",
  "Pixel Harbor",
  "Cascade Systems",
  "Lemonline Soft",
  "Orbit Desk",
];

const TITLES = [
  "Software Engineer",
  "Product Designer",
  "Data Analyst",
  "DevOps Engineer",
  "Support Lead",
  "QA Specialist",
];

const STREETS = [
  "Oak",
  "Maple",
  "Cedar",
  "Pine",
  "Willow",
  "Harbor",
  "Market",
  "Summit",
];

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

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 12);
}

function randomId(rng: () => number): string {
  const hex = Array.from({ length: 8 }, () =>
    Math.floor(rng() * 16).toString(16),
  ).join("");
  return `usr_${hex}`;
}

export function generateFakeUsers(
  options: FakeUserOptions,
): { ok: true; users: FakeUser[]; json: string } | { ok: false; error: string } {
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

  const users: FakeUser[] = [];
  for (let i = 0; i < count; i += 1) {
    const first = pick(rng, FIRST);
    const last = pick(rng, LAST);
    const username = `${slugify(first)}.${slugify(last)}${Math.floor(rng() * 90 + 10)}`;
    const domain = pick(rng, ["example.com", "example.org", "test.local"]);
    const created = new Date(
      Date.UTC(2020 + Math.floor(rng() * 6), Math.floor(rng() * 12), 1 + Math.floor(rng() * 27)),
    );

    const user: FakeUser = {
      id: randomId(rng),
      username,
      email: `${username}@${domain}`,
      name: { first, last, full: `${first} ${last}` },
      phone: `+1-555-${String(100 + Math.floor(rng() * 900)).padStart(3, "0")}-${String(1000 + Math.floor(rng() * 9000))}`,
      address: options.rich
        ? {
            street: `${100 + Math.floor(rng() * 8900)} ${pick(rng, STREETS)} St`,
            city: pick(rng, CITIES),
            state: pick(rng, STATES),
            zip: String(10000 + Math.floor(rng() * 89999)),
            country: "US",
          }
        : {
            street: "",
            city: "",
            state: "",
            zip: "",
            country: "",
          },
      company: options.rich ? pick(rng, COMPANIES) : "",
      jobTitle: options.rich ? pick(rng, TITLES) : "",
      avatarSeed: username,
      createdAt: created.toISOString().slice(0, 10),
    };

    users.push(user);
  }

  const payload = options.rich
    ? users
    : users.map(({ id, username, email, name, phone, createdAt }) => ({
        id,
        username,
        email,
        name,
        phone,
        createdAt,
      }));

  return {
    ok: true,
    users: payload as FakeUser[],
    json: JSON.stringify(payload, null, 2) + "\n",
  };
}
