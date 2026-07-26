"use client";

import { useCallback, useMemo, useState } from "react";
import { CopyButton } from "@/components/editor/CopyButton";
import { ToolErrorState } from "@/components/tool/ToolShell";
import {
  TIMEZONES,
  convertTimezones,
  guessLocalTimeZone,
  nowInLocalInput,
} from "@/lib/time/timezone";
import { track } from "@/lib/analytics";

const DEFAULT_TARGETS = [
  "UTC",
  "America/New_York",
  "Europe/London",
  "Asia/Kolkata",
  "Asia/Tokyo",
  "Australia/Sydney",
];

export function TimezoneConverterTool() {
  const localZone = useMemo(() => guessLocalTimeZone(), []);
  const sourceOptions = useMemo(() => {
    if (TIMEZONES.some((z) => z.id === localZone)) return TIMEZONES;
    return [
      { id: localZone, label: `${localZone} (local)`, region: "Local" },
      ...TIMEZONES,
    ];
  }, [localZone]);

  const [dateTime, setDateTime] = useState(() => nowInLocalInput());
  const [sourceZone, setSourceZone] = useState(() =>
    TIMEZONES.some((z) => z.id === localZone) ? localZone : "UTC",
  );
  const [targets, setTargets] = useState<string[]>(DEFAULT_TARGETS);
  const [started, setStarted] = useState(false);

  const markStart = useCallback(() => {
    if (!started) {
      setStarted(true);
      track({
        name: "tool_start",
        tool: "timezone-converter",
        family: "convert",
      });
    }
  }, [started]);

  const result = useMemo(
    () => convertTimezones(dateTime, sourceZone, targets),
    [dateTime, sourceZone, targets],
  );

  const toggleTarget = (id: string) => {
    markStart();
    setTargets((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
          Date &amp; time
          <div className="flex gap-2">
            <input
              type="datetime-local"
              value={dateTime}
              onChange={(e) => {
                markStart();
                setDateTime(e.target.value);
              }}
              className="min-w-0 flex-1 rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 font-[family-name:var(--font-mono)] text-[var(--foreground)]"
            />
            <button
              type="button"
              onClick={() => {
                markStart();
                setDateTime(nowInLocalInput());
              }}
              className="rounded-md border border-[var(--border)] px-3 py-2 text-sm hover:border-[var(--accent)]/50"
            >
              Now
            </button>
          </div>
        </label>

        <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
          Source timezone
          <select
            value={sourceZone}
            onChange={(e) => {
              markStart();
              setSourceZone(e.target.value);
            }}
            className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[var(--foreground)]"
          >
            {sourceOptions.map((z) => (
              <option key={z.id} value={z.id}>
                {z.label} ({z.id})
              </option>
            ))}
          </select>
        </label>
      </div>

      <div>
        <p className="mb-2 text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
          Show zones
        </p>
        <div className="flex flex-wrap gap-2">
          {TIMEZONES.map((z) => {
            const on = targets.includes(z.id);
            return (
              <button
                key={z.id}
                type="button"
                onClick={() => toggleTarget(z.id)}
                className={
                  on
                    ? "rounded-md bg-[var(--accent)] px-2.5 py-1 text-xs font-medium text-[var(--ink)]"
                    : "rounded-md border border-[var(--border)] px-2.5 py-1 text-xs text-[var(--muted)] hover:border-[var(--accent)]/50"
                }
              >
                {z.label}
              </button>
            );
          })}
        </div>
      </div>

      {!result.ok ? (
        <ToolErrorState message={result.error} />
      ) : (
        <div className="overflow-hidden rounded-xl border border-[var(--border)]">
          <table className="w-full text-sm">
            <thead className="bg-[var(--surface)] text-left text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
              <tr>
                <th className="px-4 py-2">Zone</th>
                <th className="px-4 py-2">Local time</th>
                <th className="px-4 py-2">Offset</th>
                <th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody>
              {result.rows.map((row) => (
                <tr
                  key={row.zone.id}
                  className="border-t border-[var(--border)]"
                >
                  <td className="px-4 py-3">
                    <div className="font-medium text-[var(--foreground)]">
                      {row.zone.label}
                    </div>
                    <div className="font-[family-name:var(--font-mono)] text-xs text-[var(--muted)]">
                      {row.zone.id}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-[family-name:var(--font-mono)] text-[var(--foreground)]">
                    {row.display}
                    <div className="text-xs text-[var(--muted)]">
                      {row.isoLocal}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-[family-name:var(--font-mono)] text-[var(--muted)]">
                    {row.offset}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <CopyButton
                      getText={() => row.isoLocal}
                      label="Copy"
                      className="!py-1 !text-xs"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
