import { md5Bytes } from "@/lib/hash/md5";
import { sha1Bytes } from "@/lib/hash/sha1";
import { sha256Bytes } from "@/lib/hash/sha256";

export type ChecksumAlgorithm = "md5" | "sha1" | "sha256";

export const CHECKSUM_ALGORITHMS: {
  id: ChecksumAlgorithm;
  label: string;
}[] = [
  { id: "md5", label: "MD5" },
  { id: "sha1", label: "SHA-1" },
  { id: "sha256", label: "SHA-256" },
];

export type FileChecksumResult = {
  algorithm: ChecksumAlgorithm;
  hex: string;
  byteLength: number;
};

/** Hash raw bytes with the selected algorithm (lowercase hex). */
export function hashBytes(
  bytes: Uint8Array,
  algorithm: ChecksumAlgorithm,
): string {
  switch (algorithm) {
    case "md5":
      return md5Bytes(bytes);
    case "sha1":
      return sha1Bytes(bytes);
    case "sha256":
      return sha256Bytes(bytes);
  }
}

export function checksumFileBytes(
  bytes: Uint8Array,
  algorithm: ChecksumAlgorithm,
): FileChecksumResult {
  return {
    algorithm,
    hex: hashBytes(bytes, algorithm),
    byteLength: bytes.byteLength,
  };
}

/** Normalize expected digest for comparison (strip spaces/colons, lowercase). */
export function normalizeChecksum(raw: string): string {
  return raw.trim().toLowerCase().replace(/[\s:]+/g, "");
}

export function checksumsMatch(
  actualHex: string,
  expectedRaw: string,
): boolean {
  const expected = normalizeChecksum(expectedRaw);
  if (!expected) return false;
  return normalizeChecksum(actualHex) === expected;
}

export function formatByteSize(n: number): string {
  if (!Number.isFinite(n) || n < 0) return "0 B";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  if (n < 1024 * 1024 * 1024) return `${(n / (1024 * 1024)).toFixed(2)} MB`;
  return `${(n / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}
