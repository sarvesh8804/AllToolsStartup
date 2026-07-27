"use client";

import { useCallback, useMemo, useState } from "react";
import { CopyButton } from "@/components/editor/CopyButton";
import { EditorPaneHeader } from "@/components/editor/EditorPaneHeader";
import { CodeEditor } from "@/components/editor/CodeEditor";
import {
  DEFAULT_BORDER_RADIUS_OPTIONS,
  buildBorderRadiusCss,
  type BorderRadiusOptions,
} from "@/lib/css/border-radius";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/cn";

const CORNER_KEYS = [
  ["topLeft", "Top left"],
  ["topRight", "Top right"],
  ["bottomRight", "Bottom right"],
  ["bottomLeft", "Bottom left"],
] as const;

export function CssBorderRadiusGeneratorTool() {
  const [options, setOptions] = useState<BorderRadiusOptions>(
    DEFAULT_BORDER_RADIUS_OPTIONS,
  );
  const [started, setStarted] = useState(false);

  const css = useMemo(() => buildBorderRadiusCss(options), [options]);

  const markStart = useCallback(() => {
    if (!started) {
      setStarted(true);
      track({
        name: "tool_start",
        tool: "css-border-radius-generator",
        family: "tools",
      });
    }
  }, [started]);

  const update = (patch: Partial<BorderRadiusOptions>) => {
    markStart();
    setOptions((prev) => {
      const next = { ...prev, ...patch };
      if (patch.all !== undefined && next.linked) {
        next.corners = {
          topLeft: patch.all,
          topRight: patch.all,
          bottomRight: patch.all,
          bottomLeft: patch.all,
        };
        if (next.elliptical) {
          next.ellipse = { ...next.corners };
        }
      }
      return next;
    });
    track({
      name: "tool_complete",
      tool: "css-border-radius-generator",
      family: "tools",
    });
  };

  const updateCorner = (
    key: keyof BorderRadiusOptions["corners"],
    value: number,
  ) => {
    markStart();
    setOptions((prev) => ({
      ...prev,
      linked: false,
      corners: { ...prev.corners, [key]: value },
    }));
    track({
      name: "tool_complete",
      tool: "css-border-radius-generator",
      family: "tools",
    });
  };

  const max = options.unit === "%" ? 100 : options.unit === "rem" ? 20 : 200;

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--muted)]">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={options.linked}
                onChange={(e) => update({ linked: e.target.checked })}
              />
              Link corners
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={options.elliptical}
                onChange={(e) => update({ elliptical: e.target.checked })}
              />
              Elliptical
            </label>
            <div className="flex flex-wrap gap-1">
              {(["px", "%", "rem"] as const).map((u) => (
                <button
                  key={u}
                  type="button"
                  onClick={() => update({ unit: u })}
                  className={cn(
                    "rounded-md border px-2.5 py-1 text-sm",
                    options.unit === u
                      ? "border-[var(--accent)] bg-[var(--accent)]/15 text-[var(--foreground)]"
                      : "border-[var(--border)] hover:border-[var(--accent)]/50",
                  )}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>

          {options.linked ? (
            <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
              Radius: {options.all}
              {options.unit}
              <input
                type="range"
                min={0}
                max={max}
                step={options.unit === "rem" ? 0.1 : 1}
                value={options.all}
                onChange={(e) => update({ all: Number(e.target.value) })}
              />
            </label>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {CORNER_KEYS.map(([key, label]) => (
                <label
                  key={key}
                  className="flex flex-col gap-1 text-sm text-[var(--muted)]"
                >
                  {label}: {options.corners[key]}
                  {options.unit}
                  <input
                    type="range"
                    min={0}
                    max={max}
                    step={options.unit === "rem" ? 0.1 : 1}
                    value={options.corners[key]}
                    onChange={(e) =>
                      updateCorner(key, Number(e.target.value))
                    }
                  />
                </label>
              ))}
            </div>
          )}

          {options.elliptical && !options.linked ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <p className="sm:col-span-2 text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
                Vertical radii
              </p>
              {CORNER_KEYS.map(([key, label]) => (
                <label
                  key={`e-${key}`}
                  className="flex flex-col gap-1 text-sm text-[var(--muted)]"
                >
                  {label} Y: {options.ellipse[key]}
                  {options.unit}
                  <input
                    type="range"
                    min={0}
                    max={max}
                    step={options.unit === "rem" ? 0.1 : 1}
                    value={options.ellipse[key]}
                    onChange={(e) => {
                      markStart();
                      setOptions((prev) => ({
                        ...prev,
                        ellipse: {
                          ...prev.ellipse,
                          [key]: Number(e.target.value),
                        },
                      }));
                    }}
                  />
                </label>
              ))}
            </div>
          ) : null}
        </div>

        <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-8">
          <div
            className="h-40 w-40 bg-[var(--accent)]"
            style={{ borderRadius: css.styleValue }}
            aria-hidden
          />
          <p className="text-center font-[family-name:var(--font-mono)] text-sm text-[var(--muted)]">
            {css.value}
          </p>
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between gap-2">
          <EditorPaneHeader label="CSS" getText={() => css.declaration} />
          <CopyButton getText={() => css.declaration} label="Copy" />
        </div>
        <CodeEditor
          language="text"
          value={css.rule}
          editable={false}
          minHeight="20vh"
        />
      </div>
    </div>
  );
}
