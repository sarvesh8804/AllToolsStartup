import { describe, expect, it } from "vitest";
import {
  SAMPLE_JSON_ESCAPED,
  SAMPLE_JSON_TEXT,
  convertJsonEscape,
  escapeJsonString,
  unescapeJsonString,
} from "./json-escape";

describe("escapeJsonString", () => {
  it("escapes newlines and quotes", () => {
    const result = escapeJsonString(SAMPLE_JSON_TEXT);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.escaped).toBe(SAMPLE_JSON_ESCAPED);
  });
});

describe("unescapeJsonString", () => {
  it("round-trips escaped JSON", () => {
    const escaped = escapeJsonString("tab\there");
    expect(escaped.ok).toBe(true);
    if (!escaped.ok) return;
    const decoded = unescapeJsonString(escaped.escaped);
    expect(decoded.ok).toBe(true);
    if (!decoded.ok) return;
    expect(decoded.text).toBe("tab\there");
  });
});

describe("convertJsonEscape", () => {
  it("unescapes in unescape mode", () => {
    const result = convertJsonEscape(SAMPLE_JSON_ESCAPED, "unescape");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.output).toBe(SAMPLE_JSON_TEXT);
  });
});
