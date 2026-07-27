export type PasswordStrengthLabel =
  | "Very weak"
  | "Weak"
  | "Fair"
  | "Strong"
  | "Very strong";

export type PasswordChecks = {
  length: boolean;
  lowercase: boolean;
  uppercase: boolean;
  number: boolean;
  symbol: boolean;
  noCommon: boolean;
  noRepeat: boolean;
};

export type PasswordAnalysis = {
  length: number;
  charsetSize: number;
  entropyBits: number;
  score: number;
  label: PasswordStrengthLabel;
  checks: PasswordChecks;
  feedback: string[];
};

const COMMON = [
  "password",
  "password1",
  "123456",
  "12345678",
  "123456789",
  "qwerty",
  "abc123",
  "letmein",
  "welcome",
  "admin",
  "iloveyou",
  "monkey",
  "dragon",
  "master",
  "login",
];

function hasRepeatedRun(password: string): boolean {
  return /(.)\1{2,}/.test(password);
}

function estimateCharsetSize(password: string): number {
  let size = 0;
  if (/[a-z]/.test(password)) size += 26;
  if (/[A-Z]/.test(password)) size += 26;
  if (/\d/.test(password)) size += 10;
  if (/[^a-zA-Z0-9]/.test(password)) size += 32;
  return size;
}

function labelFromScore(score: number): PasswordStrengthLabel {
  if (score >= 85) return "Very strong";
  if (score >= 70) return "Strong";
  if (score >= 50) return "Fair";
  if (score >= 30) return "Weak";
  return "Very weak";
}

/**
 * Heuristic analysis of an existing password (not a guarantee).
 * Entropy ≈ length × log2(detected charset size).
 */
export function analyzePassword(password: string): PasswordAnalysis {
  const length = [...password].length;
  const charsetSize = estimateCharsetSize(password);
  const entropyBits =
    length > 0 && charsetSize > 1
      ? Math.round(length * Math.log2(charsetSize))
      : 0;

  const lower = password.toLowerCase();
  const checks: PasswordChecks = {
    length: length >= 12,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /\d/.test(password),
    symbol: /[^a-zA-Z0-9]/.test(password),
    noCommon: !COMMON.some((c) => lower === c || lower.includes(c)),
    noRepeat: !hasRepeatedRun(password),
  };

  let score = 0;
  if (length >= 8) score += 10;
  if (length >= 12) score += 15;
  if (length >= 16) score += 15;
  if (checks.lowercase) score += 10;
  if (checks.uppercase) score += 10;
  if (checks.number) score += 10;
  if (checks.symbol) score += 15;
  if (checks.noCommon) score += 10;
  if (checks.noRepeat) score += 5;
  if (entropyBits >= 60) score += 5;
  if (entropyBits >= 80) score += 5;
  if (entropyBits >= 100) score += 5;
  score = Math.min(100, score);

  if (length === 0) score = 0;
  if (!checks.noCommon) score = Math.min(score, 25);

  const feedback: string[] = [];
  if (length === 0) {
    feedback.push("Enter a password to analyze.");
  } else {
    if (!checks.length) feedback.push("Use at least 12 characters.");
    if (!checks.lowercase) feedback.push("Add lowercase letters.");
    if (!checks.uppercase) feedback.push("Add uppercase letters.");
    if (!checks.number) feedback.push("Add a number.");
    if (!checks.symbol) feedback.push("Add a symbol (!@#…).");
    if (!checks.noCommon) feedback.push("Avoid common passwords and patterns.");
    if (!checks.noRepeat) {
      feedback.push("Avoid long runs of the same character (aaa, 111).");
    }
    if (feedback.length === 0) {
      feedback.push("Looks solid for a random or unique passphrase.");
    }
  }

  return {
    length,
    charsetSize,
    entropyBits,
    score,
    label: length === 0 ? "Very weak" : labelFromScore(score),
    checks,
    feedback,
  };
}
