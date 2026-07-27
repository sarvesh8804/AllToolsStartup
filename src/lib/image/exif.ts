/**
 * Lightweight metadata detection for privacy tooling.
 * Full EXIF tag parsing is deferred to Image Metadata Viewer (later phase).
 */

export type MetadataScan = {
  kind: "jpeg" | "png" | "other";
  hasExif: boolean;
  /** JPEG APP segments or PNG ancillary chunks that often carry privacy data */
  hasExtraMetadata: boolean;
  notes: string[];
};

function isJpeg(bytes: Uint8Array): boolean {
  return bytes.length >= 2 && bytes[0] === 0xff && bytes[1] === 0xd8;
}

function isPng(bytes: Uint8Array): boolean {
  return (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  );
}

function asciiAt(bytes: Uint8Array, offset: number, len: number): string {
  let s = "";
  for (let i = 0; i < len && offset + i < bytes.length; i++) {
    s += String.fromCharCode(bytes[offset + i]!);
  }
  return s;
}

/** True when JPEG contains an APP1 "Exif\0\0" segment. */
export function hasJpegExif(bytes: Uint8Array): boolean {
  if (!isJpeg(bytes)) return false;
  let offset = 2;
  while (offset + 4 < bytes.length) {
    if (bytes[offset] !== 0xff) break;
    const marker = bytes[offset + 1]!;
    // Standalone markers without length
    if (marker === 0xd8 || marker === 0xd9) {
      offset += 2;
      continue;
    }
    if (marker === 0xda) break; // SOS — image data
    const segLen = (bytes[offset + 2]! << 8) | bytes[offset + 3]!;
    if (segLen < 2) break;
    if (marker === 0xe1) {
      const id = asciiAt(bytes, offset + 4, 6);
      if (id === "Exif\0\0") return true;
    }
    offset += 2 + segLen;
  }
  return false;
}

/** JPEG APP1 XMP or other APP1/APP13 that aren't EXIF. */
export function hasJpegAppMetadata(bytes: Uint8Array): boolean {
  if (!isJpeg(bytes)) return false;
  let offset = 2;
  let found = false;
  while (offset + 4 < bytes.length) {
    if (bytes[offset] !== 0xff) break;
    const marker = bytes[offset + 1]!;
    if (marker === 0xda) break;
    if (marker === 0xd8 || marker === 0xd9) {
      offset += 2;
      continue;
    }
    const segLen = (bytes[offset + 2]! << 8) | bytes[offset + 3]!;
    if (segLen < 2) break;
    // APP1–APP15 except we still count non-Exif APP1 / IPTC APP13
    if (marker >= 0xe1 && marker <= 0xef) {
      const id = asciiAt(bytes, offset + 4, 6);
      if (marker === 0xe1 && id === "Exif\0\0") {
        // counted separately
      } else {
        found = true;
      }
    }
    offset += 2 + segLen;
  }
  return found;
}

/** PNG eXIf chunk presence. */
export function hasPngExifChunk(bytes: Uint8Array): boolean {
  if (!isPng(bytes)) return false;
  let offset = 8;
  while (offset + 8 <= bytes.length) {
    const len =
      (bytes[offset]! << 24) |
      (bytes[offset + 1]! << 16) |
      (bytes[offset + 2]! << 8) |
      bytes[offset + 3]!;
    const type = asciiAt(bytes, offset + 4, 4);
    if (type === "eXIf") return true;
    if (type === "IEND") break;
    offset += 12 + len; // len + type + data + crc
  }
  return false;
}

/** PNG text / ICC / etc. that canvas re-encode will drop. */
export function hasPngAncillaryPrivacyChunks(bytes: Uint8Array): boolean {
  if (!isPng(bytes)) return false;
  const watched = new Set(["eXIf", "tEXt", "iTXt", "zTXt", "iCCP", "tIME"]);
  let offset = 8;
  while (offset + 8 <= bytes.length) {
    const len =
      (bytes[offset]! << 24) |
      (bytes[offset + 1]! << 16) |
      (bytes[offset + 2]! << 8) |
      bytes[offset + 3]!;
    const type = asciiAt(bytes, offset + 4, 4);
    if (watched.has(type)) return true;
    if (type === "IEND") break;
    offset += 12 + len;
  }
  return false;
}

export function scanImageMetadata(bytes: Uint8Array): MetadataScan {
  if (isJpeg(bytes)) {
    const hasExif = hasJpegExif(bytes);
    const hasExtra = hasJpegAppMetadata(bytes);
    const notes: string[] = [];
    if (hasExif) notes.push("EXIF segment found (may include camera, time, or GPS).");
    if (hasExtra) notes.push("Additional APP metadata found (XMP/IPTC-style).");
    if (!hasExif && !hasExtra) notes.push("No EXIF/APP metadata detected in this JPEG.");
    return {
      kind: "jpeg",
      hasExif,
      hasExtraMetadata: hasExtra,
      notes,
    };
  }
  if (isPng(bytes)) {
    const hasExif = hasPngExifChunk(bytes);
    const hasExtra = hasPngAncillaryPrivacyChunks(bytes);
    const notes: string[] = [];
    if (hasExif) notes.push("PNG eXIf chunk found.");
    else if (hasExtra) notes.push("Text/ICC/time metadata chunks found.");
    else notes.push("No common privacy metadata chunks detected in this PNG.");
    return {
      kind: "png",
      hasExif,
      hasExtraMetadata: hasExtra && !hasExif ? true : hasExtra,
      notes,
    };
  }
  return {
    kind: "other",
    hasExif: false,
    hasExtraMetadata: false,
    notes: [
      "Format-specific metadata scan is limited; re-encoding still strips embedded metadata.",
    ],
  };
}
