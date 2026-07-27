import { describe, expect, it } from "vitest";
import {
  hasJpegExif,
  hasPngExifChunk,
  scanImageMetadata,
} from "@/lib/image/exif";

/** Minimal JPEG SOI + APP1 Exif stub + SOS-ish stop. */
function jpegWithExif(): Uint8Array {
  // SOI
  const parts: number[] = [0xff, 0xd8];
  // APP1: marker + length(2+6+2) + Exif\0\0 + dummy
  const payload = [
    0x45, 0x78, 0x69, 0x66, 0x00, 0x00, // Exif\0\0
    0x00, 0x00,
  ];
  const segLen = 2 + payload.length;
  parts.push(0xff, 0xe1, (segLen >> 8) & 0xff, segLen & 0xff, ...payload);
  // SOS to stop scan
  parts.push(0xff, 0xda, 0x00, 0x02);
  return new Uint8Array(parts);
}

function jpegBare(): Uint8Array {
  return new Uint8Array([0xff, 0xd8, 0xff, 0xda, 0x00, 0x02]);
}

function pngWithExifChunk(): Uint8Array {
  const sig = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  // IHDR empty-ish then eXIf
  const ihdrData = new Array(13).fill(0);
  const ihdrLen = ihdrData.length;
  const ihdr = [
    (ihdrLen >> 24) & 0xff,
    (ihdrLen >> 16) & 0xff,
    (ihdrLen >> 8) & 0xff,
    ihdrLen & 0xff,
    0x49, 0x48, 0x44, 0x52, // IHDR
    ...ihdrData,
    0, 0, 0, 0, // crc
  ];
  const exifData = [1, 2, 3, 4];
  const exLen = exifData.length;
  const exif = [
    (exLen >> 24) & 0xff,
    (exLen >> 16) & 0xff,
    (exLen >> 8) & 0xff,
    exLen & 0xff,
    0x65, 0x58, 0x49, 0x66, // eXIf
    ...exifData,
    0, 0, 0, 0,
  ];
  const iend = [0, 0, 0, 0, 0x49, 0x45, 0x4e, 0x44, 0, 0, 0, 0];
  return new Uint8Array([...sig, ...ihdr, ...exif, ...iend]);
}

describe("hasJpegExif", () => {
  it("finds Exif APP1", () => {
    expect(hasJpegExif(jpegWithExif())).toBe(true);
  });

  it("returns false without EXIF", () => {
    expect(hasJpegExif(jpegBare())).toBe(false);
  });
});

describe("hasPngExifChunk", () => {
  it("detects eXIf", () => {
    expect(hasPngExifChunk(pngWithExifChunk())).toBe(true);
  });
});

describe("scanImageMetadata", () => {
  it("summarizes jpeg with exif", () => {
    const s = scanImageMetadata(jpegWithExif());
    expect(s.kind).toBe("jpeg");
    expect(s.hasExif).toBe(true);
  });

  it("notes other formats", () => {
    const s = scanImageMetadata(new Uint8Array([0, 1, 2]));
    expect(s.kind).toBe("other");
  });
});
