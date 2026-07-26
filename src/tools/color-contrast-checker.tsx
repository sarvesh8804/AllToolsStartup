"use client";

import { useCallback, useMemo, useState } from "react";
import { CopyButton } from "@/components/editor/CopyButton";
import { ToolErrorState } from "@/components/tool/ToolShell";
import { checkContrast, parseColor } from "@/lib/color/contrast";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/cn";

export function ColorContrastTool() {
  const [foreground, setForeground] = useState("#243018");
  const [background, setBackground] = useState("#fffceb");
  const [started, setStarted] = useState(false);

  const result = useMemo(
    () => checkContrast(foreground, background),
    [foreground, background],
  );

  const fgParsed = useMemo(() => parseColor(foreground), [foreground]);
  const bgParsed = useMemo(() => parseColor(background), [background]);

  const markStart = useCallback(() => {
    if (!started) {
      setStarted(true);
      track({
        name: "tool_start",
        tool: "color-contrast-checker",
        family: "tools",
      });
    }
  }, [started]);

  const swap = () => {
    markStart();
    setForeground(background);
    setBackground(foreground);
  };

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <ColorField
          label="Foreground (text)"
          value={foreground}
          hex={fgParsed.ok ? fgParsed.hex : "#000000"}
          onChange={(v) => {
            markStart();
            setForeground(v);
          }}
        />
        <ColorField
          label="Background"
          value={background}
          hex={bgParsed.ok ? bgParsed.hex : "#ffffff"}
          onChange={(v) => {
            markStart();
            setBackground(v);
          }}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={swap}
          className="rounded-md border border-[var(--border)] px-3 py-1.5 text-sm hover:border-[var(--accent)]/50"
        >
          Swap colors
        </button>
      </div>

      {!result.ok ? (
        <ToolErrorState message={result.error} />
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-4">
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-5 py-4">
              <p className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
                Contrast ratio
              </p>
              <p className="mt-1 font-[family-name:var(--font-mono)] text-3xl text-[var(--foreground)]">
                {result.value.ratioLabel}
              </p>
              <CopyButton
                getText={() => result.value.ratioLabel}
                label="Copy ratio"
                className="mt-2 !py-1 !text-xs"
              />
            </div>

            <div
              className="flex min-h-[7rem] min-w-[16rem] flex-1 items-center justify-center rounded-xl border border-[var(--border)] px-6 py-4 text-center"
              style={{
                color: fgParsed.ok ? fgParsed.hex : foreground,
                background: bgParsed.ok ? bgParsed.hex : background,
              }}
            >
              <div>
                <p className="text-2xl font-semibold">Large text sample</p>
                <p className="mt-2 text-sm">
                  Normal body text for readability preview.
                </p>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-[var(--border)]">
            <table className="w-full text-sm">
              <thead className="bg-[var(--surface)] text-left text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
                <tr>
                  <th className="px-4 py-2">WCAG 2</th>
                  <th className="px-4 py-2">Normal text</th>
                  <th className="px-4 py-2">Large text</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-[var(--border)]">
                  <td className="px-4 py-3 font-medium">AA</td>
                  <td className="px-4 py-3">
                    <PassFail pass={result.value.aaNormal} need="4.5:1" />
                  </td>
                  <td className="px-4 py-3">
                    <PassFail pass={result.value.aaLarge} need="3:1" />
                  </td>
                </tr>
                <tr className="border-t border-[var(--border)]">
                  <td className="px-4 py-3 font-medium">AAA</td>
                  <td className="px-4 py-3">
                    <PassFail pass={result.value.aaaNormal} need="7:1" />
                  </td>
                  <td className="px-4 py-3">
                    <PassFail pass={result.value.aaaLarge} need="4.5:1" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

function ColorField({
  label,
  value,
  hex,
  onChange,
}: {
  label: string;
  value: string;
  hex: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex flex-col gap-2 text-sm text-[var(--muted)]">
      {label}
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={hex}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-12 cursor-pointer rounded border border-[var(--border)] bg-[var(--surface)]"
          aria-label={`${label} picker`}
        />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="min-w-0 flex-1 rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 font-[family-name:var(--font-mono)] text-[var(--foreground)]"
          spellCheck={false}
        />
      </div>
    </label>
  );
}

function PassFail({ pass, need }: { pass: boolean; need: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-md px-2 py-1 text-xs font-medium",
        pass
          ? "bg-[var(--success-bg)] text-[var(--success)]"
          : "bg-[var(--danger-bg)] text-[var(--danger)]",
      )}
    >
      {pass ? "Pass" : "Fail"}
      <span className="opacity-70">({need})</span>
    </span>
  );
}
