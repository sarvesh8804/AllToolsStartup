"use client";

import { useCallback, useState } from "react";
import { CopyButton } from "@/components/editor/CopyButton";
import {
  ULID_MAX_BATCH,
  decodeUlidTimestamp,
  ulidBatch,
} from "@/lib/id/ulid";
import { track } from "@/lib/analytics";

export function UlidGeneratorTool() {
  const [count, setCount] = useState(5);
  const [useCustomTime, setUseCustomTime] = useState(false);
  const [timestamp, setTimestamp] = useState("1700000000000");
  const [ids, setIds] = useState<string[]>(() => ulidBatch(5));
  const [started, setStarted] = useState(false);

  const generate = useCallback(
    (nextCount: number) => {
      if (!started) {
        setStarted(true);
        track({
          name: "tool_start",
          tool: "ulid-generator",
          family: "tools",
        });
      }
      const ts = useCustomTime
        ? Math.floor(Number(timestamp)) || 0
        : Date.now();
      setIds(ulidBatch(nextCount, ts));
      track({
        name: "tool_complete",
        tool: "ulid-generator",
        family: "tools",
      });
    },
    [started, useCustomTime, timestamp],
  );

  const joined = ids.join("\n");
  const firstTimestamp = ids[0] ? decodeUlidTimestamp(ids[0]) : null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-4">
        <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
          How many
          <input
            type="number"
            min={1}
            max={ULID_MAX_BATCH}
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className="w-28 rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-[var(--foreground)]"
          />
        </label>
        <label className="flex items-center gap-2 text-sm text-[var(--foreground)]">
          <input
            type="checkbox"
            checked={useCustomTime}
            onChange={(e) => setUseCustomTime(e.target.checked)}
          />
          Custom timestamp (ms)
        </label>
        {useCustomTime ? (
          <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
            Unix ms
            <input
              type="number"
              value={timestamp}
              onChange={(e) => setTimestamp(e.target.value)}
              className="w-44 rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 font-[family-name:var(--font-mono)] text-[var(--foreground)]"
            />
          </label>
        ) : null}
        <button
          type="button"
          onClick={() => generate(count)}
          className="rounded-md bg-[var(--accent)] px-4 py-1.5 text-sm font-medium text-[var(--ink)] hover:bg-[var(--accent-bright)]"
        >
          Generate
        </button>
        <CopyButton getText={() => joined} label="Copy all" />
      </div>

      {firstTimestamp !== null ? (
        <p className="text-sm text-[var(--muted)]">
          First ULID timestamp:{" "}
          <span className="font-[family-name:var(--font-mono)] text-[var(--foreground)]">
            {new Date(firstTimestamp).toISOString()}
          </span>
        </p>
      ) : null}

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
        Lexicographically sortable IDs with a 48-bit millisecond timestamp and
        80 bits of randomness. Batch generation increments the timestamp by 1 ms
        per ID.
      </p>
    </div>
  );
}
