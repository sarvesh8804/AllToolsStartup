export type IpParseResult =
  | { ok: true; octets: [number, number, number, number]; int: number }
  | { ok: false; error: string };

export function parseIpv4(input: string): IpParseResult {
  const trimmed = input.trim();
  const parts = trimmed.split(".");
  if (parts.length !== 4) {
    return { ok: false, error: "IPv4 address must have four octets." };
  }
  const octets = parts.map((part) => Number(part)) as [
    number,
    number,
    number,
    number,
  ];
  if (octets.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) {
    return { ok: false, error: "Each octet must be between 0 and 255." };
  }
  const int =
    ((octets[0]! << 24) >>> 0) +
    (octets[1]! << 16) +
    (octets[2]! << 8) +
    octets[3]!;
  return { ok: true, octets, int };
}

export function intToIpv4(int: number): string {
  const n = int >>> 0;
  return [
    (n >>> 24) & 255,
    (n >>> 16) & 255,
    (n >>> 8) & 255,
    n & 255,
  ].join(".");
}

export function prefixToMask(prefix: number): number {
  if (!Number.isInteger(prefix) || prefix < 0 || prefix > 32) {
    throw new Error("Prefix must be between 0 and 32.");
  }
  if (prefix === 0) return 0;
  return (0xffffffff << (32 - prefix)) >>> 0;
}

export function maskToPrefix(maskInt: number): number {
  let bits = 0;
  for (let i = 31; i >= 0; i -= 1) {
    if ((maskInt >>> i) & 1) bits += 1;
    else break;
  }
  const trailing = maskInt & ((1 << (32 - bits)) - 1);
  if (trailing !== 0) {
    throw new Error("Subnet mask is not contiguous.");
  }
  return bits;
}

export function maskDottedToInt(mask: string): IpParseResult {
  const parsed = parseIpv4(mask);
  if (!parsed.ok) return parsed;
  try {
    maskToPrefix(parsed.int);
    return parsed;
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Invalid mask",
    };
  }
}

export type NetworkInfo = {
  network: string;
  broadcast: string;
  firstHost: string;
  lastHost: string;
  prefix: number;
  mask: string;
  hostCount: number;
  usableHosts: number;
};

export function networkFromIpAndMask(
  ip: string,
  maskInput: string,
): { ok: true; info: NetworkInfo } | { ok: false; error: string } {
  const ipParsed = parseIpv4(ip);
  if (!ipParsed.ok) return ipParsed;

  let maskInt: number;
  let prefix: number;

  if (maskInput.includes(".")) {
    const maskParsed = maskDottedToInt(maskInput);
    if (!maskParsed.ok) return maskParsed;
    maskInt = maskParsed.int;
    prefix = maskToPrefix(maskInt);
  } else {
    const p = Number(maskInput.replace(/^\/+/, ""));
    if (!Number.isInteger(p) || p < 0 || p > 32) {
      return { ok: false, error: "CIDR prefix must be between 0 and 32." };
    }
    prefix = p;
    maskInt = prefixToMask(prefix);
  }

  const networkInt = ipParsed.int & maskInt;
  const broadcastInt = networkInt | (~maskInt >>> 0);
  const hostCount = prefix === 32 ? 1 : 2 ** (32 - prefix);
  const usableHosts =
    prefix >= 31 ? hostCount : Math.max(0, hostCount - 2);

  return {
    ok: true,
    info: {
      network: intToIpv4(networkInt),
      broadcast: intToIpv4(broadcastInt),
      firstHost:
        prefix >= 31
          ? intToIpv4(networkInt)
          : intToIpv4(networkInt + 1),
      lastHost:
        prefix >= 31
          ? intToIpv4(broadcastInt)
          : intToIpv4(broadcastInt - 1),
      prefix,
      mask: intToIpv4(maskInt),
      hostCount,
      usableHosts,
    },
  };
}

/** Parse CIDR notation like 192.168.1.0/24. */
export function parseCidr(
  input: string,
): { ok: true; info: NetworkInfo } | { ok: false; error: string } {
  const trimmed = input.trim();
  const slash = trimmed.indexOf("/");
  if (slash === -1) {
    return { ok: false, error: "Enter CIDR as address/prefix (e.g. 10.0.0.0/24)." };
  }
  const ip = trimmed.slice(0, slash);
  const prefix = trimmed.slice(slash + 1);
  return networkFromIpAndMask(ip, prefix);
}

export const SAMPLE_CIDR = "192.168.1.0/24";
