import { describe, expect, it } from "vitest";
import { generateDummyText } from "./dummy-text";

describe("dummy text generator", () => {
  it("generates the requested paragraph count", () => {
    const out = generateDummyText({
      paragraphs: 3,
      sentencesPerParagraph: 2,
      wordsPerSentence: 8,
      startWithOpener: false,
    });
    expect(out.split(/\n\n/).length).toBe(3);
  });

  it("can start with English opener", () => {
    const out = generateDummyText({
      paragraphs: 1,
      sentencesPerParagraph: 2,
      wordsPerSentence: 6,
      startWithOpener: true,
    });
    expect(out.startsWith("This is placeholder copy")).toBe(true);
  });

  it("is deterministic", () => {
    const a = generateDummyText({
      paragraphs: 2,
      sentencesPerParagraph: 3,
      wordsPerSentence: 10,
      startWithOpener: false,
    });
    const b = generateDummyText({
      paragraphs: 2,
      sentencesPerParagraph: 3,
      wordsPerSentence: 10,
      startWithOpener: false,
    });
    expect(a).toBe(b);
  });
});
