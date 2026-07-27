import { describe, expect, it } from "vitest";
import {
  buildCountdownEmbedHtml,
  defaultTargetIso,
  formatCountdownLabel,
  parseTargetInput,
  remainingParts,
} from "./countdown";

describe("remainingParts", () => {
  it("splits remaining time", () => {
    const now = Date.UTC(2024, 0, 1, 0, 0, 0);
    const target = Date.UTC(2024, 0, 2, 3, 4, 5);
    const parts = remainingParts(now, target);
    expect(parts).toMatchObject({
      days: 1,
      hours: 3,
      minutes: 4,
      seconds: 5,
      expired: false,
    });
  });

  it("marks expired when target is past", () => {
    const parts = remainingParts(2000, 1000);
    expect(parts.expired).toBe(true);
    expect(parts.totalMs).toBe(0);
  });
});

describe("formatCountdownLabel", () => {
  it("formats visible units", () => {
    const label = formatCountdownLabel(
      { days: 1, hours: 2, minutes: 3, seconds: 4, totalMs: 1, expired: false },
      {
        showDays: true,
        showHours: true,
        showMinutes: true,
        showSeconds: false,
      },
    );
    expect(label).toBe("1d 02h 03m");
  });
});

describe("parseTargetInput / defaultTargetIso", () => {
  it("parses ISO dates", () => {
    expect(parseTargetInput("2024-06-01T12:00:00.000Z")).toBe(
      Date.parse("2024-06-01T12:00:00.000Z"),
    );
    expect(parseTargetInput("nope")).toBeNull();
  });

  it("defaults about a week ahead", () => {
    const now = Date.UTC(2024, 0, 1);
    const iso = defaultTargetIso(now);
    expect(Date.parse(iso) - now).toBe(7 * 24 * 60 * 60 * 1000);
  });
});

describe("buildCountdownEmbedHtml", () => {
  it("embeds title and target", () => {
    const html = buildCountdownEmbedHtml({
      title: "Ship day",
      subtitle: "Go live",
      targetIso: "2030-01-01T00:00:00.000Z",
      showDays: true,
      showHours: true,
      showMinutes: true,
      showSeconds: true,
      accent: "#c4a70a",
      background: "#243018",
      foreground: "#fffef6",
    });
    expect(html).toContain("Ship day");
    expect(html).toContain("2030-01-01T00:00:00.000Z");
    expect(html).toContain("setInterval");
  });
});
