import { describe, expect, it } from "vitest";
import {
  SAMPLE_MORSE,
  SAMPLE_TEXT_MORSE,
  morseToText,
  textToMorse,
} from "./morse";

describe("textToMorse", () => {
  it("encodes letters and words", () => {
    const result = textToMorse(SAMPLE_TEXT_MORSE);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.morse).toBe(SAMPLE_MORSE);
  });

  it("supports pipe word separators", () => {
    const result = textToMorse("SOS SOS", { wordSeparator: "|" });
    expect(result).toEqual({
      ok: true,
      morse: "... --- ... | ... --- ...",
    });
  });

  it("rejects unsupported characters", () => {
    expect(textToMorse("hello 🎉").ok).toBe(false);
  });

  it("rejects empty input", () => {
    expect(textToMorse("   ").ok).toBe(false);
  });
});

describe("morseToText", () => {
  it("decodes letters and words", () => {
    const result = morseToText(SAMPLE_MORSE);
    expect(result).toEqual({ ok: true, text: "HELLO WORLD!" });
  });

  it("accepts pipe as a word separator", () => {
    expect(morseToText("... --- ... | ... --- ...")).toEqual({
      ok: true,
      text: "SOS SOS",
    });
  });

  it("rejects invalid characters", () => {
    expect(morseToText("hello").ok).toBe(false);
  });

  it("rejects unknown sequences", () => {
    expect(morseToText("........").ok).toBe(false);
  });

  it("rejects empty input", () => {
    expect(morseToText("   ").ok).toBe(false);
  });
});
