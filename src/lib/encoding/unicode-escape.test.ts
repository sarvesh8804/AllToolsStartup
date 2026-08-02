import { describe, expect, it } from "vitest";
import {
  SAMPLE_UNICODE_ESCAPED,
  SAMPLE_UNICODE_TEXT,
  convertUnicodeEscape,
  escapeUnicode,
  unescapeUnicode,
} from "./unicode-escape";

describe("escapeUnicode", () => {
  it("escapes non-ascii code points", () => {
    const result = escapeUnicode(SAMPLE_UNICODE_TEXT);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.escaped).toBe(SAMPLE_UNICODE_ESCAPED);
  });

  it("can escape ascii when requested", () => {
    const result = escapeUnicode("A", { escapeAscii: true });
    expect(result).toEqual({ ok: true, escaped: "\\u0041" });
  });

  it("rejects empty input", () => {
    expect(escapeUnicode("").ok).toBe(false);
  });
});

describe("unescapeUnicode", () => {
  it("decodes \\u and \\u{} sequences", () => {
    expect(unescapeUnicode(SAMPLE_UNICODE_ESCAPED)).toEqual({
      ok: true,
      text: SAMPLE_UNICODE_TEXT,
    });
  });

  it("decodes short escapes", () => {
    expect(unescapeUnicode("line1\\nline2")).toEqual({
      ok: true,
      text: "line1\nline2",
    });
  });

  it("rejects invalid sequences", () => {
    expect(unescapeUnicode("\\uZZZZ").ok).toBe(false);
  });
});

describe("convertUnicodeEscape", () => {
  it("round-trips", () => {
    const encoded = convertUnicodeEscape(SAMPLE_UNICODE_TEXT, "escape");
    expect(encoded.ok).toBe(true);
    if (!encoded.ok) return;
    expect(convertUnicodeEscape(encoded.output, "unescape")).toEqual({
      ok: true,
      output: SAMPLE_UNICODE_TEXT,
    });
  });
});
