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

const ALL_PHRASES = [...MAJOR_KEYWORDS, ...JOIN_KEYWORDS].sort(
  (a, b) => b.length - a.length,
);

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

function uppercaseKeywords(sql: string): string {
  let out = sql;
  for (const phrase of ALL_PHRASES) {
    const re = new RegExp(`\\b${phrase.replace(/ /g, "\\s+")}\\b`, "gi");
    out = out.replace(re, phrase);
  }
  // Single-word helpers
  for (const word of [
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
  ]) {
    out = out.replace(new RegExp(`\\b${word}\\b`, "gi"), word);
  }
  return out;
}

export function formatSql(input: string, indentSize = 2): string {
  const { text, strings } = protectStrings(input);
  let sql = text.replace(/\s+/g, " ").trim();
  if (!sql) return "";

  sql = uppercaseKeywords(sql);

  // Newline before major / join clauses
  for (const phrase of ALL_PHRASES) {
    const re = new RegExp(`\\s+(${phrase})\\b`, "g");
    sql = sql.replace(re, `\n$1`);
  }

  // Break AND/OR in WHERE-ish clauses onto new indented lines
  sql = sql.replace(/\s+(AND|OR)\b/g, "\n$1");

  const pad = " ".repeat(indentSize);
  const lines = sql.split("\n").map((l) => l.trim()).filter(Boolean);
  const out: string[] = [];

  for (const line of lines) {
    const isMajor = MAJOR_KEYWORDS.some((k) => line.startsWith(k));
    const isJoin = JOIN_KEYWORDS.some((k) => line.startsWith(k));
    const isBool = /^(AND|OR)\b/.test(line);

    if (isMajor) {
      out.push(line);
    } else if (isJoin || isBool) {
      out.push(pad + line);
    } else if (out.length === 0) {
      out.push(line);
    } else {
      out.push(pad + line);
    }
  }

  // Indent comma-separated select lists lightly: split long SELECT bodies
  const formatted = out
    .map((line) => {
      if (!line.startsWith("SELECT ") && line !== "SELECT") return line;
      const rest = line.slice("SELECT".length).trim();
      if (!rest || !rest.includes(",")) return line;
      const parts = rest.split(",").map((p) => p.trim());
      return [`SELECT`, ...parts.map((p, i) => `${pad}${p}${i < parts.length - 1 ? "," : ""}`)].join(
        "\n",
      );
    })
    .join("\n");

  return restoreStrings(formatted, strings) + "\n";
}

export function minifySql(input: string): string {
  const { text, strings } = protectStrings(input);
  const min = text.replace(/\s+/g, " ").trim();
  return restoreStrings(min, strings);
}
