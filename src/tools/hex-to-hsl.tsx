"use client";

import { useCallback, useMemo, useState } from "react";
import { CopyButton } from "@/components/editor/CopyButton";
import { ToolErrorState } from "@/components/tool/ToolShell";
import {
  convertToHsl,
  hslChannelsToConversion,
} from "@/lib/color/hex-hsl";
import { track } from "@/lib/analytics";
import Link from "next/link";

export function HexToHslTool() {
  const [input, setInput] = useState("#c4a70a");
  const [useSliders, setUseSliders] = useState(false);
  const [h, setH] = useState(50);
  const [s, setS] = useState(92);
  const [l, setL] = useState(40);
  const [started, setStarted] = useState(false);

  const parsed = useMemo(() => convertToHsl(input), [input]);

  const result = useMemo(() => {
    if (useSliders) return hslChannelsToConversion(h, s, l);
    return parsed;
  }, [useSliders, h, s, l, parsed]);

  const markStart = useCallback(() => {
    if (!started) {
      setStarted(true);
      track({ name: "tool_start", tool: "hex-to-hsl", family: "tools" });
    }
  }, [started]);

  const onInputChange = (v: string) => {
    markStart();
    setUseSliders(false);
    setInput(v);
    const next = convertToHsl(v);
    if (next.ok) {
      setH(next.hsl.h);
      setS(next.hsl.s);
      setL(next.hsl.l);
    }
  };

  const onSlider = (channel: "h" | "s" | "l", value: number) => {
    markStart();
    setUseSliders(true);
    const next = {
      h: channel === "h" ? value : h,
      s: channel === "s" ? value : s,
      l: channel === "l" ? value : l,
    };
    setH(next.h);
    setS(next.s);
    setL(next.l);
    const conv = hslChannelsToConversion(next.h, next.s, next.l);
    setInput(conv.hex);
  };

  return (
    <div className="space-y-5">
      <p className="text-sm text-[var(--muted)]">
        Related:{" "}
        <Link
          href="/tools/hex-to-rgb"
          className="text-[var(--accent-bright)] underline-offset-2 hover:underline"
        >
          HEX to RGB
        </Link>
        ,{" "}
        <Link
          href="/tools/rgb-to-hex"
          className="text-[var(--accent-bright)] underline-offset-2 hover:underline"
        >
          RGB to HEX
        </Link>
        .
      </p>

      <div className="flex flex-wrap items-end gap-4">
        <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
          Color (hex, rgb, or hsl)
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={result.ok ? result.hex : "#c4a70a"}
              onChange={(e) => onInputChange(e.target.value)}
              className="h-10 w-12 cursor-pointer rounded border border-[var(--border)] bg-[var(--surface)]"
              aria-label="Color picker"
            />
            <input
              value={input}
              onChange={(e) => onInputChange(e.target.value)}
              className="w-64 rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 font-[family-name:var(--font-mono)] text-[var(--foreground)]"
              spellCheck={false}
            />
          </div>
        </label>

        {result.ok ? (
          <div
            className="h-10 w-28 rounded-md border border-[var(--border)]"
            style={{ background: result.hex }}
            title={result.hex}
          />
        ) : null}
      </div>

      {!result.ok ? (
        <ToolErrorState message={result.error} />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            {(
              [
                ["Hue", h, 0, 360, "h", "°"],
                ["Saturation", s, 0, 100, "s", "%"],
                ["Lightness", l, 0, 100, "l", "%"],
              ] as const
            ).map(([label, value, min, max, channel, unit]) => (
              <label
                key={label}
                className="flex flex-col gap-2 text-sm text-[var(--muted)]"
              >
                {label}{" "}
                <span className="font-[family-name:var(--font-mono)] text-[var(--foreground)]">
                  {value}
                  {unit}
                </span>
                <input
                  type="range"
                  min={min}
                  max={max}
                  step={channel === "h" ? 1 : 0.5}
                  value={value}
                  onChange={(e) =>
                    onSlider(channel, Number(e.target.value))
                  }
                  className="w-full"
                />
              </label>
            ))}
          </div>

          <dl className="divide-y divide-[var(--border)] overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]">
            {(
              [
                ["HSL channels", result.channels],
                ["CSS hsl()", result.cssHsl],
                ["CSS hsl() modern", result.cssHslModern],
                ["HEX", result.hex],
                ["RGB", `rgb(${result.rgb.r}, ${result.rgb.g}, ${result.rgb.b})`],
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
                  <CopyButton
                    getText={() => value}
                    label="Copy"
                    className="!py-1 !text-xs"
                  />
                </dd>
              </div>
            ))}
          </dl>
        </>
      )}
    </div>
  );
}
