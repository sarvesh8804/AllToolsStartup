"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  DEFAULT_WORLD_CLOCK_ZONES,
  availableWorldClockZones,
  buildWorldClock,
} from "@/lib/time/world-clock";
import { track } from "@/lib/analytics";

export function WorldClockTool() {
  const [zones, setZones] = useState<string[]>(DEFAULT_WORLD_CLOCK_ZONES);
  const [now, setNow] = useState(() => new Date());
  const [addZone, setAddZone] = useState("Asia/Singapore");
  const [started, setStarted] = useState(false);
  const [paused, setPaused] = useState(false);

  const markStart = useCallback(() => {
    if (!started) {
      setStarted(true);
      track({ name: "tool_start", tool: "world-clock", family: "tools" });
    }
  }, [started]);

  useEffect(() => {
    if (paused) return;
    const id = window.setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => window.clearInterval(id);
  }, [paused]);

  const rows = useMemo(() => buildWorldClock(zones, now), [zones, now]);
  const catalog = useMemo(() => availableWorldClockZones(), []);

  const add = () => {
    markStart();
    if (!addZone || zones.includes(addZone)) return;
    setZones((prev) => [...prev, addZone]);
    track({ name: "tool_complete", tool: "world-clock", family: "tools" });
  };

  const remove = (id: string) => {
    markStart();
    setZones((prev) => prev.filter((z) => z !== id));
  };

  const reset = () => {
    markStart();
    setZones(DEFAULT_WORLD_CLOCK_ZONES);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
          Add timezone
          <select
            value={addZone}
            onChange={(e) => setAddZone(e.target.value)}
            className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-2 text-[var(--foreground)]"
          >
            {catalog.map((z) => (
              <option key={z.id} value={z.id}>
                {z.label} ({z.id})
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={add}
          className="rounded-md border border-[var(--border)] px-3 py-2 text-sm hover:border-[var(--accent)]/50"
        >
          Add
        </button>
        <button
          type="button"
          onClick={reset}
          className="rounded-md border border-[var(--border)] px-3 py-2 text-sm hover:border-[var(--accent)]/50"
        >
          Reset defaults
        </button>
        <button
          type="button"
          onClick={() => {
            markStart();
            setPaused((p) => !p);
          }}
          className="rounded-md border border-[var(--border)] px-3 py-2 text-sm hover:border-[var(--accent)]/50"
        >
          {paused ? "Resume" : "Pause"}
        </button>
        <Link
          href="/tools/timezone-converter"
          className="pb-2 text-sm text-[var(--accent-bright)] underline-offset-2 hover:underline"
        >
          Timezone Converter →
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map((row) => (
          <div
            key={row.zone.id}
            className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-4"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-medium text-[var(--foreground)]">
                  {row.zone.label}
                </p>
                <p className="font-[family-name:var(--font-mono)] text-xs text-[var(--muted)]">
                  {row.zone.id}
                </p>
              </div>
              <button
                type="button"
                onClick={() => remove(row.zone.id)}
                className="text-xs text-[var(--muted)] hover:text-[var(--foreground)]"
              >
                Remove
              </button>
            </div>
            <p className="mt-3 font-[family-name:var(--font-mono)] text-3xl tabular-nums text-[var(--foreground)]">
              {row.time}
            </p>
            <p className="mt-1 text-sm text-[var(--muted)]">
              {row.weekday} · {row.date}
            </p>
            <p className="mt-1 font-[family-name:var(--font-mono)] text-xs text-[var(--muted)]">
              {row.offset || "—"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
