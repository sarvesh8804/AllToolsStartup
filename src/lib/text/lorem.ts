const WORDS = [
  "lorem",
  "ipsum",
  "dolor",
  "sit",
  "amet",
  "consectetur",
  "adipiscing",
  "elit",
  "sed",
  "do",
  "eiusmod",
  "tempor",
  "incididunt",
  "ut",
  "labore",
  "et",
  "dolore",
  "magna",
  "aliqua",
  "enim",
  "ad",
  "minim",
  "veniam",
  "quis",
  "nostrud",
  "exercitation",
  "ullamco",
  "laboris",
  "nisi",
  "aliquip",
  "ex",
  "ea",
  "commodo",
  "consequat",
  "duis",
  "aute",
  "irure",
  "in",
  "reprehenderit",
  "voluptate",
  "velit",
  "esse",
  "cillum",
  "fugiat",
  "nulla",
  "pariatur",
  "excepteur",
  "sint",
  "occaecat",
  "cupidatat",
  "non",
  "proident",
  "sunt",
  "culpa",
  "qui",
  "officia",
  "deserunt",
  "mollit",
  "anim",
  "id",
  "est",
  "laborum",
];

export type LoremUnit = "paragraphs" | "sentences" | "words";

export type LoremOptions = {
  count: number;
  unit: LoremUnit;
  startWithLorem: boolean;
};

export const DEFAULT_LOREM_OPTIONS: LoremOptions = {
  count: 3,
  unit: "paragraphs",
  startWithLorem: true,
};

function clampCount(n: number): number {
  return Math.max(1, Math.min(100, Math.floor(n) || 1));
}

function wordAt(i: number): string {
  return WORDS[i % WORDS.length];
}

function makeSentence(startIndex: number, length: number): string {
  const words: string[] = [];
  for (let i = 0; i < length; i += 1) {
    words.push(wordAt(startIndex + i));
  }
  words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);
  return `${words.join(" ")}.`;
}

function makeParagraph(startIndex: number, sentences: number): string {
  const parts: string[] = [];
  let idx = startIndex;
  for (let s = 0; s < sentences; s += 1) {
    const len = 6 + ((idx + s) % 8);
    parts.push(makeSentence(idx, len));
    idx += len;
  }
  return parts.join(" ");
}

export function generateLorem(options: LoremOptions): string {
  const count = clampCount(options.count);
  let cursor = 0;

  if (options.unit === "words") {
    const words: string[] = [];
    for (let i = 0; i < count; i += 1) words.push(wordAt(i));
    if (options.startWithLorem && count >= 2) {
      words[0] = "Lorem";
      words[1] = "ipsum";
    } else if (options.startWithLorem && count >= 1) {
      words[0] = "Lorem";
    }
    return words.join(" ");
  }

  if (options.unit === "sentences") {
    const sentences: string[] = [];
    for (let i = 0; i < count; i += 1) {
      const len = 6 + (i % 8);
      let sentence = makeSentence(cursor, len);
      if (i === 0 && options.startWithLorem) {
        sentence = sentence.replace(/^[A-Za-z]+(?:\s+[A-Za-z]+)?/, "Lorem ipsum");
      }
      sentences.push(sentence);
      cursor += len;
    }
    return sentences.join(" ");
  }

  const paragraphs: string[] = [];
  for (let i = 0; i < count; i += 1) {
    const sentenceCount = 3 + (i % 3);
    let paragraph = makeParagraph(cursor, sentenceCount);
    if (i === 0 && options.startWithLorem) {
      paragraph = paragraph.replace(/^[A-Za-z]+(?:\s+[A-Za-z]+)?/, "Lorem ipsum");
    }
    paragraphs.push(paragraph);
    cursor += sentenceCount * 10;
  }
  return paragraphs.join("\n\n");
}
