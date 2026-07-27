export type FindReplaceRule = {
  id: string;
  find: string;
  replace: string;
  /** When true, `find` is treated as a RegExp pattern. */
  useRegex: boolean;
  caseSensitive: boolean;
  /** Match whole words only (literal or regex). */
  wholeWord: boolean;
  enabled: boolean;
};

export type FindReplaceRuleResult = {
  id: string;
  count: number;
  error?: string;
};

export type FindReplaceBatchResult = {
  text: string;
  totalReplacements: number;
  perRule: FindReplaceRuleResult[];
};

export function createFindReplaceRule(
  partial?: Partial<Omit<FindReplaceRule, "id">> & { id?: string },
): FindReplaceRule {
  return {
    id: partial?.id ?? `rule-${Math.random().toString(36).slice(2, 9)}`,
    find: partial?.find ?? "",
    replace: partial?.replace ?? "",
    useRegex: partial?.useRegex ?? false,
    caseSensitive: partial?.caseSensitive ?? true,
    wholeWord: partial?.wholeWord ?? false,
    enabled: partial?.enabled ?? true,
  };
}

export function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildRuleRegExp(
  rule: FindReplaceRule,
): { ok: true; regex: RegExp } | { ok: false; error: string } {
  const raw = rule.find;
  if (!raw) {
    return { ok: false, error: "Find pattern is empty." };
  }

  let source = rule.useRegex ? raw : escapeRegExp(raw);
  if (rule.wholeWord) {
    source = `\\b(?:${source})\\b`;
  }

  const flags = `g${rule.caseSensitive ? "" : "i"}`;
  try {
    return { ok: true, regex: new RegExp(source, flags) };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Invalid regular expression",
    };
  }
}

/** Count matches without mutating lastIndex surprises. */
export function countRegExpMatches(text: string, regex: RegExp): number {
  const flags = regex.flags.includes("g") ? regex.flags : `${regex.flags}g`;
  const re = new RegExp(regex.source, flags);
  let count = 0;
  let m: RegExpExecArray | null;
  let lastIndex = -1;
  while ((m = re.exec(text)) !== null) {
    count += 1;
    if (m[0].length === 0) {
      if (re.lastIndex === lastIndex) re.lastIndex += 1;
      lastIndex = re.lastIndex;
      if (re.lastIndex > text.length) break;
    }
  }
  return count;
}

/**
 * Apply enabled rules in order. Each rule runs on the output of the previous.
 */
export function applyFindReplaceBatch(
  text: string,
  rules: FindReplaceRule[],
): FindReplaceBatchResult {
  let current = text;
  let totalReplacements = 0;
  const perRule: FindReplaceRuleResult[] = [];

  for (const rule of rules) {
    if (!rule.enabled) {
      perRule.push({ id: rule.id, count: 0 });
      continue;
    }
    if (!rule.find) {
      perRule.push({ id: rule.id, count: 0 });
      continue;
    }

    const built = buildRuleRegExp(rule);
    if (!built.ok) {
      perRule.push({ id: rule.id, count: 0, error: built.error });
      continue;
    }

    const count = countRegExpMatches(current, built.regex);
    try {
      current = current.replace(built.regex, rule.replace);
    } catch (e) {
      perRule.push({
        id: rule.id,
        count: 0,
        error:
          e instanceof Error ? e.message : "Replacement failed (check $ groups).",
      });
      continue;
    }

    totalReplacements += count;
    perRule.push({ id: rule.id, count });
  }

  return { text: current, totalReplacements, perRule };
}

export const SAMPLE_FIND_REPLACE_TEXT = `Hello world
hello WORLD
foo_bar foo bar
Colour and color
https://example.com/path
`;

export const SAMPLE_FIND_REPLACE_RULES: FindReplaceRule[] = [
  createFindReplaceRule({
    id: "sample-1",
    find: "hello",
    replace: "hi",
    caseSensitive: false,
    useRegex: false,
    wholeWord: true,
  }),
  createFindReplaceRule({
    id: "sample-2",
    find: "Colour",
    replace: "Color",
    caseSensitive: false,
    useRegex: false,
    wholeWord: true,
  }),
  createFindReplaceRule({
    id: "sample-3",
    find: "https://([^/\\s]+)",
    replace: "https://cdn.$1",
    useRegex: true,
    caseSensitive: true,
    wholeWord: false,
  }),
];
