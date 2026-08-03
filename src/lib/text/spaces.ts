export type RemoveSpacesMode = "collapse" | "trim-lines" | "all";

export type RemoveSpacesOptions = {
  mode?: RemoveSpacesMode;
  /** Also trim leading/trailing whitespace on each line (default true). */
  trimLines?: boolean;
};

/** Remove extra whitespace from text. */
export function removeExtraSpaces(
  input: string,
  options: RemoveSpacesOptions = {},
): { ok: true; text: string } | { ok: false; error: string } {
  if (!input) {
    return { ok: false, error: "Enter text to clean up." };
  }

  const mode = options.mode ?? "collapse";
  const trimLines = options.trimLines !== false;

  if (mode === "all") {
    return { ok: true, text: input.replace(/\s+/g, " ").trim() };
  }

  const lines = input.split(/\r?\n/);
  const cleaned = lines.map((line) => {
    let next = line;
    if (trimLines) next = next.trim();
    if (mode === "collapse") {
      next = next.replace(/[ \t\f\v]+/g, " ");
    }
    return next;
  });

  return { ok: true, text: cleaned.join("\n") };
}

export const SAMPLE_SPACES_TEXT = "Hello   world\n  extra   line  ";
