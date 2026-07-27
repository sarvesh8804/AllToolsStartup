export type FakeName = {
  first: string;
  last: string;
  full: string;
  username: string;
  initials: string;
};

export type FakeNameOptions = {
  count: number;
  style: "western" | "mixed";
  includeUsername: boolean;
  seed?: number;
};

const FIRST_WESTERN = [
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
  "James",
  "Maria",
  "Omar",
  "Elena",
];

const LAST_WESTERN = [
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
  "Wilson",
  "Wirth",
  "Borg",
  "Thompson",
  "Lamarr",
  "Garcia",
  "Chen",
  "Patel",
  "Nguyen",
  "Silva",
];

const FIRST_MIXED = [
  ...FIRST_WESTERN,
  "Aisha",
  "Yuki",
  "Priya",
  "Hassan",
  "Mei",
  "Diego",
  "Fatima",
  "Soren",
];

const LAST_MIXED = [
  ...LAST_WESTERN,
  "Kim",
  "Ivanov",
  "Okafor",
  "Fernandez",
  "Nakamura",
  "Singh",
  "Almeida",
  "Berg",
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

function slug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

export function generateFakeNames(
  options: FakeNameOptions,
):
  | { ok: true; names: FakeName[]; json: string; plain: string }
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
  const firstPool =
    options.style === "mixed" ? FIRST_MIXED : FIRST_WESTERN;
  const lastPool = options.style === "mixed" ? LAST_MIXED : LAST_WESTERN;

  const names: FakeName[] = [];
  for (let i = 0; i < count; i += 1) {
    const first = pick(rng, firstPool);
    const last = pick(rng, lastPool);
    const username = options.includeUsername
      ? `${slug(first)}.${slug(last)}${Math.floor(rng() * 90 + 10)}`
      : "";
    names.push({
      first,
      last,
      full: `${first} ${last}`,
      username,
      initials: `${first[0] ?? ""}${last[0] ?? ""}`.toUpperCase(),
    });
  }

  const payload = options.includeUsername
    ? names
    : names.map(({ first, last, full, initials }) => ({
        first,
        last,
        full,
        initials,
      }));

  return {
    ok: true,
    names,
    json: JSON.stringify(payload, null, 2) + "\n",
    plain: names.map((n) => n.full).join("\n") + (names.length ? "\n" : ""),
  };
}
