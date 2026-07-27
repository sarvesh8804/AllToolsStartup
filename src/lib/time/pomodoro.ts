export type PomodoroPhase = "focus" | "shortBreak" | "longBreak";

export type PomodoroSettings = {
  focusMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  /** Long break after this many completed focus sessions (default 4). */
  sessionsUntilLongBreak: number;
};

export type PomodoroState = {
  phase: PomodoroPhase;
  /** Remaining seconds in the current phase. */
  remainingSeconds: number;
  /** Completed focus sessions in the current cycle (0 .. sessionsUntilLongBreak-1 before long break). */
  completedFocus: number;
  /** Total focus sessions finished this page session. */
  totalFocusCompleted: number;
  running: boolean;
};

export const DEFAULT_POMODORO_SETTINGS: PomodoroSettings = {
  focusMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  sessionsUntilLongBreak: 4,
};

function clampMinutes(n: number, min: number, max: number): number {
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, Math.round(n)));
}

export function normalizePomodoroSettings(
  partial: Partial<PomodoroSettings> = {},
): PomodoroSettings {
  return {
    focusMinutes: clampMinutes(partial.focusMinutes ?? 25, 1, 180),
    shortBreakMinutes: clampMinutes(partial.shortBreakMinutes ?? 5, 1, 60),
    longBreakMinutes: clampMinutes(partial.longBreakMinutes ?? 15, 1, 60),
    sessionsUntilLongBreak: clampMinutes(
      partial.sessionsUntilLongBreak ?? 4,
      1,
      12,
    ),
  };
}

export function phaseDurationSeconds(
  phase: PomodoroPhase,
  settings: Partial<PomodoroSettings>,
): number {
  const s = normalizePomodoroSettings(settings);
  switch (phase) {
    case "focus":
      return s.focusMinutes * 60;
    case "shortBreak":
      return s.shortBreakMinutes * 60;
    case "longBreak":
      return s.longBreakMinutes * 60;
  }
}

export function createPomodoroState(
  settings: Partial<PomodoroSettings> = DEFAULT_POMODORO_SETTINGS,
): PomodoroState {
  const s = normalizePomodoroSettings(settings);
  return {
    phase: "focus",
    remainingSeconds: phaseDurationSeconds("focus", s),
    completedFocus: 0,
    totalFocusCompleted: 0,
    running: false,
  };
}

export function formatPomodoroTime(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
}

export function phaseLabel(phase: PomodoroPhase): string {
  switch (phase) {
    case "focus":
      return "Focus";
    case "shortBreak":
      return "Short break";
    case "longBreak":
      return "Long break";
  }
}

/** Advance by one second while running. Returns next state and whether a phase just completed. */
export function tickPomodoro(
  state: PomodoroState,
  settings: Partial<PomodoroSettings>,
): { state: PomodoroState; phaseCompleted: boolean } {
  if (!state.running) return { state, phaseCompleted: false };
  if (state.remainingSeconds > 1) {
    return {
      state: { ...state, remainingSeconds: state.remainingSeconds - 1 },
      phaseCompleted: false,
    };
  }
  // remainingSeconds is 1 or 0 → complete phase
  return { state: completePomodoroPhase(state, settings), phaseCompleted: true };
}

export function completePomodoroPhase(
  state: PomodoroState,
  settings: Partial<PomodoroSettings>,
): PomodoroState {
  const s = normalizePomodoroSettings(settings);

  if (state.phase === "focus") {
    const completedFocus = state.completedFocus + 1;
    const totalFocusCompleted = state.totalFocusCompleted + 1;
    const longBreak = completedFocus >= s.sessionsUntilLongBreak;
    const nextPhase: PomodoroPhase = longBreak ? "longBreak" : "shortBreak";
    return {
      phase: nextPhase,
      remainingSeconds: phaseDurationSeconds(nextPhase, s),
      completedFocus: longBreak ? 0 : completedFocus,
      totalFocusCompleted,
      running: false,
    };
  }

  // breaks → focus
  return {
    phase: "focus",
    remainingSeconds: phaseDurationSeconds("focus", s),
    completedFocus: state.completedFocus,
    totalFocusCompleted: state.totalFocusCompleted,
    running: false,
  };
}

export function resetPomodoroPhase(
  state: PomodoroState,
  settings: Partial<PomodoroSettings>,
): PomodoroState {
  const s = normalizePomodoroSettings(settings);
  return {
    ...state,
    remainingSeconds: phaseDurationSeconds(state.phase, s),
    running: false,
  };
}

export function skipPomodoroPhase(
  state: PomodoroState,
  settings: Partial<PomodoroSettings>,
): PomodoroState {
  return completePomodoroPhase({ ...state, running: false }, settings);
}
