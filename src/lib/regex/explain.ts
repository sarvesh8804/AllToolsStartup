export type RegexExplainToken = {
  raw: string;
  start: number;
  end: number;
  kind:
    | "literal"
    | "escape"
    | "dot"
    | "anchor"
    | "quantifier"
    | "alternation"
    | "group-open"
    | "group-close"
    | "class"
    | "unknown";
  title: string;
  explanation: string;
  /** Nesting depth of capturing/non-capturing groups (0 = top level). */
  depth: number;
};

export type RegexExplainResult =
  | { ok: true; tokens: RegexExplainToken[]; summary: string }
  | { ok: false; error: string; tokens: RegexExplainToken[] };

const SIMPLE_ESCAPES: Record<string, { title: string; explanation: string }> = {
  d: { title: "Digit", explanation: "Matches a digit 0–9 (\\d)." },
  D: { title: "Non-digit", explanation: "Matches any character that is not a digit (\\D)." },
  w: {
    title: "Word character",
    explanation: "Matches a letter, digit, or underscore [A-Za-z0-9_] (\\w).",
  },
  W: {
    title: "Non-word character",
    explanation: "Matches anything outside [A-Za-z0-9_] (\\W).",
  },
  s: { title: "Whitespace", explanation: "Matches whitespace (space, tab, newline, …) (\\s)." },
  S: {
    title: "Non-whitespace",
    explanation: "Matches any non-whitespace character (\\S).",
  },
  b: {
    title: "Word boundary",
    explanation: "Matches a position between a word and a non-word character (\\b).",
  },
  B: {
    title: "Non-word boundary",
    explanation: "Matches a position that is not a word boundary (\\B).",
  },
  t: { title: "Tab", explanation: "Matches a tab character (\\t)." },
  n: { title: "Newline", explanation: "Matches a newline (\\n)." },
  r: { title: "Carriage return", explanation: "Matches a carriage return (\\r)." },
  f: { title: "Form feed", explanation: "Matches a form feed (\\f)." },
  v: { title: "Vertical tab", explanation: "Matches a vertical tab (\\v)." },
  "0": { title: "NUL", explanation: "Matches a null character (\\0), when not a backreference." },
};

function isDigit(ch: string): boolean {
  return ch >= "0" && ch <= "9";
}

function isHex(ch: string): boolean {
  return (
    (ch >= "0" && ch <= "9") ||
    (ch >= "a" && ch <= "f") ||
    (ch >= "A" && ch <= "F")
  );
}

function pushToken(
  tokens: RegexExplainToken[],
  pattern: string,
  start: number,
  end: number,
  kind: RegexExplainToken["kind"],
  title: string,
  explanation: string,
  depth: number,
) {
  tokens.push({
    raw: pattern.slice(start, end),
    start,
    end,
    kind,
    title,
    explanation,
    depth,
  });
}

function explainQuantifier(raw: string): { title: string; explanation: string } {
  const lazy = raw.endsWith("?");
  const base = lazy ? raw.slice(0, -1) : raw;
  const lazyNote = lazy
    ? " Lazy (non-greedy) — matches as few times as possible."
    : " Greedy — matches as many times as possible.";

  if (base === "*") {
    return {
      title: lazy ? "Zero or more (lazy)" : "Zero or more",
      explanation: `Matches the previous item 0 or more times.${lazyNote}`,
    };
  }
  if (base === "+") {
    return {
      title: lazy ? "One or more (lazy)" : "One or more",
      explanation: `Matches the previous item 1 or more times.${lazyNote}`,
    };
  }
  if (base === "?") {
    return {
      title: lazy ? "Optional (lazy)" : "Optional",
      explanation: `Matches the previous item 0 or 1 time.${lazyNote}`,
    };
  }
  const brace = base.match(/^\{(\d+)(,(\d*))?\}$/);
  if (brace) {
    const n = brace[1];
    const hasComma = brace[2] != null;
    const m = brace[3];
    let range: string;
    if (!hasComma) range = `exactly ${n} time${n === "1" ? "" : "s"}`;
    else if (m === "") range = `at least ${n} times`;
    else range = `between ${n} and ${m} times`;
    return {
      title: lazy ? `Quantifier {…} (lazy)` : "Quantifier {…}",
      explanation: `Matches the previous item ${range}.${lazyNote}`,
    };
  }
  return {
    title: "Quantifier",
    explanation: `Repeats the previous item (${raw}).${lazyNote}`,
  };
}

