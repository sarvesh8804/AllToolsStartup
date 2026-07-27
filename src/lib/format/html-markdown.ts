export type HtmlToMarkdownOptions = {
  /** Prefer ATX (#) headings (default true). */
  atxHeadings?: boolean;
  /** Fence style for code blocks. */
  fence?: "```" | "~~~";
};

export type HtmlToMarkdownResult =
  | { ok: true; markdown: string }
  | { ok: false; error: string };

const VOID = new Set([
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

type AttrMap = Record<string, string>;

type Node =
  | { type: "text"; text: string }
  | { type: "element"; tag: string; attrs: AttrMap; children: Node[] };

function decodeEntities(text: string): string {
  return text
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) =>
      String.fromCodePoint(parseInt(h, 16)),
    );
}

function parseAttrs(raw: string): AttrMap {
  const attrs: AttrMap = {};
  const re = /([^\s=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(raw))) {
    const key = m[1]!.toLowerCase();
    attrs[key] = decodeEntities(m[2] ?? m[3] ?? m[4] ?? "");
  }
  return attrs;
}

/** Minimal HTML parser sufficient for common content fragments. */
export function parseHtmlFragment(html: string): Node[] {
  const nodes: Node[] = [];
  const stack: { tag: string; attrs: AttrMap; children: Node[] }[] = [];
  let i = 0;
  const src = html.replace(/<!--[\s\S]*?-->/g, "");

  const push = (node: Node) => {
    if (stack.length === 0) nodes.push(node);
    else stack[stack.length - 1]!.children.push(node);
  };

  while (i < src.length) {
    if (src[i] === "<") {
      const close = src.indexOf(">", i + 1);
      if (close === -1) {
        push({ type: "text", text: src.slice(i) });
        break;
      }
      const raw = src.slice(i + 1, close).trim();
      i = close + 1;

      if (raw.startsWith("!") || raw.startsWith("?")) continue;

      if (raw.startsWith("/")) {
        const tag = raw.slice(1).trim().toLowerCase().split(/\s/)[0] ?? "";
        while (stack.length > 0) {
          const top = stack.pop()!;
          push({
            type: "element",
            tag: top.tag,
            attrs: top.attrs,
            children: top.children,
          });
          if (top.tag === tag) break;
        }
        continue;
      }

      const selfClosing = raw.endsWith("/");
      const body = selfClosing ? raw.slice(0, -1).trim() : raw;
      const space = body.search(/\s/);
      const tag = (space === -1 ? body : body.slice(0, space)).toLowerCase();
      const attrs = parseAttrs(space === -1 ? "" : body.slice(space));

      if (tag === "script" || tag === "style") {
        const end = src.toLowerCase().indexOf(`</${tag}>`, i);
        i = end === -1 ? src.length : end + tag.length + 3;
        continue;
      }

      if (VOID.has(tag) || selfClosing) {
        push({ type: "element", tag, attrs, children: [] });
      } else {
        stack.push({ tag, attrs, children: [] });
      }
      continue;
    }

    const next = src.indexOf("<", i);
    const text = next === -1 ? src.slice(i) : src.slice(i, next);
    i = next === -1 ? src.length : next;
    if (text) push({ type: "text", text: decodeEntities(text) });
  }

  while (stack.length > 0) {
    const top = stack.pop()!;
    push({
      type: "element",
      tag: top.tag,
      attrs: top.attrs,
      children: top.children,
    });
  }

  return nodes;
}

