import { describe, expect, it } from "vitest";
import { generateLicenseText } from "./license";

describe("generateLicenseText", () => {
  it("fills MIT copyright line", () => {
    const text = generateLicenseText({
      id: "mit",
      year: "2026",
      holder: "Forge Labs",
    });
    expect(text).toContain("Copyright (c) 2026 Forge Labs");
    expect(text).toContain("MIT License");
    expect(text).not.toContain("{{");
  });

  it("fills GPL notice project name", () => {
    const text = generateLicenseText({
      id: "gpl-3.0",
      year: "2026",
      holder: "Ada",
      project: "Widget",
    });
    expect(text.startsWith("Widget")).toBe(true);
    expect(text).toContain("GNU General Public License");
  });
});
