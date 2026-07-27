type Token =
  | { type: "tag"; raw: string; closing: boolean; selfClosing: boolean }
  | { type: "text"; raw: string }
  | { type: "comment"; raw: string }
  | { type: "cdata"; raw: string }
  | { type: "pi"; raw: string }
  | { type: "declaration"; raw: string };

function tokenize(xml: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  while (i < xml.length) {
    if (xml.startsWith("<!--", i)) {
      const end = xml.indexOf("-->", i + 4);
      const close = end === -1 ? xml.length : end + 3;
      tokens.push({ type: "comment", raw: xml.slice(i, close) });
      i = close;
      continue;
    }
    if (xml.startsWith("<![CDATA[", i)) {
      const end = xml.indexOf("]]>", i + 9);
      const close = end === -1 ? xml.length : end + 3;
      tokens.push({ type: "cdata", raw: xml.slice(i, close) });
      i = close;
      continue;
    }
    if (xml.startsWith("<?", i)) {
      const end = xml.indexOf("?>", i + 2);
      const close = end === -1 ? xml.length : end + 2;
      const raw = xml.slice(i, close);
      tokens.push({
        type: /^<\?xml\b/i.test(raw) ? "declaration" : "pi",
        raw,
      });
      i = close;
      continue;
    }
    if (xml.startsWith("<!", i)) {
      const end = xml.indexOf(">", i);
      const close = end === -1 ? xml.length : end + 1;
      tokens.push({ type: "declaration", raw: xml.slice(i, close) });
      i = close;
      continue;
    }
    if (xml[i] === "<") {
      const end = xml.indexOf(">", i);
      const close = end === -1 ? xml.length : end + 1;
      const raw = xml.slice(i, close);
      const closing = /^<\s*\//.test(raw);
      const selfClosing = /\/>\s*$/.test(raw);
      tokens.push({ type: "tag", raw, closing, selfClosing });
      i = close;
      continue;
    }
    const next = xml.indexOf("<", i);
    const close = next === -1 ? xml.length : next;
    tokens.push({ type: "text", raw: xml.slice(i, close) });
    i = close;
  }
  return tokens;
}

/**
 * Pretty-print XML with consistent indentation. Best-effort for well-formed markup.
 */
export function formatXml(input: string, indentSize = 2): string {
  const pad = (n: number) => " ".repeat(Math.max(0, n) * indentSize);
  const tokens = tokenize(input);
  const lines: string[] = [];
  let depth = 0;

  for (const token of tokens) {
    if (token.type === "text") {
      const text = token.raw.replace(/\s+/g, " ").trim();
      if (!text) continue;
      lines.push(pad(depth) + text);
      continue;
    }

    if (
      token.type === "comment" ||
      token.type === "cdata" ||
      token.type === "pi" ||
      token.type === "declaration"
    ) {
      lines.push(pad(depth) + token.raw.trim());
      continue;
    }

    if (token.closing) {
      depth = Math.max(0, depth - 1);
      lines.push(pad(depth) + token.raw.trim());
      continue;
    }

    lines.push(pad(depth) + token.raw.trim());
    if (!token.selfClosing) {
      depth += 1;
    }
  }

  return (
    lines
      .join("\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim() + (input.trim() ? "\n" : "")
  );
}

export type XmlMinifyOptions = {
  /** Strip XML comments (default true). */
  removeComments?: boolean;
  /** Collapse whitespace between tags (default true). */
  collapseWhitespace?: boolean;
  /** Trim text node edges between tags (default true). */
  trimTextNodes?: boolean;
};

export const DEFAULT_XML_MINIFY_OPTIONS: Required<XmlMinifyOptions> = {
  removeComments: true,
  collapseWhitespace: true,
  trimTextNodes: true,
};

/**
 * Minify XML by collapsing whitespace. CDATA and processing instructions are preserved.
 */
export function minifyXml(
  input: string,
  options: XmlMinifyOptions = {},
): string {
  const opts = { ...DEFAULT_XML_MINIFY_OPTIONS, ...options };
  const tokens = tokenize(input);
  const parts: string[] = [];

  for (const token of tokens) {
    if (token.type === "comment") {
      if (!opts.removeComments) parts.push(token.raw);
      continue;
    }
    if (
      token.type === "cdata" ||
      token.type === "pi" ||
      token.type === "declaration" ||
      token.type === "tag"
    ) {
      parts.push(token.raw.trim());
      continue;
    }
    let text = token.raw;
    if (opts.trimTextNodes) {
      text = text.trim();
    } else if (opts.collapseWhitespace) {
      text = text.replace(/\s{2,}/g, " ");
    }
    if (opts.collapseWhitespace && opts.trimTextNodes) {
      text = text.replace(/\s{2,}/g, " ");
    }
    if (text) parts.push(text);
  }

  let out = parts.join("");
  if (opts.collapseWhitespace) {
    out = out.replace(/>\s+</g, "><");
  }
  return out.trim();
}
