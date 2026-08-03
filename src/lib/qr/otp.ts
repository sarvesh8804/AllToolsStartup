export type OtpAlgorithm = "SHA1" | "SHA256" | "SHA512";
export type OtpDigits = 6 | 8;

export type OtpSetupInput = {
  issuer: string;
  account: string;
  secret: string;
  algorithm?: OtpAlgorithm;
  digits?: OtpDigits;
  period?: number;
};

export type OtpSetupResult =
  | { ok: true; uri: string; label: string }
  | { ok: false; error: string };

const BASE32 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

/** Normalize and validate a Base32 secret (spaces/padding allowed). */
export function normalizeBase32Secret(secret: string): string {
  return secret.replace(/\s+/g, "").replace(/=+$/g, "").toUpperCase();
}

export function isValidBase32Secret(secret: string): boolean {
  const normalized = normalizeBase32Secret(secret);
  if (!normalized || normalized.length < 16) return false;
  return /^[A-Z2-7]+$/.test(normalized);
}

function encodeUriComponentStrict(value: string): string {
  return encodeURIComponent(value).replace(
    /[!'()*]/g,
    (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`,
  );
}

/** Build an otpauth:// TOTP URI for authenticator app setup. */
export function buildOtpAuthUri(input: OtpSetupInput): OtpSetupResult {
  const issuer = input.issuer.trim();
  const account = input.account.trim();
  const secret = normalizeBase32Secret(input.secret);
  const algorithm = input.algorithm ?? "SHA1";
  const digits = input.digits ?? 6;
  const period = Math.max(15, Math.min(120, Math.floor(input.period ?? 30)));

  if (!issuer) {
    return { ok: false, error: "Issuer is required (e.g. GitHub, Google)." };
  }
  if (!account) {
    return { ok: false, error: "Account label is required (e.g. you@email.com)." };
  }
  if (!isValidBase32Secret(secret)) {
    return {
      ok: false,
      error: "Secret must be Base32 (A–Z, 2–7) and at least 16 characters.",
    };
  }

  const label = `${issuer}:${account}`;
  const params = new URLSearchParams({
    secret,
    issuer,
    algorithm,
    digits: String(digits),
    period: String(period),
  });

  const uri = `otpauth://totp/${encodeUriComponentStrict(label)}?${params.toString()}`;
  return { ok: true, uri, label };
}

/** Generate a random Base32 secret suitable for TOTP setup. */
export function generateOtpSecret(length = 32): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  let out = "";
  for (let i = 0; i < length; i += 1) {
    out += BASE32[bytes[i]! % 32]!;
  }
  return out;
}

export const SAMPLE_OTP_INPUT: OtpSetupInput = {
  issuer: "Forge",
  account: "demo@example.com",
  secret: "JBSWY3DPEHPK3PXP",
};
