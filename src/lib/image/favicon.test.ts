import { describe, expect, it } from "vitest";
import {
  buildIcoFromPngs,
  faviconHtmlSnippet,
  FAVICON_SIZES,
  ICO_PACK_SIZES,
  squareCropRect,
} from "@/lib/image/favicon";

/** Tiny valid-looking PNG header (not a real decodeable image — enough for ICO pack). */
function fakePng(n: number): Uint8Array {
  const bytes = new Uint8Array(16 + n);
  bytes.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], 0);
  bytes[15] = n & 0xff;
  return bytes;
}

describe("squareCropRect", () => {
  it("rejects invalid", () => {
    expect(squareCropRect(0, 10)).toMatchObject({ ok: false });
  });

  it("centers landscape", () => {
    expect(squareCropRect(200, 100)).toEqual({
      sx: 50,
      sy: 0,
      sSize: 100,
    });
  });

  it("centers portrait", () => {
    expect(squareCropRect(100, 200)).toEqual({
      sx: 0,
      sy: 50,
      sSize: 100,
    });
  });

  it("handles already square", () => {
    expect(squareCropRect(128, 128)).toEqual({
      sx: 0,
      sy: 0,
      sSize: 128,
    });
  });
});

describe("buildIcoFromPngs", () => {
  it("writes ICONDIR and entries", () => {
    const png16 = fakePng(1);
    const png32 = fakePng(2);
    const ico = buildIcoFromPngs([
      { size: 16, png: png16 },
      { size: 32, png: png32 },
    ]);
    const view = new DataView(ico.buffer, ico.byteOffset, ico.byteLength);
    expect(view.getUint16(0, true)).toBe(0);
    expect(view.getUint16(2, true)).toBe(1);
    expect(view.getUint16(4, true)).toBe(2);
    expect(ico[6]).toBe(16);
    expect(ico[7]).toBe(16);
    expect(ico[22]).toBe(32);
    // PNG signature at first image offset
    const off0 = view.getUint32(6 + 12, true);
    expect(ico[off0]).toBe(0x89);
    expect(ico[off0 + 1]).toBe(0x50);
  });

  it("encodes 256 as 0 dimension byte", () => {
    const ico = buildIcoFromPngs([{ size: 256, png: fakePng(3) }]);
    expect(ico[6]).toBe(0);
    expect(ico[7]).toBe(0);
  });

  it("rejects empty", () => {
    expect(() => buildIcoFromPngs([])).toThrow(/at least one/i);
  });
});

describe("favicon constants + html", () => {
  it("includes standard sizes", () => {
    expect(FAVICON_SIZES.map((s) => s.size)).toEqual([
      16, 32, 48, 180, 192, 512,
    ]);
    expect([...ICO_PACK_SIZES]).toEqual([16, 32, 48]);
  });

  it("builds head snippet", () => {
    const html = faviconHtmlSnippet();
    expect(html).toContain('rel="icon" href="/favicon.ico"');
    expect(html).toContain("apple-touch-icon");
    expect(html).toContain("512x512");
  });

  it("can omit apple/manifest", () => {
    const html = faviconHtmlSnippet({
      includeApple: false,
      includeManifestIcons: false,
    });
    expect(html).not.toContain("apple-touch");
    expect(html).not.toContain("512x512");
  });
});
