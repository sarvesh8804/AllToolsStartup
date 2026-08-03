export type ReverseTextMode = "characters" | "words" | "lines";

/** Reverse text by characters, words, or lines. */
export function reverseText(
  input: string,
  mode: ReverseTextMode = "characters",
): { ok: true; text: string } | { ok: false; error: string } {
  if (!input) {
    return { ok: false, error: "Enter text to reverse." };
  }

  if (mode === "characters") {
    return { ok: true, text: [...input].reverse().join("") };
  }

  if (mode === "words") {
    const parts = input.split(/(\s+)/);
    const words = parts.filter((p) => p.trim().length > 0);
    const reversed = words.reverse();
    let i = 0;
    return {
      ok: true,
      text: parts
        .map((part) => (part.trim().length > 0 ? reversed[i++]! : part))
        .join(""),
    };
  }

  return {
    ok: true,
    text: input.split(/\r?\n/).reverse().join("\n"),
  };
}

export const SAMPLE_REVERSE_TEXT = "Forge tools";
