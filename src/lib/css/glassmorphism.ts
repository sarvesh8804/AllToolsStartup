export type GlassmorphismOptions = {
  /** Blur radius in px (backdrop-filter). */
  blur: number;
  /** Background fill opacity 0–100. */
  opacity: number;
  /** Base RGB for the frosted fill. */
  r: number;
  g: number;
  b: number;
  /** Border opacity 0–100. */
  borderOpacity: number;
  /** Border width in px. */
  borderWidth: number;
  /** Corner radius in px. */
  borderRadius: number;
  /** Soft outer shadow. */
  shadow: boolean;
};

export const DEFAULT_GLASS_OPTIONS: GlassmorphismOptions = {
  blur: 16,
  opacity: 25,
  r: 255,
  g: 255,
  b: 255,
  borderOpacity: 35,
  borderWidth: 1,
  borderRadius: 16,
  shadow: true,
};

function clamp(n: number, min: number, max: number): number {
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, n));
}

function channel(n: number): number {
  return Math.round(clamp(n, 0, 255));
}

function alpha(percent: number): string {
  const a = clamp(percent, 0, 100) / 100;
  // Trim trailing zeros for readable CSS
  return String(Math.round(a * 1000) / 1000);
}

export function buildGlassmorphismCss(options: GlassmorphismOptions): {
  style: Record<string, string>;
  declaration: string;
  rule: string;
} {
  const blur = clamp(options.blur, 0, 80);
  const opacity = clamp(options.opacity, 0, 100);
  const borderOpacity = clamp(options.borderOpacity, 0, 100);
  const borderWidth = clamp(options.borderWidth, 0, 12);
  const borderRadius = clamp(options.borderRadius, 0, 64);
  const r = channel(options.r);
  const g = channel(options.g);
  const b = channel(options.b);

  const bg = `rgba(${r}, ${g}, ${b}, ${alpha(opacity)})`;
  const borderColor = `rgba(${r}, ${g}, ${b}, ${alpha(borderOpacity)})`;
  const filter = `blur(${blur}px)`;

  const style: Record<string, string> = {
    background: bg,
    backdropFilter: filter,
    WebkitBackdropFilter: filter,
    border: `${borderWidth}px solid ${borderColor}`,
    borderRadius: `${borderRadius}px`,
  };

  const lines = [
    `background: ${bg};`,
    `backdrop-filter: ${filter};`,
    `-webkit-backdrop-filter: ${filter};`,
    `border: ${borderWidth}px solid ${borderColor};`,
    `border-radius: ${borderRadius}px;`,
  ];

  if (options.shadow) {
    const shadow = "0 8px 32px rgba(0, 0, 0, 0.18)";
    style.boxShadow = shadow;
    lines.push(`box-shadow: ${shadow};`);
  }

  const declaration = lines.join("\n");
  const rule = `.glass {\n  ${lines.join("\n  ")}\n}`;
  return { style, declaration, rule };
}
