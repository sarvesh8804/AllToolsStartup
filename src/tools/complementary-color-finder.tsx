"use client";

import { useCallback, useMemo, useState } from "react";
import { CopyButton } from "@/components/editor/CopyButton";
import { ToolErrorState } from "@/components/tool/ToolShell";
import { complementaryPalette } from "@/lib/color/complementary";
import { track } from "@/lib/analytics";
import Link from "next/link";

export function ComplementaryColorFinderTool() {
  const [input, setInput] = useState("#c4a70a");
  const [started, setStarted] = useState(false);

  const result = useMemo(() => complementaryPalette(input), [input]);

  const onChange = useCallback(
    (v: string) => {
      if (!started) {
        setStarted(true);
        track({
          name: "tool_start",
          tool: "complementary-color-finder",
          family: "tools",
        });
      }
      setInput(v);
      track({
        name: "tool_complete",
        tool: "complementary-color-finder",
        family: "tools",
      });
    },
    [started],
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end gap-4">
        <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
          Base color (hex or rgb)
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={result.ok ? result.base.hex : "#c4a70a"}
              onChange={(e) => onChange(e.target.value)}
              className="h-10 w-12 cursor-pointer rounded border border-[var(--border)] bg-[var(--surface)]"
              aria-label="Color picker"
            />
            <input
              value={input}
              onChange={(e) => onChange(e.target.value)}
              className="w-56 rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 font-[family-name:var(--font-mono)] text-[var(--foreground)]"
              spellCheck={false}
            />
          </div>
        </label>
        {result.ok ? (
          <div className="flex items-center gap-2">
            <div
              className="h-10 w-16 rounded-md border border-[var(--border)]"
              style={{ background: result.base.hex }}
              title="Base"
            />
            <span className="text-[var(--muted)]">→</span>
            <div
              className="h-10 w-16 rounded-md border border-[var(--border)]"
              style={{ background: result.complementary.hex }}
              title="Complementary"
            />
          </div>
        ) : null}
      </div>

      {!result.ok ? (
        <ToolErrorState message={result.error} />
      ) : (
        <>
          <div
            className="flex h-24 overflow-hidden rounded-xl border border-[var(--border)]"
            aria-hidden
          >
            {result.swatches.slice(0, 2).map((s) => (
              <div
                key={s.id}
                className="flex-1"
                style={{ background: s.color.hex }}
              />
            ))}
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {result.swatches.map((s) => (
              <div
                key={s.id}
                className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]"
              >
                <div
                  className="h-20"
                  style={{ background: s.color.hex }}
                />
                <div className="space-y-1 p-3">
                  <p className="text-sm font-medium text-[var(--foreground)]">
                    {s.label}
                  </p>
                  <p className="text-xs text-[var(--muted)]">{s.role}</p>
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <code className="font-[family-name:var(--font-mono)] text-sm text-[var(--foreground)]">
                      {s.color.hex}
                    </code>
                    <CopyButton
                      getText={() => s.color.hex}
                      label="Copy"
                      className="!py-1 !text-xs"
                    />
                  </div>
                  <p className="font-[family-name:var(--font-mono)] text-xs text-[var(--muted)]">
                    {s.color.cssHsl}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <p className="text-sm text-[var(--muted)]">
        Also try{" "}
        <Link
          href="/tools/color-contrast-checker"
          className="text-[var(--accent-bright)] underline-offset-2 hover:underline"
        >
          Color Contrast Checker
        </Link>{" "}
        and{" "}
        <Link
          href="/tools/hex-to-rgb"
          className="text-[var(--accent-bright)] underline-offset-2 hover:underline"
        >
          Hex to RGB
        </Link>
        .
      </p>
    </div>
  );
}
