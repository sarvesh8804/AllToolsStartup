export type UserAgentField = {
  label: string;
  value: string;
};

export type ParsedUserAgent = {
  raw: string;
  browser: string;
  browserVersion: string;
  engine: string;
  os: string;
  osVersion: string;
  device: string;
  deviceType: "desktop" | "mobile" | "tablet" | "bot" | "unknown";
  isBot: boolean;
  fields: UserAgentField[];
};

export const SAMPLE_USER_AGENTS = {
  chrome:
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  safariMobile:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
  firefox:
    "Mozilla/5.0 (X11; Linux x86_64; rv:121.0) Gecko/20100101 Firefox/121.0",
  curl: "curl/8.4.0",
  googlebot:
    "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
} as const;

const BOT_PATTERN =
  /bot|crawler|spider|slurp|bingpreview|googlebot|bingbot|yandex|duckduckbot|baiduspider|facebookexternalhit/i;

function matchGroup(ua: string, pattern: RegExp, group = 1): string {
  const m = ua.match(pattern);
  return m?.[group]?.trim() ?? "";
}

function detectBot(ua: string): { isBot: boolean; name: string } {
  if (!BOT_PATTERN.test(ua)) {
    return { isBot: false, name: "" };
  }
  const named =
    matchGroup(ua, /(Googlebot|Bingbot|DuckDuckBot|YandexBot|facebookexternalhit)/i) ||
    matchGroup(ua, /([A-Za-z]+bot)/i) ||
    "Bot";
  return { isBot: true, name: named };
}

function parseBrowser(ua: string): { browser: string; version: string } {
  const edg = matchGroup(ua, /Edg\/([\d.]+)/);
  if (edg) return { browser: "Microsoft Edge", version: edg };

  const chrome = matchGroup(ua, /Chrome\/([\d.]+)/);
  const isChromium = chrome && !/Edg\//.test(ua);
  if (isChromium) return { browser: "Chrome", version: chrome };

  const firefox = matchGroup(ua, /Firefox\/([\d.]+)/);
  if (firefox) return { browser: "Firefox", version: firefox };

  const versionSafari = matchGroup(ua, /Version\/([\d.]+)/);
  if (versionSafari && /Safari\//.test(ua)) {
    return { browser: "Safari", version: versionSafari };
  }

  const curl = matchGroup(ua, /^curl\/([\d.]+)/);
  if (curl) return { browser: "curl", version: curl };

  const opera = matchGroup(ua, /OPR\/([\d.]+)/);
  if (opera) return { browser: "Opera", version: opera };

  return { browser: "Unknown", version: "" };
}

function parseEngine(ua: string): string {
  if (/AppleWebKit\//.test(ua)) return "WebKit";
  if (/Gecko\//.test(ua)) return "Gecko";
  if (/Trident\//.test(ua)) return "Trident";
  return "Unknown";
}

function parseOs(ua: string): { os: string; version: string } {
  const windows = matchGroup(ua, /Windows NT ([\d.]+)/);
  if (windows) {
    const map: Record<string, string> = {
      "10.0": "10/11",
      "6.3": "8.1",
      "6.2": "8",
      "6.1": "7",
    };
    return { os: "Windows", version: map[windows] ?? windows };
  }

  const mac = matchGroup(ua, /Mac OS X ([\d_]+)/);
  if (mac) return { os: "macOS", version: mac.replace(/_/g, ".") };

  const iphone = matchGroup(ua, /iPhone OS ([\d_]+)/);
  if (iphone) return { os: "iOS", version: iphone.replace(/_/g, ".") };

  const ipad = matchGroup(ua, /iPad; CPU OS ([\d_]+)/);
  if (ipad) return { os: "iPadOS", version: ipad.replace(/_/g, ".") };

  const android = matchGroup(ua, /Android ([\d.]+)/);
  if (android) return { os: "Android", version: android };

  if (/Linux/.test(ua)) return { os: "Linux", version: "" };
  if (/CrOS/.test(ua)) return { os: "Chrome OS", version: "" };

  return { os: "Unknown", version: "" };
}

function parseDeviceType(
  ua: string,
  isBot: boolean,
): ParsedUserAgent["deviceType"] {
  if (isBot) return "bot";
  if (/iPad|Tablet/i.test(ua)) return "tablet";
  if (/Mobile|iPhone|Android/i.test(ua)) return "mobile";
  if (/Windows|Macintosh|Linux|CrOS|X11/.test(ua)) return "desktop";
  return "unknown";
}

function parseDeviceName(ua: string, deviceType: ParsedUserAgent["deviceType"]): string {
  if (deviceType === "bot") return "Bot / crawler";
  if (/iPhone/.test(ua)) return "iPhone";
  if (/iPad/.test(ua)) return "iPad";
  if (/Android/.test(ua)) {
    const model = matchGroup(ua, /Android[^;]*;\s*([^;)]+)\s+Build/);
    return model || "Android device";
  }
  if (deviceType === "desktop") return "Desktop";
  return "Unknown";
}

/** Parse a User-Agent string into browser, OS, device, and engine fields. */
export function parseUserAgent(
  input: string,
): { ok: true; value: ParsedUserAgent } | { ok: false; error: string } {
  const raw = input.trim();
  if (!raw) {
    return { ok: false, error: "Paste a User-Agent string to parse." };
  }

  const bot = detectBot(raw);
  const { browser, version: browserVersion } = bot.isBot
    ? { browser: bot.name, version: matchGroup(raw, /[\d.]+/) }
    : parseBrowser(raw);
  const engine = parseEngine(raw);
  const { os, version: osVersion } = parseOs(raw);
  const deviceType = parseDeviceType(raw, bot.isBot);
  const device = parseDeviceName(raw, deviceType);

  const fields: UserAgentField[] = [
    { label: "Browser", value: browserVersion ? `${browser} ${browserVersion}` : browser },
    { label: "Engine", value: engine },
    { label: "Operating system", value: osVersion ? `${os} ${osVersion}` : os },
    { label: "Device", value: device },
    {
      label: "Device type",
      value: deviceType.charAt(0).toUpperCase() + deviceType.slice(1),
    },
    { label: "Bot", value: bot.isBot ? "Yes" : "No" },
  ];

  return {
    ok: true,
    value: {
      raw,
      browser,
      browserVersion,
      engine,
      os,
      osVersion,
      device,
      deviceType,
      isBot: bot.isBot,
      fields,
    },
  };
}
