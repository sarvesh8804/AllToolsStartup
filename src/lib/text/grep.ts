export type GrepFlags = {
  i: boolean;
  m: boolean;
  g: boolean;
};

export const DEFAULT_GREP_FLAGS: GrepFlags = {
  i: false,
  m: false,
  g: true,
};

export type GrepMatchSpan = {
  start: number;
  end: number;
  text: string;
};

export type GrepLineResult = {
  lineNumber: number;
  line: string;
  spans: GrepMatchSpan[];
};

export type GrepResult =
  | { ok: true; lines: GrepLineResult[]; totalMatches: number }
  | { ok: false; error: string };

export const SAMPLE_GREP_PATTERN = "\\bForge\\b";
export const SAMPLE_GREP_TEXT = `Forge ships tools every day.
Ada loves Regex.
JSON Formatter is ready.`;

function flagsToString(flags: GrepFlags): string {
  return (flags.g ? "g" : "") + (flags.i ? "i" : "") + (flags.m ? "m" : "");
}

/** Multiline grep with per-line match spans and line numbers. */
export function grepText(
  pattern: string,
  text: string,
  flags: GrepFlags = DEFAULT_GREP_FLAGS,
): GrepResult {
  if (!pattern.trim()) {
    return { ok: false, error: "Enter a search pattern." };
  }

  let regex: RegExp;
  try {
    regex = new RegExp(pattern, flagsToString(flags));
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Invalid regular expression",
    };
  }

  const sourceLines = text.split(/\n/);
  const lines: GrepLineResult[] = [];
  let totalMatches = 0;

  for (let i = 0; i < sourceLines.length; i += 1) {
    const line = sourceLines[i]!;
    const spans: GrepMatchSpan[] = [];
    if (regex.global) {
      const lineRegex = new RegExp(regex.source, flagsToString(flags));
      let match: RegExpExecArray | null;
      while ((match = lineRegex.exec(line)) !== null) {
        spans.push({
          start: match.index,
          end: match.index + match[0].length,
          text: match[0],
        });
        totalMatches += 1;
        if (match[0].length === 0) lineRegex.lastIndex += 1;
      }
    } else {
      const match = regex.exec(line);
      if (match) {
        spans.push({
          start: match.index,
          end: match.index + match[0].length,
          text: match[0],
        });
        totalMatches += 1;
      }
    }
    if (spans.length > 0) {
      lines.push({ lineNumber: i + 1, line, spans });
    }
  }

  return { ok: true, lines, totalMatches };
}
