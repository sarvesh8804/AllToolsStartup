export type PemBlock = {
  type: string;
  base64: string;
  der: Uint8Array;
};

export type CertificateInfo = {
  type: string;
  serial?: string;
  subject: string[];
  issuer: string[];
  notBefore?: string;
  notAfter?: string;
  fingerprintSha256: string;
  bytes: number;
};

export type SslDecodeResult =
  | { ok: true; blocks: CertificateInfo[] }
  | { ok: false; error: string };

function readLength(bytes: Uint8Array, offset: number): { length: number; next: number } {
  const first = bytes[offset]!;
  if ((first & 0x80) === 0) return { length: first, next: offset + 1 };
  const count = first & 0x7f;
  let length = 0;
  for (let i = 0; i < count; i += 1) {
    length = (length << 8) | bytes[offset + 1 + i]!;
  }
  return { length, next: offset + 1 + count };
}

function readTlv(bytes: Uint8Array, offset: number): { tag: number; value: Uint8Array; next: number } | null {
  if (offset >= bytes.length) return null;
  const tag = bytes[offset]!;
  const { length, next } = readLength(bytes, offset + 1);
  const start = next;
  const end = start + length;
  if (end > bytes.length) return null;
  return { tag, value: bytes.slice(start, end), next: end };
}

function readOid(bytes: Uint8Array): string {
  if (bytes.length === 0) return "";
  const parts = [Math.floor(bytes[0]! / 40), bytes[0]! % 40];
  let value = 0;
  for (let i = 1; i < bytes.length; i += 1) {
    value = (value << 7) | (bytes[i]! & 0x7f);
    if ((bytes[i]! & 0x80) === 0) {
      parts.push(value);
      value = 0;
    }
  }
  return parts.join(".");
}

function readString(bytes: Uint8Array): string {
  return new TextDecoder().decode(bytes);
}

function readTime(bytes: Uint8Array, tag: number): string {
  const raw = readString(bytes);
  if (tag === 23 && raw.length >= 12) {
    const yy = Number(raw.slice(0, 2));
    const year = yy >= 50 ? 1900 + yy : 2000 + yy;
    return `${year}-${raw.slice(2, 4)}-${raw.slice(4, 6)}T${raw.slice(6, 8)}:${raw.slice(8, 10)}:${raw.slice(10, 12)}Z`;
  }
  if (tag === 24 && raw.length >= 14) {
    return `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}T${raw.slice(8, 10)}:${raw.slice(10, 12)}:${raw.slice(12, 14)}Z`;
  }
  return raw;
}

const DN_OIDS: Record<string, string> = {
  "2.5.4.3": "CN",
  "2.5.4.6": "C",
  "2.5.4.7": "L",
  "2.5.4.8": "ST",
  "2.5.4.10": "O",
  "2.5.4.11": "OU",
};

function parseRdn(bytes: Uint8Array): string[] {
  const parts: string[] = [];
  let offset = 0;
  while (offset < bytes.length) {
    const set = readTlv(bytes, offset);
    if (!set) break;
    offset = set.next;
    let inner = 0;
    while (inner < set.value.length) {
      const seq = readTlv(set.value, inner);
      if (!seq) break;
      inner = seq.next;
      let partOffset = 0;
      const oid = readTlv(seq.value, partOffset);
      if (!oid || oid.tag !== 6) continue;
      partOffset = oid.next;
      const valueTlv = readTlv(seq.value, partOffset);
      if (!valueTlv) continue;
      const label = DN_OIDS[readOid(oid.value)] ?? readOid(oid.value);
      parts.push(`${label}=${readString(valueTlv.value)}`);
    }
  }
  return parts;
}

