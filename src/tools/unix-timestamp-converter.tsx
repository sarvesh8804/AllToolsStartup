"use client";

import { useCallback, useMemo, useState } from "react";
import { CopyButton } from "@/components/editor/CopyButton";
import { ToolErrorState } from "@/components/tool/ToolShell";
import {
  fromIso,
  nowParts,
  parseTimestampInput,
  type TimestampParts,
} from "@/lib/time/timestamp";
import { track } from "@/lib/analytics";

type Mode = "unix" | "iso";

export function UnixTimestampTool() {
  const initial = useMemo(() => nowParts(), []);
  const [mode, setMode] = useState<Mode>("unix");
  const [unixInput, setUnixInput] = useState(String(initial.seconds));
  const [isoInput, setIsoInput] = useState(initial.iso);
  const [started, setStarted] = useState(false);

  const markStart = useCallback(() => {
    if (!started) {
      setStarted(true);
      track({
        name: "tool_start",
        tool: "unix-timestamp-converter",
        family: "convert",
      });
    }
  }, [started]);

  const result =
    mode === "unix"
      ? parseTimestampInput(unixInput)
      : fromIso(isoInput);

  const useNow = () => {
    markStart();
    const n = nowParts();
    setUnixInput(String(n.seconds));
    setIsoInput(n.iso);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div
          role="tablist"
          aria-label="Conversion direction"
          className="inline-flex rounded-lg border border-[var(--border)] bg-[var(--surface)] p-1 text-sm"
        >
          {(
            [
              ["unix", "Unix → Date"],
              ["iso", "Date → Unix"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={mode === id}
              onClick={() => setMode(id)}
              className={
                mode === id
                  ? "rounded-md bg-[var(--accent)] px-3 py-1.5 font-medium text-[var(--ink)]"
                  : "rounded-md px-3 py-1.5 text-[var(--muted)] hover:text-[var(--foreground)]"
              }
            >
              {label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={useNow}
          className="rounded-md border border-[var(--border)] px-3 py-1.5 text-sm hover:border-[var(--accent)]/50"
        >
          Use current time
        </button>
      </div>

      {mode === "unix" ? (
        <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
          Unix timestamp (seconds or milliseconds)
          <input
            value={unixInput}
            onChange={(e) => {
              markStart();
              setUnixInput(e.target.value);
            }}
            className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 font-[family-name:var(--font-mono)] text-[var(--foreground)]"
            spellCheck={false}
          />
        </label>
      ) : (
        <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
          ISO-8601 / parseable date
          <input
            value={isoInput}
            onChange={(e) => {
              markStart();
              setIsoInput(e.target.value);
            }}
            className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 font-[family-name:var(--font-mono)] text-[var(--foreground)]"
            spellCheck={false}
          />
        </label>
      )}

      {!result.ok ? (
        <ToolErrorState message={result.error} />
      ) : (
        <PartsGrid parts={result.value} unit={result.unit} />
      )}
    </div>
  );
}

function PartsGrid({
  parts,
  unit,
}: {
  parts: TimestampParts;
  unit: "s" | "ms";
}) {
  const rows = [
    {
      label: unit === "ms" ? "Detected unit" : "Detected unit",
      value: unit === "ms" ? "milliseconds" : "seconds",
    },
    { label: "Seconds", value: String(parts.seconds) },
    { label: "Milliseconds", value: String(parts.milliseconds) },
    { label: "ISO-8601 (UTC)", value: parts.iso },
    { label: "UTC", value: parts.utc },
    { label: "Local", value: parts.local },
  ];

  return (
    <dl className="divide-y divide-[var(--border)] overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]">
      {rows.map((row) => (
        <div
          key={row.label}
          className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
        >
          <dt className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
            {row.label}
          </dt>
          <dd className="flex items-center gap-2">
            <code className="break-all font-[family-name:var(--font-mono)] text-sm text-[var(--foreground)]">
              {row.value}
            </code>
            <CopyButton
              getText={() => row.value}
              label="Copy"
              className="!py-1 !text-xs"
            />
          </dd>
        </div>
      ))}
    </dl>
  );
}
