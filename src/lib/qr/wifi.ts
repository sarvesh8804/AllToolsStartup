export type WifiAuth = "WPA" | "WEP" | "nopass";

export type WifiQrOptions = {
  ssid: string;
  password: string;
  auth: WifiAuth;
  /** Hidden network (default false). */
  hidden?: boolean;
};

/**
 * Escape special characters for WIFI: QR payload (MECARD-like escaping).
 * Spec: `\`, `;`, `,`, `"`, `:` must be escaped with a backslash.
 */
export function escapeWifiField(value: string): string {
  return value.replace(/([\\;,:"])/g, "\\$1");
}

export function unescapeWifiField(value: string): string {
  let out = "";
  for (let i = 0; i < value.length; i++) {
    if (value[i] === "\\" && i + 1 < value.length) {
      out += value[i + 1];
      i += 1;
    } else {
      out += value[i];
    }
  }
  return out;
}

/**
 * Build a WIFI: QR payload string.
 * Format: WIFI:T:<auth>;S:<ssid>;P:<password>;H:<true|false>;;
 */
export function buildWifiQrPayload(options: WifiQrOptions): string {
  const ssid = options.ssid.trim();
  if (!ssid) {
    throw new Error("Enter a network name (SSID).");
  }

  const auth = options.auth;
  const password = options.password;
  if (auth !== "nopass" && !password) {
    throw new Error("Enter a password, or choose Open (nopass).");
  }

  const parts = [
    `T:${auth}`,
    `S:${escapeWifiField(ssid)}`,
  ];

  if (auth !== "nopass") {
    parts.push(`P:${escapeWifiField(password)}`);
  } else {
    parts.push("P:");
  }

  if (options.hidden) {
    parts.push("H:true");
  }

  return `WIFI:${parts.join(";")};`;
}

export type ParsedWifiQr =
  | {
      ok: true;
      ssid: string;
      password: string;
      auth: WifiAuth;
      hidden: boolean;
    }
  | { ok: false; error: string };

/**
 * Best-effort parse of a WIFI: payload (for display / tests).
 */
export function parseWifiQrPayload(raw: string): ParsedWifiQr {
  const text = raw.trim();
  if (!/^WIFI:/i.test(text)) {
    return { ok: false, error: "Not a WIFI: QR payload." };
  }

  const body = text.slice(5);
  const fields: Record<string, string> = {};
  let key = "";
  let value = "";
  let inKey = true;
  let escaped = false;

  const flush = () => {
    if (key) fields[key.toUpperCase()] = value;
    key = "";
    value = "";
    inKey = true;
  };

  for (let i = 0; i < body.length; i++) {
    const ch = body[i]!;
    if (escaped) {
      if (inKey) key += ch;
      else value += ch;
      escaped = false;
      continue;
    }
    if (ch === "\\") {
      escaped = true;
      continue;
    }
    if (ch === ";" && !inKey) {
      flush();
      continue;
    }
    if (ch === ":" && inKey) {
      inKey = false;
      continue;
    }
    if (inKey) key += ch;
    else value += ch;
  }
  if (key || value) flush();

  const ssid = unescapeWifiField(fields.S ?? "");
  if (!ssid) return { ok: false, error: "Missing SSID (S:)." };

  const t = (fields.T ?? "nopass").toUpperCase();
  let auth: WifiAuth = "nopass";
  if (t === "WPA" || t === "WPA2" || t === "WPA/WPA2") auth = "WPA";
  else if (t === "WEP") auth = "WEP";
  else auth = "nopass";

  const password = unescapeWifiField(fields.P ?? "");
  const hidden =
    String(fields.H ?? "").toLowerCase() === "true" || fields.H === "1";

  return { ok: true, ssid, password, auth, hidden };
}
