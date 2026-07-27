export type GradientType = "linear" | "radial" | "conic";

export type GradientStop = {
  id: string;
  color: string;
  /** Position 0–100 (%). */
  position: number;
};

export type GradientOptions = {
  type: GradientType;
  /** Linear / conic angle in degrees. */
  angle: number;
  /** Radial / conic shape keyword. */
  shape: "circle" | "ellipse";
  stops: GradientStop[];
};

function clamp(n: number, min: number, max: number): number {
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, n));
}

export function createGradientStop(
  partial: Partial<Omit<GradientStop, "id">> & { id?: string } = {},
): GradientStop {
  return {
    id: partial.id ?? `stop-${Math.random().toString(36).slice(2, 9)}`,
    color: partial.color ?? "#c4a70a",
    position: clamp(partial.position ?? 0, 0, 100),
  };
}

export function formatGradientStops(stops: GradientStop[]): string {
  return [...stops]
    .sort((a, b) => a.position - b.position)
    .map((s) => `${s.color.trim() || "#000"} ${clamp(s.position, 0, 100)}%`)
    .join(", ");
}

export function buildGradientCss(options: GradientOptions): {
  value: string;
  declaration: string;
  rule: string;
} {
  const stops = formatGradientStops(options.stops);
  const angle = clamp(options.angle, 0, 360);
  let value: string;

  if (options.type === "linear") {
    value = `linear-gradient(${angle}deg, ${stops})`;
  } else if (options.type === "radial") {
    value = `radial-gradient(${options.shape}, ${stops})`;
  } else {
    value = `conic-gradient(from ${angle}deg, ${stops})`;
  }

  const declaration = `background: ${value};`;
  const rule = `.gradient {\n  ${declaration}\n}`;
  return { value, declaration, rule };
}
