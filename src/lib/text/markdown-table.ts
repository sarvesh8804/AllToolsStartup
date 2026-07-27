export type CellAlign = "left" | "center" | "right";

export type MarkdownTableOptions = {
  headers: string[];
  rows: string[][];
  alignments?: CellAlign[];
  /** Pad cells so columns line up (default true). */
  pretty?: boolean;
};

export const DEFAULT_MARKDOWN_TABLE: MarkdownTableOptions = {
  headers: ["Name", "Role", "Active"],
  rows: [
    ["Ada", "Engineer", "Yes"],
    ["Grace", "Lead", "Yes"],
    ["Alan", "Research", "No"],
  ],
  alignments: ["left", "left", "center"],
  pretty: true,
};

function escapeCell(value: string): string {
  return value.replace(/\|/g, "\\|").replace(/\r?\n/g, "<br>");
}

function alignmentMarker(align: CellAlign): string {
  switch (align) {
    case "center":
      return ":---:";
    case "right":
      return "---:";
    default:
      return ":---";
  }
}

function pad(value: string, width: number, align: CellAlign): string {
  const len = value.length;
  if (len >= width) return value;
  const space = width - len;
  if (align === "right") return " ".repeat(space) + value;
  if (align === "center") {
    const left = Math.floor(space / 2);
    const right = space - left;
    return " ".repeat(left) + value + " ".repeat(right);
  }
  return value + " ".repeat(space);
}

function normalizeGrid(
  headers: string[],
  rows: string[][],
): { headers: string[]; rows: string[][]; cols: number } {
  const cols = Math.max(
    headers.length,
    ...rows.map((r) => r.length),
    1,
  );
  const padRow = (row: string[]) =>
    Array.from({ length: cols }, (_, i) => row[i] ?? "");
  return {
    cols,
    headers: padRow(headers),
    rows: rows.map(padRow),
  };
}

export function buildMarkdownTable(
  options: MarkdownTableOptions,
): string {
  const pretty = options.pretty !== false;
  const { headers, rows, cols } = normalizeGrid(
    options.headers,
    options.rows,
  );
  const alignments: CellAlign[] = Array.from(
    { length: cols },
    (_, i) => options.alignments?.[i] ?? "left",
  );

  const escapedHeaders = headers.map(escapeCell);
  const escapedRows = rows.map((r) => r.map(escapeCell));

  const widths = Array.from({ length: cols }, (_, i) => {
    const markerLen = alignmentMarker(alignments[i]).length;
    const headerLen = escapedHeaders[i].length;
    const cellLen = Math.max(
      0,
      ...escapedRows.map((r) => r[i]?.length ?? 0),
    );
    return Math.max(markerLen, headerLen, cellLen, 3);
  });

  const formatRow = (cells: string[]) => {
    const body = cells
      .map((c, i) =>
        pretty ? pad(c, widths[i], alignments[i]) : c,
      )
      .join(" | ");
    return `| ${body} |`;
  };

  const sep = alignments
    .map((a, i) => {
      const marker = alignmentMarker(a);
      if (!pretty) return marker;
      if (a === "center") {
        return `:${"-".repeat(Math.max(1, widths[i] - 2))}:`;
      }
      if (a === "right") {
        return `${"-".repeat(Math.max(1, widths[i] - 1))}:`;
      }
      return `:${"-".repeat(Math.max(1, widths[i] - 1))}`;
    })
    .join(" | ");

  const lines = [
    formatRow(escapedHeaders),
    `| ${sep} |`,
    ...escapedRows.map(formatRow),
  ];

  return lines.join("\n") + "\n";
}

export function resizeTable(
  options: MarkdownTableOptions,
  cols: number,
  dataRows: number,
): MarkdownTableOptions {
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
