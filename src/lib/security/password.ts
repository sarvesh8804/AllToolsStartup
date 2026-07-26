export type PasswordOptions = {
  length: number;
  lowercase: boolean;
  uppercase: boolean;
  numbers: boolean;
  symbols: boolean;
  excludeAmbiguous: boolean;
};

const SETS = {
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  numbers: "0123456789",
  symbols: "!@#$%^&*()-_=+[]{};:,.<>?",
};

const AMBIGUOUS = new Set(["l", "I", "1", "O", "0", "o"]);

export const DEFAULT_PASSWORD_OPTIONS: PasswordOptions = {
  length: 20,
  lowercase: true,
  uppercase: true,
  numbers: true,
  symbols: true,
  excludeAmbiguous: false,
};

export function buildPool(options: PasswordOptions): string {
  let pool = "";
  if (options.lowercase) pool += SETS.lowercase;
  if (options.uppercase) pool += SETS.uppercase;
  if (options.numbers) pool += SETS.numbers;
  if (options.symbols) pool += SETS.symbols;

  if (options.excludeAmbiguous) {
    pool = [...pool].filter((c) => !AMBIGUOUS.has(c)).join("");
  }
  return pool;
}

/** Uniform random int in [0, max) using rejection sampling over the CSPRNG. */
function randomIndex(max: number): number {
  const limit = Math.floor(0xffffffff / max) * max;
  const buf = new Uint32Array(1);
  let value: number;
  do {
    globalThis.crypto.getRandomValues(buf);
    value = buf[0];
  } while (value >= limit);
  return value % max;
}

export function generatePassword(options: PasswordOptions): string {
  const pool = buildPool(options);
  if (pool.length === 0) return "";
  const length = Math.max(1, Math.min(256, Math.floor(options.length)));

  let out = "";
  for (let i = 0; i < length; i += 1) {
    out += pool[randomIndex(pool.length)];
  }
  return out;
}

export type PasswordStrength = {
  entropyBits: number;
  label: "Very weak" | "Weak" | "Fair" | "Strong" | "Very strong";
};

export function estimateStrength(options: PasswordOptions): PasswordStrength {
  const pool = buildPool(options);
  const length = Math.max(0, Math.floor(options.length));
  const entropyBits =
    pool.length > 1 ? Math.round(length * Math.log2(pool.length)) : 0;

  let label: PasswordStrength["label"] = "Very weak";
  if (entropyBits >= 128) label = "Very strong";
  else if (entropyBits >= 80) label = "Strong";
  else if (entropyBits >= 60) label = "Fair";
  else if (entropyBits >= 36) label = "Weak";

  return { entropyBits, label };
}
