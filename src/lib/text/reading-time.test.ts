import { describe, expect, it } from "vitest";
import {
  DEFAULT_READING_TIME_OPTIONS,
  estimateReadingTime,
  formatDurationMinutes,
} from "./reading-time";

describe("estimateReadingTime", () => {
  it("returns zeros for empty text", () => {
    const r = estimateReadingTime("");
    expect(r.words).toBe(0);
    expect(r.readingMinutes).toBe(0);
    expect(r.readingLabel).toBe("0 min");
  });

  it("estimates from word count and wpm", () => {
    const words = Array.from({ length: 400 }, () => "word").join(" ");
    const r = estimateReadingTime(words, {
      readingWpm: 200,
      speakingWpm: 150,
    });
    expect(r.words).toBe(400);
    expect(r.readingMinutes).toBe(2);
    expect(r.speakingMinutes).toBe(3);
  });

  it("respects custom reading wpm", () => {
    const words = Array.from({ length: 300 }, () => "x").join(" ");
    const slow = estimateReadingTime(words, {
      ...DEFAULT_READING_TIME_OPTIONS,
      readingWpm: 100,
    });
    const fast = estimateReadingTime(words, {
      ...DEFAULT_READING_TIME_OPTIONS,
      readingWpm: 300,
    });
    expect(slow.readingMinutes).toBeGreaterThan(fast.readingMinutes);
  });

  it("formats long durations", () => {
    expect(formatDurationMinutes(0)).toBe("0 min");
    expect(formatDurationMinutes(5)).toBe("5 min");
    expect(formatDurationMinutes(90)).toBe("1 hr 30 min");
    expect(formatDurationMinutes(120)).toBe("2 hr");
  });
});
