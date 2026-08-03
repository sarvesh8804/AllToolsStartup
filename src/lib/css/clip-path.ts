export type ClipPathShape =
  | "polygon"
  | "circle"
  | "ellipse"
  | "inset"
  | "triangle"
  | "hexagon"
  | "star";

export type ClipPathOptions = {
  shape: ClipPathShape;
  /** Polygon points as x y pairs in percent (0-100). */
  points?: Array<{ x: number; y: number }>;
  radius?: number;
  insetTop?: number;
  insetRight?: number;
  insetBottom?: number;
  insetLeft?: number;
  round?: number;
};

export type ClipPathResult = {
  value: string;
  declaration: string;
  rule: string;
};

const PRESETS: Record<Exclude<ClipPathShape, "polygon">, string> = {
  triangle: "polygon(50% 0%, 0% 100%, 100% 100%)",
  hexagon:
    "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)",
  star:
    "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)",
  circle: "circle(50% at 50% 50%)",
  ellipse: "ellipse(45% 35% at 50% 50%)",
  inset: "inset(10% 10% 10% 10%)",
};

function clampPct(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

/** Build clip-path CSS value and sample rule. */
export function buildClipPathCss(options: ClipPathOptions): ClipPathResult {
  let value: string;

  if (options.shape === "polygon" && options.points && options.points.length >= 3) {
    const pairs = options.points
      .map((p) => `${clampPct(p.x)}% ${clampPct(p.y)}%`)
      .join(", ");
    value = `polygon(${pairs})`;
  } else if (options.shape === "circle") {
    const r = Math.max(1, Math.min(50, options.radius ?? 50));
    value = `circle(${r}% at 50% 50%)`;
  } else if (options.shape === "ellipse") {
    value = `ellipse(${options.radius ?? 45}% 35% at 50% 50%)`;
  } else if (options.shape === "inset") {
    const t = options.insetTop ?? 10;
    const r = options.insetRight ?? 10;
    const b = options.insetBottom ?? 10;
    const l = options.insetLeft ?? 10;
    const round = options.round ?? 0;
    value =
      round > 0
        ? `inset(${t}% ${r}% ${b}% ${l}% round ${round}px)`
        : `inset(${t}% ${r}% ${b}% ${l}%)`;
  } else {
    value = PRESETS[options.shape as Exclude<ClipPathShape, "polygon">];
  }

  const declaration = `clip-path: ${value};`;
  const rule = `.clipped {\n  ${declaration}\n}`;
  return { value, declaration, rule };
}

export const DEFAULT_CLIP_PATH: ClipPathOptions = {
  shape: "hexagon",
};
