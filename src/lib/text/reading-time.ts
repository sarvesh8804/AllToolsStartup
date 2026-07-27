import { countWords, countCharacters, countSentences, countParagraphs } from "./count";

export type ReadingTimeOptions = {
  /** Words per minute for silent reading (default 200). */
  readingWpm: number;
  /** Words per minute for speaking aloud (default 150). */
  speakingWpm: number;
};

export const DEFAULT_READING_TIME_OPTIONS: ReadingTimeOptions = {
  readingWpm: 200,
  speakingWpm: 150,
};

export type ReadingTimeEstimate = {
  words: number;
  characters: number;
  charactersNoSpaces: number;
  sentences: number;
  paragraphs: number;
  readingMinutes: number;
  speakingMinutes: number;
  readingLabel: string;
  speakingLabel: string;
};

function clampWpm(n: number, fallback: number): number {
  if (!Number.isFinite(n) || n <= 0) return fallback;
  return Math.max(50, Math.min(1000, Math.floor(n)));
}

/** Format minutes as "Xm", "Xh Ym", or "< 1 min". */
export function formatDurationMinutes(minutes: number): string {
  if (minutes <= 0) return "0 min";
  if (minutes < 1) return "< 1 min";
  const whole = Math.round(minutes);
  if (whole < 60) return `${whole} min`;
  const h = Math.floor(whole / 60);
  const m = whole % 60;
  return m === 0 ? `${h} hr` : `${h} hr ${m} min`;
}

export function estimateReadingTime(
  text: string,
  options: ReadingTimeOptions = DEFAULT_READING_TIME_OPTIONS,
): ReadingTimeEstimate {
  const words = countWords(text);
  const chars = countCharacters(text);
  const readingWpm = clampWpm(options.readingWpm, 200);
  const speakingWpm = clampWpm(options.speakingWpm, 150);

  const readingExact = words === 0 ? 0 : words / readingWpm;
  const speakingExact = words === 0 ? 0 : words / speakingWpm;

  // Display minutes: ceil for non-empty (matches word-counter UX), keep fractional for labels via format
  const readingMinutes =
    words === 0 ? 0 : Math.max(1, Math.ceil(readingExact));
  const speakingMinutes =
    words === 0 ? 0 : Math.max(1, Math.ceil(speakingExact));

  return {
    words,
    characters: chars.characters,
    charactersNoSpaces: chars.charactersNoSpaces,
    sentences: countSentences(text),
    paragraphs: countParagraphs(text),
    readingMinutes,
    speakingMinutes,
    readingLabel: formatDurationMinutes(readingExact === 0 ? 0 : readingMinutes),
    speakingLabel: formatDurationMinutes(
      speakingExact === 0 ? 0 : speakingMinutes,
    ),
  };
}