function readEscape(
  pattern: string,
  i: number,
): { end: number; title: string; explanation: string } {
  const next = pattern[i + 1];
  if (next == null) {
    return {
      end: i + 1,
      title: "Trailing backslash",
      explanation: "A lone backslash at the end is invalid in most engines.",
    };
  }

  if (SIMPLE_ESCAPES[next]) {
    const meta = SIMPLE_ESCAPES[next]!;
    return { end: i + 2, ...meta };
  }

  if (next === "x" && isHex(pattern[i + 2] ?? "") && isHex(pattern[i + 3] ?? "")) {
    const hex = pattern.slice(i + 2, i + 4);
    return {
      end: i + 4,
      title: "Hex escape",
      explanation: `Matches the character with hex code ${hex.toUpperCase()} (\\x${hex}).`,
    };
  }

  if (next === "u") {
    if (pattern[i + 2] === "{") {
      let j = i + 3;
      while (j < pattern.length && isHex(pattern[j]!)) j += 1;
      if (pattern[j] === "}") {
        const hex = pattern.slice(i + 3, j);
        return {
          end: j + 1,
          title: "Unicode code point",
          explanation: `Matches Unicode code point U+${hex.toUpperCase()} (\\u{${hex}}). Requires the u flag in some cases.`,
        };
      }
    }
    if (
      isHex(pattern[i + 2] ?? "") &&
      isHex(pattern[i + 3] ?? "") &&
      isHex(pattern[i + 4] ?? "") &&
      isHex(pattern[i + 5] ?? "")
    ) {
      const hex = pattern.slice(i + 2, i + 6);
      return {
        end: i + 6,
        title: "Unicode escape",
        explanation: `Matches the character U+${hex.toUpperCase()} (\\u${hex}).`,
      };
    }
  }

  if (next === "c" && /[A-Za-z]/.test(pattern[i + 2] ?? "")) {
    return {
      end: i + 3,
      title: "Control character",
      explanation: `Matches a control character (\\c${pattern[i + 2]}).`,
    };
  }

  if (next === "k" && pattern[i + 2] === "<") {
    let j = i + 3;
    while (j < pattern.length && pattern[j] !== ">" && pattern[j] !== "\n") j += 1;
    if (pattern[j] === ">") {
      const name = pattern.slice(i + 3, j);
      return {
        end: j + 1,
        title: "Named backreference",
        explanation: `Refers to the capturing group named "${name}" (\\k<${name}>).`,
      };
    }
  }

  if (next === "p" || next === "P") {
    if (pattern[i + 2] === "{") {
      let j = i + 3;
      while (j < pattern.length && pattern[j] !== "}") j += 1;
      if (pattern[j] === "}") {
        const name = pattern.slice(i + 3, j);
        return {
          end: j + 1,
          title: next === "p" ? "Unicode property" : "Negated Unicode property",
          explanation:
            next === "p"
              ? `Matches characters with Unicode property ${name} (\\p{${name}}). Requires the u flag.`
              : `Matches characters without Unicode property ${name} (\\P{${name}}). Requires the u flag.`,
        };
      }
    }
  }

  if (isDigit(next)) {
    let j = i + 1;
    while (j < pattern.length && isDigit(pattern[j]!) && j - i < 4) j += 1;
    const digits = pattern.slice(i + 1, j);
    return {
      end: j,
      title: "Backreference",
      explanation: `Refers to capturing group number ${digits} (\\${digits}).`,
    };
  }

  return {
    end: i + 2,
    title: "Escaped literal",
    explanation: `Matches a literal "${next}" character (\\${next}).`,
  };
}

function readCharClass(
  pattern: string,
  start: number,
): { end: number; title: string; explanation: string } | { error: string } {
  if (pattern[start] !== "[") return { error: "Expected [" };
  let i = start + 1;
  const negated = pattern[i] === "^";
  if (negated) i += 1;

  while (i < pattern.length) {
    const ch = pattern[i]!;
    if (ch === "]") {
      const raw = pattern.slice(start, i + 1);
      const empty = i === start + 1 || (negated && i === start + 2);
      return {
        end: i + 1,
        title: negated ? "Negated character class" : "Character class",
        explanation: empty
          ? negated
            ? "Empty negated class [^] — matches any character."
            : "Empty character class [] — matches no characters."
          : negated
            ? `Matches any character not listed in ${raw}.`
            : `Matches one character from the set ${raw}.`,
      };
    }
    if (ch === "\\") {
      if (i + 1 >= pattern.length) {
        return { error: "Trailing backslash in character class." };
      }
      i += 2;
      continue;
    }
    i += 1;
  }
  return { error: "Unclosed character class [" };
}

