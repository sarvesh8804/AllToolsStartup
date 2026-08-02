"use client";

import { useCallback, useState } from "react";
import { CopyButton } from "@/components/editor/CopyButton";
import {
  DEFAULT_NANOID_SIZE,
  NANOID_MAX_BATCH,
  NANOID_MAX_SIZE,
  nanoidBatch,
} from "@/lib/id/nanoid";
import { track } from "@/lib/analytics";

export function NanoidGeneratorTool() {
  const [count, setCount] = useState(5);
  const [size, setSize] = useState(DEFAULT_NANOID_SIZE);
  const [ids, setIds] = useState<string[]>(() => nanoidBatch({ count: 5 }));
  const [started, setStarted] = useState(false);

  const generate = useCallback(
    (nextCount: number, nextSize: number) => {
      if (!started) {
        setStarted(true);
        track({
          name: "tool_start",
          tool: "nanoid-generator",
          family: "tools",
        });
      }
      setIds(nanoidBatch({ count: nextCount, size: nextSize }));
      track({
        name: "tool_complete",
        tool: "nanoid-generator",
        family: "tools",
      });
    },
    [started],
  );

  const joined = ids.join("\n");

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-4">
        <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
          How many
          <input
            type="number"
            min={1}
            max={NANOID_MAX_BATCH}
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className="w-28 rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-[var(--foreground)]"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
          Length
          <input
            type="number"
            min={1}
            max={NANOID_MAX_SIZE}
            value={size}
            onChange={(e) => setSize(Number(e.target.value))}
            className="w-28 rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-[var(--foreground)]"
          />
        </label>
        <button
          type="button"
          onClick={() => generate(count, size)}
          className="rounded-md bg-[var(--accent)] px-4 py-1.5 text-sm font-medium text-[var(--ink)] hover:bg-[var(--accent-bright)]"
        >
          Generate
        </button>
        <CopyButton getText={() => joined} label="Copy all" />
      </div>

      <ul className="divide-y divide-[var(--border)] overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]">
        {ids.map((id, i) => (
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

      <p className="text-xs text-[var(--muted)]">
        URL-safe NanoIDs using the standard alphabet and{" "}
        <code>crypto.getRandomValues</code>. Default length is 21 characters.
      </p>
    </div>
  );
}
