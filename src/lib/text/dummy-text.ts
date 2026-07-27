const ENGLISH_WORDS = [
  "the",
  "quick",
  "brown",
  "fox",
  "jumps",
  "over",
  "lazy",
  "dog",
  "design",
  "layout",
  "preview",
  "content",
  "placeholder",
  "sample",
  "paragraph",
  "sentence",
  "browser",
  "local",
  "tool",
  "forge",
  "ships",
  "daily",
  "mockup",
  "wireframe",
  "headline",
  "body",
  "copy",
  "draft",
  "ready",
  "simple",
  "clean",
  "readable",
  "space",
  "margin",
  "column",
  "section",
  "block",
  "page",
  "screen",
  "mobile",
  "desktop",
  "responsive",
  "typography",
  "contrast",
  "color",
  "image",
  "caption",
  "button",
  "action",
  "primary",
];

export type DummyTextOptions = {
  paragraphs: number;
  /** Sentences per paragraph (clamped). */
  sentencesPerParagraph: number;
  /** Approximate words per sentence. */
  wordsPerSentence: number;
  /** Start first paragraph with a recognizable English opener. */
  startWithOpener: boolean;
};

export const DEFAULT_DUMMY_TEXT_OPTIONS: DummyTextOptions = {
  paragraphs: 3,
  sentencesPerParagraph: 4,
  wordsPerSentence: 12,
  startWithOpener: true,
};

const OPENER = "This is placeholder copy for your layout.";

function clamp(n: number, min: number, max: number): number {
  if (!Number.isFinite(n)) return min;
  return Math.max(min, Math.min(max, Math.floor(n)));
}

function wordAt(i: number): string {
  return ENGLISH_WORDS[i % ENGLISH_WORDS.length]!;
}

function makeSentence(startIndex: number, wordCount: number): string {
  const words: string[] = [];
  for (let i = 0; i < wordCount; i += 1) {
    words.push(wordAt(startIndex + i));
  }
  words[0] = words[0]!.charAt(0).toUpperCase() + words[0]!.slice(1);
  return `${words.join(" ")}.`;
}

/**
 * Deterministic English dummy paragraphs (not Latin Lorem).
 */
export function generateDummyText(options: DummyTextOptions): string {
  const paragraphs = clamp(options.paragraphs, 1, 50);
  const sentencesPerParagraph = clamp(options.sentencesPerParagraph, 1, 12);
  const wordsPerSentence = clamp(options.wordsPerSentence, 4, 30);

  const blocks: string[] = [];
  let cursor = 0;

  for (let p = 0; p < paragraphs; p += 1) {
    const sentences: string[] = [];
    for (let s = 0; s < sentencesPerParagraph; s += 1) {
      const len = Math.max(4, wordsPerSentence + ((cursor + s) % 5) - 2);
      let sentence = makeSentence(cursor, len);
      if (p === 0 && s === 0 && options.startWithOpener) {
        sentence = OPENER;
      }
      sentences.push(sentence);
      cursor += len;
    }
    blocks.push(sentences.join(" "));
  }

  return blocks.join("\n\n");
}