function readGroupOpen(
  pattern: string,
  start: number,
): { end: number; title: string; explanation: string; capturing: boolean } {
  // start points at '('
  if (pattern[start + 1] !== "?") {
    return {
      end: start + 1,
      title: "Capturing group",
      explanation: "Starts a capturing group. The matched text is available as $1, $2, …",
      capturing: true,
    };
  }

  const after = pattern.slice(start + 2, start + 6);

  if (pattern[start + 2] === ":") {
    return {
      end: start + 3,
      title: "Non-capturing group",
      explanation: "Starts a non-capturing group (?:…) — groups without creating a backreference.",
      capturing: false,
    };
  }
  if (pattern[start + 2] === "=") {
    return {
      end: start + 3,
      title: "Positive lookahead",
      explanation: "Positive lookahead (?=…) — asserts that this pattern follows, without consuming it.",
      capturing: false,
    };
  }
  if (pattern[start + 2] === "!") {
    return {
      end: start + 3,
      title: "Negative lookahead",
      explanation: "Negative lookahead (?!…) — asserts that this pattern does not follow.",
      capturing: false,
    };
  }
  if (after.startsWith("<=")) {
    return {
      end: start + 4,
      title: "Positive lookbehind",
      explanation: "Positive lookbehind (?<=…) — asserts that this pattern precedes the current position.",
      capturing: false,
    };
  }
  if (after.startsWith("<!")) {
    return {
      end: start + 4,
      title: "Negative lookbehind",
      explanation: "Negative lookbehind (?<!…) — asserts that this pattern does not precede.",
      capturing: false,
    };
  }
  if (pattern[start + 2] === "<") {
    let j = start + 3;
    while (j < pattern.length && /[A-Za-z0-9_]/.test(pattern[j]!)) j += 1;
    if (pattern[j] === ">") {
      const name = pattern.slice(start + 3, j);
      return {
        end: j + 1,
        title: "Named capturing group",
        explanation: `Starts a named capturing group (?<${name}>…) — reference later with \\k<${name}>.`,
        capturing: true,
      };
    }
  }

  return {
    end: start + 2,
    title: "Special group",
    explanation: "Starts a group with an unrecognized (?…) construct for this explainer.",
    capturing: false,
  };
}

function readBraceQuantifier(
  pattern: string,
  start: number,
): { end: number; raw: string } | null {
  if (pattern[start] !== "{") return null;
  let i = start + 1;
  if (!isDigit(pattern[i] ?? "")) return null;
  while (isDigit(pattern[i] ?? "")) i += 1;
  if (pattern[i] === ",") {
    i += 1;
    while (isDigit(pattern[i] ?? "")) i += 1;
  }
  if (pattern[i] !== "}") return null;
  let end = i + 1;
  let raw = pattern.slice(start, end);
  if (pattern[end] === "?") {
    end += 1;
    raw = pattern.slice(start, end);
  }
  return { end, raw };
}

/**
 * Tokenize a JavaScript regex pattern into explained pieces (static rules only).
 */
export function explainRegex(pattern: string): RegexExplainResult {
  const tokens: RegexExplainToken[] = [];

  if (!pattern) {
    return { ok: false, error: "Enter a regular expression pattern.", tokens };
  }

  try {
    // Validate syntax (flags unused — pattern-only explain)
    void new RegExp(pattern);
  } catch (e) {
    // Still try to tokenize what we can, but mark failure
    const error = e instanceof Error ? e.message : "Invalid regular expression";
    tokenize(pattern, tokens);
    return { ok: false, error, tokens };
  }

  tokenize(pattern, tokens);

  const groups = tokens.filter((t) => t.kind === "group-open").length;
  const classes = tokens.filter((t) => t.kind === "class").length;
  const summary = `${tokens.length} token${tokens.length === 1 ? "" : "s"} · ${groups} group opener${groups === 1 ? "" : "s"} · ${classes} character class${classes === 1 ? "" : "es"}`;

  return { ok: true, tokens, summary };
}

