import { optimize as svgoOptimize } from "svgo/browser";

export type SvgOptimizeOptions = {
  /** Run multiple optimization passes (default true). */
  multipass?: boolean;
  /** Float precision for path/numeric data (default 3). */
  floatPrecision?: number;
  /** Pretty-print output instead of minifying (default false). */
  pretty?: boolean;
  /** Indent spaces when pretty (default 2). */
  indent?: number;
  /** Keep viewBox even when width/height exist (default true — safer for responsive SVG). */
  keepViewBox?: boolean;
  /** Remove XML declaration / DOCTYPE (default true). */
  removeXmlns?: boolean;
};

export type SvgOptimizeResult =
  | {
      ok: true;
      svg: string;
      originalBytes: number;
      optimizedBytes: number;
      savedPercent: number;
    }
  | { ok: false; error: string };

export const DEFAULT_SVG_OPTIMIZE_OPTIONS: Required<SvgOptimizeOptions> = {
  multipass: true,
  floatPrecision: 3,
  pretty: false,
  indent: 2,
  keepViewBox: true,
  removeXmlns: false,
};

function clampPrecision(n: number): number {
  if (!Number.isFinite(n)) return 3;
  return Math.min(8, Math.max(0, Math.round(n)));
}

function byteLength(text: string): number {
  return new TextEncoder().encode(text).length;
}

/**
 * Optimize SVG markup with SVGO (browser build) — local, no upload.
 */
export function optimizeSvg(
  input: string,
  options: SvgOptimizeOptions = {},
): SvgOptimizeResult {
  const trimmed = input.trim();
  if (!trimmed) {
    return { ok: false, error: "Paste SVG markup to optimize." };
  }
  if (!/<svg[\s>]/i.test(trimmed)) {
    return { ok: false, error: "Input does not look like SVG (missing <svg>)." };
  }

  const multipass = options.multipass ?? DEFAULT_SVG_OPTIMIZE_OPTIONS.multipass;
  const floatPrecision = clampPrecision(
    options.floatPrecision ?? DEFAULT_SVG_OPTIMIZE_OPTIONS.floatPrecision,
  );
  const pretty = options.pretty ?? DEFAULT_SVG_OPTIMIZE_OPTIONS.pretty;
  const indent = Math.max(
    1,
    options.indent ?? DEFAULT_SVG_OPTIMIZE_OPTIONS.indent,
  );
  const keepViewBox =
    options.keepViewBox ?? DEFAULT_SVG_OPTIMIZE_OPTIONS.keepViewBox;
  const removeXmlns =
    options.removeXmlns ?? DEFAULT_SVG_OPTIMIZE_OPTIONS.removeXmlns;

  try {
    const plugins: Array<
      | "preset-default"
      | { name: "preset-default"; params: { floatPrecision: number } }
      | "removeViewBox"
      | "removeXMLNS"
    > = [
      {
        name: "preset-default",
        params: { floatPrecision },
      },
    ];
    if (!keepViewBox) plugins.push("removeViewBox");
    if (removeXmlns) plugins.push("removeXMLNS");

    const result = svgoOptimize(trimmed, {
      multipass,
      floatPrecision,
      js2svg: {
        pretty,
        indent,
      },
      plugins,
    });

    const svg = result.data;
    if (!svg || !svg.trim()) {
      return { ok: false, error: "Optimization produced empty output." };
    }

    const originalBytes = byteLength(trimmed);
    const optimizedBytes = byteLength(svg);
    const savedPercent =
      originalBytes === 0
        ? 0
        : Math.max(
            0,
            Math.round((1 - optimizedBytes / originalBytes) * 1000) / 10,
          );

    return {
      ok: true,
      svg: pretty && !svg.endsWith("\n") ? svg + "\n" : svg,
      originalBytes,
      optimizedBytes,
      savedPercent,
    };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Failed to optimize SVG",
    };
  }
}

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}
