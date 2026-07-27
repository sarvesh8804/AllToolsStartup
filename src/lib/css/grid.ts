export type JustifyItems =
  | "start"
  | "end"
  | "center"
  | "stretch";

export type AlignItems = JustifyItems;

export type JustifyContent =
  | "start"
  | "end"
  | "center"
  | "stretch"
  | "space-between"
  | "space-around"
  | "space-evenly";

export type AlignContent = JustifyContent;

export type GridTrackMode = "fr" | "px" | "auto";

export type GridOptions = {
  columns: number;
  rows: number;
  columnTrack: GridTrackMode;
  rowTrack: GridTrackMode;
  /** Used when columnTrack/rowTrack is "px". */
  columnSize: number;
  rowSize: number;
  columnGap: number;
  rowGap: number;
  justifyItems: JustifyItems;
  alignItems: AlignItems;
  justifyContent: JustifyContent;
  alignContent: AlignContent;
};

export const DEFAULT_GRID_OPTIONS: GridOptions = {
  columns: 3,
  rows: 3,
  columnTrack: "fr",
  rowTrack: "fr",
  columnSize: 100,
  rowSize: 80,
  columnGap: 12,
  rowGap: 12,
  justifyItems: "stretch",
  alignItems: "stretch",
  justifyContent: "start",
  alignContent: "start",
};

function clamp(n: number, min: number, max: number): number {
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, n));
}

function trackValue(mode: GridTrackMode, size: number): string {
  if (mode === "auto") return "auto";
  if (mode === "px") return `${clamp(size, 20, 400)}px`;
  return "1fr";
}

export function buildGridTemplate(
  count: number,
  mode: GridTrackMode,
  size: number,
): string {
  const n = clamp(Math.round(count), 1, 12);
  const track = trackValue(mode, size);
  return `repeat(${n}, ${track})`;
}

export function buildGridCss(options: GridOptions): {
  style: Record<string, string>;
  declaration: string;
  rule: string;
  cellCount: number;
} {
  const columns = clamp(Math.round(options.columns), 1, 12);
  const rows = clamp(Math.round(options.rows), 1, 12);
  const columnGap = clamp(options.columnGap, 0, 120);
  const rowGap = clamp(options.rowGap, 0, 120);

  const gridTemplateColumns = buildGridTemplate(
    columns,
    options.columnTrack,
    options.columnSize,
  );
  const gridTemplateRows = buildGridTemplate(
    rows,
    options.rowTrack,
    options.rowSize,
  );

  const style: Record<string, string> = {
    display: "grid",
    gridTemplateColumns,
    gridTemplateRows,
    columnGap: `${columnGap}px`,
    rowGap: `${rowGap}px`,
    justifyItems: options.justifyItems,
    alignItems: options.alignItems,
    justifyContent: options.justifyContent,
    alignContent: options.alignContent,
  };

  const lines = [
    "display: grid;",
    `grid-template-columns: ${gridTemplateColumns};`,
    `grid-template-rows: ${gridTemplateRows};`,
    `column-gap: ${columnGap}px;`,
    `row-gap: ${rowGap}px;`,
    `justify-items: ${options.justifyItems};`,
    `align-items: ${options.alignItems};`,
    `justify-content: ${options.justifyContent};`,
    `align-content: ${options.alignContent};`,
  ];

  const declaration = lines.join("\n");
  const rule = `.grid-container {\n  ${lines.join("\n  ")}\n}`;
  return { style, declaration, rule, cellCount: columns * rows };
}

export const JUSTIFY_ITEMS: JustifyItems[] = [
  "start",
  "end",
  "center",
  "stretch",
];

export const ALIGN_ITEMS: AlignItems[] = [...JUSTIFY_ITEMS];

export const JUSTIFY_CONTENTS: JustifyContent[] = [
  "start",
  "end",
  "center",
  "stretch",
  "space-between",
  "space-around",
  "space-evenly",
];

export const ALIGN_CONTENTS: AlignContent[] = [...JUSTIFY_CONTENTS];

export const GRID_TRACK_MODES: GridTrackMode[] = ["fr", "px", "auto"];
