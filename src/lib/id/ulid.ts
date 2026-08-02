const ENCODING = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

export const ULID_MAX_BATCH = 1000;

function getCrypto(): Crypto {
  const c = globalThis.crypto;
  if (!c?.getRandomValues) {
    throw new Error("Secure random is not available in this environment.");
  }
  return c;
}

function encodeTime(now: number): string {
  if (!Number.isFinite(now) || now < 0 || now > 0xffffffffffff) {
    throw new Error("Timestamp must be between 0 and 2^48 - 1.");
  }

  let time = Math.floor(now);
  let str = "";
  for (let i = 0; i < 10; i++) {
    const mod = time % 32;
    str = ENCODING[mod]! + str;
    time = (time - mod) / 32;
  }
  return str;
}

function encodeRandom(): string {
  const random = getCrypto().getRandomValues(new Uint8Array(10));
  let str = "";
  let value = 0;
  let bits = 0;

  for (const byte of random) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      str += ENCODING[(value >>> (bits - 5)) & 31]!;
      bits -= 5;
    }
  }

  if (bits > 0) {
    str += ENCODING[(value << (5 - bits)) & 31]!;
  }

  return str.slice(0, 16);
}

/** Generate a ULID for the given timestamp (defaults to now). */
export function ulid(timestamp = Date.now()): string {
  return encodeTime(timestamp) + encodeRandom();
}

export function ulidBatch(count: number, timestamp = Date.now()): string[] {
  const n = Math.max(1, Math.min(ULID_MAX_BATCH, Math.floor(count) || 1));
  const baseTime = Math.floor(timestamp);
  return Array.from({ length: n }, (_, index) => ulid(baseTime + index));
}

export function decodeUlidTimestamp(id: string): number | null {
  const trimmed = id.trim().toUpperCase();
  if (trimmed.length < 10) return null;

  let time = 0;
  for (let i = 0; i < 10; i++) {
    const char = trimmed[i]!;
    const value = ENCODING.indexOf(char);
    if (value === -1) return null;
    time = time * 32 + value;
  }
  return time;
}

export function isUlid(value: string): boolean {
  const trimmed = value.trim();
  if (trimmed.length !== 26) return false;
  return /^[0-9A-HJKMNP-TV-Z]{26}$/i.test(trimmed);
}