function escapeMd(text: string): string {
  return text.replace(/([\\`*_{}[\]()#+.!|-])/g, "\\$1");
}

function collapseWs(text: string): string {
  return text.replace(/\s+/g, " ");
}

function renderInline(nodes: Node[]): string {
  let out = "";
  for (const node of nodes) {
    if (node.type === "text") {
      out += collapseWs(node.text);
      continue;
    }
    const inner = renderInline(node.children);
    switch (node.tag) {
      case "strong":
      case "b":
        out += inner ? `**${inner.trim()}**` : "";
        break;
      case "em":
      case "i":
        out += inner ? `*${inner.trim()}*` : "";
        break;
      case "del":
      case "s":
      case "strike":
        out += inner ? `~~${inner.trim()}~~` : "";
        break;
      case "code":
        out += "`" + inner.replace(/`/g, "\\`") + "`";
        break;
      case "a": {
        const href = node.attrs.href ?? "";
        const title = node.attrs.title;
        const label = inner.trim() || href;
        out += title
          ? `[${label}](${href} "${title}")`
          : `[${label}](${href})`;
        break;
      }
      case "img": {
        const alt = node.attrs.alt ?? "";
        const src = node.attrs.src ?? "";
        const title = node.attrs.title;
        out += title
          ? `![${alt}](${src} "${title}")`
          : `![${alt}](${src})`;
        break;
      }
      case "br":
        out += "  \n";
        break;
      case "span":
      case "div":
        out += inner;
        break;
      default:
        out += inner;
    }
  }
  return out;
}

function isBlock(tag: string): boolean {
  return [
    "p",
    "div",
    "section",
    "article",
    "header",
    "footer",
    "main",
    "aside",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "ul",
    "ol",
    "li",
    "blockquote",
    "pre",
    "hr",
    "table",
    "thead",
    "tbody",
    "tr",
  ].includes(tag);
}

function listItems(nodes: Node[], ordered: boolean, depth: number): string {
  const indent = "  ".repeat(depth);
  const lines: string[] = [];
  let index = 1;
  for (const node of nodes) {
    if (node.type !== "element" || node.tag !== "li") continue;
    const marker = ordered ? `${index}.` : "-";
    index += 1;
    const parts: string[] = [];
    const nested: string[] = [];
    for (const child of node.children) {
      if (
        child.type === "element" &&
        (child.tag === "ul" || child.tag === "ol")
      ) {
        nested.push(
          listItems(child.children, child.tag === "ol", depth + 1),
        );
      } else if (child.type === "element" && isBlock(child.tag)) {
        parts.push(renderBlocks([child], { atxHeadings: true, fence: "```" }).trim());
      } else {
        parts.push(renderInline([child]));
      }
    }
    const text = collapseWs(parts.join(" ")).trim();
    lines.push(`${indent}${marker} ${text}`);
    if (nested.length) lines.push(nested.join("\n"));
  }
  return lines.join("\n");
}

function tableMarkdown(node: Node): string {
  const rows: string[][] = [];
  const walk = (n: Node) => {
    if (n.type !== "element") return;
    if (n.tag === "tr") {
      const cells: string[] = [];
      for (const c of n.children) {
        if (c.type === "element" && (c.tag === "th" || c.tag === "td")) {
          cells.push(collapseWs(renderInline(c.children)).trim());
        }
      }
      if (cells.length) rows.push(cells);
      return;
    }
    for (const c of n.children) walk(c);
  };
  walk(node);
  if (rows.length === 0) return "";
  const width = Math.max(...rows.map((r) => r.length));
  const pad = (r: string[]) =>
    Array.from({ length: width }, (_, i) => r[i] ?? "");
  const header = pad(rows[0]!);
  const body = rows.slice(1).map(pad);
  const sep = header.map(() => "---");
  const fmt = (r: string[]) => `| ${r.join(" | ")} |`;
  return [fmt(header), fmt(sep), ...body.map(fmt)].join("\n");
}

function renderBlocks(
  nodes: Node[],
  options: Required<HtmlToMarkdownOptions>,
): string {
  const chunks: string[] = [];

  for (const node of nodes) {
    if (node.type === "text") {
      const t = collapseWs(node.text).trim();
      if (t) chunks.push(escapeMd(t));
      continue;
    }

    switch (node.tag) {
      case "h1":
      case "h2":
      case "h3":
      case "h4":
      case "h5":
      case "h6": {
        const level = Number(node.tag[1]);
        const text = collapseWs(renderInline(node.children)).trim();
        chunks.push(`${"#".repeat(level)} ${text}`);
        break;
      }
      case "p":
      case "div":
      case "section":
      case "article":
      case "header":
      case "footer":
      case "main":
      case "aside": {
        const text = collapseWs(renderInline(node.children)).trim();
        if (text) chunks.push(text);
        else {
          const nested = renderBlocks(node.children, options).trim();
          if (nested) chunks.push(nested);
        }
        break;
      }
      case "br":
        chunks.push("");
        break;
      case "hr":
        chunks.push("---");
        break;
      case "blockquote": {
        const inner = renderBlocks(node.children, options)
          .trim()
          .split("\n")
          .map((l) => `> ${l}`)
          .join("\n");
        if (inner) chunks.push(inner);
        break;
      }
      case "ul":
        chunks.push(listItems(node.children, false, 0));
        break;
      case "ol":
        chunks.push(listItems(node.children, true, 0));
        break;
      case "pre": {
        let code = "";
        let lang = "";
        const codeEl = node.children.find(
          (c) => c.type === "element" && c.tag === "code",
        );
        if (codeEl && codeEl.type === "element") {
          const cls = codeEl.attrs.class ?? "";
          const m = cls.match(/language-([\w-]+)/);
          if (m) lang = m[1]!;
          code = codeEl.children
            .map((c) => (c.type === "text" ? c.text : ""))
            .join("");
        } else {
          code = node.children
            .map((c) => (c.type === "text" ? c.text : ""))
            .join("");
        }
        const fence = options.fence;
        chunks.push(`${fence}${lang}\n${code.replace(/\n$/, "")}\n${fence}`);
        break;
      }
      case "table":
        chunks.push(tableMarkdown(node));
        break;
      case "img":
      case "a":
      case "strong":
      case "em":
      case "code":
        chunks.push(collapseWs(renderInline([node])).trim());
        break;
      default: {
        const nested = renderBlocks(node.children, options).trim();
        if (nested) chunks.push(nested);
        else {
          const inline = collapseWs(renderInline(node.children)).trim();
          if (inline) chunks.push(inline);
        }
      }
    }
  }

  return chunks.filter((c) => c.length > 0).join("\n\n") + (chunks.length ? "\n" : "");
}

/** Convert an HTML fragment to Markdown (common tags; not a full HTML5 engine). */
export function htmlToMarkdown(
  html: string,
  options: HtmlToMarkdownOptions = {},
): HtmlToMarkdownResult {
  const trimmed = html.trim();
  if (!trimmed) {
    return { ok: false, error: "Paste HTML to convert." };
  }

  try {
    const opts: Required<HtmlToMarkdownOptions> = {
      atxHeadings: options.atxHeadings ?? true,
      fence: options.fence ?? "```",
    };
    const tree = parseHtmlFragment(trimmed);
    const markdown = renderBlocks(tree, opts).replace(/\n{3,}/g, "\n\n").trimEnd() + "\n";
    return { ok: true, markdown };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Failed to convert HTML",
    };
  }
}
