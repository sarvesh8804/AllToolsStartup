import { describe, expect, it } from "vitest";
import {
  DEFAULT_AVATAR_NAME,
  buildColorfulAvatarSvg,
  getAvatarInitials,
} from "./avatar";

describe("getAvatarInitials", () => {
  it("uses first and last initials", () => {
    expect(getAvatarInitials("Ada Lovelace")).toBe("AL");
  });

  it("uses two letters for a single word", () => {
    expect(getAvatarInitials("Forge")).toBe("FO");
  });
});

describe("buildColorfulAvatarSvg", () => {
  it("builds a deterministic svg for the same name", () => {
    const a = buildColorfulAvatarSvg({ name: DEFAULT_AVATAR_NAME, size: 128 });
    const b = buildColorfulAvatarSvg({ name: DEFAULT_AVATAR_NAME, size: 128 });
    expect(a.ok).toBe(true);
    expect(b.ok).toBe(true);
    if (!a.ok || !b.ok) return;
    expect(a.svg).toBe(b.svg);
    expect(a.initials).toBe("AL");
    expect(a.svg).toContain("<svg");
  });

  it("supports pattern style", () => {
    const result = buildColorfulAvatarSvg({
      name: "Forge",
      style: "pattern",
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.svg).toContain("<circle");
  });

  it("rejects empty names", () => {
    expect(buildColorfulAvatarSvg({ name: "  " }).ok).toBe(false);
  });
});
