import { unifiedDiff } from "@/lib/text/diff";

export type JsonDiffKind = "added" | "removed" | "changed";

export type JsonDiffChange = {
  path: string;
  kind: JsonDiffKind;
  before?: unknown;
  after?: unknown;
};

export type JsonDiffStats = {
  added: number;
  removed: number;
  changed: number;
};

export type JsonDiffResult =
  | {
      ok: true;
      equal: boolean;
      changes: JsonDiffChange[];
      stats: JsonDiffStats;
      /** Pretty-printed text unified diff of sorted JSON. */
      textDiff: string;
      leftPretty: string;
      rightPretty: string;
    }
  | { ok: false; error: string; side?: "left" | "right" | "both" };

function parseJson(
  raw: string,
  side: "left" | "right",
): { ok: true; value: unknown } | { ok: false; error: string; side: "left" | "right" } {
  const trimmed = raw.trim();
  if (!trimmed) {
    return {
      ok: false,
      error: `Paste ${side === "left" ? "original" : "modified"} JSON.`,
      side,
    };
  }
  try {
    return { ok: true, value: JSON.parse(trimmed) };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : `Invalid ${side} JSON`,
      side,
    };
  }
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function pathJoin(base: string, key: string | number): string {
  if (base === "") {
    return typeof key === "number" ? `[${key}]` : key;
  }
  if (typeof key === "number") return `${base}[${key}]`;
  if (/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) return `${base}.${key}`;
  return `${base}[${JSON.stringify(key)}]`;
}

function sameType(a: unknown, b: unknown): boolean {
  if (a === null || b === null) return a === b;
  if (Array.isArray(a) && Array.isArray(b)) return true;
  return typeof a === typeof b && isPlainObject(a) === isPlainObject(b);
}

function walk(left: unknown, right: unknown, path: string, out: JsonDiffChange[]) {
  if (Object.is(left, right)) return;

  if (!sameType(left, right) || left === null || right === null) {
    out.push({ path: path || "$", kind: "changed", before: left, after: right });
    return;
  }

  if (Array.isArray(left) && Array.isArray(right)) {
    const max = Math.max(left.length, right.length);
    for (let i = 0; i < max; i += 1) {
      const p = pathJoin(path, i);
      if (i >= left.length) {
        out.push({ path: p, kind: "added", after: right[i] });
      } else if (i >= right.length) {
        out.push({ path: p, kind: "removed", before: left[i] });
      } else {
        walk(left[i], right[i], p, out);
      }
    }
    return;
  }

  if (isPlainObject(left) && isPlainObject(right)) {
    const keys = new Set([...Object.keys(left), ...Object.keys(right)]);
    const sorted = [...keys].sort();
    for (const key of sorted) {
      const p = pathJoin(path, key);
      const hasL = Object.prototype.hasOwnProperty.call(left, key);
      const hasR = Object.prototype.hasOwnProperty.call(right, key);
      if (!hasL) {
        out.push({ path: p, kind: "added", after: right[key] });
      } else if (!hasR) {
        out.push({ path: p, kind: "removed", before: left[key] });
      } else {
        walk(left[key], right[key], p, out);
      }
    }
    return;
  }

  // primitives (and mismatched already handled)
  if (left !== right) {
    out.push({ path: path || "$", kind: "changed", before: left, after: right });
  }
}

/** Stable pretty JSON for text unified view (object keys sorted recursively). */
export function stableStringify(value: unknown, spaces = 2): string {
  return `${JSON.stringify(sortKeys(value), null, spaces)}\n`;
}

function sortKeys(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortKeys);
  if (!isPlainObject(value)) return value;
  const out: Record<string, unknown> = {};
  for (const key of Object.keys(value).sort()) {
    out[key] = sortKeys(value[key]);
  }
  return out;
}

export function formatJsonValue(value: unknown): string {
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

/** Structural JSON diff with path-level changes + text unified of sorted pretty JSON. */
export function diffJson(leftRaw: string, rightRaw: string): JsonDiffResult {
  const leftParsed = parseJson(leftRaw, "left");
  const rightParsed = parseJson(rightRaw, "right");

  if (!leftParsed.ok && !rightParsed.ok) {
    return {
      ok: false,
      error: `${leftParsed.error} ${rightParsed.error}`,
      side: "both",
    };
  }
  if (!leftParsed.ok) return leftParsed;
  if (!rightParsed.ok) return rightParsed;

  const changes: JsonDiffChange[] = [];
  walk(leftParsed.value, rightParsed.value, "", changes);

  const stats: JsonDiffStats = { added: 0, removed: 0, changed: 0 };
  for (const c of changes) {
    if (c.kind === "added") stats.added += 1;
    else if (c.kind === "removed") stats.removed += 1;
    else stats.changed += 1;
  }

  const leftPretty = stableStringify(leftParsed.value);
  const rightPretty = stableStringify(rightParsed.value);

  return {
    ok: true,
    equal: changes.length === 0,
    changes,
    stats,
    textDiff: unifiedDiff(leftPretty, rightPretty),
    leftPretty,
    rightPretty,
  };
}
