const VOID_TAGS = new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr",
]);

const RAW_TAGS = new Set(["script", "style", "pre", "textarea", "code"]);

type Token =
  | { type: "tag"; raw: string; name: string; closing: boolean; selfClosing: boolean }
  | { type: "text"; raw: string }
  | { type: "comment"; raw: string }
  | { type: "doctype"; raw: string };

function tokenize(html: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  while (i < html.length) {
    if (html.startsWith("<!--", i)) {
      const end = html.indexOf("-->", i + 4);
      const close = end === -1 ? html.length : end + 3;
      tokens.push({ type: "comment", raw: html.slice(i, close) });
      i = close;
      continue;
    }
    if (/^<!doctype/i.test(html.slice(i, i + 9))) {
      const end = html.indexOf(">", i);
      const close = end === -1 ? html.length : end + 1;
      tokens.push({ type: "doctype", raw: html.slice(i, close) });
      i = close;
      continue;
    }
    if (html[i] === "<") {
      const end = html.indexOf(">", i);
      const close = end === -1 ? html.length : end + 1;
      const raw = html.slice(i, close);
      const closing = /^<\s*\//.test(raw);
      const selfClosing = /\/>$/.test(raw) || /^<!.*>$/.test(raw);
      const nameMatch = raw.match(/^<\/?\s*([a-zA-Z0-9:-]+)/);
      const name = (nameMatch?.[1] ?? "").toLowerCase();
      tokens.push({ type: "tag", raw, name, closing, selfClosing });
      i = close;
      continue;
    }
    const next = html.indexOf("<", i);
    const close = next === -1 ? html.length : next;
    tokens.push({ type: "text", raw: html.slice(i, close) });
    i = close;
  }
  return tokens;
}

export function formatHtml(input: string, indentSize = 2): string {
  const pad = (n: number) => " ".repeat(Math.max(0, n) * indentSize);
  const tokens = tokenize(input);
  const lines: string[] = [];
  let depth = 0;
  let rawDepth = 0;

  for (const token of tokens) {
    if (token.type === "text") {
      const text = rawDepth > 0 ? token.raw : token.raw.replace(/\s+/g, " ").trim();
      if (!text) continue;
      if (rawDepth > 0) {
        lines.push(token.raw.replace(/\r\n|\r/g, "\n"));
      } else {
        lines.push(pad(depth) + text);
      }
      continue;
    }

    if (token.type === "comment" || token.type === "doctype") {
      lines.push(pad(depth) + token.raw.trim());
      continue;
    }

    const isVoid = VOID_TAGS.has(token.name) || token.selfClosing;
    const isRaw = RAW_TAGS.has(token.name);

    if (token.closing) {
      depth = Math.max(0, depth - 1);
      if (isRaw) rawDepth = Math.max(0, rawDepth - 1);
      lines.push(pad(depth) + token.raw.trim());
      continue;
    }

    lines.push(pad(depth) + token.raw.trim());
    if (!isVoid) {
      depth += 1;
      if (isRaw) rawDepth += 1;
    }
  }

  return lines
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim() + (input.trim() ? "\n" : "");
}

export type HtmlMinifyOptions = {
  /** Strip HTML comments (default true). */
  removeComments?: boolean;
  /** Collapse whitespace between tags and runs of spaces (default true). */
  collapseWhitespace?: boolean;
  /** Also trim text node edges between tags more aggressively (default true). */
  trimTextNodes?: boolean;
};

export const DEFAULT_HTML_MINIFY_OPTIONS: Required<HtmlMinifyOptions> = {
  removeComments: true,
  collapseWhitespace: true,
  trimTextNodes: true,
};

export function minifyHtml(
  input: string,
  options: HtmlMinifyOptions = {},
): string {
  const opts = { ...DEFAULT_HTML_MINIFY_OPTIONS, ...options };
  let out = input;

  if (opts.removeComments) {
    out = out.replace(/<!--[\s\S]*?-->/g, "");
  }

  if (opts.collapseWhitespace) {
    out = out.replace(/>\s+</g, "><");
    out = out.replace(/\s{2,}/g, " ");
  }

  if (opts.trimTextNodes) {
    out = out.replace(/>\s+/g, ">").replace(/\s+</g, "<");
  }

  return out.trim();
}
