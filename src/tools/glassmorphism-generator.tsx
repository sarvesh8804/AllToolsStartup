"use client";

import { useCallback, useMemo, useState } from "react";
import { EditorPaneHeader } from "@/components/editor/EditorPaneHeader";
import {
  DEFAULT_GLASS_OPTIONS,
  buildGlassmorphismCss,
} from "@/lib/css/glassmorphism";
import { track } from "@/lib/analytics";

export function GlassmorphismGeneratorTool() {
  const [blur, setBlur] = useState(DEFAULT_GLASS_OPTIONS.blur);
  const [opacity, setOpacity] = useState(DEFAULT_GLASS_OPTIONS.opacity);
  const [borderOpacity, setBorderOpacity] = useState(
    DEFAULT_GLASS_OPTIONS.borderOpacity,
  );
  const [borderWidth, setBorderWidth] = useState(
    DEFAULT_GLASS_OPTIONS.borderWidth,
  );
  const [borderRadius, setBorderRadius] = useState(
    DEFAULT_GLASS_OPTIONS.borderRadius,
  );
  const [hex, setHex] = useState("#ffffff");
  const [shadow, setShadow] = useState(DEFAULT_GLASS_OPTIONS.shadow);
  const [copied, setCopied] = useState(false);
  const [started, setStarted] = useState(false);

  const markStart = useCallback(() => {
    if (!started) {
      setStarted(true);
      track({
        name: "tool_start",
        tool: "glassmorphism-generator",
        family: "tools",
      });
    }
  }, [started]);

  const rgb = useMemo(() => {
    const m = hex.trim().match(/^#?([0-9a-fA-F]{6})$/);
    if (!m) return { r: 255, g: 255, b: 255 };
    const n = parseInt(m[1]!, 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
  }, [hex]);

  const css = useMemo(
    () =>
      buildGlassmorphismCss({
        blur,
        opacity,
        borderOpacity,
        borderWidth,
        borderRadius,
        shadow,
        ...rgb,
      }),
    [blur, opacity, borderOpacity, borderWidth, borderRadius, shadow, rgb],
  );

  const copyCss = async () => {
    markStart();
    try {
      await navigator.clipboard.writeText(css.rule);
      setCopied(true);
      track({
        name: "tool_complete",
        tool: "glassmorphism-generator",
        family: "tools",
      });
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <div className="space-y-4">
          <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
            <span className="flex justify-between">
              Blur
              <span className="font-[family-name:var(--font-mono)]">
                {blur}px
              </span>
            </span>
            <input
              type="range"
              min={0}
              max={40}
              value={blur}
              onChange={(e) => {
                markStart();
                setBlur(Number(e.target.value));
              }}
              className="accent-[var(--accent)]"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
            <span className="flex justify-between">
              Fill opacity
              <span className="font-[family-name:var(--font-mono)]">
                {opacity}%
              </span>
            </span>
            <input
              type="range"
              min={0}
              max={80}
              value={opacity}
              onChange={(e) => {
                markStart();
                setOpacity(Number(e.target.value));
              }}
              className="accent-[var(--accent)]"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
            <span className="flex justify-between">
              Border opacity
              <span className="font-[family-name:var(--font-mono)]">
                {borderOpacity}%
              </span>
            </span>
            <input
              type="range"
              min={0}
              max={100}
              value={borderOpacity}
              onChange={(e) => {
                markStart();
                setBorderOpacity(Number(e.target.value));
              }}
              className="accent-[var(--accent)]"
            />
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
              Border width
              <input
                type="number"
                min={0}
                max={12}
                value={borderWidth}
                onChange={(e) => {
                  markStart();
                  setBorderWidth(Number(e.target.value));
                }}
                className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1.5 text-[var(--foreground)]"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
              Radius
              <input
                type="number"
                min={0}
                max={64}
                value={borderRadius}
                onChange={(e) => {
                  markStart();
                  setBorderRadius(Number(e.target.value));
                }}
                className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1.5 text-[var(--foreground)]"
              />
            </label>
          </div>

          <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
            Tint color
            <div className="flex gap-2">
              <input
                type="color"
                value={hex}
                onChange={(e) => {
                  markStart();
                  setHex(e.target.value);
                }}
                className="h-10 w-14 cursor-pointer rounded border border-[var(--border)] bg-[var(--surface)]"
              />
              <input
                value={hex}
                onChange={(e) => {
                  markStart();
                  setHex(e.target.value);
                }}
                className="min-w-0 flex-1 rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 font-[family-name:var(--font-mono)] text-[var(--foreground)]"
                spellCheck={false}
              />
            </div>
          </label>

          <label className="flex items-center gap-2 text-sm text-[var(--foreground)]">
            <input
              type="checkbox"
              checked={shadow}
              onChange={(e) => {
                markStart();
                setShadow(e.target.checked);
              }}
            />
            Soft box-shadow
          </label>

          <div>
            <EditorPaneHeader label="CSS" getText={() => css.rule} />
            <pre className="overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 font-[family-name:var(--font-mono)] text-sm text-[var(--foreground)]">
              {css.rule}
            </pre>
            <div className="mt-2">
              <button
                type="button"
                onClick={copyCss}
                className="rounded-md border border-[var(--border)] px-3 py-1.5 text-sm hover:border-[var(--accent)]/50"
              >
                {copied ? "Copied rule" : "Copy CSS rule"}
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm text-[var(--muted)]">Live preview</p>
          <div
            className="flex min-h-[360px] items-center justify-center rounded-xl border border-[var(--border)] p-8"
            style={{
              background:
                "linear-gradient(135deg, #c4a70a 0%, #3d6b8a 45%, #6b8f3c 100%)",
            }}
          >
            <div
              className="flex h-40 w-56 flex-col items-center justify-center px-4 text-center"
              style={css.style}
            >
              <p className="text-sm font-medium text-[var(--ink)]">Glass card</p>
              <p className="mt-1 text-xs text-[var(--ink)]/80">
                backdrop-filter preview
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
