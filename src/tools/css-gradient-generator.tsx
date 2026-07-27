"use client";

import { useCallback, useMemo, useState } from "react";
import { EditorPaneHeader } from "@/components/editor/EditorPaneHeader";
import {
  buildGradientCss,
  createGradientStop,
  type GradientStop,
  type GradientType,
} from "@/lib/css/gradient";
import { track } from "@/lib/analytics";

export function CssGradientGeneratorTool() {
  const [type, setType] = useState<GradientType>("linear");
  const [angle, setAngle] = useState(135);
  const [shape, setShape] = useState<"circle" | "ellipse">("circle");
  const [stops, setStops] = useState<GradientStop[]>([
    createGradientStop({ id: "a", color: "#fff6b8", position: 0 }),
    createGradientStop({ id: "b", color: "#c4a70a", position: 55 }),
    createGradientStop({ id: "c", color: "#243018", position: 100 }),
  ]);
  const [copied, setCopied] = useState(false);
  const [started, setStarted] = useState(false);

  const markStart = useCallback(() => {
    if (!started) {
      setStarted(true);
      track({
        name: "tool_start",
        tool: "css-gradient-generator",
        family: "tools",
      });
    }
  }, [started]);

  const css = useMemo(
    () => buildGradientCss({ type, angle, shape, stops }),
    [type, angle, shape, stops],
  );

  const updateStop = (id: string, patch: Partial<GradientStop>) => {
    markStart();
    setStops((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    );
  };

  const copyCss = async () => {
    markStart();
    try {
      await navigator.clipboard.writeText(css.declaration);
      setCopied(true);
      track({
        name: "tool_complete",
        tool: "css-gradient-generator",
        family: "tools",
      });
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {(
          [
            ["linear", "Linear"],
            ["radial", "Radial"],
            ["conic", "Conic"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => {
              markStart();
              setType(value);
            }}
            className={`rounded-md border px-3 py-1.5 text-sm transition ${
              type === value
                ? "border-[var(--accent)] bg-[var(--accent)]/15 text-[var(--foreground)]"
                : "border-[var(--border)] text-[var(--muted)] hover:border-[var(--accent)]/50"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <div className="space-y-4">
          {type !== "radial" ? (
            <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
              <span className="flex justify-between">
                Angle
                <span className="font-[family-name:var(--font-mono)]">
                  {angle}°
                </span>
              </span>
              <input
                type="range"
                min={0}
                max={360}
                value={angle}
                onChange={(e) => {
                  markStart();
                  setAngle(Number(e.target.value));
                }}
                className="accent-[var(--accent)]"
              />
            </label>
          ) : (
            <div className="flex flex-wrap gap-2">
              {(
                [
                  ["circle", "Circle"],
                  ["ellipse", "Ellipse"],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => {
                    markStart();
                    setShape(value);
                  }}
                  className={`rounded-md border px-3 py-1.5 text-sm transition ${
                    shape === value
                      ? "border-[var(--accent)] bg-[var(--accent)]/15 text-[var(--foreground)]"
                      : "border-[var(--border)] text-[var(--muted)] hover:border-[var(--accent)]/50"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}

          <div className="space-y-3">
            {stops.map((stop, index) => (
              <div
                key={stop.id}
                className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3"
              >
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm text-[var(--foreground)]">
                    Stop {index + 1}
                  </p>
                  <button
                    type="button"
                    disabled={stops.length <= 2}
                    onClick={() => {
                      markStart();
                      setStops((prev) => prev.filter((s) => s.id !== stop.id));
                    }}
                    className="text-xs text-[var(--muted)] hover:text-[var(--danger)] disabled:opacity-40"
                  >
                    Remove
                  </button>
                </div>
                <div className="grid gap-3 sm:grid-cols-[auto_1fr]">
                  <input
                    type="color"
                    value={
                      stop.color.startsWith("#") && stop.color.length === 7
                        ? stop.color
                        : "#c4a70a"
                    }
                    onChange={(e) =>
                      updateStop(stop.id, { color: e.target.value })
                    }
                    className="h-10 w-12 cursor-pointer rounded border border-[var(--border)]"
                  />
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={stop.color}
                      onChange={(e) =>
                        updateStop(stop.id, { color: e.target.value })
                      }
                      className="w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-2 py-1.5 font-[family-name:var(--font-mono)] text-sm text-[var(--foreground)]"
                    />
                    <label className="flex flex-col gap-1 text-xs text-[var(--muted)]">
                      <span className="flex justify-between">
                        Position
                        <span className="font-[family-name:var(--font-mono)]">
                          {stop.position}%
                        </span>
                      </span>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={stop.position}
                        onChange={(e) =>
                          updateStop(stop.id, {
                            position: Number(e.target.value),
                          })
                        }
                        className="accent-[var(--accent)]"
                      />
                    </label>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => {
              markStart();
              setStops((prev) => [
                ...prev,
                createGradientStop({
                  color: "#ffffff",
                  position: 50,
                }),
              ]);
            }}
            className="rounded-md border border-[var(--border)] px-3 py-1.5 text-sm hover:border-[var(--accent)]/50"
          >
            Add color stop
          </button>
        </div>

        <div className="space-y-4">
          <div
            className="min-h-[240px] rounded-xl border border-[var(--border)]"
            style={{ background: css.value }}
          />

          <div>
            <div className="mb-2 flex items-center justify-between gap-2">
              <EditorPaneHeader label="CSS" getText={() => css.declaration} />
              <button
                type="button"
                onClick={copyCss}
                className="rounded-md border border-[var(--border)] px-3 py-1.5 text-sm hover:border-[var(--accent)]/50"
              >
                {copied ? "Copied" : "Copy CSS"}
              </button>
            </div>
            <pre className="overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 font-[family-name:var(--font-mono)] text-xs leading-relaxed text-[var(--foreground)]">
              {css.rule}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