function tokenize(pattern: string, tokens: RegexExplainToken[]) {
  let i = 0;
  let depth = 0;

  while (i < pattern.length) {
    const ch = pattern[i]!;

    if (ch === "\\") {
      const esc = readEscape(pattern, i);
      pushToken(
        tokens,
        pattern,
        i,
        esc.end,
        "escape",
        esc.title,
        esc.explanation,
        depth,
      );
      i = esc.end;
      continue;
    }

    if (ch === "[") {
      const cls = readCharClass(pattern, i);
      if ("error" in cls) {
        pushToken(tokens, pattern, i, i + 1, "unknown", "Character class", cls.error, depth);
        i += 1;
        continue;
      }
      pushToken(tokens, pattern, i, cls.end, "class", cls.title, cls.explanation, depth);
      i = cls.end;
      continue;
    }

    if (ch === "(") {
      const g = readGroupOpen(pattern, i);
      pushToken(tokens, pattern, i, g.end, "group-open", g.title, g.explanation, depth);
      depth += 1;
      i = g.end;
      continue;
    }

    if (ch === ")") {
      depth = Math.max(0, depth - 1);
      pushToken(
        tokens,
        pattern,
        i,
        i + 1,
        "group-close",
        "Group end",
        "Closes the nearest open group.",
        depth,
      );
      i += 1;
      continue;
    }

    if (ch === "^") {
      pushToken(
        tokens,
        pattern,
        i,
        i + 1,
        "anchor",
        "Start anchor",
        "Matches the start of the string (or line start with the m flag).",
        depth,
      );
      i += 1;
      continue;
    }

    if (ch === "$") {
      pushToken(
        tokens,
        pattern,
        i,
        i + 1,
        "anchor",
        "End anchor",
        "Matches the end of the string (or line end with the m flag).",
        depth,
      );
      i += 1;
      continue;
    }

    if (ch === ".") {
      pushToken(
        tokens,
        pattern,
        i,
        i + 1,
        "dot",
        "Any character",
        "Matches any character except line terminators (unless the s / dotAll flag is set).",
        depth,
      );
      i += 1;
      continue;
    }

    if (ch === "|") {
      pushToken(
        tokens,
        pattern,
        i,
        i + 1,
        "alternation",
        "Alternation",
        "Matches either the expression on the left or the expression on the right.",
        depth,
      );
      i += 1;
      continue;
    }

    if (ch === "*" || ch === "+" || ch === "?") {
      let end = i + 1;
      let raw = ch;
      // lazy
      if (pattern[end] === "?" && ch !== "?") {
        // *? +?
        end += 1;
        raw = pattern.slice(i, end);
      } else if (ch === "?" && pattern[end] === "?") {
        // ??
        end += 1;
        raw = pattern.slice(i, end);
      }
      const meta = explainQuantifier(raw);
      pushToken(tokens, pattern, i, end, "quantifier", meta.title, meta.explanation, depth);
      i = end;
      continue;
    }

    if (ch === "{") {
      const brace = readBraceQuantifier(pattern, i);
      if (brace) {
        const meta = explainQuantifier(brace.raw);
        pushToken(
          tokens,
          pattern,
          i,
          brace.end,
          "quantifier",
          meta.title,
          meta.explanation,
          depth,
        );
        i = brace.end;
        continue;
      }
    }

    // Merge consecutive literals into one token for readability
    let j = i + 1;
    while (
      j < pattern.length &&
      !"[\\()^$.|?*+{}".includes(pattern[j]!)
    ) {
      j += 1;
    }
    const lit = pattern.slice(i, j);
    pushToken(
      tokens,
      pattern,
      i,
      j,
      "literal",
      lit.length === 1 ? "Literal character" : "Literal text",
      lit.length === 1
        ? `Matches the character "${lit}" exactly.`
        : `Matches the text "${lit}" exactly.`,
      depth,
    );
    i = j;
  }
}

export function tokensToPlainText(tokens: RegexExplainToken[]): string {
  return tokens
    .map(
      (t) =>
        `${t.raw}\n  ${t.title}: ${t.explanation}`,
    )
    .join("\n\n");
}

export const SAMPLE_REGEX_EXPLAIN =
  "^(?<year>\\d{4})-(?<month>\\d{2})-(?<day>\\d{2})$";

export const REGEX_EXPLAIN_EXAMPLES: { label: string; pattern: string }[] = [
  { label: "Date", pattern: SAMPLE_REGEX_EXPLAIN },
  { label: "Email-ish", pattern: "^[\\w.-]+@[\\w.-]+\\.[A-Za-z]{2,}$" },
  { label: "Lookahead", pattern: "\\b\\w+(?=\\.js\\b)" },
  { label: "Alternation", pattern: "(cat|dog|bird)s?" },
];
