export type CurlToFetchResult =
  | { ok: true; code: string }
  | { ok: false; error: string };

export const SAMPLE_CURL =
  "curl -X POST https://api.example.com/users -H 'Content-Type: application/json' -d '{\"name\":\"Ada\"}'";

function tokenizeCurl(input: string): string[] {
  const tokens: string[] = [];
  let cur = "";
  let quote: "'" | '"' | null = null;

  for (let i = 0; i < input.length; i += 1) {
    const ch = input[i]!;
    if (quote) {
      if (ch === quote) quote = null;
      else cur += ch;
      continue;
    }
    if (ch === "'" || ch === '"') {
      quote = ch;
      continue;
    }
    if (/\s/.test(ch)) {
      if (cur) {
        tokens.push(cur);
        cur = "";
      }
      continue;
    }
    cur += ch;
  }
  if (cur) tokens.push(cur);
  return tokens;
}

/** Convert a curl command into a fetch() snippet. */
export function curlToFetch(input: string): CurlToFetchResult {
  const trimmed = input.trim();
  const tokens = tokenizeCurl(trimmed);
  if (tokens[0] !== "curl") {
    return { ok: false, error: "Command must start with curl." };
  }

  let url = "";
  let method = "GET";
  const headers: Record<string, string> = {};
  let body: string | undefined;

  let i = 1;
  while (i < tokens.length) {
    const token = tokens[i]!;
    if (token === "-X" || token === "--request") {
      method = tokens[i + 1]?.toUpperCase() ?? "GET";
      i += 2;
      continue;
    }
    if (token === "-H" || token === "--header") {
      const header = tokens[i + 1] ?? "";
      const colon = header.indexOf(":");
      if (colon > 0) {
        headers[header.slice(0, colon).trim()] = header.slice(colon + 1).trim();
      }
      i += 2;
      continue;
    }
    if (token === "-d" || token === "--data" || token === "--data-raw") {
      body = tokens[i + 1] ?? "";
      i += 2;
      continue;
    }
    if (token.startsWith("-")) {
      return { ok: false, error: `Unsupported curl flag: ${token}` };
    }
    url = token;
    i += 1;
  }

  if (!url) {
    return { ok: false, error: "Missing URL in curl command." };
  }

  const options: string[] = [];
  if (method !== "GET") options.push(`method: '${method}'`);
  if (Object.keys(headers).length > 0) {
    const headerLines = Object.entries(headers)
      .map(([key, value]) => `    '${key}': '${value.replace(/'/g, "\\'")}',`)
      .join("\n");
    options.push(`headers: {\n${headerLines}\n  }`);
  }
  if (body !== undefined) {
    const escaped = body.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
    options.push(`body: '${escaped}'`);
  }

  const code =
    options.length === 0
      ? `fetch('${url}')`
      : `fetch('${url}', {\n  ${options.join(",\n  ")}\n})`;

  return { ok: true, code: `${code};\n` };
}
