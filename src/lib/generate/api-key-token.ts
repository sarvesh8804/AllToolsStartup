export type ApiKeyStyle = "stripe" | "generic";
export type ApiKeyRole = "sk" | "pk" | "api";
export type ApiKeyEnvironment = "live" | "test" | "none";

export type ApiKeyTokenOptions = {
  count?: number;
  style?: ApiKeyStyle;
  role?: ApiKeyRole;
  environment?: ApiKeyEnvironment;
  prefix?: string;
  secretLength?: number;
};

export const API_KEY_TOKEN_MAX = 50;
export const API_KEY_SECRET_MIN = 16;
export const API_KEY_SECRET_MAX = 64;

const BASE64URL =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";

export const DEFAULT_API_KEY_TOKEN_OPTIONS: ApiKeyTokenOptions = {
  count: 5,
  style: "stripe",
  role: "sk",
  environment: "live",
  prefix: "forge",
  secretLength: 32,
};

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

function randomFromAlphabet(length: number, alphabet: string): string {
  let out = "";
  for (let i = 0; i < length; i += 1) {
    out += alphabet[randomIndex(alphabet.length)]!;
  }
  return out;
}

function normalizeSecretLength(length: number | undefined): number {
  return Math.max(
    API_KEY_SECRET_MIN,
    Math.min(API_KEY_SECRET_MAX, Math.floor(length ?? 32) || 32),
  );
}

function buildStripeLikeToken(options: ApiKeyTokenOptions): string {
  const role = options.role ?? "sk";
  const env = options.environment ?? "live";
  const secretLength = normalizeSecretLength(options.secretLength);
  const secret = randomFromAlphabet(secretLength, BASE64URL);
  if (env === "none") {
    return `${role}_${secret}`;
  }
  return `${role}_${env}_${secret}`;
}

function buildGenericToken(options: ApiKeyTokenOptions): string {
  const prefix = (options.prefix ?? "api").trim() || "api";
  const secretLength = normalizeSecretLength(options.secretLength);
  const secret = randomFromAlphabet(secretLength, BASE64URL);
  return `${prefix}_${secret}`;
}

/** Generate API-key-style tokens for demos and local development. */
export function generateApiKeyToken(
  options: ApiKeyTokenOptions = {},
): string {
  const style = options.style ?? "stripe";
  return style === "stripe"
    ? buildStripeLikeToken(options)
    : buildGenericToken(options);
}

export function generateApiKeyTokens(
  options: ApiKeyTokenOptions = {},
): string[] {
  const count = Math.max(
    1,
    Math.min(API_KEY_TOKEN_MAX, Math.floor(options.count ?? 1) || 1),
  );
  return Array.from({ length: count }, () => generateApiKeyToken(options));
}
