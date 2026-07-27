import { describe, expect, it } from "vitest";
import {
  checksumFileBytes,
  checksumsMatch,
  formatByteSize,
  hashBytes,
  normalizeChecksum,
} from "./file-checksum";
import { sha256 } from "./sha256";

describe("hashBytes", () => {
  it("matches string sha256 for UTF-8 text", () => {
    const text = "hello forge";
    const bytes = new TextEncoder().encode(text);
    expect(hashBytes(bytes, "sha256")).toBe(sha256(text));
  });
});

describe("checksumFileBytes", () => {
  it("returns hex and length", () => {
    const bytes = new Uint8Array([1, 2, 3, 4]);
    const result = checksumFileBytes(bytes, "md5");
    expect(result.byteLength).toBe(4);
    expect(result.hex).toMatch(/^[0-9a-f]{32}$/);
    expect(result.algorithm).toBe("md5");
  });
});

describe("checksumsMatch / normalizeChecksum", () => {
  it("ignores case, spaces, and colons", () => {
    expect(normalizeChecksum("AB:CD EF")).toBe("abcdef");
    expect(checksumsMatch("abcdef", "AB:CD EF")).toBe(true);
    expect(checksumsMatch("abcdef", "000000")).toBe(false);
  });
});

describe("formatByteSize", () => {
  it("formats sizes", () => {
    expect(formatByteSize(500)).toBe("500 B");
    expect(formatByteSize(2048)).toBe("2.0 KB");
  });
});
