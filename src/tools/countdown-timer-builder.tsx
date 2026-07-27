"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { EditorPaneHeader } from "@/components/editor/EditorPaneHeader";
import { ToolErrorState } from "@/components/tool/ToolShell";
import {
  DEFAULT_COUNTDOWN_CONFIG,
  buildCountdownEmbedHtml,
  defaultTargetIso,
  formatCountdownLabel,
  parseTargetInput,
  remainingParts,
  type CountdownConfig,
} from "@/lib/time/countdown";
import { track } from "@/lib/analytics";

function toDatetimeLocalValue(iso: string): string {
  const d = new Date(iso);
  if (!Number.isFinite(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromDatetimeLocalValue(local: string): string {
  const ms = Date.parse(local);
  if (!Number.isFinite(ms)) return defaultTargetIso();
  return new Date(ms).toISOString();
}

export function CountdownTimerBuilderTool() {
  const [title, setTitle] = useState(DEFAULT_COUNTDOWN_CONFIG.title);
  const [subtitle, setSubtitle] = useState(DEFAULT_COUNTDOWN_CONFIG.subtitle);
  const [targetIso, setTargetIso] = useState(() => defaultTargetIso());
  const [showDays, setShowDays] = useState(true);
  const [showHours, setShowHours] = useState(true);
  const [showMinutes, setShowMinutes] = useState(true);
  const [showSeconds, setShowSeconds] = useState(true);
  const [accent, setAccent] = useState(DEFAULT_COUNTDOWN_CONFIG.accent);
  const [background, setBackground] = useState(
    DEFAULT_COUNTDOWN_CONFIG.background,
  );
  const [foreground, setForeground] = useState(
    DEFAULT_COUNTDOWN_CONFIG.foreground,
  );
  const [nowMs, setNowMs] = useState(() => Date.now());
  const [started, setStarted] = useState(false);

  const markStart = useCallback(() => {
    if (!started) {
      setStarted(true);
      track({
        name: "tool_start",
        tool: "countdown-timer-builder",
        family: "tools",
      });
    }
  }, [started]);

  useEffect(() => {
    const id = window.setInterval(() => setNowMs(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const config: CountdownConfig = useMemo(
    () => ({
      title,
      subtitle,
      targetIso,
      showDays,
      showHours,
      showMinutes,
      showSeconds,
      accent,
      background,
      foreground,
    }),
    [
      title,
      subtitle,
      targetIso,
      showDays,
      showHours,
      showMinutes,
      showSeconds,
      accent,
      background,
      foreground,
    ],
  );

  const targetMs = parseTargetInput(targetIso);
  const parts =
    targetMs == null ? null : remainingParts(nowMs, targetMs);
  const embed = useMemo(() => buildCountdownEmbedHtml(config), [config]);

  const downloadHtml = () => {
    markStart();
    const blob = new Blob([embed], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "countdown.html";
    a.click();
    URL.revokeObjectURL(url);
    track({
      name: "tool_complete",
      tool: "countdown-timer-builder",
      family: "tools",
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
          Title
          <input
            value={title}
            onChange={(e) => {
              markStart();
              setTitle(e.target.value);
            }}
            className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[var(--foreground)]"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
          Target date & time
          <input
            type="datetime-local"
            value={toDatetimeLocalValue(targetIso)}
            onChange={(e) => {
              markStart();
              setTargetIso(fromDatetimeLocalValue(e.target.value));
            }}
            className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 font-[family-name:var(--font-mono)] text-[var(--foreground)]"
          />
        </label>
        <label className="sm:col-span-2 flex flex-col gap-1 text-sm text-[var(--muted)]">
          Subtitle
          <input
            value={subtitle}
            onChange={(e) => {
              markStart();
              setSubtitle(e.target.value);
            }}
            className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[var(--foreground)]"
          />
        </label>
      </div>

      <div className="flex flex-wrap gap-4">
        {(
          [
            ["Days", showDays, setShowDays],
            ["Hours", showHours, setShowHours],
            ["Minutes", showMinutes, setShowMinutes],
            ["Seconds", showSeconds, setShowSeconds],
          ] as const
        ).map(([label, value, setValue]) => (
          <label
            key={label}
            className="flex items-center gap-2 text-sm text-[var(--foreground)]"
          >
            <input
              type="checkbox"
              checked={value}
              onChange={(e) => {
                markStart();
                setValue(e.target.checked);
              }}
            />
            {label}
          </label>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {(
          [
            ["Accent", accent, setAccent],
            ["Background", background, setBackground],
            ["Text", foreground, setForeground],
          ] as const
        ).map(([label, value, setValue]) => (
          <label
            key={label}
            className="flex flex-col gap-1 text-sm text-[var(--muted)]"
          >
            {label}
            <div className="flex gap-2">
              <input
                type="color"
                value={/^#[0-9a-fA-F]{6}$/.test(value) ? value : "#c4a70a"}
                onChange={(e) => {
                  markStart();
                  setValue(e.target.value);
                }}
                className="h-10 w-12 cursor-pointer rounded border border-[var(--border)] bg-[var(--surface)]"
              />
              <input
                value={value}
                onChange={(e) => {
                  markStart();
                  setValue(e.target.value);
                }}
                className="min-w-0 flex-1 rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1.5 font-[family-name:var(--font-mono)] text-sm text-[var(--foreground)]"
              />
            </div>
          </label>
        ))}
      </div>

      {targetMs == null ? (
        <ToolErrorState message="Enter a valid target date and time." />
      ) : (
        <div
          className="rounded-xl border border-[var(--border)] px-6 py-8 text-center"
          style={{ background, color: foreground }}
        >
          <p className="font-[family-name:var(--font-display)] text-2xl">
            {title || "Countdown"}
          </p>
          {subtitle ? (
            <p className="mt-1 text-sm opacity-75">{subtitle}</p>
          ) : null}
          <p
            className="mt-6 font-[family-name:var(--font-mono)] text-3xl font-semibold tracking-wide"
            style={{ color: accent }}
          >
            {parts
              ? formatCountdownLabel(parts, {
                  showDays,
                  showHours,
                  showMinutes,
                  showSeconds,
                })
              : "—"}
          </p>
          {parts?.expired ? (
            <p className="mt-2 text-sm opacity-80">Target time has passed.</p>
          ) : null}
        </div>
      )}

      <div>
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <EditorPaneHeader label="Embed HTML" getText={() => embed} />
          <button
            type="button"
            onClick={downloadHtml}
            className="rounded-md bg-[var(--accent)] px-3 py-1.5 text-sm font-medium text-[var(--ink)]"
          >
            Download HTML
          </button>
        </div>
        <pre className="max-h-64 overflow-auto rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 font-[family-name:var(--font-mono)] text-xs text-[var(--foreground)]">
          {embed}
        </pre>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Self-contained page — open the download or paste into a static host.
          Runs entirely in the visitor’s browser.
        </p>
      </div>
    </div>
  );
}
