import { PASSPHRASE_WORDS } from "./passphrase-words";

export type PassphraseOptions = {
  /** Number of dictionary words (3–12). */
  wordCount: number;
  /** Separator between words. */
  separator: string;
  /** Capitalize the first letter of each word. */
  capitalize: boolean;
  /** Append a random digit 0–9. */
  includeNumber: boolean;
  /** Append a random symbol from a small safe set. */
  includeSymbol: boolean;
  /** How many passphrases to generate (1–10). */
  count: number;
};

export const DEFAULT_PASSPHRASE_OPTIONS: PassphraseOptions = {
  wordCount: 6,
  separator: "-",
  capitalize: false,
  includeNumber: false,
  includeSymbol: false,
  count: 1,
};

export const PASSPHRASE_SEPARATORS = [
  { id: "-", label: "Hyphen (-)" },
  { id: " ", label: "Space" },
  { id: ".", label: "Dot (.)" },
  { id: "_", label: "Underscore (_)" },
  { id: "", label: "None" },
] as const;

const SYMBOLS = "!@#$%&*?";

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

function pickWord(): string {
  return PASSPHRASE_WORDS[randomIndex(PASSPHRASE_WORDS.length)]!;
}

function formatWord(word: string, capitalize: boolean): string {
  if (!capitalize) return word;
  return word.charAt(0).toUpperCase() + word.slice(1);
}

export function generatePassphrase(options: PassphraseOptions): string {
  const wordCount = Math.max(3, Math.min(12, Math.floor(options.wordCount)));
  const words = Array.from({ length: wordCount }, () =>
    formatWord(pickWord(), options.capitalize),
  );
  let out = words.join(options.separator);
  if (options.includeNumber) {
    out += String(randomIndex(10));
  }
  if (options.includeSymbol) {
    out += SYMBOLS[randomIndex(SYMBOLS.length)]!;
  }
  return out;
}

export function generatePassphrases(options: PassphraseOptions): string[] {
  const count = Math.max(1, Math.min(10, Math.floor(options.count)));
  return Array.from({ length: count }, () => generatePassphrase(options));
}

export type PassphraseStrength = {
  entropyBits: number;
  label: "Weak" | "Fair" | "Strong" | "Very strong";
};

/** Approximate entropy from dictionary size + optional number/symbol. */
export function estimatePassphraseStrength(
  options: PassphraseOptions,
): PassphraseStrength {
  const wordCount = Math.max(3, Math.min(12, Math.floor(options.wordCount)));
  const bitsPerWord = Math.log2(PASSPHRASE_WORDS.length);
  let entropyBits = wordCount * bitsPerWord;
  if (options.includeNumber) entropyBits += Math.log2(10);
  if (options.includeSymbol) entropyBits += Math.log2(SYMBOLS.length);
  entropyBits = Math.round(entropyBits);

  let label: PassphraseStrength["label"] = "Weak";
  if (entropyBits >= 80) label = "Very strong";
  else if (entropyBits >= 60) label = "Strong";
  else if (entropyBits >= 44) label = "Fair";

  return { entropyBits, label };
}
