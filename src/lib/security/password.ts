export type PasswordOptions = {
  length: number;
  lowercase: boolean;
  uppercase: boolean;
  numbers: boolean;
  symbols: boolean;
  excludeAmbiguous: boolean;
};

export type AdvancedPasswordOptions = PasswordOptions & {
  /** How many passwords to generate (1–20). */
  count: number;
  /** Guarantee ≥1 char from each enabled set. */
  requireEverySet: boolean;
  /** First character must be a letter (if letters enabled). */
  beginWithLetter: boolean;
  /** Extra symbols merged into the symbol set when includeCustomSymbols. */
  customSymbols: string;
  includeCustomSymbols: boolean;
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

export const DEFAULT_ADVANCED_PASSWORD_OPTIONS: AdvancedPasswordOptions = {
  ...DEFAULT_PASSWORD_OPTIONS,
  length: 24,
  count: 1,
  requireEverySet: true,
  beginWithLetter: true,
  customSymbols: "",
  includeCustomSymbols: false,
};

function filterAmbiguous(pool: string, exclude: boolean): string {
  if (!exclude) return pool;
  return [...pool].filter((c) => !AMBIGUOUS.has(c)).join("");
}

export function buildPool(options: PasswordOptions): string {
  let pool = "";
  if (options.lowercase) pool += SETS.lowercase;
  if (options.uppercase) pool += SETS.uppercase;
  if (options.numbers) pool += SETS.numbers;
  if (options.symbols) pool += SETS.symbols;
  return filterAmbiguous(pool, options.excludeAmbiguous);
}

export function buildAdvancedPool(options: AdvancedPasswordOptions): string {
  let pool = "";
  if (options.lowercase) pool += SETS.lowercase;
  if (options.uppercase) pool += SETS.uppercase;
  if (options.numbers) pool += SETS.numbers;
  if (options.symbols) pool += SETS.symbols;
  if (options.includeCustomSymbols && options.customSymbols) {
    pool += options.customSymbols;
  }
  // Dedupe while preserving order
  pool = [...new Set(pool)].join("");
  return filterAmbiguous(pool, options.excludeAmbiguous);
}

function enabledSets(options: AdvancedPasswordOptions): string[] {
  const sets: string[] = [];
  if (options.lowercase) {
    sets.push(filterAmbiguous(SETS.lowercase, options.excludeAmbiguous));
  }
  if (options.uppercase) {
    sets.push(filterAmbiguous(SETS.uppercase, options.excludeAmbiguous));
  }
  if (options.numbers) {
    sets.push(filterAmbiguous(SETS.numbers, options.excludeAmbiguous));
  }
  let symbols = "";
  if (options.symbols) symbols += SETS.symbols;
  if (options.includeCustomSymbols) symbols += options.customSymbols;
  if (symbols) {
    sets.push(filterAmbiguous([...new Set(symbols)].join(""), options.excludeAmbiguous));
  }
  return sets.filter((s) => s.length > 0);
}

/** Uniform random int in [0, max) using rejection sampling over the CSPRNG. */
function randomIndex(max: number): number {
  const limit = Math.floor(0xffffffff / max) * max;
  const buf = new Uint32Array(1);
  let value: number;
  do {
    globalThis.crypto.getRandomValues(buf);
    value = buf[0]!;
  } while (value >= limit);
  return value % max;
}

function pick(pool: string): string {
  return pool[randomIndex(pool.length)]!;
}

function shuffleInPlace(chars: string[]): void {
  for (let i = chars.length - 1; i > 0; i -= 1) {
    const j = randomIndex(i + 1);
    [chars[i], chars[j]] = [chars[j]!, chars[i]!];
  }
}

export function generatePassword(options: PasswordOptions): string {
  const pool = buildPool(options);
  if (pool.length === 0) return "";
  const length = Math.max(1, Math.min(256, Math.floor(options.length)));

  let out = "";
  for (let i = 0; i < length; i += 1) {
    out += pick(pool);
  }
  return out;
}

export function generateAdvancedPassword(
  options: AdvancedPasswordOptions,
): string {
  const pool = buildAdvancedPool(options);
  if (pool.length === 0) return "";

  const sets = enabledSets(options);
  const length = Math.max(
    options.requireEverySet ? Math.max(1, sets.length) : 1,
    Math.min(256, Math.floor(options.length)),
  );

  const chars: string[] = [];

  if (options.requireEverySet) {
    for (const set of sets) chars.push(pick(set));
  }

  while (chars.length < length) {
    chars.push(pick(pool));
  }

  shuffleInPlace(chars);

  if (options.beginWithLetter) {
    const letters = filterAmbiguous(
      `${options.lowercase ? SETS.lowercase : ""}${options.uppercase ? SETS.uppercase : ""}`,
      options.excludeAmbiguous,
    );
    if (letters.length > 0 && !/[a-zA-Z]/.test(chars[0] ?? "")) {
      chars[0] = pick(letters);
    }
  }

  return chars.join("");
}

export function generateAdvancedPasswords(
  options: AdvancedPasswordOptions,
): string[] {
  const count = Math.max(1, Math.min(20, Math.floor(options.count)));
  return Array.from({ length: count }, () => generateAdvancedPassword(options));
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

export function estimateAdvancedStrength(
  options: AdvancedPasswordOptions,
): PasswordStrength {
  const pool = buildAdvancedPool(options);
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
