export type RegexFlags = {
  g: boolean;
  i: boolean;
  m: boolean;
  s: boolean;
  u: boolean;
  y: boolean;
};

export const DEFAULT_REGEX_FLAGS: RegexFlags = {
  g: true,
  i: false,
  m: false,
  s: false,
  u: false,
  y: false,
};

export type RegexMatch = {
  index: number;
  match: string;
  groups: string[];
  namedGroups: Record<string, string>;
};

export type RegexTestResult =
  | {
      ok: true;
      matches: RegexMatch[];
      replaced: string;
      flags: string;
    }
  | { ok: false; error: string };

export function flagsToString(flags: RegexFlags): string {
  return (
    (flags.g ? "g" : "") +
    (flags.i ? "i" : "") +
    (flags.m ? "m" : "") +
    (flags.s ? "s" : "") +
    (flags.u ? "u" : "") +
    (flags.y ? "y" : "")
  );
}

export function buildRegExp(
  pattern: string,
  flags: RegexFlags,
): { ok: true; regex: RegExp } | { ok: false; error: string } {
  if (!pattern) {
    return { ok: false, error: "Enter a regular expression pattern." };
  }
  try {
    return { ok: true, regex: new RegExp(pattern, flagsToString(flags)) };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Invalid regular expression",
    };
  }
}

export function testRegex(
  pattern: string,
  text: string,
  flags: RegexFlags = DEFAULT_REGEX_FLAGS,
  replacement = "",
): RegexTestResult {
  const built = buildRegExp(pattern, flags);
  if (!built.ok) return built;

  const { regex } = built;
  const matches: RegexMatch[] = [];

  if (regex.global || regex.sticky) {
    let m: RegExpExecArray | null;
    // Guard against zero-length match infinite loops
    let lastIndex = -1;
    while ((m = regex.exec(text)) !== null) {
      matches.push({
        index: m.index,
        match: m[0],
        groups: m.slice(1).map((g) => g ?? ""),
        namedGroups: { ...(m.groups ?? {}) },
      });
      if (m[0].length === 0) {
        if (regex.lastIndex === lastIndex) {
          regex.lastIndex += 1;
        }
        lastIndex = regex.lastIndex;
        if (regex.lastIndex > text.length) break;
      }
    }
  } else {
    const m = regex.exec(text);
    if (m) {
      matches.push({
        index: m.index,
        match: m[0],
        groups: m.slice(1).map((g) => g ?? ""),
        namedGroups: { ...(m.groups ?? {}) },
      });
    }
  }

  let replaced = text;
  try {
    replaced = text.replace(
      new RegExp(pattern, flagsToString({ ...flags, g: flags.g })),
      replacement,
    );
  } catch {
    // replacement syntax errors — keep original
  }

  return {
    ok: true,
    matches,
    replaced,
    flags: flagsToString(flags),
  };
}

/** Build highlighted segments for the UI (match vs plain). */
export function highlightMatches(
  text: string,
  matches: RegexMatch[],
): { text: string; isMatch: boolean }[] {
  if (matches.length === 0) return [{ text, isMatch: false }];

  const sorted = [...matches].sort((a, b) => a.index - b.index);
  const segments: { text: string; isMatch: boolean }[] = [];
  let cursor = 0;

  for (const m of sorted) {
    if (m.index < cursor) continue; // overlapping — skip
    if (m.index > cursor) {
      segments.push({ text: text.slice(cursor, m.index), isMatch: false });
    }
    segments.push({ text: m.match, isMatch: true });
    cursor = m.index + m.match.length;
    if (m.match.length === 0) cursor = Math.max(cursor, m.index + 1);
  }
  if (cursor < text.length) {
    segments.push({ text: text.slice(cursor), isMatch: false });
  }
  return segments;
}