function walkCertificate(bytes: Uint8Array): Omit<CertificateInfo, "type" | "fingerprintSha256" | "bytes"> {
  const info: Omit<CertificateInfo, "type" | "fingerprintSha256" | "bytes"> = {
    subject: [],
    issuer: [],
  };
  const cert = readTlv(bytes, 0);
  if (!cert) return info;
  const tbs = readTlv(cert.value, 0);
  if (!tbs) return info;
  let offset = 0;
  if (tbs.value[offset] === 0xa0) {
    const version = readTlv(tbs.value, offset);
    offset = version?.next ?? offset;
  }
  const serial = readTlv(tbs.value, offset);
  if (serial?.tag === 2) {
    info.serial = [...serial.value].map((b) => b.toString(16).padStart(2, "0")).join("");
    offset = serial.next;
  }
  offset = readTlv(tbs.value, offset)?.next ?? offset;
  const issuer = readTlv(tbs.value, offset);
  if (issuer) {
    info.issuer = parseRdn(issuer.value);
    offset = issuer.next;
  }
  const validity = readTlv(tbs.value, offset);
  if (validity) {
    let vOffset = 0;
    const notBefore = readTlv(validity.value, vOffset);
    if (notBefore) {
      info.notBefore = readTime(notBefore.value, notBefore.tag);
      vOffset = notBefore.next;
    }
    const notAfter = readTlv(validity.value, vOffset);
    if (notAfter) info.notAfter = readTime(notAfter.value, notAfter.tag);
    offset = validity.next;
  }
  const subject = readTlv(tbs.value, offset);
  if (subject) info.subject = parseRdn(subject.value);
  return info;
}

function parsePemBlocks(input: string): PemBlock[] {
  const re = /-----BEGIN ([^-]+)-----([\s\S]*?)-----END \1-----/g;
  const blocks: PemBlock[] = [];
  let match: RegExpExecArray | null;
  while ((match = re.exec(input)) !== null) {
    const base64 = match[2]!.replace(/\s+/g, "");
    const binary = atob(base64);
    const der = Uint8Array.from(binary, (c) => c.charCodeAt(0));
    blocks.push({ type: match[1]!.trim(), base64, der });
  }
  return blocks;
}

async function sha256Hex(bytes: Uint8Array): Promise<string> {
  const copy = new Uint8Array(bytes);
  const hash = await crypto.subtle.digest("SHA-256", copy);
  return [...new Uint8Array(hash)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Decode PEM-encoded X.509 certificates (paste only — no network). */
export async function decodeSslCertificates(
  input: string,
): Promise<SslDecodeResult> {
  const trimmed = input.trim();
  if (!trimmed) {
    return { ok: false, error: "Paste a PEM certificate block." };
  }
  const pemBlocks = parsePemBlocks(trimmed);
  if (pemBlocks.length === 0) {
    return { ok: false, error: "No PEM blocks found. Include BEGIN/END CERTIFICATE lines." };
  }

  const blocks: CertificateInfo[] = [];
  for (const block of pemBlocks) {
    const parsed = walkCertificate(block.der);
    const fingerprintSha256 = await sha256Hex(block.der);
    blocks.push({
      type: block.type,
      ...parsed,
      fingerprintSha256,
      bytes: block.der.length,
    });
  }

  return { ok: true, blocks };
}

export const SAMPLE_PEM_CERT = `-----BEGIN CERTIFICATE-----
MIIDXTCCAkWgAwIBAgIJAKL2z3vF6pQ0MA0GCSqGSIb3DQEBCwUAMEUxCzAJBgNV
BAYTAlVTMRMwEQYDVQQIDApDYWxpZm9ybmlhMRYwFAYDVQQHDA1TYW4gRnJhbmNpc2Nv
MRYwFAYDVQQKDA1Gb3JnZSBUZXN0MQ0wCwYDVQQDDARGb3JnZTAeFw0yNTAxMDEwMDAw
MDBaFw0yNjAxMDEwMDAwMDBaMEUxCzAJBgNVBAYTAlVTMRMwEQYDVQQIDApDYWxpZm9y
bmlhMRYwFAYDVQQHDA1TYW4gRnJhbmNpc2NvMRYwFAYDVQQKDA1Gb3JnZSBUZXN0MQ0w
CwYDVQQDDARGb3JnZWCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBALdummy
-----END CERTIFICATE-----`;
