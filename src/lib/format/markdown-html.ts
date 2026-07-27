export type MarkdownToHtmlOptions = {
  /** Wrap output in <article> (default false). */
  wrapArticle?: boolean;
};

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function inlineMarkdown(text: string): string {
  let s = escapeHtml(text);

  // code first (protect)
  const codes: string[] = [];
  s = s.replace(/`([^`]+)`/g, (_, code: string) => {
    codes.push(`<code>${code}</code>`);
    return `__MD_CODE_${codes.length - 1}__`;
  });

  // images then links
  s = s.replace(
    /!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)/g,
    (_m, alt: string, src: string, title?: string) =>
      title
        ? `<img src="${src}" alt="${alt}" title="${title}" />`
        : `<img src="${src}" alt="${alt}" />`,
  );
  s = s.replace(
    /\[([^\]]+)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)/g,
    (_m, label: string, href: string, title?: string) =>
      title
        ? `<a href="${href}" title="${title}">${label}</a>`
        : `<a href="${href}">${label}</a>`,
  );

  // bold / italic (order matters)
  s = s.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  s = s.replace(/__(.+?)__/g, "<strong>$1</strong>");
  s = s.replace(/\*(.+?)\*/g, "<em>$1</em>");
  s = s.replace(/_(.+?)_/g, "<em>$1</em>");
  s = s.replace(/~~(.+?)~~/g, "<del>$1</del>");

  return s.replace(/__MD_CODE_(\d+)__/g, (_, i) => codes[Number(i)]);
}

function isTableSeparator(line: string): boolean {
  return /^\s*\|?[\s:|-]+\|[\s:|-]*\|?\s*$/.test(line) && line.includes("-");
}

function parseTable(lines: string[], start: number): {
  html: string;
  next: number;
} | null {
  if (start + 1 >= lines.length) return null;
  const header = lines[start];
  const sep = lines[start + 1];
  if (!header.includes("|") || !isTableSeparator(sep)) return null;

  const splitRow = (row: string) =>
    row
      .trim()
      .replace(/^\|/, "")
      .replace(/\|$/, "")
      .split("|")
      .map((c) => c.trim());

  const headers = splitRow(header);
  const rows: string[][] = [];
  let i = start + 2;
  while (i < lines.length && lines[i].includes("|") && lines[i].trim()) {
    rows.push(splitRow(lines[i]));
    i += 1;
  }

  const thead = `<thead><tr>${headers
    .map((h) => `<th>${inlineMarkdown(h)}</th>`)
    .join("")}</tr></thead>`;
  const tbody = `<tbody>${rows
    .map(
      (r) =>
        `<tr>${headers
          .map((_, idx) => `<td>${inlineMarkdown(r[idx] ?? "")}</td>`)
          .join("")}</tr>`,
    )
    .join("")}</tbody>`;

  return { html: `<table>${thead}${tbody}</table>`, next: i };
}

/**
 * Lightweight Markdown → HTML converter (CommonMark-ish + GFM tables / strikethrough / tasks).
 * Not a full CommonMark implementation — good enough for paste-and-convert tools.
 */
export function markdownToHtml(
  source: string,
  options: MarkdownToHtmlOptions = {},
): string {
  const lines = source.replace(/\r\n?/g, "\n").split("\n");
  const out: string[] = [];
  let i = 0;
  let paragraph: string[] = [];

  const flushParagraph = () => {
    if (!paragraph.length) return;
    out.push(`<p>${inlineMarkdown(paragraph.join(" "))}</p>`);
    paragraph = [];
  };

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // fenced code
    if (trimmed.startsWith("```")) {
      flushParagraph();
      const lang = trimmed.slice(3).trim();
      i += 1;
      const code: string[] = [];
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        code.push(lines[i]);
        i += 1;
      }
      if (i < lines.length) i += 1;
      const attr = lang ? ` class="language-${escapeHtml(lang)}"` : "";
      out.push(
        `<pre><code${attr}>${escapeHtml(code.join("\n"))}</code></pre>`,
      );
      continue;
    }

    // blank
    if (!trimmed) {
      flushParagraph();
      i += 1;
      continue;
    }

    // hr
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
      flushParagraph();
      out.push("<hr />");
      i += 1;
      continue;
    }

    // heading
    const heading = trimmed.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      flushParagraph();
      const level = heading[1].length;
      out.push(`<h${level}>${inlineMarkdown(heading[2])}</h${level}>`);
      i += 1;
      continue;
    }

    // blockquote
    if (trimmed.startsWith(">")) {
      flushParagraph();
      const quote: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith(">")) {
        quote.push(lines[i].trim().replace(/^>\s?/, ""));
        i += 1;
      }
      out.push(`<blockquote>${markdownToHtml(quote.join("\n"))}</blockquote>`);
      continue;
    }

    // table
    if (trimmed.includes("|")) {
      const table = parseTable(lines, i);
      if (table) {
        flushParagraph();
        out.push(table.html);
        i = table.next;
        continue;
      }
    }

    // lists
    const ul = trimmed.match(/^[-*+]\s+(.+)$/);
    const ol = trimmed.match(/^\d+\.\s+(.+)$/);
    if (ul || ol) {
      flushParagraph();
      const ordered = Boolean(ol);
      const items: string[] = [];
      const re = ordered ? /^\d+\.\s+(.+)$/ : /^[-*+]\s+(.+)$/;
      while (i < lines.length) {
        const m = lines[i].trim().match(re);
        if (!m) break;
        let item = m[1];
        // task list
        const task = item.match(/^\[([ xX])\]\s+(.+)$/);
        if (task) {
          const checked = task[1].toLowerCase() === "x";
          item = `<input type="checkbox" disabled${checked ? " checked" : ""} /> ${inlineMarkdown(task[2])}`;
        } else {
          item = inlineMarkdown(item);
        }
        items.push(`<li>${item}</li>`);
        i += 1;
      }
      out.push(
        ordered
          ? `<ol>${items.join("")}</ol>`
          : `<ul>${items.join("")}</ul>`,
      );
      continue;
    }

    paragraph.push(trimmed);
    i += 1;
  }

  flushParagraph();

  const html = out.join("\n");
  if (options.wrapArticle) {
    return `<article>\n${html}\n</article>\n`;
  }
  return html ? `${html}\n` : "";
}
