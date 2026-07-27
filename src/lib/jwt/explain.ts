import { claimToDate, decodeJwt, type JwtParts } from "./decode";

export type ClaimSeverity = "info" | "ok" | "warn" | "danger";

export type ExplainedClaim = {
  name: string;
  value: unknown;
  displayValue: string;
  explanation: string;
  severity: ClaimSeverity;
  /** ISO date when this is a time claim */
  isoDate?: string | null;
};

export type JwtExplainResult =
  | {
      ok: true;
      parts: JwtParts;
      headerClaims: ExplainedClaim[];
      payloadClaims: ExplainedClaim[];
      summary: string[];
    }
  | { ok: false; error: string };

const HEADER_DOCS: Record<string, string> = {
  alg: "Signing or encryption algorithm used for the signature.",
  typ: "Token type. Usually JWT.",
  cty: "Content type of the nested token when nested JWTs are used.",
  kid: "Key ID — hints which key to use when verifying.",
  jku: "URL of a JWK Set containing the key. Treat as untrusted until verified.",
  jwk: "Embedded JSON Web Key. Rare in production access tokens.",
  x5u: "URL of an X.509 certificate chain.",
  x5c: "X.509 certificate chain embedded in the header.",
  x5t: "SHA-1 thumbprint of an X.509 certificate.",
  "x5t#S256": "SHA-256 thumbprint of an X.509 certificate.",
  crit: "Extensions that must be understood and processed.",
};

const PAYLOAD_DOCS: Record<string, string> = {
  iss: "Issuer — who created and signed the token.",
  sub: "Subject — the principal the token is about (often a user id).",
  aud: "Audience — intended recipient(s). Verifiers should reject mismatches.",
  exp: "Expiration time — after this instant the token must be rejected.",
  nbf: "Not-before — before this instant the token must be rejected.",
  iat: "Issued-at — when the token was created.",
  jti: "JWT ID — unique identifier, useful for replay detection.",
  azp: "Authorized party — OAuth client that requested the token.",
  scope: "OAuth 2.0 scopes granted to this token.",
  scp: "Alternate claim name for scopes (some IdPs).",
  roles: "Application roles assigned to the subject.",
  email: "Email address associated with the subject.",
  name: "Display name of the subject.",
  preferred_username: "Preferred username for the subject.",
  nonce: "String value used to associate a client session with an ID token.",
  auth_time: "When the end-user authenticated.",
  amr: "Authentication methods reference.",
  acr: "Authentication context class reference.",
  sid: "Session ID.",
};

const TIME_CLAIMS = new Set(["exp", "nbf", "iat", "auth_time"]);

function stringifyValue(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function explainAlg(alg: unknown): { explanation: string; severity: ClaimSeverity } {
  if (typeof alg !== "string") {
    return { explanation: HEADER_DOCS.alg!, severity: "warn" };
  }
  if (alg === "none") {
    return {
      explanation:
        "alg=none means an unsigned token. Verifiers must reject this unless explicitly allowed.",
      severity: "danger",
    };
  }
  if (alg.startsWith("HS")) {
    return {
      explanation: `${HEADER_DOCS.alg} HMAC with a shared secret (${alg}).`,
      severity: "info",
    };
  }
  if (alg.startsWith("RS") || alg.startsWith("PS") || alg.startsWith("ES")) {
    return {
      explanation: `${HEADER_DOCS.alg} asymmetric algorithm (${alg}).`,
      severity: "info",
    };
  }
  return {
    explanation: `${HEADER_DOCS.alg} Reported algorithm: ${alg}.`,
    severity: "warn",
  };
}

function timeSeverity(
  claim: string,
  epochSec: number,
  nowSec: number,
): ClaimSeverity {
  if (claim === "exp") {
    if (epochSec <= nowSec) return "danger";
    if (epochSec - nowSec < 300) return "warn";
    return "ok";
  }
  if (claim === "nbf") {
    if (epochSec > nowSec) return "warn";
    return "ok";
  }
  return "info";
}

function explainTimeClaim(
  name: string,
  value: unknown,
  nowSec: number,
): ExplainedClaim {
  const iso = claimToDate(value);
  const base = PAYLOAD_DOCS[name] ?? `Custom time claim “${name}”.`;
  if (typeof value !== "number" || !iso) {
    return {
      name,
      value,
      displayValue: stringifyValue(value),
      explanation: `${base} Value is not a numeric Unix timestamp.`,
      severity: "warn",
    };
  }

  const severity = timeSeverity(name, value, nowSec);
  let status = "";
  if (name === "exp") {
    status =
      value <= nowSec
        ? " Token is expired relative to now."
        : " Token is not expired yet.";
  } else if (name === "nbf") {
    status =
      value > nowSec
        ? " Token is not yet valid (nbf in the future)."
        : " Not-before has passed.";
  }

  return {
    name,
    value,
    displayValue: `${value} (${iso})`,
    explanation: `${base}${status}`,
    severity,
    isoDate: iso,
  };
}

function explainHeaderClaim(name: string, value: unknown): ExplainedClaim {
  if (name === "alg") {
    const { explanation, severity } = explainAlg(value);
    return {
      name,
      value,
      displayValue: stringifyValue(value),
      explanation,
      severity,
    };
  }
  return {
    name,
    value,
    displayValue: stringifyValue(value),
    explanation: HEADER_DOCS[name] ?? `Custom header parameter “${name}”.`,
    severity: "info",
  };
}

function explainPayloadClaim(
  name: string,
  value: unknown,
  nowSec: number,
): ExplainedClaim {
  if (TIME_CLAIMS.has(name)) {
    return explainTimeClaim(name, value, nowSec);
  }
  return {
    name,
    value,
    displayValue: stringifyValue(value),
    explanation: PAYLOAD_DOCS[name] ?? `Custom claim “${name}”.`,
    severity: "info",
  };
}

function buildSummary(
  header: ExplainedClaim[],
  payload: ExplainedClaim[],
): string[] {
  const lines: string[] = [
    "Signature is not verified — this tool only decodes and explains claims.",
  ];
  const alg = header.find((c) => c.name === "alg");
  if (alg) lines.push(`Algorithm: ${alg.displayValue}.`);
  for (const c of payload) {
    if (c.severity === "danger" || c.severity === "warn") {
      lines.push(c.explanation);
    }
  }
  return lines;
}

/** Decode a JWT and attach human explanations for header/payload claims. */
export function explainJwt(
  token: string,
  nowMs: number = Date.now(),
): JwtExplainResult {
  const decoded = decodeJwt(token);
  if (!decoded.ok) return decoded;

  const nowSec = Math.floor(nowMs / 1000);
  const { header, payload } = decoded.value;

  const headerClaims = Object.entries(header).map(([name, value]) =>
    explainHeaderClaim(name, value),
  );
  const payloadClaims = Object.entries(payload).map(([name, value]) =>
    explainPayloadClaim(name, value, nowSec),
  );

  return {
    ok: true,
    parts: decoded.value,
    headerClaims,
    payloadClaims,
    summary: buildSummary(headerClaims, payloadClaims),
  };
}
