"use client";

import { useCallback, useMemo, useState } from "react";
import { CopyButton } from "@/components/editor/CopyButton";
import { ToolErrorState } from "@/components/tool/ToolShell";
import { convertColor } from "@/lib/color/hex-rgb";
import { track } from "@/lib/analytics";

export function HexToRgbTool() {
  const [input, setInput] = useState("#c4a70a");
  const [started, setStarted] = useState(false);

  const result = useMemo(() => convertColor(input), [input]);

  const onChange = useCallback(
    (v: string) => {
      if (!started) {
        setStarted(true);
        track({ name: "tool_start", tool: "hex-to-rgb", family: "tools" });
      }
      setInput(v);
    },
    [started],
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end gap-4">
        <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
          Color (hex or rgb)
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={result.ok ? result.hex : "#c4a70a"}
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
        <dl className="divide-y divide-[var(--border)] overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]">
          {(
            [
              ["HEX", result.hex],
              ["Short HEX", result.hexShort ?? "—"],
              ["RGB", result.cssRgb],
              ["Channels", `${result.rgb.r}, ${result.rgb.g}, ${result.rgb.b}`],
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
