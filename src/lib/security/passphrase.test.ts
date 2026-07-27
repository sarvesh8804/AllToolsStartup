import { describe, expect, it } from "vitest";
import { PASSPHRASE_WORDS } from "./passphrase-words";
import {
  DEFAULT_PASSPHRASE_OPTIONS,
  estimatePassphraseStrength,
  generatePassphrase,
  generatePassphrases,
} from "./passphrase";

describe("passphrase", () => {
  it("has a 1024-word dictionary", () => {
    expect(PASSPHRASE_WORDS).toHaveLength(1024);
    expect(new Set(PASSPHRASE_WORDS).size).toBe(1024);
  });

  it("generates the requested word count with separator", () => {
    const phrase = generatePassphrase({
      ...DEFAULT_PASSPHRASE_OPTIONS,
      wordCount: 5,
      separator: "-",
      capitalize: false,
      includeNumber: false,
      includeSymbol: false,
    });
    const parts = phrase.split("-");
    expect(parts).toHaveLength(5);
    for (const p of parts) {
      expect(PASSPHRASE_WORDS).toContain(p);
    }
  });

  it("capitalizes words when requested", () => {
    const phrase = generatePassphrase({
      ...DEFAULT_PASSPHRASE_OPTIONS,
      wordCount: 4,
      separator: " ",
      capitalize: true,
    });
    for (const w of phrase.split(" ")) {
      expect(w.charAt(0)).toMatch(/[A-Z]/);
    }
  });

  it("appends number and symbol", () => {
    const phrase = generatePassphrase({
      ...DEFAULT_PASSPHRASE_OPTIONS,
      includeNumber: true,
      includeSymbol: true,
      separator: "-",
    });
    expect(phrase).toMatch(/\d[!@#$%&*?]$/);
  });

  it("generates a batch", () => {
    const list = generatePassphrases({
      ...DEFAULT_PASSPHRASE_OPTIONS,
      count: 3,
    });
    expect(list).toHaveLength(3);
    expect(new Set(list).size).toBeGreaterThan(0);
  });

  it("estimates entropy from word count", () => {
    const weak = estimatePassphraseStrength({
      ...DEFAULT_PASSPHRASE_OPTIONS,
      wordCount: 3,
    });
    const strong = estimatePassphraseStrength({
      ...DEFAULT_PASSPHRASE_OPTIONS,
      wordCount: 8,
    });
    expect(strong.entropyBits).toBeGreaterThan(weak.entropyBits);
    expect(strong.label).toBe("Very strong");
  });
});
