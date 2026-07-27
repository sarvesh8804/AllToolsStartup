import { describe, expect, it } from "vitest";
import {
  DEFAULT_BADGE_INPUT,
  buildReadmeBadges,
} from "./readme-badges";

describe("buildReadmeBadges", () => {
  it("emits markdown for selected presets", () => {
    const { markdown, badges } = buildReadmeBadges(DEFAULT_BADGE_INPUT);
    expect(badges.length).toBe(4);
    expect(markdown).toContain("img.shields.io");
    expect(markdown).toContain("npm/v/my-project");
    expect(markdown).toContain("github/stars/you/my-project");
  });

  it("skips npm badges without package name", () => {
    const { badges } = buildReadmeBadges({
      ...DEFAULT_BADGE_INPUT,
      npmPackage: "",
      presets: ["npm-version", "license"],
    });
    expect(badges).toHaveLength(1);
    expect(badges[0].alt).toBe("License");
  });

  it("builds a custom static badge", () => {
    const { markdown } = buildReadmeBadges({
      ...DEFAULT_BADGE_INPUT,
      presets: ["custom"],
      customLabel: "status",
      customMessage: "stable",
      customColor: "success",
    });
    expect(markdown).toContain("status-stable-success");
  });

  it("applies non-default style query", () => {
    const { markdown } = buildReadmeBadges({
      ...DEFAULT_BADGE_INPUT,
      style: "for-the-badge",
      presets: ["stars"],
    });
    expect(markdown).toContain("style=for-the-badge");
  });
});
