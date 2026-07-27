export type CellAlign = "left" | "center" | "right";

export type HtmlTableOptions = {
  headers: string[];
  rows: string[][];
  alignments?: CellAlign[];
  caption: string;
  /** Add border="1" for classic HTML preview. */
  border: boolean;
  /** Include <thead> / <tbody>. */
  useSections: boolean;
  /** Add scope="col" on header cells. */
  accessible: boolean;
  tableClass: string;
};

export const DEFAULT_HTML_TABLE: HtmlTableOptions = {
  headers: ["Name", "Role", "Active"],
  rows: [
    ["Ada", "Engineer", "Yes"],
    ["Grace", "Lead", "Yes"],
    ["Alan", "Research", "No"],
  ],
  alignments: ["left", "left", "center"],
  caption: "",
  border: true,
  useSections: true,
  accessible: true,
  tableClass: "",
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function normalizeGrid(
  headers: string[],
  rows: string[][],
): { headers: string[]; rows: string[][]; cols: number } {
  const cols = Math.max(headers.length, ...rows.map((r) => r.length), 1);
  const padRow = (row: string[]) =>
    Array.from({ length: cols }, (_, i) => row[i] ?? "");
  return {
    cols,
    headers: padRow(headers),
    rows: rows.map(padRow),
  };
}

function styleAttr(align: CellAlign | undefined): string {
  if (!align || align === "left") return "";
  return ` style="text-align: ${align}"`;
}

/**
 * Build an HTML table string from a grid of cells.
 */
export function buildHtmlTable(options: HtmlTableOptions): string {
  const { headers, rows, cols } = normalizeGrid(options.headers, options.rows);
  const alignments: CellAlign[] = Array.from(
    { length: cols },
    (_, i) => options.alignments?.[i] ?? "left",
  );

  const attrs: string[] = [];
  if (options.border) attrs.push('border="1"');
  if (options.tableClass.trim()) {
    attrs.push(`class="${escapeHtml(options.tableClass.trim())}"`);
  }
  attrs.push('cellpadding="6"');
  attrs.push('cellspacing="0"');

  const open = `<table${attrs.length ? " " + attrs.join(" ") : ""}>`;
  const lines: string[] = [open];

  if (options.caption.trim()) {
    lines.push(`  <caption>${escapeHtml(options.caption.trim())}</caption>`);
  }

  const headerCells = headers
    .map((h, i) => {
      const scope = options.accessible ? ' scope="col"' : "";
      return `<th${scope}${styleAttr(alignments[i])}>${escapeHtml(h)}</th>`;
    })
    .join("");

  if (options.useSections) {
    lines.push("  <thead>");
    lines.push(`    <tr>${headerCells}</tr>`);
    lines.push("  </thead>");
    lines.push("  <tbody>");
    for (const row of rows) {
      const cells = row
        .map(
          (c, i) =>
            `<td${styleAttr(alignments[i])}>${escapeHtml(c)}</td>`,
        )
        .join("");
      lines.push(`    <tr>${cells}</tr>`);
    }
    lines.push("  </tbody>");
  } else {
    lines.push(`  <tr>${headerCells}</tr>`);
    for (const row of rows) {
      const cells = row
        .map(
          (c, i) =>
            `<td${styleAttr(alignments[i])}>${escapeHtml(c)}</td>`,
        )
        .join("");
      lines.push(`  <tr>${cells}</tr>`);
    }
  }

  lines.push("</table>");
  return lines.join("\n") + "\n";
}

export function resizeHtmlTable(
  options: HtmlTableOptions,
  cols: number,
  dataRows: number,
): HtmlTableOptions {
  const c = Math.min(20, Math.max(1, Math.floor(cols)));
  const r = Math.min(50, Math.max(0, Math.floor(dataRows)));
  const headers = Array.from(
    { length: c },
    (_, i) => options.headers[i] ?? `Column ${i + 1}`,
  );
  const alignments = Array.from(
    { length: c },
    (_, i) => options.alignments?.[i] ?? "left",
  );
  const rows = Array.from({ length: r }, (_, ri) =>
    Array.from({ length: c }, (_, ci) => options.rows[ri]?.[ci] ?? ""),
  );
  return { ...options, headers, rows, alignments };
}

/** Parse TSV/CSV-ish paste: first row headers, rest body. */
export function parseDelimitedToHtmlTable(
  text: string,
  delimiter: "," | "\t" = "\t",
): Pick<HtmlTableOptions, "headers" | "rows"> {
  const lines = text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split("\n")
    .filter((l) => l.length > 0);
  if (lines.length === 0) {
    return { headers: ["Column 1"], rows: [] };
  }
  const split = (line: string) => line.split(delimiter).map((c) => c.trim());
  const headers = split(lines[0]!);
  const rows = lines.slice(1).map(split);
  return { headers, rows };
}
