"use client";

import { useCallback, useState } from "react";
import { CopyButton } from "@/components/editor/CopyButton";
import { uuidV4, uuidV4Batch } from "@/lib/id/uuid";
import { track } from "@/lib/analytics";

export function UuidGeneratorTool() {
  const [count, setCount] = useState(5);
  const [uppercase, setUppercase] = useState(false);
  const [ids, setIds] = useState<string[]>(() => [uuidV4()]);
  const [started, setStarted] = useState(false);

  const generate = useCallback(
    (n: number) => {
      if (!started) {
        setStarted(true);
        track({ name: "tool_start", tool: "uuid-v4-generator", family: "tools" });
      }
      setIds(uuidV4Batch(n));
      track({ name: "tool_complete", tool: "uuid-v4-generator", family: "tools" });
    },
    [started],
  );

  const display = uppercase ? ids.map((id) => id.toUpperCase()) : ids;
  const joined = display.join("\n");

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-4">
        <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
          How many
          <input
            type="number"
            min={1}
            max={1000}
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className="w-28 rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-[var(--foreground)]"
          />
        </label>

        <label className="flex items-center gap-2 text-sm text-[var(--muted)]">
          <input
            type="checkbox"
            checked={uppercase}
            onChange={(e) => setUppercase(e.target.checked)}
            className="h-4 w-4 accent-[var(--accent)]"
          />
          Uppercase
        </label>

        <button
          type="button"
          onClick={() => generate(count)}
          className="rounded-md bg-[var(--accent)] px-4 py-1.5 text-sm font-medium text-[var(--ink)] hover:bg-[var(--accent-bright)]"
        >
          Generate
        </button>
        <CopyButton getText={() => joined} label="Copy all" />
      </div>

      <ul className="divide-y divide-[var(--border)] overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]">
        {display.map((id, i) => (
          <li
            key={`${id}-${i}`}
            className="flex items-center justify-between gap-3 px-4 py-2.5"
          >
            <code className="font-[family-name:var(--font-mono)] text-sm text-[var(--foreground)]">
              {id}
            </code>
            <CopyButton getText={() => id} label="Copy" className="!py-1 !text-xs" />
          </li>
        ))}
      </ul>
    </div>
  );
}
