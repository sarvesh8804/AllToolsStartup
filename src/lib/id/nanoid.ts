export const DEFAULT_NANOID_ALPHABET =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz-";

export const DEFAULT_NANOID_SIZE = 21;
export const NANOID_MAX_BATCH = 1000;
export const NANOID_MAX_SIZE = 64;
export const NANOID_MIN_SIZE = 1;

function getCrypto(): Crypto {
  const c = globalThis.crypto;
  if (!c?.getRandomValues) {
    throw new Error("Secure random is not available in this environment.");
  }
  return c;
}

/** Generate a NanoID using the standard URL-safe alphabet. */
export function nanoid(
  size = DEFAULT_NANOID_SIZE,
  alphabet = DEFAULT_NANOID_ALPHABET,
): string {
  const length = Math.max(
    NANOID_MIN_SIZE,
    Math.min(NANOID_MAX_SIZE, Math.floor(size) || DEFAULT_NANOID_SIZE),
  );
  const n = alphabet.length;
  if (n < 2 || n > 256) {
    throw new Error("Alphabet must contain 2–256 characters.");
  }

  const mask = (2 << Math.floor(Math.log2(n - 1))) - 1;
  const step = Math.ceil((1.6 * mask * length) / n);
  const crypto = getCrypto();
  let id = "";

  while (id.length < length) {
    const bytes = crypto.getRandomValues(new Uint8Array(step));
    for (let i = 0; i < bytes.length && id.length < length; i++) {
      const index = bytes[i]! & mask;
      if (index < n) id += alphabet[index]!;
    }
  }

  return id;
}

export type NanoidBatchOptions = {
  count?: number;
  size?: number;
  alphabet?: string;
};

export function nanoidBatch(options: NanoidBatchOptions = {}): string[] {
  const count = Math.max(
    1,
    Math.min(NANOID_MAX_BATCH, Math.floor(options.count ?? 1) || 1),
  );
  const size = options.size ?? DEFAULT_NANOID_SIZE;
  const alphabet = options.alphabet ?? DEFAULT_NANOID_ALPHABET;
  return Array.from({ length: count }, () => nanoid(size, alphabet));
}
