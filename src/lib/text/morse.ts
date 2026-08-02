export const MORSE_TO_CHAR: Record<string, string> = {
  ".-": "A",
  "-...": "B",
  "-.-.": "C",
  "-..": "D",
  ".": "E",
  "..-.": "F",
  "--.": "G",
  "....": "H",
  "..": "I",
  ".---": "J",
  "-.-": "K",
  ".-..": "L",
  "--": "M",
  "-.": "N",
  "---": "O",
  ".--.": "P",
  "--.-": "Q",
  ".-.": "R",
  "...": "S",
  "-": "T",
  "..-": "U",
  "...-": "V",
  ".--": "W",
  "-..-": "X",
  "-.--": "Y",
  "--..": "Z",
  "-----": "0",
  ".----": "1",
  "..---": "2",
  "...--": "3",
  "....-": "4",
  ".....": "5",
  "-....": "6",
  "--...": "7",
  "---..": "8",
  "----.": "9",
  ".-.-.-": ".",
  "--..--": ",",
  "..--..": "?",
  "-.-.--": "!",
  "-..-.": "/",
  ".--.-.": "@",
};

export const SAMPLE_MORSE =
  ".... . .-.. .-.. --- / .-- --- .-. .-.. -.. -.-.--";

export const SAMPLE_TEXT_MORSE = "HELLO WORLD!";

export const CHAR_TO_MORSE: Record<string, string> = Object.fromEntries(
  Object.entries(MORSE_TO_CHAR).map(([code, char]) => [char, code]),
);

export type TextToMorseOptions = {
  wordSeparator?: "/" | "|";
};

/** Encode plain text into International Morse code. */
export function textToMorse(
  input: string,
  options: TextToMorseOptions = {},
): { ok: true; morse: string } | { ok: false; error: string } {
  const trimmed = input.trim();
  if (!trimmed) {
    return { ok: false, error: "Enter text to encode into Morse code." };
  }

  const wordSeparator = options.wordSeparator ?? "/";
  const words = trimmed.split(/\s+/).filter(Boolean);
  const encodedWords: string[] = [];

  for (const word of words) {
    const letters: string[] = [];
    for (const char of word) {
      const upper = char.toUpperCase();
      const code = CHAR_TO_MORSE[upper];
      if (!code) {
        return {
          ok: false,
          error: `Unsupported character: ${char}`,
        };
      }
      letters.push(code);
    }
    encodedWords.push(letters.join(" "));
  }

  return { ok: true, morse: encodedWords.join(` ${wordSeparator} `) };
}

/** Decode International Morse code into plain text. */
export function morseToText(
  input: string,
): { ok: true; text: string } | { ok: false; error: string } {
  const trimmed = input.trim();
  if (!trimmed) {
    return { ok: false, error: "Paste Morse code to decode (dots, dashes, spaces)." };
  }

  if (!/^[.\-\s/|]+$/i.test(trimmed)) {
    return {
      ok: false,
      error: "Morse input may only contain dots (.), dashes (-), spaces, and word separators (/ or |).",
    };
  }

  const words = trimmed.split(/\s*(?:\/|\|)\s*/);
  const decodedWords: string[] = [];

  for (const word of words) {
    const letters = word.trim().split(/\s+/).filter(Boolean);
    if (letters.length === 0) continue;

    const chars: string[] = [];
    for (const code of letters) {
      const upper = code.toUpperCase();
      const char = MORSE_TO_CHAR[upper];
      if (!char) {
        return { ok: false, error: `Unknown Morse sequence: ${code}` };
      }
      chars.push(char);
    }
    decodedWords.push(chars.join(""));
  }

  if (decodedWords.length === 0) {
    return { ok: false, error: "No Morse letters found." };
  }

  return { ok: true, text: decodedWords.join(" ") };
}
