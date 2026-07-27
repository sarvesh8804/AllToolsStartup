const MAJOR_KEYWORDS = [
  "WITH",
  "SELECT",
  "FROM",
  "WHERE",
  "GROUP BY",
  "HAVING",
  "ORDER BY",
  "LIMIT",
  "OFFSET",
  "UNION ALL",
  "UNION",
  "INTERSECT",
  "EXCEPT",
  "INSERT INTO",
  "VALUES",
  "UPDATE",
  "SET",
  "DELETE FROM",
  "CREATE TABLE",
  "ALTER TABLE",
  "DROP TABLE",
];

const JOIN_KEYWORDS = [
  "LEFT OUTER JOIN",
  "RIGHT OUTER JOIN",
  "FULL OUTER JOIN",
  "LEFT JOIN",
  "RIGHT JOIN",
  "FULL JOIN",
  "INNER JOIN",
  "CROSS JOIN",
  "JOIN",
];

const SINGLE_KEYWORDS = [
  "AND",
  "OR",
  "NOT",
  "AS",
  "ON",
  "IN",
  "IS",
  "NULL",
  "LIKE",
  "BETWEEN",
  "CASE",
  "WHEN",
  "THEN",
  "ELSE",
  "END",
  "ASC",
  "DESC",
  "DISTINCT",
];

const ALL_PHRASES = [...MAJOR_KEYWORDS, ...JOIN_KEYWORDS].sort(
  (a, b) => b.length - a.length,
);

export type KeywordCase = "upper" | "lower" | "preserve";

export type SqlFormatOptions = {
  /** Spaces per indent level (default 2). */
  indentSize?: number;
  /** How to rewrite SQL keywords (default "upper"). */
  keywordCase?: KeywordCase;
  /** Indent JOIN clauses (default true). */
  indentJoins?: boolean;
  /** Put AND/OR on their own indented lines (default true). */
  breakBoolean?: boolean;
  /** Split SELECT column lists onto multiple lines (default true). */
  splitSelectList?: boolean;
  /** Use tabs instead of spaces (default false). */
  useTabs?: boolean;
};

export const DEFAULT_SQL_FORMAT_OPTIONS: Required<SqlFormatOptions> = {
  indentSize: 2,
  keywordCase: "upper",
  indentJoins: true,
  breakBoolean: true,
  splitSelectList: true,
  useTabs: false,
};

function protectStrings(sql: string): { text: string; strings: string[] } {
  const strings: string[] = [];
  const text = sql.replace(/('([^']|'')*'|"([^"]|"")*")/g, (m) => {
    strings.push(m);
    return `__SQL_STR_${strings.length - 1}__`;
  });
  return { text, strings };
}

function restoreStrings(sql: string, strings: string[]): string {
  return sql.replace(/__SQL_STR_(\d+)__/g, (_, i) => strings[Number(i)]);
}

/** Strip SQL comments from string-protected source text. */
function stripComments(text: string): string {
  let out = "";
  let i = 0;
  while (i < text.length) {
    const ch = text[i];
    const next = text[i + 1];
    if (ch === "-" && next === "-") {
      while (i < text.length && text[i] !== "\n") i += 1;
      continue;
    }
    if (ch === "/" && next === "*") {
      i += 2;
      while (i < text.length && !(text[i] === "*" && text[i + 1] === "/")) {
        i += 1;
      }
      i = Math.min(text.length, i + 2);
      continue;
    }
    out += ch;
    i += 1;
  }
  return out;
}

function applyCase(phrase: string, mode: KeywordCase): string {
  if (mode === "upper") return phrase.toUpperCase();
  if (mode === "lower") return phrase.toLowerCase();
  return phrase;
}

function rewriteKeywords(sql: string, mode: KeywordCase): string {
  if (mode === "preserve") return sql;
  let out = sql;
  for (const phrase of ALL_PHRASES) {
    const re = new RegExp(`\\b${phrase.replace(/ /g, "\\s+")}\\b`, "gi");
    out = out.replace(re, applyCase(phrase, mode));
  }
  for (const word of SINGLE_KEYWORDS) {
    out = out.replace(
      new RegExp(`\\b${word}\\b`, "gi"),
      applyCase(word, mode),
    );
  }
  return out;
}

