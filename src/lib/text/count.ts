export type TextStats = {
  characters: number;
  charactersNoSpaces: number;
  words: number;
  sentences: number;
  paragraphs: number;
  lines: number;
  bytes: number;
  readingTimeMinutes: number;
};

const WORDS_PER_MINUTE = 200;

export function countCharacters(input: string): {
  characters: number;
  charactersNoSpaces: number;
  bytes: number;
} {
  return {
    characters: [...input].length,
    charactersNoSpaces: [...input.replace(/\s/g, "")].length,
    bytes: new TextEncoder().encode(input).length,
  };
}

export function countWords(input: string): number {
  const trimmed = input.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).filter(Boolean).length;
}

export function countSentences(input: string): number {
  const trimmed = input.trim();
  if (!trimmed) return 0;
  const matches = trimmed.match(/[^.!?…]+[.!?…]+|[^.!?…]+$/g);
  return matches ? matches.filter((s) => s.trim().length > 0).length : 0;
}

export function countParagraphs(input: string): number {
  const trimmed = input.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\n\s*\n/).filter((p) => p.trim().length > 0).length;
}

export function countLines(input: string): number {
  if (input.length === 0) return 0;
  return input.split(/\r\n|\r|\n/).length;
}

export function analyzeText(input: string): TextStats {
  const chars = countCharacters(input);
  const words = countWords(input);
  return {
    ...chars,
    words,
    sentences: countSentences(input),
    paragraphs: countParagraphs(input),
    lines: countLines(input),
    readingTimeMinutes: words === 0 ? 0 : Math.max(1, Math.ceil(words / WORDS_PER_MINUTE)),
  };
}
