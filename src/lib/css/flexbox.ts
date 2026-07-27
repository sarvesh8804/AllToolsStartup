export type FlexDirection =
  | "row"
  | "row-reverse"
  | "column"
  | "column-reverse";

export type FlexWrap = "nowrap" | "wrap" | "wrap-reverse";

export type JustifyContent =
  | "flex-start"
  | "flex-end"
  | "center"
  | "space-between"
  | "space-around"
  | "space-evenly";

export type AlignItems =
  | "stretch"
  | "flex-start"
  | "flex-end"
  | "center"
  | "baseline";

export type AlignContent =
  | "stretch"
  | "flex-start"
  | "flex-end"
  | "center"
  | "space-between"
  | "space-around"
  | "space-evenly";

export type FlexboxOptions = {
  direction: FlexDirection;
  wrap: FlexWrap;
  justifyContent: JustifyContent;
  alignItems: AlignItems;
  alignContent: AlignContent;
  /** Gap between items in px. */
  gap: number;
};

export const DEFAULT_FLEXBOX_OPTIONS: FlexboxOptions = {
  direction: "row",
  wrap: "wrap",
  justifyContent: "flex-start",
  alignItems: "stretch",
  alignContent: "stretch",
  gap: 12,
};

function clamp(n: number, min: number, max: number): number {
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, n));
}

export function buildFlexboxCss(options: FlexboxOptions): {
  style: Record<string, string>;
  declaration: string;
  rule: string;
} {
  const gap = clamp(options.gap, 0, 120);
  const style: Record<string, string> = {
    display: "flex",
    flexDirection: options.direction,
    flexWrap: options.wrap,
    justifyContent: options.justifyContent,
    alignItems: options.alignItems,
    alignContent: options.alignContent,
    gap: `${gap}px`,
  };

  const lines = [
    "display: flex;",
    `flex-direction: ${options.direction};`,
    `flex-wrap: ${options.wrap};`,
    `justify-content: ${options.justifyContent};`,
    `align-items: ${options.alignItems};`,
    `align-content: ${options.alignContent};`,
    `gap: ${gap}px;`,
  ];

  const declaration = lines.join("\n");
  const rule = `.flex-container {\n  ${lines.join("\n  ")}\n}`;
  return { style, declaration, rule };
}

export const FLEX_DIRECTIONS: FlexDirection[] = [
  "row",
  "row-reverse",
  "column",
  "column-reverse",
];

export const FLEX_WRAPS: FlexWrap[] = ["nowrap", "wrap", "wrap-reverse"];

export const JUSTIFY_CONTENTS: JustifyContent[] = [
  "flex-start",
  "flex-end",
  "center",
  "space-between",
  "space-around",
  "space-evenly",
];

export const ALIGN_ITEMS: AlignItems[] = [
  "stretch",
  "flex-start",
  "flex-end",
  "center",
  "baseline",
];

export const ALIGN_CONTENTS: AlignContent[] = [
  "stretch",
  "flex-start",
  "flex-end",
  "center",
  "space-between",
  "space-around",
  "space-evenly",
];
