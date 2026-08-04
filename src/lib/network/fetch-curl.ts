export type FetchToCurlResult =
  | { ok: true; curl: string }
  | { ok: false; error: string };

export const SAMPLE_FETCH =
  "fetch('https://api.example.com/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'Ada' }) })";

function shellQuote(value: string): string {
  if (/^[A-Za-z0-9_./:?&=-]+$/.test(value)) return value;
  return `'${value.replace(/'/g, "'\\''")}'`;
}

/** Convert a fetch(...) call string into a curl command. */
export function fetchToCurl(input: string): FetchToCurlResult {
  const trimmed = input.trim().replace(/;+\s*$/, "");
  const match = trimmed.match(/^fetch\s*\(\s*([^,]+)\s*(?:,\s*(\{[\s\S]*\}))?\s*\)\s*$/);
  if (!match) {
    return { ok: false, error: "Paste a fetch(url, options?) call." };
  }

  let url = match[1]!.trim();
  if ((url.startsWith("'") && url.endsWith("'")) || (url.startsWith('"') && url.endsWith('"'))) {
    url = url.slice(1, -1);
  }

  const parts = [`curl`, shellQuote(url)];
  const optionsText = match[2];

  if (optionsText) {
    try {
      const options = new Function(`return (${optionsText})`)() as Record<string, unknown>;
      const method = typeof options.method === "string" ? options.method.toUpperCase() : "GET";
      if (method !== "GET") parts.push("-X", method);
      const headers = options.headers as Record<string, string> | undefined;
      if (headers && typeof headers === "object") {
        for (const [key, value] of Object.entries(headers)) {
          parts.push("-H", shellQuote(`${key}: ${value}`));
        }
      }
      if (options.body !== undefined) {
        const body =
          typeof options.body === "string"
            ? options.body
            : JSON.stringify(options.body);
        parts.push("-d", shellQuote(body));
      }
    } catch {
      return { ok: false, error: "Could not parse fetch options object." };
    }
  }


  return { ok: true, curl: parts.join(" ") };
}
