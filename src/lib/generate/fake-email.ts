export type FakeEmailOptions = {
  count: number;
  domain: string;
  /** Use random disposable-looking domains instead of a fixed domain. */
  randomDomain: boolean;
  seed?: number;
};

const LOCAL_PARTS = [
  "ada",
  "grace",
  "alan",
  "kate",
  "linus",
  "margaret",
  "edsger",
  "barbara",
  "donald",
  "radia",
  "tim",
  "sophie",
  "dev",
  "test",
  "user",
  "demo",
];

const DOMAINS = [
  "example.com",
  "example.org",
  "example.net",
  "test.local",
  "mail.test",
  "inbox.example",
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

function sanitizeDomain(domain: string): string | null {
  const d = domain.trim().toLowerCase();
  if (!d) return null;
  if (!/^[a-z0-9]([a-z0-9.-]*[a-z0-9])?$/i.test(d)) return null;
  if (!d.includes(".")) return null;
  return d;
}

export function generateFakeEmails(
  options: FakeEmailOptions,
):
  | { ok: true; emails: string[]; plain: string; json: string }
  | { ok: false; error: string } {
  const count = Math.floor(options.count);
  if (!Number.isFinite(count) || count < 1 || count > 100) {
    return { ok: false, error: "Count must be between 1 and 100." };
  }

  let fixedDomain: string | null = null;
  if (!options.randomDomain) {
    fixedDomain = sanitizeDomain(options.domain);
    if (!fixedDomain) {
      return {
        ok: false,
        error: "Enter a valid domain like example.com.",
      };
    }
  }

  const seed =
    options.seed ??
    (typeof globalThis.crypto?.getRandomValues === "function"
      ? globalThis.crypto.getRandomValues(new Uint32Array(1))[0]!
      : Date.now());
  const rng = mulberry32(seed >>> 0);

  const emails: string[] = [];
  for (let i = 0; i < count; i += 1) {
    const local = `${pick(rng, LOCAL_PARTS)}.${pick(rng, LOCAL_PARTS)}${Math.floor(rng() * 90 + 10)}`;
    const domain = fixedDomain ?? pick(rng, DOMAINS);
    emails.push(`${local}@${domain}`);
  }

  return {
    ok: true,
    emails,
    plain: emails.join("\n") + (emails.length ? "\n" : ""),
    json: JSON.stringify(emails, null, 2) + "\n",
  };
}
