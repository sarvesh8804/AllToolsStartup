"use client";

import { useCallback, useMemo, useState } from "react";
import { CopyButton } from "@/components/editor/CopyButton";
import { ToolErrorState } from "@/components/tool/ToolShell";
import { convertRgbChannels, parseRgbInput } from "@/lib/color/rgb-hex";
import { track } from "@/lib/analytics";
import Link from "next/link";

export function RgbToHexTool() {
  const [r, setR] = useState(196);
  const [g, setG] = useState(167);
  const [b, setB] = useState(10);
  const [paste, setPaste] = useState("196, 167, 10");
  const [started, setStarted] = useState(false);

  const markStart = useCallback(() => {
    if (!started) {
      setStarted(true);
      track({ name: "tool_start", tool: "rgb-to-hex", family: "tools" });
    }
  }, [started]);

  const result = useMemo(() => convertRgbChannels(r, g, b), [r, g, b]);

  const setChannel = (channel: "r" | "g" | "b", value: number) => {
    markStart();
    const v = Number.isFinite(value) ? value : 0;
    if (channel === "r") setR(v);
    if (channel === "g") setG(v);
    if (channel === "b") setB(v);
    const next = {
      r: channel === "r" ? v : r,
      g: channel === "g" ? v : g,
      b: channel === "b" ? v : b,
    };
    setPaste(`${clampPreview(next.r)}, ${clampPreview(next.g)}, ${clampPreview(next.b)}`);
  };

  const applyPaste = (value: string) => {
    markStart();
    setPaste(value);
    const parsed = parseRgbInput(value);
    if (parsed.ok) {
      setR(parsed.rgb.r);
      setG(parsed.rgb.g);
      setB(parsed.rgb.b);
    }
  };

  return (
    <div className="space-y-5">
      <p className="text-sm text-[var(--muted)]">
        Need the other direction? Use{" "}
        <Link
          href="/tools/hex-to-rgb"
          className="text-[var(--accent-bright)] underline-offset-2 hover:underline"
        >
          HEX to RGB
        </Link>
        .
      </p>

      <div className="flex flex-wrap items-end gap-4">
        {(
          [
            ["R", r, (v: number) => setChannel("r", v)],
            ["G", g, (v: number) => setChannel("g", v)],
            ["B", b, (v: number) => setChannel("b", v)],
          ] as const
        ).map(([label, value, onVal]) => (
          <label
            key={label}
            className="flex flex-col gap-1 text-sm text-[var(--muted)]"
          >
            {label}
            <input
              type="number"
              min={0}
              max={255}
              value={value}
              onChange={(e) => onVal(Number(e.target.value))}
              className="w-24 rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 font-[family-name:var(--font-mono)] text-[var(--foreground)]"
            />
          </label>
        ))}

        <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
          Or paste rgb / channels
          <input
            value={paste}
            onChange={(e) => applyPaste(e.target.value)}
            placeholder="rgb(196, 167, 10)"
            className="w-64 rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 font-[family-name:var(--font-mono)] text-[var(--foreground)]"
            spellCheck={false}
          />
        </label>

        {result.ok ? (
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={result.hex}
              onChange={(e) => applyPaste(e.target.value)}
              className="h-10 w-12 cursor-pointer rounded border border-[var(--border)] bg-[var(--surface)]"
              aria-label="Color picker"
            />
            <div
              className="h-10 w-28 rounded-md border border-[var(--border)]"
              style={{ background: result.hex }}
              title={result.hex}
            />
          </div>
        ) : null}
      </div>

      {!result.ok ? (
        <ToolErrorState message={result.error} />
      ) : (
        <dl className="divide-y divide-[var(--border)] overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]">
          {(
            [
              ["HEX", result.hex],
              ["Short HEX", result.hexShort ?? "—"],
              ["RGB", result.cssRgb],
              ["HSL", result.cssHsl],
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
                {value !== "—" ? (
                  <CopyButton
                    getText={() => value}
                    label="Copy"
                    className="!py-1 !text-xs"
                  />
                ) : null}
              </dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}

function clampPreview(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.min(255, Math.max(0, Math.round(n)));
}
