export type BoxShadowLayer = {
  id: string;
  offsetX: number;
  offsetY: number;
  blur: number;
  spread: number;
  color: string;
  inset: boolean;
  enabled: boolean;
};

export type BoxShadowOptions = {
  layers: BoxShadowLayer[];
};

function clamp(n: number, min: number, max: number): number {
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, n));
}

export function createBoxShadowLayer(
  partial: Partial<Omit<BoxShadowLayer, "id">> & { id?: string } = {},
): BoxShadowLayer {
  return {
    id: partial.id ?? `layer-${Math.random().toString(36).slice(2, 9)}`,
    offsetX: partial.offsetX ?? 0,
    offsetY: partial.offsetY ?? 8,
    blur: partial.blur ?? 24,
    spread: partial.spread ?? -4,
    color: partial.color ?? "rgba(0, 0, 0, 0.25)",
    inset: partial.inset ?? false,
    enabled: partial.enabled ?? true,
  };
}

/** Serialize one layer to CSS box-shadow value fragment. */
export function formatBoxShadowLayer(layer: BoxShadowLayer): string {
  const x = clamp(layer.offsetX, -200, 200);
  const y = clamp(layer.offsetY, -200, 200);
  const blur = clamp(layer.blur, 0, 200);
  const spread = clamp(layer.spread, -100, 100);
  const color = layer.color.trim() || "rgba(0,0,0,0.25)";
  const inset = layer.inset ? "inset " : "";
  return `${inset}${x}px ${y}px ${blur}px ${spread}px ${color}`;
}

export function buildBoxShadowCss(options: BoxShadowOptions): {
  value: string;
  declaration: string;
  rule: string;
} {
  const parts = options.layers
    .filter((l) => l.enabled)
    .map(formatBoxShadowLayer);

  const value = parts.length ? parts.join(", ") : "none";
  const declaration = `box-shadow: ${value};`;
  const rule = `.shadow {\n  ${declaration}\n}`;
  return { value, declaration, rule };
}
