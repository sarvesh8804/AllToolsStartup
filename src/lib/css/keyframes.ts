export type KeyframeStop = {
  id: string;
  offset: number;
  opacity: number;
  translateX: number;
  translateY: number;
  scale: number;
  rotate: number;
};

export type KeyframesOptions = {
  name: string;
  duration: number;
  timingFunction: string;
  iterationCount: string;
  direction: "normal" | "reverse" | "alternate" | "alternate-reverse";
  fillMode: "none" | "forwards" | "backwards" | "both";
  stops: KeyframeStop[];
};

export type KeyframesCssResult = {
  keyframes: string;
  animation: string;
  rule: string;
};

export const DEFAULT_KEYFRAMES: KeyframesOptions = {
  name: "forge-bounce",
  duration: 1.2,
  timingFunction: "ease-in-out",
  iterationCount: "infinite",
  direction: "normal",
  fillMode: "both",
  stops: [
    {
      id: "a",
      offset: 0,
      opacity: 1,
      translateX: 0,
      translateY: 0,
      scale: 1,
      rotate: 0,
    },
    {
      id: "b",
      offset: 50,
      opacity: 1,
      translateX: 0,
      translateY: -24,
      scale: 1.05,
      rotate: 0,
    },
    {
      id: "c",
      offset: 100,
      opacity: 1,
      translateX: 0,
      translateY: 0,
      scale: 1,
      rotate: 0,
    },
  ],
};

function clampOffset(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

function stopCss(stop: KeyframeStop): string {
  const transforms: string[] = [];
  if (stop.translateX !== 0 || stop.translateY !== 0) {
    transforms.push(`translate(${stop.translateX}px, ${stop.translateY}px)`);
  }
  if (stop.scale !== 1) transforms.push(`scale(${stop.scale})`);
  if (stop.rotate !== 0) transforms.push(`rotate(${stop.rotate}deg)`);

  const lines = [`opacity: ${stop.opacity}`];
  if (transforms.length > 0) lines.push(`transform: ${transforms.join(" ")}`);
  return `  ${clampOffset(stop.offset)}% {\n    ${lines.join(";\n    ")};\n  }`;
}

/** Build @keyframes CSS and animation shorthand. */
export function buildKeyframesCss(options: KeyframesOptions): KeyframesCssResult {
  const name = options.name.trim().replace(/[^a-zA-Z0-9_-]/g, "-") || "forge-animation";
  const sorted = [...options.stops].sort((a, b) => a.offset - b.offset);
  const body = sorted.map(stopCss).join("\n");
  const keyframes = `@keyframes ${name} {\n${body}\n}`;
  const animation = `animation: ${name} ${options.duration}s ${options.timingFunction} ${options.iterationCount} ${options.direction} ${options.fillMode};`;
  const rule = `${keyframes}\n\n.animated {\n  ${animation}\n}`;
  return { keyframes, animation, rule };
}
