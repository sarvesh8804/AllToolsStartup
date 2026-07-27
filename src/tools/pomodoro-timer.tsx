"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  DEFAULT_POMODORO_SETTINGS,
  createPomodoroState,
  formatPomodoroTime,
  normalizePomodoroSettings,
  phaseDurationSeconds,
  phaseLabel,
  resetPomodoroPhase,
  skipPomodoroPhase,
  tickPomodoro,
  type PomodoroSettings,
  type PomodoroState,
} from "@/lib/time/pomodoro";
import { track } from "@/lib/analytics";

export function PomodoroTimerTool() {
  const [settings, setSettings] = useState<PomodoroSettings>(
    DEFAULT_POMODORO_SETTINGS,
  );
  const [state, setState] = useState<PomodoroState>(() =>
    createPomodoroState(DEFAULT_POMODORO_SETTINGS),
  );
  const [started, setStarted] = useState(false);
  const settingsRef = useRef(settings);
  const baseTitleRef = useRef("Forge");

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  useEffect(() => {
    if (typeof document !== "undefined") {
      baseTitleRef.current = document.title;
    }
  }, []);

  const markStart = useCallback(() => {
    if (!started) {
      setStarted(true);
      track({ name: "tool_start", tool: "pomodoro-timer", family: "tools" });
    }
  }, [started]);

  useEffect(() => {
    if (!state.running) return;
    const id = window.setInterval(() => {
      setState((prev) => {
        const { state: next, phaseCompleted } = tickPomodoro(
          prev,
          settingsRef.current,
        );
        if (phaseCompleted) {
          track({
            name: "tool_complete",
            tool: "pomodoro-timer",
            family: "tools",
          });
          if (
            typeof window !== "undefined" &&
            "Notification" in window &&
            Notification.permission === "granted"
          ) {
            try {
              new Notification(`${phaseLabel(next.phase)}`, {
                body: `${formatPomodoroTime(next.remainingSeconds)} remaining`,
              });
            } catch {
              /* ignore */
            }
          }
        }
        return next;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [state.running]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const base = baseTitleRef.current;
    if (state.running) {
      document.title = `${formatPomodoroTime(state.remainingSeconds)} · ${phaseLabel(state.phase)}`;
    } else {
      document.title = base;
    }
    return () => {
      document.title = base;
    };
  }, [state.remainingSeconds, state.phase, state.running]);

  const applySettings = (partial: Partial<PomodoroSettings>) => {
    markStart();
    const next = normalizePomodoroSettings({ ...settings, ...partial });
    setSettings(next);
    setState((prev) => resetPomodoroPhase({ ...prev, running: false }, next));
  };

  const total = phaseDurationSeconds(state.phase, settings);
  const progress = 1 - state.remainingSeconds / Math.max(1, total);

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-6 py-10">
        <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
          {phaseLabel(state.phase)}
          {state.running ? " · running" : " · paused"}
        </p>
        <p className="font-[family-name:var(--font-mono)] text-6xl tabular-nums text-[var(--foreground)] sm:text-7xl">
          {formatPomodoroTime(state.remainingSeconds)}
        </p>
        <div className="h-2 w-full max-w-md overflow-hidden rounded-full bg-[var(--surface-2)]">
          <div
            className="h-full rounded-full bg-[var(--accent)] transition-[width] duration-1000 linear"
            style={{ width: `${Math.min(100, Math.max(0, progress * 100))}%` }}
          />
        </div>
        <p className="text-sm text-[var(--muted)]">
          Focus this cycle: {state.completedFocus}/
          {settings.sessionsUntilLongBreak} · Total focus:{" "}
          {state.totalFocusCompleted}
        </p>

        <div className="flex flex-wrap justify-center gap-2">
          <button
            type="button"
            onClick={() => {
              markStart();
              setState((prev) => ({ ...prev, running: !prev.running }));
            }}
            className="rounded-md bg-[var(--accent)] px-5 py-2 text-sm font-medium text-[var(--background)]"
          >
            {state.running ? "Pause" : "Start"}
          </button>
          <button
            type="button"
            onClick={() => {
              markStart();
              setState((prev) => resetPomodoroPhase(prev, settings));
            }}
            className="rounded-md border border-[var(--border)] px-4 py-2 text-sm hover:border-[var(--accent)]/50"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={() => {
              markStart();
              setState((prev) => skipPomodoroPhase(prev, settings));
            }}
            className="rounded-md border border-[var(--border)] px-4 py-2 text-sm hover:border-[var(--accent)]/50"
          >
            Skip
          </button>
          <button
            type="button"
            onClick={() => {
              if ("Notification" in window) {
                void Notification.requestPermission();
              }
            }}
            className="rounded-md border border-[var(--border)] px-4 py-2 text-sm hover:border-[var(--accent)]/50"
          >
            Enable alerts
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {(
          [
            ["focusMinutes", "Focus (min)", 1, 180],
            ["shortBreakMinutes", "Short break", 1, 60],
            ["longBreakMinutes", "Long break", 1, 60],
            ["sessionsUntilLongBreak", "Sessions / long break", 1, 12],
          ] as const
        ).map(([key, label, min, max]) => (
          <label
            key={key}
            className="flex flex-col gap-1 text-sm text-[var(--muted)]"
          >
            {label}
            <input
              type="number"
              min={min}
              max={max}
              value={settings[key]}
              onChange={(e) =>
                applySettings({ [key]: Number(e.target.value) })
              }
              className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[var(--foreground)]"
            />
          </label>
        ))}
      </div>
    </div>
  );
}
