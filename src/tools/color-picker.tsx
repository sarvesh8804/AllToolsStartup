"use client";

import { useCallback, useMemo, useState } from "react";
import { CopyButton } from "@/components/editor/CopyButton";
import {
  colorFromHex,
  colorFromHsl,
  colorFromRgb,
  relatedColors,
  type PickedColor,
} from "@/lib/color/picker";
import { track } from "@/lib/analytics";

const DEFAULT = colorFromHex("#c4a70a")!;

export function ColorPickerTool() {
  const [color, setColor] = useState<PickedColor>(DEFAULT);
  const [hexDraft, setHexDraft] = useState(DEFAULT.hex);
  const [started, setStarted] = useState(false);

  const markStart = useCallback(() => {
    if (!started) {
      setStarted(true);
      track({ name: "tool_start", tool: "color-picker", family: "tools" });
    }
  }, [started]);

  const apply = useCallback(
    (next: PickedColor) => {
      markStart();
      setColor(next);
      setHexDraft(next.hex);
      track({ name: "tool_complete", tool: "color-picker", family: "tools" });
    },
    [markStart],
  );

  const related = useMemo(() => relatedColors(color), [color]);

  return (
    <div className="space-y-5">
      <div
        className="h-28 w-full rounded-xl border border-[var(--border)]"
        style={{ background: color.hex }}
        aria-label={`Preview ${color.hex}`}
      />

      <div className="flex flex-wrap items-end gap-4">
        <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
          Picker
          <input
            type="color"
            value={color.hex}
            onChange={(e) => {
              const next = colorFromHex(e.target.value);
              if (next) apply(next);
            }}
            className="h-10 w-14 cursor-pointer rounded border border-[var(--border)] bg-[var(--surface)]"
            aria-label="Native color picker"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
          HEX
          <input
            value={hexDraft}
            onChange={(e) => {
              setHexDraft(e.target.value);
              const next = colorFromHex(e.target.value);
              if (next) apply(next);
            }}
            className="w-36 rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 font-[family-name:var(--font-mono)] text-[var(--foreground)]"
            spellCheck={false}
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {(
          [
            ["R", color.rgb.r, 255, (v: number) => colorFromRgb(v, color.rgb.g, color.rgb.b)],
            ["G", color.rgb.g, 255, (v: number) => colorFromRgb(color.rgb.r, v, color.rgb.b)],
            ["B", color.rgb.b, 255, (v: number) => colorFromRgb(color.rgb.r, color.rgb.g, v)],
          ] as const
        ).map(([label, value, max, make]) => (
          <label key={label} className="flex flex-col gap-1 text-sm text-[var(--muted)]">
            {label} ({value})
            <input
              type="range"
              min={0}
              max={max}
              value={value}
              onChange={(e) => apply(make(Number(e.target.value)))}
              className="w-full accent-[var(--accent)]"
            />
          </label>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {(
          [
            ["H", color.hsl.h, 360, (v: number) => colorFromHsl(v, color.hsl.s, color.hsl.l)],
            ["S", color.hsl.s, 100, (v: number) => colorFromHsl(color.hsl.h, v, color.hsl.l)],
            ["L", color.hsl.l, 100, (v: number) => colorFromHsl(color.hsl.h, color.hsl.s, v)],
          ] as const
        ).map(([label, value, max, make]) => (
          <label key={label} className="flex flex-col gap-1 text-sm text-[var(--muted)]">
            {label} ({value}
            {label === "H" ? "°" : "%"})
            <input
              type="range"
              min={0}
              max={max}
              step={label === "H" ? 1 : 0.1}
              value={value}
              onChange={(e) => apply(make(Number(e.target.value)))}
              className="w-full accent-[var(--accent)]"
            />
          </label>
        ))}
      </div>

      <dl className="divide-y divide-[var(--border)] overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]">
        {(
          [
            ["HEX", color.cssHex],
            ["RGB", color.cssRgb],
            ["HSL", color.cssHsl],
          ] as const
        ).map(([label, value]) => (
          <div
            key={label}
            className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <dt className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
              {label}
            </dt>
            <dd className="flex items-center gap-2">
              <code className="font-[family-name:var(--font-mono)] text-sm text-[var(--foreground)]">
                {value}
              </code>
              <CopyButton getText={() => value} label="Copy" className="!py-1 !text-xs" />
            </dd>
          </div>
        ))}
      </dl>

      <div>
        <p className="mb-2 text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
          Related
        </p>
        <div className="flex flex-wrap gap-3">
          {(
            [
              ["Complementary", related.complementary],
              ["Analogous −", related.analogous[0]],
              ["Analogous +", related.analogous[1]],
            ] as const
          ).map(([label, swatch]) => (
            <button
              key={label}
              type="button"
              onClick={() => apply(swatch)}
              className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-left text-sm text-[var(--foreground)] transition hover:border-[var(--accent)]"
            >
              <span
                className="h-8 w-8 rounded-md border border-[var(--border)]"
                style={{ background: swatch.hex }}
              />
              <span>
                <span className="block text-xs text-[var(--muted)]">{label}</span>
                <code className="font-[family-name:var(--font-mono)] text-xs">
                  {swatch.hex}
                </code>
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
