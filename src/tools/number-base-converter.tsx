"use client";

import { useCallback, useMemo, useState } from "react";
import { CopyButton } from "@/components/editor/CopyButton";
import { ToolErrorState } from "@/components/tool/ToolShell";
import {
  NUMBER_BASES,
  convertFromBase,
  type NumberBase,
} from "@/lib/convert/number-base";
import { track } from "@/lib/analytics";

export function NumberBaseConverterTool() {
  const [activeBase, setActiveBase] = useState<NumberBase>(10);
  const [inputs, setInputs] = useState<Record<NumberBase, string>>({
    2: "101010",
    8: "52",
    10: "42",
    16: "2A",
  });
  const [started, setStarted] = useState(false);

  const result = useMemo(
    () => convertFromBase(inputs[activeBase], activeBase),
    [inputs, activeBase],
  );

  const markStart = useCallback(() => {
    if (!started) {
      setStarted(true);
      track({
        name: "tool_start",
        tool: "number-base-converter",
        family: "convert",
      });
    }
  }, [started]);

  const onEdit = (base: NumberBase, value: string) => {
    markStart();
    setActiveBase(base);
    const next = convertFromBase(value, base);
    if (next.ok) {
      setInputs({
        2: next.representations[2],
        8: next.representations[8],
        10: next.representations[10],
        16: next.representations[16],
      });
    } else {
      setInputs((prev) => ({ ...prev, [base]: value }));
    }
  };

  return (
    <div className="space-y-4">
      {!result.ok ? <ToolErrorState message={result.error} /> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        {NUMBER_BASES.map(({ base, label, prefix }) => (
          <label
            key={base}
            className="flex flex-col gap-1 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 text-sm text-[var(--muted)]"
          >
            <span className="flex items-center justify-between gap-2">
              <span>
                {label}{" "}
                <span className="font-[family-name:var(--font-mono)] text-xs">
                  (base {base}
                  {prefix ? `, ${prefix}` : ""})
                </span>
              </span>
              <CopyButton
                getText={() => inputs[base]}
                label="Copy"
                className="!py-1 !text-xs"
              />
            </span>
            <input
              value={inputs[base]}
              onChange={(e) => onEdit(base, e.target.value)}
              className="rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 font-[family-name:var(--font-mono)] text-base text-[var(--foreground)]"
              spellCheck={false}
              aria-label={label}
            />
          </label>
        ))}
      </div>

      <p className="text-sm text-[var(--muted)]">
        Edit any field — the others update automatically. Optional prefixes{" "}
        <code className="text-[var(--foreground)]">0b</code>,{" "}
        <code className="text-[var(--foreground)]">0o</code>, and{" "}
        <code className="text-[var(--foreground)]">0x</code> are accepted.
      </p>
    </div>
  );
}
