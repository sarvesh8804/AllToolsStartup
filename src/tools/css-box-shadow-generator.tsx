"use client";

import { useCallback, useMemo, useState } from "react";
import { EditorPaneHeader } from "@/components/editor/EditorPaneHeader";
import {
  buildBoxShadowCss,
  createBoxShadowLayer,
  type BoxShadowLayer,
} from "@/lib/css/box-shadow";
import { track } from "@/lib/analytics";

export function CssBoxShadowGeneratorTool() {
  const [layers, setLayers] = useState<BoxShadowLayer[]>([
    createBoxShadowLayer({
      id: "main",
      offsetX: 0,
      offsetY: 12,
      blur: 28,
      spread: -6,
      color: "rgba(36, 48, 24, 0.28)",
    }),
    createBoxShadowLayer({
      id: "soft",
      offsetX: 0,
      offsetY: 2,
      blur: 6,
      spread: 0,
      color: "rgba(36, 48, 24, 0.12)",
    }),
  ]);
  const [copied, setCopied] = useState(false);
  const [started, setStarted] = useState(false);

  const markStart = useCallback(() => {
    if (!started) {
      setStarted(true);
      track({
        name: "tool_start",
        tool: "css-box-shadow-generator",
        family: "tools",
      });
    }
  }, [started]);

  const css = useMemo(() => buildBoxShadowCss({ layers }), [layers]);

  const updateLayer = (id: string, patch: Partial<BoxShadowLayer>) => {
    markStart();
    setLayers((prev) =>
      prev.map((l) => (l.id === id ? { ...l, ...patch } : l)),
    );
  };

  const copyCss = async () => {
    markStart();
    try {
      await navigator.clipboard.writeText(css.declaration);
      setCopied(true);
      track({
        name: "tool_complete",
        tool: "css-box-shadow-generator",
        family: "tools",
      });
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <div className="space-y-4">
          {layers.map((layer, index) => (
            <div
              key={layer.id}
              className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4"
            >
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-medium text-[var(--foreground)]">
                  Layer {index + 1}
                </p>
                <div className="flex items-center gap-3 text-sm">
                  <label className="flex items-center gap-1.5 text-[var(--muted)]">
                    <input
                      type="checkbox"
                      checked={layer.enabled}
                      onChange={(e) =>
                        updateLayer(layer.id, { enabled: e.target.checked })
                      }
                    />
                    On
                  </label>
                  <label className="flex items-center gap-1.5 text-[var(--muted)]">
                    <input
                      type="checkbox"
                      checked={layer.inset}
                      onChange={(e) =>
                        updateLayer(layer.id, { inset: e.target.checked })
                      }
                    />
                    Inset
                  </label>
                  <button
                    type="button"
                    disabled={layers.length <= 1}
                    onClick={() => {
                      markStart();
                      setLayers((prev) => prev.filter((l) => l.id !== layer.id));
                    }}
                    className="text-[var(--muted)] hover:text-[var(--danger)] disabled:opacity-40"
                  >
                    Remove
                  </button>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {(
                  [
                    ["offsetX", "Offset X", -50, 50],
                    ["offsetY", "Offset Y", -50, 50],
                    ["blur", "Blur", 0, 100],
                    ["spread", "Spread", -40, 40],
                  ] as const
                ).map(([key, label, min, max]) => (
                  <label
                    key={key}
                    className="flex flex-col gap-1 text-xs text-[var(--muted)]"
                  >
                    <span className="flex justify-between">
                      {label}
                      <span className="font-[family-name:var(--font-mono)]">
                        {layer[key]}px
                      </span>
                    </span>
                    <input
                      type="range"
                      min={min}
                      max={max}
                      value={layer[key]}
                      onChange={(e) =>
                        updateLayer(layer.id, {
                          [key]: Number(e.target.value),
                        })
                      }
                      className="accent-[var(--accent)]"
                    />
                  </label>
                ))}
              </div>

              <label className="mt-3 flex flex-col gap-1 text-xs text-[var(--muted)]">
                Color
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={
                      layer.color.startsWith("#") && layer.color.length === 7
                        ? layer.color
                        : "#243018"
                    }
                    onChange={(e) =>
                      updateLayer(layer.id, { color: e.target.value })
                    }
                    className="h-9 w-12 cursor-pointer rounded border border-[var(--border)] bg-[var(--surface)]"
                  />
                  <input
                    type="text"
                    value={layer.color}
                    onChange={(e) =>
                      updateLayer(layer.id, { color: e.target.value })
                    }
                    className="min-w-0 flex-1 rounded-md border border-[var(--border)] bg-[var(--background)] px-2 py-1.5 font-[family-name:var(--font-mono)] text-sm text-[var(--foreground)]"
                  />
                </div>
              </label>
            </div>
          ))}

          <button
            type="button"
            onClick={() => {
              markStart();
              setLayers((prev) => [...prev, createBoxShadowLayer()]);
            }}
            className="rounded-md border border-[var(--border)] px-3 py-1.5 text-sm hover:border-[var(--accent)]/50"
          >
            Add layer
          </button>
        </div>

        <div className="space-y-4">
          <div
            className="flex min-h-[220px] items-center justify-center rounded-xl border border-[var(--border)]"
            style={{
              background:
                "radial-gradient(ellipse at 30% 20%, #fff6b8, #fffceb 55%, #f3ecc0)",
            }}
          >
            <div
              className="h-28 w-40 rounded-2xl bg-[var(--surface)]"
              style={{ boxShadow: css.value }}
            />
          </div>

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
