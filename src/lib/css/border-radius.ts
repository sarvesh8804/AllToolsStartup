export type BorderRadiusCorners = {
  topLeft: number;
  topRight: number;
  bottomRight: number;
  bottomLeft: number;
};

export type BorderRadiusOptions = {
  /** When true, all corners share `all`. */
  linked: boolean;
  all: number;
  corners: BorderRadiusCorners;
  unit: "px" | "%" | "rem";
  /** Elliptical radii (optional second value per corner). */
  elliptical: boolean;
  ellipse: BorderRadiusCorners;
};

export const DEFAULT_BORDER_RADIUS_OPTIONS: BorderRadiusOptions = {
  linked: true,
  all: 16,
  corners: {
    topLeft: 16,
    topRight: 16,
    bottomRight: 16,
    bottomLeft: 16,
  },
  unit: "px",
  elliptical: false,
  ellipse: {
    topLeft: 16,
    topRight: 16,
    bottomRight: 16,
    bottomLeft: 16,
  },
};

function clamp(n: number, min: number, max: number): number {
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, Math.round(n * 100) / 100));
}

function unitValue(n: number, unit: BorderRadiusOptions["unit"]): string {
  const v = clamp(n, 0, unit === "%" ? 100 : 500);
  if (unit === "px") return `${Math.round(v)}px`;
  if (unit === "%") return `${v}%`;
  return `${v}rem`;
}

function resolvedCorners(options: BorderRadiusOptions): BorderRadiusCorners {
  if (options.linked) {
    const v = options.all;
    return {
      topLeft: v,
      topRight: v,
      bottomRight: v,
      bottomLeft: v,
    };
  }
  return options.corners;
}

/** Build border-radius CSS value + declaration + preview style. */
export function buildBorderRadiusCss(options: BorderRadiusOptions): {
  value: string;
  declaration: string;
  rule: string;
  /** Ready for React style.borderRadius */
  styleValue: string;
} {
  const c = resolvedCorners(options);
  const u = options.unit;

  let value: string;
  if (options.elliptical) {
    const e = options.linked
      ? {
          topLeft: options.all,
          topRight: options.all,
          bottomRight: options.all,
          bottomLeft: options.all,
        }
      : options.ellipse;
    const horiz = [
      unitValue(c.topLeft, u),
      unitValue(c.topRight, u),
      unitValue(c.bottomRight, u),
      unitValue(c.bottomLeft, u),
    ].join(" ");
    const vert = [
      unitValue(e.topLeft, u),
      unitValue(e.topRight, u),
      unitValue(e.bottomRight, u),
      unitValue(e.bottomLeft, u),
    ].join(" ");
    value = `${horiz} / ${vert}`;
  } else if (
    options.linked ||
    (c.topLeft === c.topRight &&
      c.topRight === c.bottomRight &&
      c.bottomRight === c.bottomLeft)
  ) {
    value = unitValue(c.topLeft, u);
  } else if (c.topLeft === c.bottomRight && c.topRight === c.bottomLeft) {
    value = `${unitValue(c.topLeft, u)} ${unitValue(c.topRight, u)}`;
  } else {
    value = [
      unitValue(c.topLeft, u),
      unitValue(c.topRight, u),
      unitValue(c.bottomRight, u),
      unitValue(c.bottomLeft, u),
    ].join(" ");
  }

  const declaration = `border-radius: ${value};`;
  const rule = `.rounded {\n  ${declaration}\n}`;
  return { value, declaration, rule, styleValue: value };
}
