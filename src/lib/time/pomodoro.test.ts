import { describe, expect, it } from "vitest";
import {
  completePomodoroPhase,
  createPomodoroState,
  formatPomodoroTime,
  tickPomodoro,
} from "./pomodoro";

describe("pomodoro", () => {
  it("formats time", () => {
    expect(formatPomodoroTime(1500)).toBe("25:00");
    expect(formatPomodoroTime(65)).toBe("01:05");
    expect(formatPomodoroTime(0)).toBe("00:00");
  });

  it("starts on focus", () => {
    const state = createPomodoroState({ focusMinutes: 25 });
    expect(state.phase).toBe("focus");
    expect(state.remainingSeconds).toBe(25 * 60);
    expect(state.running).toBe(false);
  });

  it("ticks down while running", () => {
    let state = { ...createPomodoroState({ focusMinutes: 1 }), running: true };
    const first = tickPomodoro(state, { focusMinutes: 1, shortBreakMinutes: 1, longBreakMinutes: 1, sessionsUntilLongBreak: 4 });
    expect(first.phaseCompleted).toBe(false);
    expect(first.state.remainingSeconds).toBe(59);
    state = first.state;
  });

  it("moves focus → short break", () => {
    const settings = {
      focusMinutes: 1,
      shortBreakMinutes: 2,
      longBreakMinutes: 5,
      sessionsUntilLongBreak: 4,
    };
    const next = completePomodoroPhase(
      { ...createPomodoroState(settings), remainingSeconds: 0 },
      settings,
    );
    expect(next.phase).toBe("shortBreak");
    expect(next.remainingSeconds).toBe(120);
    expect(next.completedFocus).toBe(1);
    expect(next.running).toBe(false);
  });

  it("takes a long break after N focus sessions", () => {
    const settings = {
      focusMinutes: 1,
      shortBreakMinutes: 1,
      longBreakMinutes: 3,
      sessionsUntilLongBreak: 2,
    };
    const afterFirst = completePomodoroPhase(
      createPomodoroState(settings),
      settings,
    );
    expect(afterFirst.phase).toBe("shortBreak");
    const afterSecond = completePomodoroPhase(
      { ...afterFirst, phase: "focus", remainingSeconds: 0 },
      settings,
    );
    expect(afterSecond.phase).toBe("longBreak");
    expect(afterSecond.completedFocus).toBe(0);
    expect(afterSecond.remainingSeconds).toBe(180);
  });
});
