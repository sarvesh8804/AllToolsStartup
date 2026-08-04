export type JsonPathResult =
  | { ok: true; matches: unknown[]; count: number }
  | { ok: false; error: string };

export const SAMPLE_JSON_PATH = `{
  "store": {
    "book": [
      { "title": "Forge", "price": 12.5 },
      { "title": "JSON", "price": 8 }
    ]
  }
}`;

export const SAMPLE_JSON_PATH_EXPR = "$.store.book[0].title";

function tokenizePath(path: string): string[] {
  const trimmed = path.trim();
  if (!trimmed.startsWith("$")) {
    throw new Error("JSON Path must start with $.");
  }
  const rest = trimmed.slice(1);
  const tokens: string[] = [];
  const re = /(?:\.([A-Za-z_][\w$]*)|\['([^']+)'\]|\["([^"]+)"\]|\[(\d+)\]|\[\*\])/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(rest)) !== null) {
    tokens.push(match[1] ?? match[2] ?? match[3] ?? match[4] ?? "*");
  }
  if (rest && tokens.length === 0 && rest !== "") {
    throw new Error("Invalid JSON Path syntax.");
  }
  return tokens;
}

function walk(value: unknown, tokens: string[]): unknown[] {
  if (tokens.length === 0) return [value];
  const [head, ...tail] = tokens;
  if (head === "*") {
    if (!Array.isArray(value)) {
      throw new Error("Wildcard [*] requires an array.");
    }
    return value.flatMap((item) => walk(item, tail));
  }
  if (Array.isArray(value)) {
    const index = Number(head);
    if (!Number.isInteger(index) || index < 0 || index >= value.length) {
      throw new Error(`Array index out of range: ${head}`);
    }
    return walk(value[index], tail);
  }
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    if (!(head in record)) {
      throw new Error(`Key not found: ${head}`);
    }
    return walk(record[head], tail);
  }
  throw new Error(`Cannot access "${head}" on ${typeof value}.`);
}

/** Evaluate a simple JSON Path against parsed JSON. */
export function evaluateJsonPath(
  data: unknown,
  path: string,
): JsonPathResult {
  const trimmed = path.trim();
  if (!trimmed) {
    return { ok: false, error: "Enter a JSON Path expression." };
  }
  try {
    const tokens = tokenizePath(trimmed);
    const matches = walk(data, tokens);
    return { ok: true, matches, count: matches.length };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "JSON Path evaluation failed.",
    };
  }
}

/** Parse JSON text and evaluate a path. */
export function testJsonPath(
  jsonText: string,
  path: string,
): JsonPathResult {
  const trimmed = jsonText.trim();
  if (!trimmed) {
    return { ok: false, error: "Paste JSON to query." };
  }
  try {
    const data = JSON.parse(trimmed) as unknown;
    return evaluateJsonPath(data, path);
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Invalid JSON",
    };
  }
}