function phraseStarts(line: string, phrases: string[], mode: KeywordCase): boolean {
  return phrases.some((k) => {
    const target = applyCase(k, mode === "preserve" ? "upper" : mode);
    const re = new RegExp(`^${target.replace(/ /g, "\\s+")}\\b`, "i");
    return re.test(line);
  });
}

export function formatSql(
  input: string,
  options: SqlFormatOptions = {},
): string {
  const opts = { ...DEFAULT_SQL_FORMAT_OPTIONS, ...options };
  const { text, strings } = protectStrings(input);
  let sql = text.replace(/\s+/g, " ").trim();
  if (!sql) return "";

  sql = rewriteKeywords(sql, opts.keywordCase);

  const caseMode = opts.keywordCase === "preserve" ? "upper" : opts.keywordCase;

  // Newline before major / join clauses (match case-insensitively, keep rewritten form)
  for (const phrase of ALL_PHRASES) {
    const re = new RegExp(`\\s+(${phrase.replace(/ /g, "\\s+")})\\b`, "gi");
    sql = sql.replace(re, "\n$1");
  }

  if (opts.breakBoolean) {
    sql = sql.replace(/\s+(AND|OR)\b/gi, "\n$1");
  }

  const pad = opts.useTabs ? "\t" : " ".repeat(opts.indentSize);
  const lines = sql
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  const out: string[] = [];

  for (const line of lines) {
    const isMajor = phraseStarts(line, MAJOR_KEYWORDS, caseMode);
    const isJoin = phraseStarts(line, JOIN_KEYWORDS, caseMode);
    const isBool = /^(AND|OR)\b/i.test(line);

    if (isMajor) {
      out.push(line);
    } else if ((isJoin && opts.indentJoins) || (isBool && opts.breakBoolean)) {
      out.push(pad + line);
    } else if (isJoin || isBool) {
      out.push(line);
    } else if (out.length === 0) {
      out.push(line);
    } else {
      out.push(pad + line);
    }
  }

  let formatted = out.join("\n");

  if (opts.splitSelectList) {
    formatted = out
      .map((line) => {
        if (!/^SELECT\b/i.test(line)) return line;
        const match = line.match(/^SELECT\s*(.*)$/i);
        if (!match) return line;
        const rest = match[1].trim();
        if (!rest || !rest.includes(",")) return line;
        const selectKw = line.match(/^SELECT/i)![0];
        const parts = rest.split(",").map((p) => p.trim());
        return [
          selectKw,
          ...parts.map(
            (p, i) => `${pad}${p}${i < parts.length - 1 ? "," : ""}`,
          ),
        ].join("\n");
      })
      .join("\n");
  }

  return restoreStrings(formatted, strings) + "\n";
}

export type SqlMinifyOptions = {
  /** Remove line (--) and block comments (default true). */
  stripComments?: boolean;
};

export type SqlMinifyResult =
  | { ok: true; sql: string; originalChars: number; minifiedChars: number }
  | { ok: false; error: string };

/** Collapse SQL to a single line; optionally strip comments. Strings are preserved. */
export function minifySql(
  input: string,
  options: SqlMinifyOptions = {},
): string {
  const result = minifySqlDetailed(input, options);
  return result.ok ? result.sql : "";
}

export function minifySqlDetailed(
  input: string,
  options: SqlMinifyOptions = {},
): SqlMinifyResult {
  const strip = options.stripComments !== false;
  const original = input;
  if (!original.trim()) {
    return { ok: false, error: "Paste SQL to minify." };
  }

  const { text, strings } = protectStrings(original);
  let body = strip ? stripComments(text) : text;
  body = body.replace(/\s+/g, " ").trim();

  const sql = restoreStrings(body, strings);
  return {
    ok: true,
    sql,
    originalChars: [...original].length,
    minifiedChars: [...sql].length,
  };
}
